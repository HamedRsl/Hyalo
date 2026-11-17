import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyDragController, HyMotion, HY_GESTURE_CONFIG } from '@hyalo/angular/motion';

@Component({
  selector: 'hy-pull-refresh',
  imports: [HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pull-refresh.html',
  styleUrl: './pull-refresh.css',
  host: {
    role: 'region',
    tabindex: '0',
    '[attr.aria-label]': 'label()',
    '[style.block-size]': 'height()',
  },
})
export class HyPullRefresh {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly indicator = viewChild.required<ElementRef<HTMLElement>>('indicator');
  private readonly config = inject(HY_GESTURE_CONFIG);
  private readonly motion = inject(HyMotion);
  readonly label = input.required<string>();
  readonly height = input('20rem');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly refreshing = model(false);
  readonly threshold = input(this.config.refreshThreshold);
  readonly pullFactor = input(1);
  readonly maxPull = input<number>();
  readonly started = output<void>();
  readonly pulled = output<number>();
  readonly refreshEnded = output<'complete' | 'cancel'>();
  private progress = 0;
  private pulling = false;
  readonly pullLabel = input('Pull to refresh');
  readonly releaseLabel = input('Release to refresh');
  readonly refreshingLabel = input('Refreshing');
  readonly refreshLabel = input('Refresh');
  readonly refresh = output<void>();
  protected readonly ready = signal(false);
  private drag?: HyDragController;
  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const threshold = (): number =>
        Number.isFinite(this.threshold()) ? Math.min(300, Math.max(24, this.threshold())) : 72;
      this.drag = new HyDragController(this.element, {
        axis: 'y',
        factor: () => this.pullFactor(),
        started: () => {
          this.pulling = true;
          this.started.emit();
        },
        slop: this.config.slop,
        motion: () => this.motion.enabled(),
        enabled: () => !this.disabled() && !this.refreshing(),
        canStart: (event) => {
          if (
            this.element.scrollTop > 0 ||
            (event.target as Element).closest('button,input,select,textarea,a,[contenteditable]')
          )
            return false;
          let node = event.target as HTMLElement | null;
          while (node && node !== this.element) {
            if (node.scrollTop > 0 && node.scrollHeight > node.clientHeight) return false;
            node = node.parentElement;
          }
          return true;
        },
        limits: () => {
          const max = this.maxPull();
          return [
            0,
            Math.max(
              threshold(),
              max !== undefined && Number.isFinite(max) ? max : threshold() * 1.5,
            ),
          ];
        },
        paint: (value) => {
          const amount = Math.max(0, value);
          this.progress = Math.min(1, amount / threshold());
          if (this.pulling) this.pulled.emit(this.progress);
          this.content().nativeElement.style.translate = '0 ' + amount + 'px';
          this.indicator().nativeElement.style.opacity = String(Math.min(1, amount / threshold()));
          this.ready.set(amount >= threshold());
        },
        ended: (event) => {
          this.pulling = false;
          if (!event.cancelled && event.value >= threshold()) this.request();
          else {
            this.drag?.settle(0);
            this.refreshEnded.emit('cancel');
          }
        },
      });
      const scroll = (): void => {
        this.element.style.touchAction =
          this.element.scrollTop <= 0 ? 'pan-x pan-up' : 'pan-x pan-y';
      };
      scroll();
      this.element.addEventListener('scroll', scroll, { passive: true });
      destroy.onDestroy(() => {
        this.drag?.destroy();
        this.element.removeEventListener('scroll', scroll);
      });
    });
    afterRenderEffect(() => {
      if (this.refreshing()) this.drag?.settle(48);
      else {
        this.ready.set(false);
        this.drag?.settle(0);
      }
    });
  }
  request(): void {
    if (this.disabled() || this.refreshing()) return;
    this.refreshing.set(true);
    this.drag?.settle(48);
    this.refresh.emit();
  }
  complete(): void {
    if (!this.refreshing()) return;
    this.refreshing.set(false);
    this.refreshEnded.emit('complete');
  }
  cancel(): void {
    const active = this.refreshing();
    this.drag?.cancel();
    this.refreshing.set(false);
    this.ready.set(false);
    this.drag?.settle(0);
    if (active) this.refreshEnded.emit('cancel');
  }
  getProgress(): number {
    return this.progress;
  }
}
