import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyFidelity, provideHyalo } from '@hyalo/angular/core';
import { HySelect } from './select';

@Component({
  imports: [HySelect],
  template: `<hy-select
    [options]="options()"
    [canSelectNullable]="nullable()"
    [virtualized]="virtual()"
  />`,
})
class Host {
  readonly nullable = signal(false);
  readonly virtual = signal(false);
  readonly options = signal([
    { key: 'none', value: null as number | null, label: 'None' },
    { value: 1, label: 'One' },
  ]);
}

describe('select policy audit regressions', () => {
  afterEach(() =>
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()),
  );
  it('disables rejected nullable choices in both custom and native surfaces', async () => {
    TestBed.inject(HyFidelity).setTier('high');
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = fixture.debugElement.children[0]!.componentInstance as HySelect<number | null>;
    select.open();
    await fixture.whenStable();
    expect(document.querySelector('[role="option"]')?.getAttribute('aria-disabled')).toBe('true');
    expect(fixture.nativeElement.querySelector('option[value="string:none"]').disabled).toBe(true);
  });
  it('inherits scoped component policy defaults while explicit inputs win', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHyalo({
          components: { select: { wrap: false, typeaheadDelay: 80, canSelectNullable: false } },
        }),
      ],
    });
    const fixture = TestBed.createComponent(HySelect<number>);
    fixture.componentRef.setInput('options', [{ value: 1, label: 'One' }]);
    await fixture.whenStable();
    expect(fixture.componentInstance.wrap()).toBe(false);
    expect(fixture.componentInstance.typeaheadDelay()).toBe(80);
    expect(fixture.componentInstance.canSelectNullable()).toBe(false);
    fixture.componentRef.setInput('wrap', true);
    await fixture.whenStable();
    expect(fixture.componentInstance.wrap()).toBe(true);
  });
});
