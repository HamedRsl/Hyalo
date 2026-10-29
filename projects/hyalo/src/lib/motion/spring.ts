/**
 * A spring in the two numbers Apple designs with.
 *
 * - `damping`: 1 settles without overshoot, lower values bounce.
 * - `response`: roughly how many seconds it takes to get there. Not a
 *   duration; the settle time falls out of the physics.
 */
export interface HySpringConfig {
  readonly damping: number;
  readonly response: number;
}

/**
 * The shared springs.
 *
 * - `settle`: the default. No bounce.
 * - `momentum`: after a flick or a drag, when the gesture carried speed.
 */
export const SPRINGS = {
  settle: { damping: 1, response: 0.4 },
  momentum: { damping: 0.8, response: 0.3 },
} as const satisfies Record<string, HySpringConfig>;

/** Options for {@link HySpring.to}. */
export interface HySpringTarget extends Partial<HySpringConfig> {
  /** Starting velocity in units per second. Defaults to the current one. */
  readonly velocity?: number;
  /** Runs once the value comes to rest on the target. */
  readonly onRest?: () => void;
}

const STEP = 1 / 240;
const REST_DELTA = 0.1;
const REST_VELOCITY = 2;

/**
 * Animates one number on `requestAnimationFrame`. Every `to()` starts from
 * the live value and keeps its velocity, so the motion can be grabbed and
 * redirected at any moment without a jump or a sudden stop.
 */
export class HySpring {
  /** The value on screen right now. */
  value: number;
  /** Units per second. */
  velocity = 0;
  private target = 0;
  private config: HySpringConfig = SPRINGS.settle;
  private onRest: (() => void) | null = null;
  private frame = 0;
  private last = 0;

  constructor(
    initial: number,
    private readonly onUpdate: (value: number) => void,
  ) {
    this.value = initial;
  }

  /** True while the spring is moving. */
  get running(): boolean {
    return this.frame !== 0;
  }

  /** Springs toward `target`, from wherever it is now. */
  to(target: number, options: HySpringTarget = {}): void {
    this.target = target;
    this.config = {
      damping: options.damping ?? SPRINGS.settle.damping,
      response: options.response ?? SPRINGS.settle.response,
    };
    if (options.velocity !== undefined) this.velocity = options.velocity;
    this.onRest = options.onRest ?? null;
    if (this.frame) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Jumps to a value and stops, as when a finger holds it. */
  set(value: number): void {
    this.stop();
    this.value = value;
    this.velocity = 0;
    this.onUpdate(value);
  }

  /** Stops where it is. A pending `onRest` is dropped. */
  stop(): void {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.onRest = null;
  }

  private readonly tick = (now: number): void => {
    // A long frame (a background tab, a busy main thread) is capped, so the
    // spring slows down instead of jumping. The first frame's timestamp can
    // be older than the call to to(), which would make dt negative.
    const dt = Math.max(0, Math.min((now - this.last) / 1000, 1 / 15));
    this.last = Math.max(now, this.last);
    const stiffness = ((2 * Math.PI) / this.config.response) ** 2;
    const friction = (4 * Math.PI * this.config.damping) / this.config.response;
    // Stiffer springs need finer steps to stay stable.
    const steps = Math.ceil(dt / Math.min(STEP, this.config.response / 60));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      this.velocity += (-stiffness * (this.value - this.target) - friction * this.velocity) * h;
      this.value += this.velocity * h;
    }
    if (
      Math.abs(this.velocity) < REST_VELOCITY &&
      Math.abs(this.value - this.target) < REST_DELTA
    ) {
      this.value = this.target;
      this.velocity = 0;
      this.frame = 0;
      const done = this.onRest;
      this.onRest = null;
      this.onUpdate(this.value);
      done?.();
      return;
    }
    this.onUpdate(this.value);
    this.frame = requestAnimationFrame(this.tick);
  };
}

/**
 * How far a flick travels before it stops, from the velocity in px per
 * second. This is the deceleration curve of scrolling, so a target picked
 * from `position + project(velocity)` lands where the gesture was going.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Resistance past a boundary. The further the overshoot, the less the
 * element follows, so an edge feels soft instead of frozen.
 */
export function rubberband(overshoot: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  const x = Math.abs(overshoot);
  return (Math.sign(overshoot) * (x * dimension * constant)) / (dimension + constant * x);
}

/** Velocity of a pointer from its last 100ms of movement. */
export class HyVelocityTracker {
  private samples: { t: number; v: number }[] = [];

  add(value: number, time = performance.now()): void {
    this.samples.push({ t: time, v: value });
    while (this.samples.length > 2 && time - (this.samples[0]?.t ?? time) > 100) {
      this.samples.shift();
    }
  }

  reset(): void {
    this.samples = [];
  }

  /** Units per second. Zero if the pointer has been still for 100ms. */
  velocity(now = performance.now()): number {
    const recent = this.samples.filter((s) => now - s.t <= 100);
    const first = recent[0];
    const last = recent[recent.length - 1];
    if (!first || !last || last.t === first.t) return 0;
    return ((last.v - first.v) / (last.t - first.t)) * 1000;
  }
}
