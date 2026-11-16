import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { HyCopy } from '@hyalo/angular/copy';
export interface HyCodeSample {
  readonly code: string;
  readonly language: string;
  readonly label: string;
}
@Component({
  selector: 'hy-code-block',
  imports: [HyCopy],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './code-block.html',
  styleUrl: './code-block.css',
})
export class HyCodeBlock {
  readonly code = input.required<string>();
  readonly language = input('text');
  readonly label = input('Code sample');
  readonly copyable = input(true);
  readonly samples = input<readonly HyCodeSample[]>([]);
  protected readonly selected = signal(0);
  protected readonly active = computed(
    () =>
      this.samples()[this.selected()] ?? {
        code: this.code(),
        language: this.language(),
        label: this.label(),
      },
  );
  protected readonly highlighted = signal<string | null>(null);
  private readonly ready = signal(false);
  constructor() {
    const destroy = inject(DestroyRef);
    let generation = 0;
    afterNextRender(() => this.ready.set(true));
    effect(() => {
      const sample = this.active(),
        ready = this.ready(),
        current = ++generation;
      this.highlighted.set(null);
      if (!ready || sample.language === 'text') return;
      void import('./highlight')
        .then((module) => module.highlight(sample.code, sample.language))
        .then((html) => {
          if (!destroy.destroyed && current === generation) this.highlighted.set(html);
        })
        .catch(() => {
          /* Plain source remains usable when the optional highlighter is unavailable. */
        });
    });
  }
}
