import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  output,
} from '@angular/core';
import { injectId } from '@hyalo/angular/core';
/** Native range input provides pointer, touch, keyboard and screen reader controls. */
@Component({
  selector: 'hy-image-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-compare.html',
  styleUrl: './image-compare.css',
})
export class HyImageCompare {
  readonly before = input.required<string>();
  readonly after = input.required<string>();
  readonly beforeAlt = input.required<string>();
  readonly afterAlt = input.required<string>();
  readonly label = input('Reveal before image');
  readonly value = model(50);
  readonly min = input(0, { transform: numberAttribute });
  readonly max = input(100, { transform: numberAttribute });
  readonly step = input(1, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly hoverReveal = input(false, { transform: booleanAttribute });
  readonly committed = output<number>();
  protected readonly lower = computed(() =>
    Number.isFinite(this.min()) ? Math.max(0, Math.min(100, this.min())) : 0,
  );
  protected readonly upper = computed(() =>
    Number.isFinite(this.max()) ? Math.max(this.lower(), Math.min(100, this.max())) : 100,
  );
  protected readonly increment = computed(() =>
    Number.isFinite(this.step()) && this.step() > 0 ? this.step() : 1,
  );
  readonly ratio = input('16 / 9');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  protected readonly id = injectId('hy-compare');
  protected readonly position = computed(() =>
    Math.max(this.lower(), Math.min(this.upper(), Number(this.value()) || 0)),
  );
  protected readonly vertical = computed(() => this.orientation() === 'vertical');
  protected readonly clip = computed(() => {
    const clipped = 100 - this.position();
    return this.vertical() ? `inset(${clipped}% 0 0 0)` : `inset(0 ${clipped}% 0 0)`;
  });
  protected change(event: Event): void {
    if (this.disabled()) return;
    this.value.set(
      Math.max(
        this.lower(),
        Math.min(this.upper(), (event.target as HTMLInputElement).valueAsNumber),
      ),
    );
  }
  protected hover(event: PointerEvent): void {
    if (!this.hoverReveal() || this.disabled() || event.pointerType === 'touch') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const size = this.vertical() ? rect.height : rect.width;
    if (!size) return;
    const raw =
      (100 * (this.vertical() ? rect.bottom - event.clientY : event.clientX - rect.left)) / size;
    const stepped =
      this.lower() + Math.round((raw - this.lower()) / this.increment()) * this.increment();
    this.value.set(Math.max(this.lower(), Math.min(this.upper(), stepped)));
  }
  protected commit(): void {
    if (!this.disabled()) this.committed.emit(this.position());
  }
}
