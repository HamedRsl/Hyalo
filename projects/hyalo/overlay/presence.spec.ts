import { HyPresence } from './presence';

function transitionEnd(el: HTMLElement, propertyName: string): void {
  const event = new Event('transitionend') as TransitionEvent;
  Object.defineProperty(event, 'propertyName', { value: propertyName });
  el.dispatchEvent(event);
}

describe('HyPresence', () => {
  let presence: HyPresence;
  let el: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    presence = new HyPresence();
    el = document.createElement('div');
  });
  afterEach(() => vi.useRealTimers());

  it('opens a panel that was just attached', () => {
    presence.enter(el);
    expect(el.dataset['state']).toBe('open');
    expect(presence.leaving).toBe(false);
  });

  it('calls done when the opacity transition ends', () => {
    const done = vi.fn();
    presence.leave(el, done);
    expect(el.dataset['state']).toBe('closing');
    expect(presence.leaving).toBe(true);
    transitionEnd(el, 'transform');
    expect(done).not.toHaveBeenCalled();
    transitionEnd(el, 'opacity');
    expect(done).toHaveBeenCalledOnce();
    expect(presence.leaving).toBe(false);
  });

  it('finishes on a timer when no transition runs', () => {
    const done = vi.fn();
    presence.leave(el, done);
    vi.runAllTimers();
    expect(done).toHaveBeenCalledOnce();
    transitionEnd(el, 'opacity');
    expect(done).toHaveBeenCalledOnce();
  });

  it('turns a leaving panel around without calling done', () => {
    const done = vi.fn();
    presence.leave(el, done);
    presence.enter(el);
    expect(el.dataset['state']).toBe('open');
    vi.runAllTimers();
    transitionEnd(el, 'opacity');
    expect(done).not.toHaveBeenCalled();
  });

  it('ignores a second leave while one is playing', () => {
    const first = vi.fn();
    const second = vi.fn();
    presence.leave(el, first);
    presence.leave(el, second);
    vi.runAllTimers();
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
  });
});
