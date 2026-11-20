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

describe('HyTimeline', () => {
  it('applies horizontal orientation and end alignment to the track', async () => {
    const fixture = TestBed.createComponent(LayoutFixture);
    await fixture.whenStable();

    const timeline: HTMLElement = fixture.nativeElement.querySelector('hy-timeline');
    expect(timeline.dataset['orientation']).toBe('horizontal');
    expect(timeline.dataset['alignment']).toBe('end');
  });
});