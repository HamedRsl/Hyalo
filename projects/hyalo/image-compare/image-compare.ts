import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
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
  readonly ratio = input('16 / 9');
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  protected readonly id = injectId('hy-compare');
  protected readonly position = computed(() =>
    Math.max(0, Math.min(100, Number(this.value()) || 0)),
  );
  protected readonly vertical = computed(() => this.orientation() === 'vertical');
  protected readonly clip = computed(() => {
    const clipped = 100 - this.position();
    return this.vertical() ? `inset(${clipped}% 0 0 0)` : `inset(0 ${clipped}% 0 0)`;
  });
  protected change(event: Event): void {
    this.value.set((event.target as HTMLInputElement).valueAsNumber);
  }
}
