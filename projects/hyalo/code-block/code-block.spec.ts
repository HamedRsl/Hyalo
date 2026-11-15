import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { HyCodeBlock } from './code-block';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyCodeBlock', () => {
  it('renders source as text and announces copy without moving focus', async () => {
    const copy = vi.fn(() => true);
    TestBed.configureTestingModule({ providers: [{ provide: Clipboard, useValue: { copy } }] });
    const fixture = TestBed.createComponent(HyCodeBlock);
    fixture.componentRef.setInput('code', '<script>alert(1)</script>');
    fixture.componentRef.setInput('label', 'Import');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    expect(fixture.nativeElement.querySelector('code').textContent).toBe(
      '<script>alert(1)</script>',
    );
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(copy).toHaveBeenCalledWith('<script>alert(1)</script>');
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toBe('Copied');
    await expectNoAxeViolations(fixture.nativeElement);
  });
});
