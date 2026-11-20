import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { HyBreadcrumb } from './breadcrumb';
@Component({ template: '' })
class Page {}
@Component({
  imports: [HyBreadcrumb],
  template: `<hy-breadcrumb [items]="items" [itemTemplate]="item" [separatorTemplate]="separator" />
    <ng-template #item let-item let-index="index" let-last="last"
      ><b>{{ index }}:{{ item.label }}:{{ last }}</b></ng-template
    >
    <ng-template #separator><i>→</i></ng-template>`,
})
class TemplateHost {
  readonly items = [{ label: 'Home' }, { label: 'Current' }];
}
describe('breadcrumb routing and templates', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'projects',
            component: Page,
            data: { breadcrumb: 'Projects' },
            children: [{ path: ':id', component: Page, data: { breadcrumb: 'Details' } }],
          },
          { path: 'other', component: Page, data: { breadcrumb: 'Other' } },
        ]),
      ],
    }),
  );
  it('tracks real completed nested router navigations and replaces stale crumbs', async () => {
    const f = TestBed.createComponent(HyBreadcrumb);
    f.componentRef.setInput('fromRouter', true);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/projects/42');
    await f.whenStable();
    expect(f.nativeElement.querySelector('a')?.getAttribute('href')).toBe('/projects');
    expect(f.nativeElement.querySelector('[aria-current]')?.textContent).toBe('Details');
    await router.navigateByUrl('/other');
    await f.whenStable();
    expect(f.nativeElement.querySelectorAll('li')).toHaveLength(1);
    expect(f.nativeElement.textContent).not.toContain('Projects');
  });
  it('uses commands, query, fragment and history state but leaves modified clicks native', async () => {
    const f = TestBed.createComponent(HyBreadcrumb);
    f.componentRef.setInput('items', [
      {
        label: 'Project',
        commands: ['/projects', 42],
        queryParams: { tab: 'files' },
        fragment: 'summary',
        state: { source: 'crumb' },
      },
      { label: 'Now' },
    ]);
    await f.whenStable();
    const a: HTMLAnchorElement = f.nativeElement.querySelector('a');
    expect(a.getAttribute('href')).toBe('/projects/42?tab=files#summary');
    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    // Prevent jsdom's native link navigation only after the component has handled the event.
    a.addEventListener(
      'click',
      (event) => {
        expect(event.defaultPrevented).toBe(false);
        event.preventDefault();
      },
      { once: true },
    );
    a.dispatchEvent(modified);
    expect(TestBed.inject(Router).url).toBe('/');
    a.click();
    await f.whenStable();
    expect(TestBed.inject(Router).url).toBe('/projects/42?tab=files#summary');
    expect(TestBed.inject(Location).getState()).toMatchObject({ source: 'crumb' });
  });
  it('renders typed item context and a custom separator only between items', async () => {
    const f = TestBed.createComponent(TemplateHost);
    await f.whenStable();
    expect([...f.nativeElement.querySelectorAll('b')].map((el: Element) => el.textContent)).toEqual(
      ['0:Home:false', '1:Current:true'],
    );
    expect(f.nativeElement.querySelectorAll('.separator i')).toHaveLength(1);
    expect(f.nativeElement.querySelector('.separator').getAttribute('aria-hidden')).toBe('true');
  });
});
