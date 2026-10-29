import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { HY_CONFIG } from '../core/config';
import { injectIsBrowser } from '../core/platform';

/** The palettes in `styles/palettes/`. Apps can add their own names too. */
export type HyPaletteName = 'aurora' | 'ember' | 'orchid' | 'ocean' | 'rose' | 'graphite';

const ATTR = 'data-hy-palette';
const VALID_NAME = /^[a-z0-9-]+$/;

/** Where a palette stylesheet is served from when no `paletteHref` is configured. */
export function defaultPaletteHref(name: string): string {
  return `palette-${name}.css`;
}

/**
 * Switches palettes, loading each stylesheet the first time it is needed.
 *
 * Palettes are separate files in `styles/palettes/`, so they never add to
 * the initial CSS. Their rules only match while `data-hy-palette` is on
 * `<html>`, which means a loaded palette costs nothing until it is picked.
 * The attribute is set only after the file has loaded, so the page never
 * shows half a palette, and switching back to a palette is instant.
 *
 * To restore a saved palette before the app boots, an inline script can add
 * `<link rel="stylesheet" data-hy-palette="ocean" href="...">` to the head
 * and the attribute to `<html>`. HyPalette picks up both.
 */
@Injectable({ providedIn: 'root' })
export class HyPalette {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(HY_CONFIG);
  private readonly isBrowser = injectIsBrowser();
  private readonly loads = new Map<string, Promise<void>>();
  private readonly _current = signal(this.document.documentElement.getAttribute(ATTR));
  private readonly _selected = signal(this._current());

  /** The palette on screen, or null for the built-in one. */
  readonly current = this._current.asReadonly();

  /**
   * The palette last asked for. It changes straight away, while `current`
   * waits for the stylesheet, so a picker can show the choice immediately.
   */
  readonly selected = this._selected.asReadonly();

  /**
   * Loads a palette and applies it, or goes back to the built-in palette for
   * null. When several calls overlap, the last one wins. Rejects when the
   * stylesheet fails to load, and leaves the current palette in place.
   */
  async use(name: HyPaletteName | (string & {}) | null): Promise<void> {
    if (name !== null) assertName(name);
    this._selected.set(name);
    try {
      if (name !== null && this.isBrowser) await this.load(name);
    } catch (error) {
      if (this._selected() === name) this._selected.set(this._current());
      throw error;
    }
    if (this._selected() !== name) return;
    const root = this.document.documentElement;
    if (name === null) root.removeAttribute(ATTR);
    else root.setAttribute(ATTR, name);
    this._current.set(name);
  }

  /** Starts loading a palette without applying it, for example on hover. */
  preload(name: HyPaletteName | (string & {})): void {
    assertName(name);
    if (this.isBrowser) this.load(name).catch(() => undefined);
  }

  private load(name: string): Promise<void> {
    const cached = this.loads.get(name);
    if (cached) return cached;
    const head = this.document.head;
    const existing = head.querySelector<HTMLLinkElement>(`link[${ATTR}="${name}"]`);
    const pending = existing?.sheet
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
          const link = existing ?? this.document.createElement('link');
          link.addEventListener('load', () => resolve(), { once: true });
          link.addEventListener(
            'error',
            () => {
              link.remove();
              this.loads.delete(name);
              reject(new Error(`Hyalo: palette "${name}" failed to load from ${link.href}`));
            },
            { once: true },
          );
          if (existing) return;
          link.rel = 'stylesheet';
          link.href = (this.config.paletteHref ?? defaultPaletteHref)(name);
          link.setAttribute(ATTR, name);
          head.appendChild(link);
        });
    this.loads.set(name, pending);
    return pending;
  }
}

/** Names end up in a selector and a URL, so only simple ones are allowed. */
function assertName(name: string): void {
  if (!VALID_NAME.test(name)) {
    throw new Error(`Hyalo: "${name}" is not a valid palette name. Use a-z, 0-9 and dashes.`);
  }
}
