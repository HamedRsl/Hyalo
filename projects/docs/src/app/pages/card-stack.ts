import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/card-stack';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HY_CARD_STACK } from '@hyalo/angular/card-stack';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-card-stack-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HY_CARD_STACK, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card-stack.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyCardStack.loop',
      type: 'boolean',
      default: 'false',
      description: 'Wraps stack navigation at the first/last item.',
    },
    {
      name: 'HyCardStack.next()',
      type: '() => void',
      default: 'method',
      description: 'Selects the next stack card.',
    },
    {
      name: 'HyCardStack.previous()',
      type: '() => void',
      default: 'method',
      description: 'Selects the previous stack card.',
    },
    {
      name: 'HyCardStack.reset()',
      type: '() => void',
      default: 'method',
      description: 'Returns to the first card and cancels pending work.',
    },
    {
      name: 'HyCardStack.select()',
      type: '(value: number) => void',
      default: 'method',
      description: 'Selects a finite index, wrapping or clamping according to loop.',
    },
    {
      name: 'HyStackItem.hyStackItem',
      type: 'HyCardStack<T>',
      default: 'required',
      description: 'Public input; see the live example and exported TypeScript declaration.',
    },
    {
      name: 'HyCardStack.items',
      type: 'readonly T[]',
      default: 'required',
      description: 'Immutable items with stable IDs; templates render each item.',
    },
    {
      name: 'HyCardStack.itemKey',
      type: '(item: T) => string | number',
      default: 'required',
      description: 'Stable identity function used when the items change.',
    },
    {
      name: 'HyCardStack.activeIndex',
      type: 'number',
      default: '0',
      description: 'Controlled active card index; supports two-way binding.',
    },
    {
      name: 'HyCardStack.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyCardStack.visibleCount',
      type: 'number',
      default: '3',
      description: 'Maximum rendered stack depth, bounded from 1 to 5.',
    },
    {
      name: 'HyCardStack.spread',
      type: 'number',
      default: '12',
      description: 'Distance in pixels between underlying cards, bounded from 0 to 40.',
    },
    {
      name: 'HyCardStack.perspective',
      type: 'string',
      default: "'60rem'",
      description: 'CSS perspective for the depth presentation.',
    },
    {
      name: 'HyCardStack.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents interaction and new actions.',
    },
    {
      name: 'HyCardStack.previousLabel',
      type: 'string',
      default: "'Previous card'",
      description: 'Localized text for previous.',
    },
    {
      name: 'HyCardStack.nextLabel',
      type: 'string',
      default: "'Next card'",
      description: 'Localized text for next.',
    },
    {
      name: 'HyCardStack.selected',
      type: 'T',
      default: 'output',
      description: 'Emits the selected data item; the host performs the work.',
    },
    {
      name: 'hyStackItem',
      type: 'HyCardStack<T>',
      default: 'required template',
      description: 'Typed $implicit item, index and active context.',
    },
  ];
  protected readonly items = [
    { id: 1, name: 'Everyday account', detail: 'Available balance: $1,250' },
    { id: 2, name: 'Savings account', detail: 'Available balance: $4,800' },
    { id: 3, name: 'Travel account', detail: 'Available balance: $620' },
  ];
  protected readonly key = (item: { id: number }): number => item.id;
}
