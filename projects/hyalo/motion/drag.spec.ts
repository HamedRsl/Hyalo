import { HyDragController, type HyDragEnd } from './drag';
import { pointer } from '../src/testing/pointer';
describe('HyDragController', () => {
  let node: HTMLDivElement;
  let drag: HyDragController;
  beforeEach(() => {
    node = document.createElement('div');
    document.body.append(node);
  });
  afterEach(() => {
    drag?.destroy();
    node.remove();
  });
  it('locks to its axis and leaves perpendicular scrolling alone', () => {
    const end = vi.fn();
    drag = new HyDragController(node, {
      axis: 'x',
      paint: vi.fn(),
      ended: end,
      motion: () => false,
    });
    pointer(node, 'pointerdown', 0, 0);
    pointer(node, 'pointermove', 2, 30);
    pointer(node, 'pointerup', 2, 30);
    expect(end).not.toHaveBeenCalled();
    expect(node.hasAttribute('data-dragging')).toBe(false);
  });
  it('ignores a second pointer and never commits a cancelled capture', () => {
    const events: HyDragEnd[] = [];
    drag = new HyDragController(node, {
      axis: 'x',
      paint: vi.fn(),
      ended: (e) => events.push(e),
      motion: () => false,
    });
    pointer(node, 'pointerdown', 0, 0);
    pointer(node, 'pointermove', 100, 0, 2);
    expect(drag.spring.value).toBe(0);
    pointer(node, 'pointermove', 60, 0);
    pointer(node, 'pointercancel', 60, 0);
    expect(events).toHaveLength(1);
    expect(events[0]?.cancelled).toBe(true);
    expect(events[0]?.velocity).toBe(0);
  });
  it('restores the previous position after lost capture and releases listeners on disposal', () => {
    const end = vi.fn();
    drag = new HyDragController(node, {
      axis: 'x',
      paint: vi.fn(),
      ended: end,
      motion: () => false,
    });
    drag.settle(25);
    pointer(node, 'pointerdown', 0, 0);
    pointer(node, 'pointermove', 60, 0);
    pointer(node, 'lostpointercapture', 60, 0);
    expect(drag.spring.value).toBe(25);
    expect(end.mock.calls[0]?.[0].cancelled).toBe(true);
    drag.destroy();
    pointer(node, 'pointerdown', 0, 0);
    pointer(node, 'pointermove', 100, 0);
    pointer(node, 'pointerup', 100, 0);
    expect(end).toHaveBeenCalledTimes(1);
  });
  it('uses resistance outside bounds and settles synchronously without motion', () => {
    const done = vi.fn();
    drag = new HyDragController(node, {
      axis: 'x',
      paint: vi.fn(),
      ended: vi.fn(),
      limits: () => [0, 100],
      motion: () => false,
    });
    pointer(node, 'pointerdown', 0, 0);
    pointer(node, 'pointermove', 300, 0);
    expect(drag.spring.value).toBeGreaterThan(100);
    expect(drag.spring.value).toBeLessThan(300);
    drag.settle(100, 0, done);
    expect(drag.spring.running).toBe(false);
    expect(done).toHaveBeenCalledTimes(1);
  });
  it('finishes a pending settle when hidden rather than leaving an action stranded', () => {
    const done = vi.fn();
    drag = new HyDragController(node, { axis: 'x', paint: vi.fn(), ended: vi.fn() });
    drag.settle(200, 0, done);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(drag.spring.value).toBe(200);
    expect(done).toHaveBeenCalledTimes(1);
    expect(drag.spring.running).toBe(false);
    vi.restoreAllMocks();
  });
});
