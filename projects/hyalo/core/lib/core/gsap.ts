/**
 * The small part of GSAP that Hyalo uses. Declared here so the kit compiles
 * without GSAP installed. The real `gsap` object satisfies it.
 */
export interface HyGsap {
  to(target: Element | Element[], vars: Record<string, unknown>): unknown;
  set(target: Element | Element[], vars: Record<string, unknown>): unknown;
  quickTo(
    target: Element,
    property: string,
    vars?: Record<string, unknown>,
  ): (value: number) => unknown;
  killTweensOf(target: Element | Element[]): void;
}

/** Returns GSAP, usually through a dynamic import so it lands in its own chunk. */
export type HyGsapLoader = () => Promise<HyGsap>;
