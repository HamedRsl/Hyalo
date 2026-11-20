import { DocsTokens } from '../shared/tokens-table';
import { EXAMPLE } from './examples/swipe-deck';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HY_SWIPE_DECK } from '@hyalo/angular/swipe-deck';

import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-swipe-deck-page',
  imports: [DocsTokens, DocsPage, DocsExample, DocsImport, DocsApiTable, HY_SWIPE_DECK],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './swipe-deck.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HySwipeDeck.allowUndo',
      type: 'boolean',
      default: 'true',
      description: 'Enables returning to the previous decision.',
    },
    {
      name: 'HySwipeDeck.undone',
      type: '{\n    readonly item: T;\n    readonly index: number;\n  }',
      default: 'output',
      description: 'Previous item and index restored by undo.',
    },
    {
      name: 'HySwipeDeck.finished',
      type: 'void',
      default: 'output',
      description: 'Emits after a decision consumes the final item.',
    },
    {
      name: 'HySwipeDeck.busy',
      type: 'boolean',
      default: 'signal',
      description: 'A decision animation is pending; additional decisions are blocked.',
    },
    {
      name: 'HySwipeDeck.swipe()',
      type: "(direction: 'start' | 'end') => void",
      default: 'method',
      description: 'Requests an animated logical start/end decision.',
    },
    {
      name: 'HySwipeDeck.undo()',
      type: '() => void',
      default: 'method',
      description: 'Returns to the previous card when enabled and idle.',
    },
    {
      name: 'HySwipeDeck.reset()',
      type: '() => void',
      default: 'method',
      description: 'Returns to the first card and cancels pending work.',
    },
    {
      name: 'HySwipeItem.hySwipeItem',
      type: 'HySwipeDeck<T>',
      default: 'required',
      description: 'Public input; see the live example and exported TypeScript declaration.',
    },
    {
      name: 'HySwipeDeck.items',
      type: 'readonly T[]',
      default: 'required',
      description: 'Immutable items with stable IDs; templates render each item.',
    },
    {
      name: 'HySwipeDeck.itemKey',
      type: '(item: T) => string | number',
      default: 'required',
      description: 'Stable identity function used when the items change.',
    },
    {
      name: 'HySwipeDeck.index',
      type: 'number',
      default: '0',
      description: 'Controlled current card index; supports two-way binding.',
    },
    {
      name: 'HySwipeDeck.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HySwipeDeck.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents interaction and new actions.',
    },
    {
      name: 'HySwipeDeck.threshold',
      type: 'see declaration',
      default: 'this.config.swipeThreshold',
      description: 'Minimum gesture travel required before a release can commit.',
    },
    {
      name: 'HySwipeDeck.startLabel',
      type: 'string',
      default: "'Pass'",
      description: 'Localized text for start.',
    },
    {
      name: 'HySwipeDeck.endLabel',
      type: 'string',
      default: "'Keep'",
      description: 'Localized text for end.',
    },
    {
      name: 'HySwipeDeck.undoLabel',
      type: 'string',
      default: "'Undo'",
      description: 'Localized text for undo.',
    },
    {
      name: 'HySwipeDeck.emptyLabel',
      type: 'string',
      default: "'No more cards'",
      description: 'Localized text for empty.',
    },
    {
      name: 'HySwipeDeck.decided',
      type: 'HySwipeDecision<T>',
      default: 'output',
      description: 'Emits item, index and logical direction after a committed decision.',
    },
    {
      name: 'hySwipeItem',
      type: 'HySwipeDeck<T>',
      default: 'required template',
      description: 'Typed $implicit item and index context, matched to the referenced deck.',
    },
  ];
  protected readonly items = [
    { id: 1, name: 'Garden apartment', detail: 'Bright rooms near the park' },
    { id: 2, name: 'City studio', detail: 'A short walk to the station' },
    { id: 3, name: 'Family home', detail: 'Room to grow' },
  ];
  protected readonly key = (item: { id: number }): number => item.id;
  protected readonly decision = signal('Choose a listing');
}
