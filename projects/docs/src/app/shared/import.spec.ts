import { TestBed } from '@angular/core/testing';
import { DocsImport } from './import';
describe('DocsImport', () => {
  it('copies the displayed import and confirms the result', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    try {
      const fixture = TestBed.createComponent(DocsImport);
      const code = "import { HyChip } from '@hyalo/angular/badge';";
      fixture.componentRef.setInput('code', code);
      await fixture.whenStable();
      fixture.nativeElement.querySelector('button').click();
      await fixture.whenStable();
      expect(writeText).toHaveBeenCalledWith(code);
      expect(fixture.nativeElement.querySelector('[role=status]').textContent).toBe(
        'Import copied.',
      );
    } finally {
      if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
      else Reflect.deleteProperty(navigator, 'clipboard');
    }
  });
});
