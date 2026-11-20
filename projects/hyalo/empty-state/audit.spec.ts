import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyEmptyState } from './empty-state';
@Component({
  imports: [HyEmptyState],
  template: `<hy-empty-state heading="No files" icon="search"
    ><svg hyEmptyIllustration aria-label="Empty folder"></svg
    ><button>Upload</button></hy-empty-state
  >`,
})
class Host {}
describe('empty state illustration', () => {
  it('replaces fallback illustration without absorbing the action slot', async () => {
    const f = TestBed.createComponent(Host);
    await f.whenStable();
    expect(f.nativeElement.querySelector('[hyEmptyIllustration]')).not.toBeNull();
    expect(f.nativeElement.querySelector('hy-icon')).toBeNull();
    expect(f.nativeElement.querySelector('.actions svg')).toBeNull();
    expect(f.nativeElement.querySelector('.actions button')?.textContent).toBe('Upload');
  });
});
