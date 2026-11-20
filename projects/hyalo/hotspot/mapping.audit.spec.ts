import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { HyHotspot } from './hotspot';
@Component({
  imports: [HyHotspot],
  template: `<hy-hotspot label="Engine" description="Service detail" [position]="{x:50,y:50}" />`,
})
class Host {}

describe('API-127 hotspot container policy', () => {
  it('uses a scoped CDK overlay container and disposes its panel on teardown', async () => {
    const container = document.createElement('div');
    container.id = 'scene-overlay-container';
    document.body.appendChild(container);
    TestBed.configureTestingModule({ providers: [{ provide: OverlayContainer, useValue: {
      getContainerElement: () => container,
    } }] });
    const f = TestBed.createComponent(Host);
    document.body.appendChild(f.nativeElement);
    try {
      await f.whenStable();
      f.nativeElement.querySelector('button').click();
      TestBed.tick();
      for (let i = 0; i < 100 && !container.querySelector('[role="dialog"]'); i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      await f.whenStable();
      const pane = container.querySelector('[role="dialog"]');
      expect(pane?.getAttribute('aria-label')).toBe('Engine');
      expect(pane?.textContent).toContain('Service detail');
      expect(document.querySelector('.cdk-overlay-container [role="dialog"]')).toBeNull();
      f.destroy();
      expect(container.querySelector('[role="dialog"]')).toBeNull();
    } finally { container.remove(); }
  });
});
