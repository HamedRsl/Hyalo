import { EXAMPLE } from './examples/pull-refresh';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyPullRefresh } from '@hyalo/angular/pull-refresh';
import { HyButton } from '@hyalo/angular/button';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { DocsImport } from '../shared/import';
import { DocsApiTable, type ApiRow } from '../shared/api-table';
@Component({
  selector: 'docs-pull-refresh-page',
  imports: [DocsPage, DocsExample, DocsImport, DocsApiTable, HyPullRefresh, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pull-refresh.html',
  styleUrl: './mobile-demos.css',
})
export default class Page {
  protected readonly example = EXAMPLE;
  protected readonly apiRows: ApiRow[] = [
    {
      name: 'HyPullRefresh.pullFactor',
      type: 'number',
      default: '1',
      description: 'Positive pointer-distance multiplier; defaults to one.',
    },
    {
      name: 'HyPullRefresh.maxPull',
      type: 'number | undefined',
      default: 'undefined',
      description: 'Pull resistance boundary in pixels, at least the refresh threshold.',
    },
    {
      name: 'HyPullRefresh.started',
      type: 'void',
      default: 'output',
      description: 'Emits once when a pull crosses gesture slop.',
    },
    {
      name: 'HyPullRefresh.pulled',
      type: 'number',
      default: 'output',
      description: 'Normalized pull progress during the owned gesture.',
    },
    {
      name: 'HyPullRefresh.refreshEnded',
      type: '"complete" | "cancel"',
      default: 'output',
      description: 'Emits complete or cancel once per terminal operation.',
    },
    {
      name: 'HyPullRefresh.request()',
      type: '() => void',
      default: 'method',
      description: 'Starts one enabled refresh until complete or cancel.',
    },
    {
      name: 'HyPullRefresh.cancel()',
      type: '() => void',
      default: 'method',
      description: 'Cancels the pull or refresh and resets the indicator.',
    },
    {
      name: 'HyPullRefresh.getProgress()',
      type: '() => number',
      default: 'method',
      description: 'Current pull progress clamped to zero through one.',
    },
    {
      name: 'HyPullRefresh.label',
      type: 'string',
      default: 'required',
      description: 'Accessible name for the control or region.',
    },
    {
      name: 'HyPullRefresh.height',
      type: 'string',
      default: "'20rem'",
      description: 'CSS block size of the native scrolling viewport.',
    },
    {
      name: 'HyPullRefresh.disabled',
      type: 'boolean',
      default: 'false',
      description: 'Prevents interaction and new actions.',
    },
    {
      name: 'HyPullRefresh.refreshing',
      type: 'boolean',
      default: 'false',
      description: 'Controlled request state; set false or call complete after work finishes.',
    },
    {
      name: 'HyPullRefresh.threshold',
      type: 'see declaration',
      default: 'this.config.refreshThreshold',
      description: 'Minimum gesture travel required before a release can commit.',
    },
    {
      name: 'HyPullRefresh.pullLabel',
      type: 'string',
      default: "'Pull to refresh'",
      description: 'Localized text for pull.',
    },
    {
      name: 'HyPullRefresh.releaseLabel',
      type: 'string',
      default: "'Release to refresh'",
      description: 'Localized text for release.',
    },
    {
      name: 'HyPullRefresh.refreshingLabel',
      type: 'string',
      default: "'Refreshing'",
      description: 'Localized text for refreshing.',
    },
    {
      name: 'HyPullRefresh.refreshLabel',
      type: 'string',
      default: "'Refresh'",
      description: 'Localized text for refresh.',
    },
    {
      name: 'HyPullRefresh.refresh',
      type: 'void',
      default: 'output',
      description: 'Emits once per active refresh request.',
    },
    {
      name: 'complete()',
      type: 'void',
      default: 'method',
      description: 'Ends the refreshing model and returns the pulled content to rest.',
    },
  ];
  protected readonly refreshing = signal(false);
  protected readonly requests = signal(0);
  protected readonly addOne = (value: number): number => value + 1;
  protected readonly rowsOfContent = Array.from({ length: 8 }, (_, i) => i + 1);
}
