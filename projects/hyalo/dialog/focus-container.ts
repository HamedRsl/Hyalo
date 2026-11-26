import { CdkDialogContainer, type DialogConfig } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Keeps CDK's focus trap and provides a second focus phase for animated surfaces. */
@Component({
  selector: 'hy-surface-focus-container',
  imports: [CdkPortalOutlet],
  template: '<ng-template cdkPortalOutlet />',
  styles: ":host { display: block; width: 100%; height: 100%; min-height: inherit; max-height: inherit; }",
  // The portal outlet hosts user content with its own change detection strategy.
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class HySurfaceFocusContainer extends CdkDialogContainer {
  focusAfterEnter(target: DialogConfig['autoFocus']): void {
    this._config.autoFocus = target;
    const element = this._elementRef.nativeElement;
    const root = element.getRootNode() as Document | ShadowRoot;
    if (element.isConnected && root.activeElement === element) {
      this._trapFocus({ preventScroll: true });
    }
  }
}
