import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  type TemplateRef,
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HY_CONFIG, type HyAction, type HySize, type HyTone, injectId } from '@hyalo/angular/core';
import { HyButton } from '@hyalo/angular/button';
import { HyIcon } from '@hyalo/angular/icon';

export interface HyFabItemContext {
  readonly $implicit: HyAction;
  readonly index: number;
}
@Component({
  selector: 'hy-fab',
  imports: [HyButton, HyIcon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fab.html',
  styleUrl: './fab.css',
  host: { '[attr.data-direction]': 'direction()', '[attr.data-layout]': 'layout()' },
})
export class HyFab {
  private readonly config = inject(HY_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly trigger = viewChild('trigger', { read: ElementRef<HTMLButtonElement> });
  private readonly pendingFocus = signal(false);
  readonly label = input.required<string>();
  readonly icon = input('plus');
  readonly closeIcon = input('');
  readonly itemTemplate = input<TemplateRef<HyFabItemContext>>();
  readonly shown = output<void>();
  readonly hidden = output<void>();
  private wasOpen = false;
  private focusLast = false;
  readonly closeLabel = input('Close actions');
  readonly actions = input<readonly HyAction[]>([]);
  readonly open = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly mask = input(false, { transform: booleanAttribute });
  readonly hideOnClickOutside = input(true, { transform: booleanAttribute });
  readonly closeOnSelect = input(true, { transform: booleanAttribute });
  readonly direction = input<'up' | 'down' | 'start' | 'end'>('up');
  readonly layout = input<'linear' | 'circle' | 'semicircle' | 'quarter-circle'>('linear');
  readonly radius = input(88);
  readonly size = input<HySize>(this.config.size);
  readonly tone = input<HyTone>(this.config.tone);
  readonly selected = output<HyAction>();
  readonly activated = output<void>();
  protected readonly listId = injectId('fab-actions');
  protected readonly positioned = computed(() => {
    const items = this.actions(),
      layout = this.layout(),
      radius = Number.isFinite(this.radius()) ? Math.max(44, this.radius()) : 88;
    const span = layout === 'circle' ? 360 : layout === 'semicircle' ? 180 : 90;
    const base = { up: -90, down: 90, start: 180, end: 0 }[this.direction()];
    return items.map((action, index) => {
      const angle =
        ((base +
          (items.length <= 1
            ? 0
            : span * (index / (layout === 'circle' ? items.length : items.length - 1) - 0.5))) *
          Math.PI) /
        180;
      return {
        action,
        transform:
          layout === 'linear'
            ? null
            : 'translate(calc(var(--_hy-direction, 1) * ' +
              Math.cos(angle) * radius +
              'px),' +
              Math.sin(angle) * radius +
              'px)',
      };
    });
  });
  constructor() {
    effect((cleanup) => {
      const open = this.open();
      if (open !== this.wasOpen) {
        this.wasOpen = open;
        if (open) this.shown.emit();
        else this.hidden.emit();
      }
      if (this.disabled()) this.open.set(false);
      if (!this.open() || !this.hideOnClickOutside()) return;
      const outside = (event: PointerEvent): void => {
        if (!this.element.contains(event.target as Node)) this.close(false);
      };
      this.document.addEventListener('pointerdown', outside);
      cleanup(() => this.document.removeEventListener('pointerdown', outside));
    });
    afterRenderEffect(() => {
      if (this.open() && this.pendingFocus()) {
        const buttons = this.element.querySelectorAll<HTMLElement>(
          '.actions button:not(:disabled)',
        );
        buttons[this.focusLast ? buttons.length - 1 : 0]?.focus();
        this.pendingFocus.set(false);
      }
    });
  }
  show(): void {
    if (!this.disabled() && this.actions().length) this.open.set(true);
  }
  hide(): void {
    this.close();
  }
  toggle(): void {
    if (this.disabled()) return;
    if (!this.actions().length) this.activated.emit();
    else this.open.update((value) => !value);
  }
  close(restoreFocus = true): void {
    this.open.set(false);
    if (restoreFocus) this.trigger()?.nativeElement.focus();
  }
  protected choose(action: HyAction): void {
    if (!this.disabled() && !action.disabled) {
      this.selected.emit(action);
      if (this.closeOnSelect()) this.close();
    }
  }
  protected keys(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.open()) {
      event.preventDefault();
      this.close();
      return;
    }
    if (
      event.target === this.trigger()?.nativeElement &&
      ['ArrowDown', 'ArrowUp'].includes(event.key) &&
      this.actions().length &&
      !this.disabled()
    ) {
      event.preventDefault();
      this.open.set(true);
      this.focusLast = event.key === 'ArrowUp';
      this.pendingFocus.set(true);
      return;
    }
    const buttons = [
      ...this.element.querySelectorAll<HTMLButtonElement>('.actions button:not(:disabled)'),
    ];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
      const rtl = getComputedStyle(this.element).direction === 'rtl';
      const forward = event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      next = (index + (forward ? 1 : -1) + buttons.length) % buttons.length;
    } else return;
    event.preventDefault();
    buttons[next]?.focus();
  }
}
