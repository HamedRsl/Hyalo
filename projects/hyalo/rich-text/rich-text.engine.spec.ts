import { TestBed } from '@angular/core/testing';
import { Extension } from '@tiptap/core';
import { HyRichText, HY_RICH_TEXT_LOADER } from './rich-text';
import * as engine from './engine';

describe('HyRichText real TipTap', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: HY_RICH_TEXT_LOADER, useValue: async () => engine }],
    }),
  );
  it('round trips JSON, resets external content and disposes replacement extensions', async () => {
    const f = TestBed.createComponent(HyRichText);
    f.componentRef.setInput('label', 'Notes');
    f.componentRef.setInput('value', {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Team' }] }],
    });
    await f.whenStable();
    const first = f.componentInstance.getEditor()!;
    expect(first.getText()).toBe('Team');
    first.commands.insertContent('Hello ');
    expect(f.componentInstance.value()).toEqual(first.getJSON());
    f.componentRef.setInput('value', null);
    await f.whenStable();
    f.componentInstance.reset();
    expect(first.isEmpty).toBe(true);
    f.componentRef.setInput('extensions', [Extension.create({ name: 'verification' })]);
    await f.whenStable();
    expect(first.isDestroyed).toBe(true);
    const next = f.componentInstance.getEditor()!;
    expect(next.extensionManager.extensions.some((e) => e.name === 'verification')).toBe(true);
    f.componentRef.setInput('readonly', true);
    await f.whenStable();
    expect(next.isEditable).toBe(false);
    f.destroy();
    expect(next.isDestroyed).toBe(true);
  });
  it('rejects unsafe command URLs without mutating JSON', async () => {
    const f = TestBed.createComponent(HyRichText);
    f.componentRef.setInput('label', 'Notes');
    f.componentRef.setInput('images', true);
    await f.whenStable();
    const editor = f.componentInstance.getEditor()!;
    const before = editor.getJSON();
    expect(f.componentInstance.setLink('javascript:alert(1)')).toBe(false);
    expect(f.componentInstance.insertImage('data:image/svg+xml,bad')).toBe(false);
    expect(editor.getJSON()).toEqual(before);
    f.destroy();
  });
  it('does not throw when a toolbar command targets a disabled extension', async () => {
    const f = TestBed.createComponent(HyRichText);
    f.componentRef.setInput('label', 'Notes');
    f.componentRef.setInput('starterKit', { bold: false, link: false, undoRedo: false });
    await f.whenStable();
    expect(f.componentInstance.run('bold')).toBe(false);
    expect(f.componentInstance.setLink('https://example.com')).toBe(false);
    f.destroy();
  });
});
