import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HY_TIMELINE } from './public-api';

@Component({
  imports: [HY_TIMELINE],
  template: `
    <hy-timeline orientation="horizontal" alignment="end">
      <hy-timeline-item heading="First">Description</hy-timeline-item>
    </hy-timeline>
  `,
})
class LayoutFixture {}

@Component({
  imports: [HY_TIMELINE],
  template: `<hy-timeline reverse pending="Waiting" alignment="alternate">
    <hy-timeline-item
      heading="First"
      side="end"
      dotColor="red"
      [markerTemplate]="marker"
      [oppositeTemplate]="opposite"
      >Details</hy-timeline-item
    >
    <hy-timeline-item heading="Second" />
    <ng-template #marker let-item
      ><b class="marker">{{ item.heading() }}</b></ng-template
    >
    <ng-template #opposite><span class="opposite">Yesterday</span></ng-template>
  </hy-timeline>`,
})
class ConfigFixture {}

describe('HyTimeline', () => {
  it('renders marker/opposite templates, item side and pending reverse layout', async () => {
    const fixture = TestBed.createComponent(ConfigFixture);
    await fixture.whenStable();
    const timeline = fixture.nativeElement.querySelector('hy-timeline');
    expect(timeline.getAttribute('data-reverse')).toBe('true');
    expect(timeline.getAttribute('data-alignment')).toBe('alternate');
    expect(timeline.querySelector('.marker').textContent).toBe('First');
    expect(timeline.querySelector('.opposite').textContent).toBe('Yesterday');
    expect(
      timeline.querySelector('hy-timeline-item[data-side="end"]').getAttribute('data-side'),
    ).toBe('end');
    expect(timeline.querySelector('.pending').getAttribute('role')).toBe('listitem');
    expect(timeline.querySelector('.pending').textContent).toBe('Waiting');
  });
  it('applies horizontal orientation and end alignment to the track', async () => {
    const fixture = TestBed.createComponent(LayoutFixture);
    await fixture.whenStable();

    const timeline: HTMLElement = fixture.nativeElement.querySelector('hy-timeline');
    expect(timeline.dataset['orientation']).toBe('horizontal');
    expect(timeline.dataset['alignment']).toBe('end');
  });
});
