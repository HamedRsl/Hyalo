import {
  ChangeDetectionStrategy,
  type TemplateRef,
  afterRenderEffect,
  signal,
  viewChild,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  output,
} from '@angular/core';
import { HY_CONFIG, type HyMaterial, type HyNavigationItem } from '@hyalo/angular/core';
import { HyTabBar, type HyNavigationContext } from '@hyalo/angular/tab-bar';
import { HyMotion } from '@hyalo/angular/motion';

@Component({
  selector: 'hy-dock',
  imports: [HyTabBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dock.html',
  styleUrl: './dock.css',
  host: {
    '[attr.data-position]': 'compact() ? "bottom" : position()',
    '[attr.data-fixed]': 'fixed()',
  },
})
export class HyDock {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);
  readonly items = input.required<readonly HyNavigationItem[]>();
  readonly label = input.required<string>();
  readonly material = input<HyMaterial>(inject(HY_CONFIG).material);
  readonly activeId = input<string>();
  readonly position = input<'top' | 'bottom' | 'start' | 'end'>('bottom');
  readonly fixed = input(false, { transform: booleanAttribute });
  readonly magnify = input(false, { transform: booleanAttribute });
  readonly magnification = input(1.35);
  readonly distance = input(96);
  readonly selected = output<HyNavigationItem>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showLabels = input(true, { transform: booleanAttribute });
  readonly itemTemplate = input<TemplateRef<HyNavigationContext>>();
  readonly breakpoint = input(640);
  protected readonly compact = signal(false);
  private readonly bar = viewChild(HyTabBar);
  private resetMagnification?: () => void;
  focusItem(id: string): boolean {
    return this.bar()?.focusItem(id) ?? false;
  }
  constructor() {
    const destroy = inject(DestroyRef);
    afterRenderEffect((cleanup) => {
      const width = Number.isFinite(this.breakpoint()) ? Math.max(0, this.breakpoint()) : 640;
      const query = this.element.ownerDocument.defaultView?.matchMedia(
        '(max-width: ' + width + 'px)',
      );
      if (!query) return;
      const update = (): void => this.compact.set(query.matches);
      update();
      query.addEventListener('change', update);
      cleanup(() => query.removeEventListener('change', update));
    });
    afterRenderEffect(() => {
      this.items();
      this.magnify();
      this.motion.enabled();
      this.position();
      this.compact();
      this.disabled();
      this.resetMagnification?.();
    });
    afterNextRender(() => {
      let icons: { icon: HTMLElement; x: number; y: number }[] = [];
      const abort = new AbortController();
      const reset = (): void => {
        for (const item of icons) item.icon.style.transform = '';
        icons = [];
      };
      this.resetMagnification = reset;
      this.element.addEventListener(
        'pointerenter',
        (event) => {
          if (
            this.disabled() ||
            !this.magnify() ||
            !this.motion.enabled() ||
            event.pointerType === 'touch' ||
            !matchMedia('(hover:hover) and (pointer:fine)').matches
          )
            return;
          icons = [...this.element.querySelectorAll<HTMLElement>('.icon')].map((icon) => {
            const rect = icon.getBoundingClientRect();
            return { icon, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
          });
        },
        { signal: abort.signal },
      );
      this.element.addEventListener(
        'pointermove',
        (event) => {
          if (!this.magnify() || !this.motion.enabled()) {
            reset();
            return;
          }
          const radius = Number.isFinite(this.distance()) ? Math.max(1, this.distance()) : 96;
          const scale = Number.isFinite(this.magnification())
            ? Math.max(1, Math.min(2, this.magnification()))
            : 1.35;
          for (const item of icons) {
            const d = Math.hypot(event.clientX - item.x, event.clientY - item.y);
            item.icon.style.transform =
              'scale(' + (1 + Math.max(0, 1 - d / radius) * (scale - 1)) + ')';
          }
        },
        { signal: abort.signal },
      );
      this.element.addEventListener('pointerleave', reset, { signal: abort.signal });
      this.element.addEventListener('focusin', reset, { signal: abort.signal });
      this.element.ownerDocument.defaultView?.addEventListener('scroll', reset, {
        signal: abort.signal,
        capture: true,
      });
      this.element.ownerDocument.defaultView?.addEventListener('resize', reset, {
        signal: abort.signal,
      });
      destroy.onDestroy(() => {
        abort.abort();
        reset();
      });
    });
  }
}
