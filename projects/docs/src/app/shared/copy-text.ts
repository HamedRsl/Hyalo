import type { Clipboard } from '@angular/cdk/clipboard';
export async function copyText(
  text: string,
  document: Document,
  fallback: Pick<Clipboard, 'copy'>,
): Promise<boolean> {
  try {
    const clipboard = document.defaultView?.navigator.clipboard;
    if (clipboard) {
      await clipboard.writeText(text);
      return true;
    }
    return fallback.copy(text);
  } catch {
    return fallback.copy(text);
  }
}
