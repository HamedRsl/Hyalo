import { hyConnectedPositions } from './positions';

describe('hyConnectedPositions', () => {
  it('falls back to the opposite side', () => {
    const [main, fallback] = hyConnectedPositions('top', 10);
    expect(main).toMatchObject({ originY: 'top', overlayY: 'bottom', offsetY: -10 });
    expect(fallback).toMatchObject({ originY: 'bottom', overlayY: 'top', offsetY: 10 });
  });

  it('uses logical start and end so CDK can flip them in RTL', () => {
    const [end] = hyConnectedPositions('end');
    expect(end).toMatchObject({ originX: 'end', overlayX: 'start' });
  });
});
