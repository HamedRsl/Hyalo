import type { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Where a floating element sits relative to its trigger. `start` and `end`
 * follow the text direction, so `end` is on the right in LTR and on the left
 * in RTL.
 */
export type HyPlacement = 'top' | 'bottom' | 'start' | 'end';

const OPPOSITE: Record<HyPlacement, HyPlacement> = {
  top: 'bottom',
  bottom: 'top',
  start: 'end',
  end: 'start',
};

function position(placement: HyPlacement, offset: number): ConnectedPosition {
  switch (placement) {
    case 'top':
      return {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetY: -offset,
      };
    case 'bottom':
      return {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offsetY: offset,
      };
    case 'start':
      return {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        offsetX: -offset,
      };
    case 'end':
      return {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offsetX: offset,
      };
  }
}

/**
 * CDK positions for a placement, with the opposite side as the first
 * fallback when there is no room.
 */
export function hyConnectedPositions(placement: HyPlacement, offset = 8): ConnectedPosition[] {
  return [position(placement, offset), position(OPPOSITE[placement], offset)];
}

/** Positions for a dropdown that lines up with the trigger's start edge. */
export function hyDropdownPositions(offset = 6): ConnectedPosition[] {
  return [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: offset },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -offset },
  ];
}
