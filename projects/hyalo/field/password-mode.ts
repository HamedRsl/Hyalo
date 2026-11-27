import { ChangeDetectionStrategy, Component, Directive, ElementRef, inject, input, signal } from '@angular/core';
import { HyIcon } from '@hyalo/angular/icon';
import { HyInput } from './input';

/** Password mode for a native Hyalo field input. */
@Directive({
  selector: 'input[hyInput][hyPassword]',
  exportAs: 'hyPassword',
  host: { '[type]': 'revealed() ? "text" : "password"' },
})
export class HyPasswordMode {
  private readonly inputElement = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly fieldInput = inject(HyInput, { self: true });
  private readonly visibility = signal(false);
  readonly revealed = this.visibility.asReadonly();

  get inputId(): string {
    return this.fieldInput.id();
  }

  toggle(): void {
    if (this.inputElement.disabled) return;
    this.visibility.update((revealed) => !revealed);
    this.inputElement.focus();
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[hyPasswordToggle]',
  imports: [HyIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: 'button',
    '[attr.aria-label]': 'label()',
    '[title]': 'label()',
    '[attr.aria-controls]': 'target().inputId || null',
    '[attr.aria-pressed]': 'target().revealed()',
    '(click)': 'target().toggle()',
  },
  template: '<hy-icon [name]="target().revealed() ? \'eye-off\' : \'eye\'" size="1.15rem" />',
  styleUrl: './password-mode.css',
})
export class HyPasswordToggle {
  readonly target = input.required<HyPasswordMode>({ alias: 'hyPasswordToggle' });
  readonly showLabel = input('Show password');
  readonly hideLabel = input('Hide password');

  protected label(): string {
    return this.target().revealed() ? this.hideLabel() : this.showLabel();
  }
}
