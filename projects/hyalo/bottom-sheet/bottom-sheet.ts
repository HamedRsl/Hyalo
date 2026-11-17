import { NgTemplateOutlet } from '@angular/common';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy, type ScrollStrategy } from '@angular/cdk/overlay';
import type { Direction } from '@angular/cdk/bidi';
import type { Observable } from 'rxjs';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  type OnChanges,
  ElementRef,
  Injectable,
  Injector,
  TemplateRef,
  afterNextRender,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  type Type,
  ViewContainerRef,
} from '@angular/core';
import { HyDialogRef, HY_DIALOG_DATA, type HyDrawerConfig } from '@hyalo/angular/dialog';
import { HyFidelity } from '@hyalo/angular/core';
import { HyDragController, HyMotion, HY_GESTURE_CONFIG, MOTION } from '@hyalo/angular/motion';

export interface HyBottomSheetConfig<D = unknown> extends HyDrawerConfig<D> {
  readonly breakpoints?: readonly number[];
  readonly initialBreakpoint?: number;
  readonly handleLabel?: string;
  readonly closeLabel?: string;
  readonly handle?: boolean;
  readonly handleBehavior?: 'cycle' | 'none';
  readonly canDismiss?:
    boolean | ((result: unknown, reason: HySheetDismissReason) => boolean | Promise<boolean>);
  readonly restoreFocus?: boolean;
  readonly panelClass?: string | readonly string[];
  readonly injector?: Injector;
  readonly viewContainerRef?: ViewContainerRef;
  readonly direction?: Direction;
  readonly hasBackdrop?: boolean;
  readonly backdropClass?: string | string[];
  readonly ariaModal?: boolean;
  readonly closeOnNavigation?: boolean;
  readonly scrollStrategy?: ScrollStrategy;
  readonly minHeight?: string;
  readonly maxHeight?: string;
  readonly width?: string;
  readonly maxWidth?: string;
}
export type HySheetDismissReason = 'programmatic' | 'backdrop' | 'escape' | 'gesture' | 'close';
export interface HySheetDismissal<R = unknown> {
  readonly result: R | undefined;
  readonly reason: HySheetDismissReason;
}
class SheetSurfaceRef<R> extends HyDialogRef<R> {
  constructor(private readonly surface: DialogRef<R>) {
    super(surface);
  }
  dispose(): void {
    this.surface.close();
  }
  request?: (result?: R) => void;
  override close(result?: R): void {
    this.request?.(result);
  }
  finish(result?: R): void {
    super.close(result);
  }
}
interface SheetContext {
  readonly content: Type<unknown> | TemplateRef<unknown>;
  readonly config: HyBottomSheetConfig;
  readonly points: readonly number[];
  readonly snap: ReturnType<typeof signal<number>>;
  readonly height: ReturnType<typeof signal<number>>;
  ref?: HyDialogRef<unknown>;
  move?: (point: number) => void;
  opened?: () => void;
  dismiss?: (result: unknown, reason: HySheetDismissReason) => void;
}
export class HyBottomSheetRef<R = unknown> {
  readonly closed: Promise<R | undefined>;
  readonly opened: Promise<void>;
  readonly dismissed: Promise<HySheetDismissal<R>>;
  readonly breakpoint;
  private readonly error = signal<unknown>(undefined);
  readonly dismissError = this.error.asReadonly();
  private pending?: Promise<boolean>;
  private closing = false;
  private reason: HySheetDismissReason = 'programmatic';
  constructor(
    private readonly ref: SheetSurfaceRef<R>,
    private readonly context: SheetContext,
    private readonly surface: DialogRef<R>,
  ) {
    this.closed = ref.closed;
    this.breakpoint = context.snap.asReadonly();
    this.opened = new Promise<void>((resolve) => {
      context.opened = resolve;
    });
    this.dismissed = this.closed.then((result) => ({ result, reason: this.reason }));
    context.dismiss = (result, reason) => {
      void this.dismiss(result as R, reason).catch((error: unknown) => {
        this.error.set(error);
      });
    };
    ref.request = (result) => context.dismiss?.(result, 'programmatic');
  }
  backdropClick(): Observable<MouseEvent> {
    return this.surface.backdropClick;
  }
  keydownEvents(): Observable<KeyboardEvent> {
    return this.surface.keydownEvents;
  }
  close(result?: R): void {
    void this.dismiss(result).catch((error: unknown) => {
      this.error.set(error);
    });
  }
  dismiss(result?: R, reason: HySheetDismissReason = 'programmatic'): Promise<boolean> {
    if (this.closing) return Promise.resolve(false);
    if (this.pending) return this.pending;
    const guard = this.context.config.canDismiss;
    // Deferring the guard also serializes synchronous reentrant close requests.
    const pending = Promise.resolve()
      .then(() => (typeof guard === 'function' ? guard(result, reason) : guard !== false))
      .then((allowed) => {
        if (!allowed || this.closing) return false;
        this.closing = true;
        this.reason = reason;
        this.ref.finish(result);
        return true;
      })
      .finally(() => {
        if (this.pending === pending) this.pending = undefined;
      });
    this.pending = pending;
    return pending;
  }
  /** @internal Disposal must release the overlay even when a user guard vetoes dismissal. */
  dispose(): void {
    this.closing = true;
    this.ref.exit = null;
    this.ref.dispose();
  }
  snapTo(point: number): void {
    if (!this.context.points.includes(point))
      throw new RangeError('Breakpoint must be in breakpoints.');
    if (point === 0) {
      if (this.context.config.dismissible !== false)
        void this.dismiss(undefined, 'gesture').catch((error: unknown) => {
          this.error.set(error);
        });
      return;
    }
    if (this.closing) return;
    this.context.snap.set(point);
    this.context.move?.(point);
  }
}
@Injectable({ providedIn: 'root' })
export class HyBottomSheet {
  private readonly cdk = inject(Dialog);
  private readonly injector = inject(Injector);
  private readonly fidelity = inject(HyFidelity);
  open<R = unknown, D = unknown>(
    content: Type<unknown> | TemplateRef<unknown>,
    config: HyBottomSheetConfig<D> = {},
  ): HyBottomSheetRef<R> {
    const points = [...new Set([...(config.breakpoints ?? [0.5, 1]), 1])].sort((a, b) => a - b);
    if (!points.length || points.some((p) => !Number.isFinite(p) || p < 0 || p > 1))
      throw new RangeError('breakpoints must contain fractions between zero and one.');
    const initial = config.initialBreakpoint ?? points.find((p) => p > 0) ?? 1;
    if (!points.includes(initial) || initial <= 0)
      throw new RangeError('initialBreakpoint must be a positive configured breakpoint.');
    const context: SheetContext = {
      content,
      config,
      points,
      snap: signal(initial),
      height: signal(0),
    };
    let surface!: SheetSurfaceRef<R>;
    const position = createGlobalPositionStrategy(this.injector).bottom('0').centerHorizontally();
    const cdkRef = this.cdk.open<R, SheetContext>(HyBottomSheetPanel, {
      data: context,
      injector: config.injector,
      viewContainerRef: config.viewContainerRef,
      direction: config.direction,
      minHeight: config.minHeight,
      maxHeight: config.maxHeight,
      scrollStrategy: config.scrollStrategy,
      closeOnNavigation: config.closeOnNavigation,
      role: config.role ?? 'dialog',
      ariaLabel: config.label ?? null,
      ariaModal: config.ariaModal ?? true,
      autoFocus: config.autoFocus ?? 'first-tabbable',
      restoreFocus: config.restoreFocus ?? true,
      disableClose: true,
      hasBackdrop: config.hasBackdrop ?? true,
      backdropClass: config.backdropClass ?? 'hy-backdrop',
      panelClass: [
        'hy-drawer-pane',
        'hy-drawer--bottom',
        ...(typeof config.panelClass === 'string'
          ? [config.panelClass]
          : (config.panelClass ?? [])),
      ],
      positionStrategy: position,
      width: config.width ?? '100%',
      maxWidth: config.maxWidth ?? '100vw',
      height: config.size ?? '85dvh',
      providers: (dialogRef: DialogRef<R>) => {
        surface = new SheetSurfaceRef<R>(dialogRef);
        context.ref = surface as HyDialogRef<unknown>;
        return [
          { provide: HY_DIALOG_DATA, useValue: context },
          { provide: HyDialogRef, useValue: surface },
        ];
      },
    });
    const ref = new HyBottomSheetRef(surface, context, cdkRef);
    const panel = surface.containerElement;
    if (panel) {
      panel.classList.add('hy-glass');
      panel.dataset['material'] =
        this.fidelity.tier() === 'low' ? 'solid' : (config.material ?? 'frosted');
      panel.dataset['thickness'] = 'thick';
    }
    if (config.dismissible !== false) {
      cdkRef.backdropClick.subscribe(() => context.dismiss?.(undefined, 'backdrop'));
      cdkRef.keydownEvents.subscribe((event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault();
          context.dismiss?.(undefined, 'escape');
        }
      });
    }
    return ref;
  }
}
@Directive({ selector: '[hySheetComponent]' })
class HySheetComponent implements OnChanges {
  private readonly outlet = inject(ViewContainerRef);
  readonly hySheetComponent = input.required<Type<unknown>>();
  readonly hySheetInjector = input.required<Injector>();
  ngOnChanges(): void {
    this.outlet.clear();
    // Sheets accept standalone content types, so NgComponentOutlet's module factory path is unnecessary.
    this.outlet.createComponent(this.hySheetComponent(), { injector: this.hySheetInjector() });
  }
}
@Component({
  selector: 'hy-bottom-sheet-panel',
  imports: [HySheetComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel.html',
  styleUrl: './bottom-sheet.css',
})
export class HyBottomSheetPanel {
  protected readonly context = inject(HY_DIALOG_DATA) as SheetContext;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly motion = inject(HyMotion);
  private readonly gestures = inject(HY_GESTURE_CONFIG);
  private readonly destroy = inject(DestroyRef);
  private readonly injector = inject(Injector);
  protected readonly template =
    this.context.content instanceof TemplateRef ? this.context.content : null;
  protected readonly component = this.template ? null : (this.context.content as Type<unknown>);
  protected readonly contentInjector = Injector.create({
    parent: this.injector,
    providers: [{ provide: HY_DIALOG_DATA, useValue: this.context.config.data }],
  });
  protected readonly templateContext = { $implicit: this.context.config.data };
  protected readonly bodyHeight = signal<number | null>(null);
  private drag?: HyDragController;

  constructor() {
    afterNextRender(() => {
      const panel = this.element.closest<HTMLElement>('.cdk-dialog-container');
      const body = this.element.querySelector<HTMLElement>('.body');
      if (!panel || !body) return;
      panel.classList.add('hy-sheet-driven');
      panel.style.overflow = 'hidden';
      let entrance: Animation | undefined;
      let exit: Animation | undefined;
      let exitTimer: ReturnType<typeof setTimeout> | undefined;
      let exiting = false;
      const offset = (): number => {
        const parts = getComputedStyle(panel).translate.split(' ');
        const value = Number.parseFloat(parts[1] ?? '0');
        return Number.isFinite(value) ? value : (this.drag?.spring.value ?? 0);
      };
      const interruptEntrance = (): void => {
        if (!entrance) return;
        const value = offset();
        entrance.cancel();
        entrance = undefined;
        this.drag?.spring.set(value);
      };
      const paint = (value: number): void => {
        panel.style.translate = '0 ' + value + 'px';
      };
      const updateBody = (): void => {
        const padding = Number.parseFloat(getComputedStyle(panel).paddingBottom) || 0;
        const inset =
          body.getBoundingClientRect().top - panel.getBoundingClientRect().top + padding;
        this.bodyHeight.set(Math.max(0, this.context.height() * this.context.snap() - inset));
      };
      const move = (point: number): void => {
        if (exiting) return;
        interruptEntrance();
        updateBody();
        this.drag?.settle(this.context.height() * (1 - point));
      };
      this.context.move = move;
      this.drag = new HyDragController(panel, {
        axis: 'y',
        slop: this.gestures.slop,
        motion: () => !this.motion.reduced(),
        limits: () => [0, this.context.height()],
        enabled: () => this.context.config.draggable !== false,
        canStart: (event) => {
          if (exiting || !(event.target as Element).closest('[data-hy-sheet-handle]')) return false;
          interruptEntrance();
          return true;
        },
        paint,
        ended: (event) => {
          if (event.cancelled) {
            move(this.context.snap());
            return;
          }
          const fraction = 1 - event.projected / Math.max(1, this.context.height());
          const allowed =
            this.context.config.dismissible === false
              ? this.context.points.filter((p) => p > 0)
              : this.context.points;
          const point = allowed.reduce(
            (a, b) => (Math.abs(b - fraction) < Math.abs(a - fraction) ? b : a),
            1,
          );
          if (point === 0) {
            this.context.dismiss?.(undefined, 'gesture');
            move(this.context.snap());
          } else {
            this.context.snap.set(point);
            move(point);
          }
        },
      });
      this.context.height.set(panel.offsetHeight);
      updateBody();
      const target = this.context.height() * (1 - this.context.snap());
      this.drag.spring.set(target);
      // The configured stop is the destination; starting there or at zero reverses the entrance.
      if (typeof panel.animate === 'function' && !panel.ownerDocument.hidden) {
        entrance = panel.animate(
          this.motion.reduced()
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [
                { translate: '0 ' + (this.context.height() + 32) + 'px' },
                { translate: '0 ' + target + 'px' },
              ],
          {
            duration:
              (this.motion.reduced() ? MOTION.quick.duration : MOTION.settle.duration) * 1000,
            easing: MOTION.settle.css,
          },
        );
        void entrance.finished.then(
          () => {
            entrance = undefined;
            this.context.opened?.();
          },
          () => this.context.opened?.(),
        );
      } else this.context.opened?.();
      if (this.context.ref)
        this.context.ref.exit = (finish) => {
          exiting = true;
          interruptEntrance();
          const from = this.drag?.spring.value ?? target;
          this.drag?.cancel();
          if (typeof panel.animate !== 'function' || panel.ownerDocument.hidden) {
            finish();
            return;
          }
          exit = panel.animate(
            this.motion.reduced()
              ? [{ opacity: 1 }, { opacity: 0 }]
              : [
                  { translate: '0 ' + from + 'px' },
                  { translate: '0 ' + (this.context.height() + 32) + 'px' },
                ],
            { duration: MOTION.quick.duration * 1000, easing: MOTION.quick.css, fill: 'forwards' },
          );
          let completed = false;
          const complete = (): void => {
            if (completed) return;
            completed = true;
            clearTimeout(exitTimer);
            finish();
          };
          // A throttled animation clock must not hold focus and scroll lock after the exit duration.
          exitTimer = setTimeout(complete, MOTION.quick.duration * 1000 + 32);
          void exit.finished.then(complete, complete);
        };
      const measure = (): void => {
        const height = panel.offsetHeight;
        if (height === this.context.height() || exiting) return;
        this.context.height.set(height);
        move(this.context.snap());
      };
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
      observer?.observe(panel);
      this.destroy.onDestroy(() => {
        observer?.disconnect();
        clearTimeout(exitTimer);
        entrance?.cancel();
        exit?.cancel();
        this.drag?.destroy();
        this.context.move = undefined;
      });
    });
  }
  protected cycle(direction = 1): void {
    if (this.context.config.handleBehavior === 'none') return;
    const points = this.context.points.filter((p) => p > 0);
    const index = points.indexOf(this.context.snap());
    const point = points[(index + direction + points.length) % points.length] ?? 1;
    this.context.snap.set(point);
    this.context.move?.(point);
  }
  protected keys(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.cycle(1);
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.cycle(-1);
    }
  }
  protected close(): void {
    this.context.dismiss?.(undefined, 'close');
  }
}
@Component({
  selector: 'hy-bottom-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bottom-sheet.html',
})
export class HyBottomSheetHost {
  private readonly service = inject(HyBottomSheet);
  private readonly destroy = inject(DestroyRef);
  protected readonly projected = viewChild.required<TemplateRef<unknown>>('content');
  readonly content = input<TemplateRef<unknown>>();
  readonly open = model(false);
  readonly label = input.required<string>();
  readonly options = input<HyBottomSheetConfig>({});
  readonly closed = output<unknown>();
  readonly opened = output<void>();
  readonly dismissed = output<HySheetDismissal>();
  readonly dismissError = output<unknown>();
  readonly breakpointChange = output<number>();
  private readonly ref = signal<HyBottomSheetRef | undefined>(undefined);
  private destroyed = false;
  constructor() {
    effect(() => {
      if (this.open() && !this.ref()) {
        const ref = this.service.open(this.content() ?? this.projected(), {
          ...this.options(),
          label: this.label(),
        });
        this.ref.set(ref);
        void ref.opened.then(() => {
          if (!this.destroyed && this.ref() === ref) this.opened.emit();
        });
        void ref.dismissed.then((event) => {
          if (!this.destroyed) this.dismissed.emit(event);
        });
        void ref.closed.then((result) => {
          if (!this.destroyed && this.ref() === ref) {
            this.ref.set(undefined);
            this.open.set(false);
            this.closed.emit(result);
          }
        });
      } else if (!this.open()) {
        const ref = this.ref();
        if (ref)
          void ref
            .dismiss()
            .then((allowed) => {
              if (!allowed && this.ref() === ref && !this.destroyed) this.open.set(true);
            })
            .catch((error: unknown) => {
              if (!this.destroyed && this.ref() === ref) {
                this.open.set(true);
                this.dismissError.emit(error);
              }
            });
      }
    });
    effect(() => {
      const error = this.ref()?.dismissError();
      if (error !== undefined) this.dismissError.emit(error);
    });
    effect(() => {
      const point = this.ref()?.breakpoint();
      if (point !== undefined) this.breakpointChange.emit(point);
    });
    this.destroy.onDestroy(() => {
      this.destroyed = true;
      this.ref()?.dispose();
    });
  }
  snapTo(point: number): void {
    this.ref()?.snapTo(point);
  }
}
