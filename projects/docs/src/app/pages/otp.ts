import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HyField } from '@hyalo/angular/field';
import { HyOtp } from '@hyalo/angular/otp';
import { DocsPage } from '../shared/page';
import { DocsExample } from '../shared/example';
import { EXAMPLE } from './examples/otp';
@Component({
  selector: 'docs-otp-page',
  imports: [DocsPage, DocsExample, HyField, HyOtp],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './otp.html',
})
export default class HyOtpPage {
  protected readonly examples = [EXAMPLE] as const;
  protected readonly pin = signal('');
  protected readonly result = signal('');
}
