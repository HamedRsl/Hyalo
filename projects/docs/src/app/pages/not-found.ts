import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HyButton } from '@hyalo/angular';
import { DocsPage } from '../shared/page';

@Component({
  selector: 'docs-not-found',
  imports: [DocsPage, RouterLink, HyButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <docs-page eyebrow="404" heading="Nothing here" lead="This page does not exist, or it moved.">
      <a hyButton routerLink="/">Back to the introduction</a>
    </docs-page>
  `,
})
export default class NotFoundPage {}
