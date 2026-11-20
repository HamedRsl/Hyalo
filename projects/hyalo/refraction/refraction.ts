import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injectable,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { HyFidelity, HyMaterialDirective } from '@hyalo/angular/core';
import type { RefractionRenderer, RefractionTarget } from './renderer';

@Injectable({ providedIn: 'root' })
export class HyRefractionRenderer {
  private readonly document = inject(DOCUMENT);
  private renderer: Promise<RefractionRenderer | null> | undefined;
  private destroyed = false;
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      void this.renderer?.then((renderer) => renderer?.destroy());
    });
  }
  draw(): void {
    void this.renderer?.then((renderer) => {
      if (!this.destroyed) renderer?.draw();
    });
  }
  async register(target: RefractionTarget): Promise<() => void> {
    if (this.destroyed) return () => undefined;
    this.renderer ??= import('./renderer')
      .then(({ RefractionRenderer }) => {
        if (this.destroyed) return null;
        try {
          return new RefractionRenderer(this.document);
        } catch {
          return null;
        }
      })
      .catch(() => null);
    const pending = this.renderer;
    const renderer = await pending;
    if (this.destroyed) return () => undefined;
    if (renderer && !renderer.available) {
      // Several registrations may have awaited the same lost renderer. Only its
      // owner clears the cache, so another caller's replacement is not discarded.
      if (this.renderer === pending) {
        renderer.destroy();
        this.renderer = undefined;
      }
      return this.register(target);
    }
    if (!renderer)
      return () => {
        /* CSS fallback remains visible. */
      };
    const remove = renderer.register(target);
    const resize =
      typeof ResizeObserver === 'function' ? new ResizeObserver(() => renderer.draw()) : null;
    resize?.observe(target.canvas);
    return () => {
      resize?.disconnect();
      remove();
    };
  }
}
/** Supply the scene image explicitly. WebGL cannot sample arbitrary DOM backdrops. */
@Component({
  selector: 'hy-refraction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: HyMaterialDirective, inputs: ['hyMaterial: material'] }],
  templateUrl: './refraction.html',
  styleUrl: './refraction.css',
})
export class HyRefraction {
  private readonly fidelity = inject(HyFidelity);
  private readonly renderer = inject(HyRefractionRenderer);
  private readonly ready = signal(false);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  readonly src = input('');
  readonly strength = input(0.12);
  constructor() {
    afterNextRender(() => this.ready.set(true));
    effect((onCleanup) => {
      const src = this.src();
      if (!this.ready() || this.fidelity.tier() !== 'high' || !src) return;
      let cancelled = false;
      let unregister: (() => void) | undefined;
      void this.renderer
        .register({ canvas: this.canvas().nativeElement, src, strength: () => this.strength() })
        .then((remove) => {
          if (cancelled) remove();
          else unregister = remove;
        });
      onCleanup(() => {
        cancelled = true;
        unregister?.();
      });
    });
    effect(() => {
      this.strength();
      this.renderer.draw();
    });
  }
}
