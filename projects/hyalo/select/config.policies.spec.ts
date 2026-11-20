import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HY_CONFIG, provideHyalo } from '@hyalo/angular/core';
import { HySelect } from '@hyalo/angular/select';
import { HyTooltip } from '@hyalo/angular/popover';

@Component({
  imports: [HySelect, HyTooltip],
  providers: [
    provideHyalo({
      components: { select: { canSelectNullable: false }, tooltip: { hideDelay: 25 } },
    }),
  ],
  template: `<hy-select [options]="options" /><button hyTooltip="Help">Help</button>`,
})
class Scoped {
  readonly options = [{ value: 1, label: 'One' }];
}

describe('per-component behavioral policy defaults', () => {
  it('merges policies by family and property without changing sibling/root consumers', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHyalo({
          components: {
            select: { wrap: false, typeaheadDelay: 90 },
            tooltip: { showDelay: 15, hideDelay: 80 },
          },
        }),
      ],
    });
    const fixture = TestBed.createComponent(Scoped);
    await fixture.whenStable();
    const select = fixture.debugElement.query(By.directive(HySelect))
      .componentInstance as HySelect<number>;
    const tooltip = fixture.debugElement.query(By.directive(HyTooltip)).injector.get(HyTooltip);
    expect(select.wrap()).toBe(false);
    expect(select.typeaheadDelay()).toBe(90);
    expect(select.canSelectNullable()).toBe(false);
    expect(tooltip.tooltipDelay()).toBe(15);
    expect(tooltip.tooltipHideDelay()).toBe(25);
    expect(TestBed.inject(HY_CONFIG).components?.tooltip?.hideDelay).toBe(80);
    const sibling = TestBed.createComponent(HySelect<number>);
    sibling.componentRef.setInput('options', []);
    await sibling.whenStable();
    expect(sibling.componentInstance.canSelectNullable()).toBe(true);
    expect(sibling.componentInstance.wrap()).toBe(false);
  });
});
