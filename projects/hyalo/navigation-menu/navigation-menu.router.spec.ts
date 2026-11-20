import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { HyNavigationMenu } from './navigation-menu';
describe('navigation router metadata and lifecycle', () => {
  it('creates native router URLs with query/fragment and closes stale disclosures', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const f = TestBed.createComponent(HyNavigationMenu);
    f.componentRef.setInput('items', [{ id: 'route', label: 'Route', routerLink: ['/catalog'], queryParams: { q: 'glass' }, fragment: 'details', state: { source: 'nav' } }, { id: 'branch', label: 'Branch', children: [{ id: 'leaf', label: 'Leaf', href: '/' }] }]);
    await f.whenStable();
    expect(f.nativeElement.querySelector('a').getAttribute('href')).toBe('/catalog?q=glass#details');
    expect(TestBed.inject(Router)).toBeTruthy();
    f.componentInstance.openMenu('branch'); await f.whenStable();
    f.componentRef.setInput('items', []); await f.whenStable();
    expect(f.componentInstance.open()).toBeNull();
  });
});
