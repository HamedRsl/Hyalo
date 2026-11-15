import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  input,
  model,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
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
  imports: [HySelect, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <div class="editors" role="group" [attr.aria-label]="label()">
      @for (field of fields(); track field.field) {
        <label
          >{{ field.label }}
          @if (field.options; as options) {
            <hy-select
              [options]="options"
              [native]="true"
              [value]="raw(field.field)"
              (valueChange)="change(field, $event ?? '')"
              [placeholder]="anyLabel()"
            />
          } @else {
            <input
              type="search"
              [value]="raw(field.field)"
              (input)="change(field, $any($event.target).value)"
            />
          }
        </label>
      }
      @if (clauses().length) {
        <button type="button" (click)="clauses.set([])">{{ clearLabel() }}</button>
      }
      <ng-content />
    </div>
    <div class="tokens" role="list" [attr.aria-label]="activeLabel()">
      @for (item of view(); track item.clause.id) {
        <span role="listitem">
          @if (item.editor; as editor) {
            <ng-container [ngTemplateOutlet]="editor" [ngTemplateOutletContext]="item.context" />
          } @else {
            <span>{{ item.label }}: {{ item.text }}</span>
          }
          <button
            type="button"
            [attr.aria-label]="removeLabel() + ' ' + item.label"
            (click)="remove(item.clause.id)"
          >
            ×
          </button>
        </span>
      }
    </div>`,
  styles: `
    :host {
      display: block;
    }
    .editors,
    .tokens {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: 0.75rem;
    }
    .tokens {
      margin-block-start: 0.75rem;
    }
    label {
      display: grid;
      gap: 0.25rem;
      font-size: 0.875rem;
    }
    input,
    hy-select,
    button {
      min-block-size: 44px;
      border: 1px solid var(--hy-line);
      border-radius: var(--hy-radius-s);
      background: var(--hy-surface-1);
      color: var(--hy-ink);
      font: inherit;
      padding: 0.5rem 0.75rem;
    }
    .tokens > span {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--hy-surface-2);
      border-radius: var(--hy-radius-s);
      padding-inline-start: 0.75rem;
    }
    button {
      cursor: pointer;
    }
    :is(input, button):focus-visible {
      outline: 2px solid var(--hy-primary);
      outline-offset: 2px;
    }
  `,
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
