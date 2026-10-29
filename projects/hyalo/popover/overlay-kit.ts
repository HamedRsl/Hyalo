/**
 * @internal The few CDK overlay and portal functions tooltips and popovers
 * use. Loaded through a dynamic import, so only these, not the whole CDK
 * overlay entry point, end up in the lazy chunk.
 */
export {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
export { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
