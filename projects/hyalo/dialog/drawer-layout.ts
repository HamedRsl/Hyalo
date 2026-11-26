import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

export type HyDrawerMode = 'side' | 'push' | 'over';
export type HyDockedDrawerSide = 'start' | 'end';

/** Content for the logical edge of a drawer layout. */
@Component({
  selector: 'hy-docked-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'complementary',
    '[attr.aria-label]': 'label() || null',
  },
  template: '<ng-content />',
})
export class HyDockedDrawer {
  readonly label = input('');
}

/** Positions a single drawer within a content region and keeps both views mounted. */
@Component({
  selector: 'hy-drawer-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-mode]': 'mode()',
    '[attr.data-side]': 'side()',
    '[attr.data-open]': 'opened() || null',
    '[style.--hy-docked-drawer-size]': 'size()',
    '(keydown.escape)': 'onEscape($event)',
  },
  templateUrl: './drawer-layout.html',
  styleUrl: './drawer-layout.css',
})
export class HyDrawerLayout {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private restoreTarget: HTMLElement | null = null;
  private focusWasInPanel = false;

  readonly opened = model(false);
  readonly mode = input<HyDrawerMode>('over');
  readonly side = input<HyDockedDrawerSide>('start');
  readonly size = input('18rem');
  readonly hasBackdrop = input<boolean | undefined, unknown>(undefined, {
    transform: (value) => (value === undefined ? undefined : booleanAttribute(value)),
  });
  readonly dismissible = input(true, { transform: booleanAttribute });
  protected readonly showBackdrop = computed(() =>
    this.opened() && (this.hasBackdrop() ?? this.mode() !== 'side'),
  );

  constructor() {
    afterRenderEffect(() => {
      const panel = this.panel().nativeElement;
      const content = this.content().nativeElement;
      const root = this.host.getRootNode() as Document | ShadowRoot;
      if (this.opened() && this.showBackdrop() && !panel.contains(root.activeElement)) {
        panel.focus({ preventScroll: true });
      } else if (!this.opened() && this.focusWasInPanel) {
        if (panel.contains(root.activeElement) || root.activeElement === this.host.ownerDocument.body) {
          const target = this.restoreTarget?.isConnected ? this.restoreTarget : content;
          target.focus({ preventScroll: true });
        }
        this.focusWasInPanel = false;
      }
    });
  }

  open(): void {
    this.opened.set(true);
  }

  close(): void {
    this.opened.set(false);
  }

  toggle(): void {
    this.opened.update((open) => !open);
  }

  protected rememberFocus(event: FocusEvent): void {
    this.focusWasInPanel = false;
    this.restoreTarget = event.target as HTMLElement;
  }

  protected onPanelFocus(): void {
    this.focusWasInPanel = true;
  }

  protected onEscape(event: Event): void {
    if (event.defaultPrevented || !this.opened() || !this.dismissible()) return;
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }
}
