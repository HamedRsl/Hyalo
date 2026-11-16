import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HySlider } from '@hyalo/angular/slider';
import { HyRangeSlider } from '@hyalo/angular/range-slider';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/slider';
@Component({selector: 'docs-slider-page', imports: [DocsPage, DocsExample, HyField, HySlider, HyRangeSlider], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './slider.html'})
export default class HySliderPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly amount = signal(40);
protected readonly range = signal<readonly [number,number]>([20,80]);
}
