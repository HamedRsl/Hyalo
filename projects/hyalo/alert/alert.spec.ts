import { TestBed } from '@angular/core/testing';
import { HyAlert } from './alert';
import { expectNoAxeViolations } from '../src/testing/axe';
describe('HyAlert', () => {
  it('announces only when requested and emits dismissal once', async () => {
    const fixture = TestBed.createComponent(HyAlert);
    fixture.componentRef.setInput('heading', 'Changes saved');
    fixture.componentRef.setInput('dismissible', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('section').getAttribute('role')).toBeNull();
    fixture.componentRef.setInput('announce', true);
    fixture.componentRef.setInput('tone', 'danger');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('section').getAttribute('role')).toBe('alert');
    await expectNoAxeViolations(fixture.nativeElement);
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });
});
