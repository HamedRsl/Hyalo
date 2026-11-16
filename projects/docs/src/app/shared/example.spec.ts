import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { DocsExample } from './example';
import { expectNoAxeViolations } from '../../../../hyalo/src/testing/axe';

describe('DocsExample source panel', () => {
  const nativeClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  afterEach(() => {
    if (nativeClipboard) Object.defineProperty(navigator, 'clipboard', nativeClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
  });

  async function setup() {
    const fixture = TestBed.createComponent(DocsExample);
    fixture.componentRef.setInput('code', '<button type="button">Save</button>');
    fixture.componentRef.setInput('tsCode', 'export class Example {}');
    fixture.componentRef.setInput('cssCode', 'button { color: var(--hy-primary); }');
    await fixture.whenStable();
    const details: HTMLDetailsElement = fixture.nativeElement.querySelector('details');
    details.open = true;
    return fixture;
  }

  it('switches source languages and supports tab keyboard navigation', async () => {
    const fixture = await setup();
    const tabs = fixture.nativeElement.querySelectorAll(
      '[role=tab]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(tabs).toHaveLength(3);
    tabs[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(tabs[2]);
    expect(tabs[2]!.getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('pre').textContent).toContain(
      'color: var(--hy-primary)',
    );
    tabs[2]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('pre').textContent).toContain('<button');
    await expectNoAxeViolations(fixture.nativeElement);
  });

  it('copies the active source and marks the example as copied', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const fixture = await setup();
    fixture.nativeElement.querySelectorAll('[role=tab]')[1].click();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.copy').click();
    await fixture.whenStable();
    expect(writeText).toHaveBeenCalledWith('export class Example {}');
    expect(
      fixture.nativeElement.querySelector('figure').classList.contains('example--copied'),
    ).toBe(true);
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain(
      'Code copied',
    );
    fixture.nativeElement.querySelectorAll('[role=tab]')[2].click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.copy').textContent.trim()).toBe('Copy');
  });

  it('falls back when the native clipboard rejects and reports a failed copy honestly', async () => {
    const copy = vi.fn().mockReturnValue(false);
    TestBed.overrideProvider(Clipboard, { useValue: { copy } });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('Unavailable')) },
    });
    const fixture = await setup();
    fixture.nativeElement.querySelector('.copy').click();
    await fixture.whenStable();
    expect(copy).toHaveBeenCalledWith('<button type="button">Save</button>');
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain(
      'Copy failed',
    );
    expect(
      fixture.nativeElement.querySelector('figure').classList.contains('example--copied'),
    ).toBe(false);
  });

  it('omits CSS when the example does not use custom styles', async () => {
    const fixture = TestBed.createComponent(DocsExample);
    fixture.componentRef.setInput('code', '<hy-avatar name="Ada" />');
    fixture.componentRef.setInput('tsCode', 'export class Example {}');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('[role=tab]')).toHaveLength(2);
  });
});
