import { MOTION } from '@hyalo/angular';

/**
 * @internal Enter and exit for small overlays (tooltips, popovers, select
 * panels), driven by `data-state` and CSS transitions.
 *
 * Transitions start from the current value, so reopening a panel while it
 * is still fading out simply turns it around, with no jump.
 */
export class HyPresence {
  private cancel: (() => void) | null = null;

  /** True while an exit is playing. */
  get leaving(): boolean {
    return this.cancel !== null;
  }

  /** Shows a panel that was just attached, or turns a leaving one around. */
  enter(el: HTMLElement): void {
    if (this.cancel) {
      this.cancel();
    } else {
      el.dataset['state'] = 'closed';
      // Commit the closed pose so the change to open transitions.
      void el.offsetWidth;
    }
    el.dataset['state'] = 'open';
  }

  /** Plays the exit, then calls `done`, unless `enter` turns it around first. */
  leave(el: HTMLElement, done: () => void): void {
    if (this.cancel) return;
    el.dataset['state'] = 'closing';
    const stop = (): void => {
      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      this.cancel = null;
    };
    const onEnd = (event: TransitionEvent): void => {
      if (event.target !== el || event.propertyName !== 'opacity') return;
      stop();
      done();
    };
    // A safety net for when transitionend never comes, as with no transition.
    const timer = setTimeout(
      () => {
        stop();
        done();
      },
      MOTION.quick.duration * 1000 + 80,
    );
    el.addEventListener('transitionend', onEnd);
    this.cancel = stop;
  }
}
