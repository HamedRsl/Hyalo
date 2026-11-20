import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyDrawer } from '@hyalo/angular/dialog';
import { HySidebar } from './sidebar';
import { describe, expect, it } from 'vitest';
@Component({ imports: [HySidebar], template: '<hy-sidebar label="Drawer navigation"><a href="/home">Home</a></hy-sidebar>' })
class DrawerContent {}
describe('sidebar drawer placement composition', () => {
  it('opens a sidebar in a start drawer with a native navigation landmark', async () => {
    const ref = TestBed.inject(HyDrawer).open(DrawerContent, { side: 'start', label: 'Navigation' });
    await TestBed.tick();
    expect(document.querySelector('.hy-drawer--start hy-sidebar nav')?.getAttribute('aria-label')).toBe('Drawer navigation');
    expect(document.querySelector('.hy-drawer--start a')?.getAttribute('href')).toBe('/home');
    ref.close(); await TestBed.tick();
  });
});
