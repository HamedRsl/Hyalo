import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyFileUpload } from '@hyalo/angular/file-upload';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/file-upload';
@Component({selector: 'docs-file-upload-page', imports: [DocsPage, DocsExample, HyField, HyFileUpload], changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './file-upload.html'})
export default class HyFileUploadPage {
 protected readonly examples = [EXAMPLE] as const;
 protected readonly files = signal<readonly File[]>([]);
}
