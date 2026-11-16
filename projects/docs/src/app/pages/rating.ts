import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyRating } from '@hyalo/angular/rating';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/rating';
@Component({selector: 'docs-rating-page', imports: [DocsPage, DocsExample, HyField, HyRating], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './rating.html'})
export default class HyRatingPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly rating = signal(0);
}
