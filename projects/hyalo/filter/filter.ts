import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { HyField, HyInput } from '@hyalo/angular/field';
import { HySelect } from '@hyalo/angular/select';
import { type HySelectOption } from '@hyalo/angular/select';
import { type HyFilterToken } from './state';
export interface HyFilterEditorContext<C> {
  readonly $implicit: C;
  readonly update: (clause: C) => void;
}
export interface HyFilterField<C extends HyFilterToken> {
  readonly field: C['field'];
  readonly label: string;
  readonly options?: readonly HySelectOption<string>[];
  readonly create: (id: string, value: string) => C | null;
  readonly editor?: TemplateRef<HyFilterEditorContext<C>>;
  readonly format?: (clause: C) => string;
}
@Component({
  selector: 'hy-filter-bar',
  imports: [HySelect, NgTemplateOutlet, HyField, HyInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class HyFilterBar<C extends HyFilterToken> {
  readonly fields = input.required<readonly HyFilterField<C>[]>();
  readonly clauses = model<readonly C[]>([]);
  readonly label = input('Filter results');
  readonly clearLabel = input('Clear filters');
  readonly removeLabel = input('Remove');
  readonly anyLabel = input('Any');
  readonly activeLabel = input('Active filters');
  protected readonly view = computed(() =>
    this.clauses().map((clause) => {
      const field = this.fields().find((entry) => entry.field === clause.field);
      return {
        clause,
        label: field?.label ?? clause.field,
        text:
          field?.format?.(clause) ??
          (typeof clause.value === 'object' ? JSON.stringify(clause.value) : String(clause.value)),
        editor: field?.editor,
        context: { $implicit: clause, update: (next: C) => this.update(next) },
      };
    }),
  );
  protected raw(field: string): string {
    const value = this.clauses().find((clause) => clause.field === field)?.value;
    if (
      typeof value === 'object' &&
      value &&
      !Array.isArray(value) &&
      'kind' in value &&
      value.kind === 'preset' &&
      'preset' in value
    )
      return String(value.preset);
    return typeof value === 'string' ? value : '';
  }
  protected change(field: HyFilterField<C>, raw: string): void {
    const existing = this.clauses().find((clause) => clause.field === field.field);
    const next = raw ? field.create(existing?.id ?? `filter-${field.field}`, raw) : null;
    this.clauses.set([
      ...this.clauses().filter((clause) => clause.field !== field.field),
      ...(next ? [next] : []),
    ]);
  }
  protected remove(id: string): void {
    this.clauses.update((items) => items.filter((item) => item.id !== id));
  }
  private update(next: C): void {
    this.clauses.update((items) => items.map((item) => (item.id === next.id ? next : item)));
  }
}
