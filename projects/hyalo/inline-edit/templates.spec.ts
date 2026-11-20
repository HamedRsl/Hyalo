import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HyInlineEdit } from './inline-edit';
@Component({
  imports: [HyInlineEdit],
  template: ` <hy-inline-edit value="old" [displayTemplate]="display" [editorTemplate]="editor" />
    <ng-template #display let-value
      ><strong>{{ value }}</strong></ng-template
    >
    <ng-template #editor let-value let-update="update" let-save="save"
      ><input class="custom" [value]="value" (input)="update($any($event.target).value)" /><button
        class="commit"
        (click)="save()"
      >
        Commit
      </button></ng-template
    >`,
})
class Host {}
it('renders templates with a draft update/save context and preserves cancellation', async () => {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  expect(fixture.nativeElement.querySelector('strong').textContent).toBe('old');
  fixture.nativeElement.querySelector('hy-inline-edit > button').click();
  await fixture.whenStable();
  const editor = fixture.nativeElement.querySelector('.custom') as HTMLInputElement;
  editor.value = 'new';
  editor.dispatchEvent(new Event('input'));
  fixture.nativeElement.querySelector('.commit').click();
  await fixture.whenStable();
  expect(fixture.nativeElement.querySelector('strong').textContent).toBe('new');
});
