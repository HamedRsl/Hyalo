import { HySpring, HyVelocityTracker, project, rubberband } from './spring';

describe('project', () => {
  it('throws further the faster the flick', () => {
    expect(project(0)).toBe(0);
    expect(project(1000)).toBeCloseTo(499, 0);
    expect(project(-1000)).toBeCloseTo(-499, 0);
  });
});

describe('rubberband', () => {
  it('follows less the further past the edge', () => {
    const near = rubberband(10, 300);
    const far = rubberband(300, 300);
    expect(near).toBeGreaterThan(0);
    expect(near).toBeLessThan(10);
    expect(far / 300).toBeLessThan(near / 10);
    expect(rubberband(-10, 300)).toBeCloseTo(-near);
  });
});

describe('HyVelocityTracker', () => {
  it('measures px per second over the last 100ms', () => {
    const tracker = new HyVelocityTracker();
    tracker.add(0, 0);
    tracker.add(10, 20);
    tracker.add(20, 40);
    expect(tracker.velocity(40)).toBeCloseTo(500);
  });

  it('reads zero once the pointer has been still', () => {
    const tracker = new HyVelocityTracker();
    tracker.add(0, 0);
    tracker.add(50, 50);
    expect(tracker.velocity(400)).toBe(0);
  });
});

/** Drives requestAnimationFrame by hand, with a clock of the test's choosing. */
function manualFrames() {
  const queue: FrameRequestCallback[] = [];
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => queue.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => queue.splice(0));
  return {
    pending: () => queue.length,
    /** Runs frames 1000/60 ms apart until none are left or `max` is reached. */
    run(start: number, max = 600): number {
      let n = 0;
      for (let t = start; queue.length && n < max; t += 1000 / 60, n++) {
        queue.splice(0).forEach((cb) => cb(t));
      }
      return n;
    },
  };
}

describe('HySpring', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('settles on the target and reports rest', () => {
    const frames = manualFrames();
    const values: number[] = [];
    const onRest = vi.fn();
    const spring = new HySpring(0, (v) => values.push(v));
    spring.to(100, { response: 0.05, onRest });
    frames.run(performance.now());
    expect(onRest).toHaveBeenCalledOnce();
    expect(spring.value).toBe(100);
    expect(spring.running).toBe(false);
    expect(Math.max(...values)).toBeLessThanOrEqual(100.1);
  });

  it('still moves when frame timestamps lag behind performance.now()', () => {
    const frames = manualFrames();
    const onRest = vi.fn();
    const spring = new HySpring(0, () => undefined);
    spring.to(100, { response: 0.05, onRest });
    const used = frames.run(performance.now() - 10_000);
    expect(onRest).toHaveBeenCalledOnce();
    expect(used).toBeLessThan(60);
  });

  it('stops where it is and drops the pending callback', () => {
    const frames = manualFrames();
    const onRest = vi.fn();
    const spring = new HySpring(0, () => undefined);
    spring.to(100, { onRest });
    spring.stop();
    expect(spring.running).toBe(false);
    expect(frames.pending()).toBe(0);
    expect(onRest).not.toHaveBeenCalled();
  });
});
