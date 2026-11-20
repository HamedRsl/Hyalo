import { TestBed } from '@angular/core/testing';
import { HyStatusIsland, HyStatusQueue } from './status-island';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyStatusIsland', () => {
  it('chooses the highest priority while preserving tie order and queue replacement', async () => {
    const queue = TestBed.inject(HyStatusQueue);
    queue.set({ id: 'a', label: 'Upload', priority: 1 });
    queue.set({ id: 'b', label: 'Order arriving', priority: 10 });
    queue.set({ id: 'c', label: 'Other order', priority: 10 });
    const f = TestBed.createComponent(HyStatusIsland);
    await f.whenStable();
    const trigger = f.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(trigger.textContent).toContain('Order arriving');
    queue.set({ id: 'b', label: 'Order updated', priority: 10 });
    await f.whenStable();
    expect(queue.items()).toHaveLength(3);
    expect(trigger.textContent).toContain('Order updated');
    queue.clear();
    await f.whenStable();
    expect(f.nativeElement.querySelector('button')).toBe(trigger);
    expect(trigger.textContent).toContain('No active tasks');
    await expectNoAxeViolations(f.nativeElement);
  });
  it('lets controlled items override the service queue', async () => {
    TestBed.inject(HyStatusQueue).set({ id: 'queued', label: 'Queued', priority: 100 });
    const f = TestBed.createComponent(HyStatusIsland);
    f.componentRef.setInput('items', [{ id: 'local', label: 'Local task', priority: 1 }]);
    await f.whenStable();
    expect(f.nativeElement.querySelector('button').textContent).toContain('Local task');
    await expectNoAxeViolations(f.nativeElement);
  });
});
