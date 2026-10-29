import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyPopover } from './popover';
import { HyTooltip } from './tooltip';

@Component({
  imports: [HyTooltip, HyPopover],
  template: `
    <button type="button" hyTooltip="Copy link" aria-label="Copy">C</button>
    <button type="button" [hyPopover]="panel" popoverLabel="Share">Share</button>
    <ng-template #panel><a href="/x">Copy link</a></ng-template>
  `,
})
class Host {}

const wait = (ms = 0) => new Promise((r) => setTimeout(r, ms));

describe('HyTooltip', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));

  it('describes the trigger for screen readers without showing anything', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const id = button.getAttribute('aria-describedby')!;
    expect(document.getElementById(id)!.textContent).toBe('Copy link');
    expect(document.querySelector('.hy-tooltip')).toBeNull();
  });

  it('shows on focus and hides on Escape', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await wait();
    await fixture.whenStable();
    const tip = document.querySelector('.hy-tooltip')!;
    expect(tip.textContent).toBe('Copy link');
    expect(tip.getAttribute('aria-hidden')).toBe('true');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(document.querySelector('.hy-tooltip')).toBeNull();
  });
});

describe('HyPopover', () => {
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove()));

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    return { fixture, trigger };
  }

  it('opens a labelled dialog panel and moves focus into it', async () => {
    const { fixture, trigger } = await setup();
    trigger.click();
    await fixture.whenStable();
    await wait();
    const pane = document.querySelector<HTMLElement>('.hy-popover')!;
    expect(pane.getAttribute('role')).toBe('dialog');
    expect(pane.getAttribute('aria-label')).toBe('Share');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(pane.id);
    // jsdom has no layout, so CDK finds nothing tabbable and the panel itself
    // takes focus. In a browser the link would.
    expect(pane.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { fixture, trigger } = await setup();
    trigger.click();
    await fixture.whenStable();
    await wait();
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });
});
