import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { injectId } from '@hyalo/angular/core';
import { HY_FIELD } from './field-control';

/** Shared field metadata for composite controls; value ownership stays with each control. */
@Directive()
export abstract class HyValueControl {
  protected readonly field = inject(HY_FIELD, { optional: true });
  protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly id = signal(injectId('control')).asReadonly();
  readonly labelable: boolean = true;
  readonly label = input('');
  readonly name = input('');
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Disabled state owned by the optional classic forms bridge. */
  readonly formDisabled = signal(false);
  protected readonly effectiveDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touched = input(false, { transform: booleanAttribute });
  readonly errors = input<readonly { readonly kind: string; readonly message?: string }[]>([]);
  readonly touch = output<void>();
  readonly errorMessage = computed(() => this.errors()[0]?.message ?? this.errors()[0]?.kind);
  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
  protected readonly showsError = computed(
    () => this.field?.errorShown() ?? (this.invalid() && this.touched()),
  );
  protected readonly blocked = computed(() => this.effectiveDisabled() || this.readonly());
  constructor() {
    const labelable = (): boolean => this.labelable;
    this.field?.register({
      id: this.id,
      get labelable(): boolean {
        return labelable();
      },
      composite: true,
      disabled: this.effectiveDisabled,
      required: this.required,
      invalid: computed(() => this.invalid() && this.touched()),
      rawInvalid: this.invalid,
      touched: this.touched,
      errorMessage: this.errorMessage,
    });
  }
  focus(): void {
    this.element.querySelector<HTMLElement>('input,select,textarea,button')?.focus();
  }
  protected leave(event: FocusEvent): void {
    if (!this.element.contains(event.relatedTarget as Node | null)) this.touch.emit();
  }
}
