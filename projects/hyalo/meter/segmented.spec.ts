import { TestBed } from '@angular/core/testing';
import { HyMeterGroup, HySegmentedProgress } from './segmented';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('segmented measurements', () => {
  it('allocates finite values within a shared range without mutating input', async () => {
    const f = TestBed.createComponent(HyMeterGroup);
    const values = Object.freeze([
      { id: 'a', label: 'Apps', value: 60 },
      { id: 'b', label: 'Files', value: 70 },
      { id: 'c', label: 'Unknown', value: NaN },
    ]);
    f.componentRef.setInput('label', 'Storage');
    f.componentRef.setInput('values', values);
    await f.whenStable();
    expect(f.nativeElement.querySelector('[role=meter]').getAttribute('aria-valuenow')).toBe('100');
    expect(f.nativeElement.textContent).toContain('Files: 40');
    expect(values[1]?.value).toBe(70);
    await expectNoAxeViolations(f.nativeElement);
  });
  it('describes each stage in words as well as color', async () => {
    const f = TestBed.createComponent(HySegmentedProgress);
    f.componentRef.setInput('label', 'Delivery');
    f.componentRef.setInput('steps', [
      { id: 'a', label: 'Placed', state: 'complete' },
      { id: 'b', label: 'Preparing', state: 'active' },
      { id: 'c', label: 'Arriving', state: 'pending' },
    ]);
    await f.whenStable();
    expect(f.nativeElement.querySelector('[role=progressbar]').getAttribute('aria-valuenow')).toBe(
      '1',
    );
    expect(f.nativeElement.querySelector('[aria-current=step]').textContent).toContain('Preparing');
    await expectNoAxeViolations(f.nativeElement);
  });
});
