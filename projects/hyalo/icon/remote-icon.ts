import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, InjectionToken, PLATFORM_ID, inject, type Provider } from '@angular/core';
import { Observable, defer, of, shareReplay, finalize } from 'rxjs';
import type { HyIconDef, HyIconNode } from './icons';

export interface HyRemoteIconSource {
  readonly url: string;
  readonly mirrorRtl?: boolean;
}

type HyRemoteIconSources = Readonly<Record<string, HyRemoteIconSource>>;

export const HY_REMOTE_ICONS = new InjectionToken<readonly HyRemoteIconSources[]>('HY_REMOTE_ICONS');

/** Registers SVG URLs by qualified name, such as `brand:mark`. */
export function provideHyaloRemoteIcons(sources: HyRemoteIconSources): Provider {
  for (const name of Object.keys(sources)) {
    if (!/^[\w-]+:[\w-]+$/.test(name)) throw new Error('Remote icon names require a namespace.');
  }
  return { provide: HY_REMOTE_ICONS, multi: true, useValue: sources };
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const TAGS = new Set(['path', 'circle', 'line', 'rect', 'polyline', 'polygon', 'ellipse']);
const GEOMETRY = new Set(['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'width', 'height', 'points', 'transform']);
const NUMERIC = new Set(['stroke-width', 'opacity']);
const PAINT = /^(?:none|currentColor|#[0-9a-f]{3,8}|[a-z]+)$/i;
const VIEWBOX = /^[-+\d.eE]+(?:[\s,]+[-+\d.eE]+){3}$/;

function parseIcon(source: string, mirrorRtl?: boolean): HyIconDef {
  if (source.length > 65536 || /<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('Unsupported SVG document.');
  const root = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
  if (root.namespaceURI !== SVG_NS || root.localName !== 'svg') throw new Error('Expected SVG document.');
  const viewBox = root.getAttribute('viewBox')?.trim();
  if (viewBox && (!VIEWBOX.test(viewBox) || viewBox.split(/[\s,]+/).some((value) => !Number.isFinite(Number(value))))) {
    throw new Error('Invalid SVG viewBox.');
  }
  const node: HyIconNode[number][] = [];
  const attributes = [...GEOMETRY, ...NUMERIC, 'fill', 'stroke'];
  for (const child of root.children) {
    if (child.namespaceURI !== SVG_NS || !TAGS.has(child.localName) || child.children.length) {
      throw new Error('Unsupported SVG shape.');
    }
    const attrs: Record<string, string> = { fill: 'currentColor', stroke: 'none' };
    for (const name of attributes) {
      const value = child.getAttribute(name) ?? (name === 'fill' || name === 'stroke' ? root.getAttribute(name) : null);
      if (value === null) continue;
      if ((name === 'fill' || name === 'stroke') && !PAINT.test(value)) continue;
      if (NUMERIC.has(name) && !Number.isFinite(Number(value))) continue;
      attrs[name] = value;
    }
    node.push([child.localName, attrs]);
  }
  if (!node.length) throw new Error('Expected at least one SVG shape.');
  return { node, viewBox, mirrorRtl };
}

/** @internal Shared lifetime and validated geometry cache for opt-in SVG assets. */
@Injectable({ providedIn: 'root' })
export class HyRemoteIconLoader {
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cache = new WeakMap<HyRemoteIconSource, HyIconDef>();
  private readonly pending = new WeakMap<HyRemoteIconSource, Observable<HyIconDef>>();

  load(source: HyRemoteIconSource): Observable<HyIconDef> {
    return defer(() => {
      if (!this.browser) return of();
      const cached = this.cache.get(source);
      if (cached) return of(cached);
      const current = this.pending.get(source);
      if (current) return current;
      const request = new Observable<HyIconDef>((subscriber) => {
        const controller = new AbortController();
        let url: URL;
        try {
          url = new URL(source.url, this.doc.baseURI);
          if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
            throw new Error('Expected an HTTP(S) icon URL.');
          }
        } catch (error) {
          subscriber.error(error);
          return;
        }
        void fetch(url, { signal: controller.signal, credentials: 'same-origin', redirect: 'error' }).then(async (response) => {
          if (!response.ok) throw new Error('Remote icon request failed.');
          const icon = parseIcon(await response.text(), source.mirrorRtl);
          if (!subscriber.closed) {
            this.cache.set(source, icon);
            subscriber.next(icon);
            subscriber.complete();
          }
        }).catch((error: unknown) => subscriber.error(error));
        return () => controller.abort();
      }).pipe(
        finalize(() => this.pending.delete(source)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
      this.pending.set(source, request);
      return request;
    });
  }
}
