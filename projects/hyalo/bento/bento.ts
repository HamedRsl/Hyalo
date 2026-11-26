import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  input,
  numberAttribute,
  model,
  output,
  contentChildren,
  afterRenderEffect,
  ElementRef,
  inject,
} from '@angular/core';
import { injectId } from '@hyalo/angular/core';
@Component({
  selector: 'hy-bento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bento.html',
  styleUrl: './bento.css',
})
export class HyBento {
  readonly order = model<readonly string[]>([]);
  readonly reorderable = input(false);
  readonly reordered = output<readonly string[]>();
  private readonly tiles = contentChildren(HyBentoTile);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private dragged: string | null = null;
  constructor() {
    afterRenderEffect(() => {
      const tiles = this.tiles(),
        order = this.order(),
        grid = this.element.querySelector('.grid');
      if (!grid || !tiles.length) return;
      const sorted = [...tiles].sort((a, b) => {
        const ai = order.indexOf(a.tileId()),
          bi = order.indexOf(b.tileId());
        return (ai < 0 ? order.length : ai) - (bi < 0 ? order.length : bi);
      });
      const focused = grid.contains(grid.ownerDocument.activeElement)
        ? grid.ownerDocument.activeElement as HTMLElement
        : null;
      const elements = new Set(tiles.map((tile) => tile.element));
      const current = Array.from(grid.children).filter((child) => elements.has(child as HTMLElement));
      if (sorted.every((tile, index) => current[index] === tile.element)) return;
      for (const tile of sorted) grid.appendChild(tile.element);
      if (focused?.isConnected) focused.focus({ preventScroll: true });
    });
  }
  private normalizedOrder(): string[] {
    const ids = this.tiles().map((tile) => tile.tileId());
    return [...new Set([...this.order().filter((id) => ids.includes(id)), ...ids])];
  }
  move(id: string, index: number): void {
    if (!Number.isInteger(index)) return;
    const current = this.normalizedOrder();
    const from = current.indexOf(id);
    if (from < 0) return;
    const target = Math.max(0, Math.min(current.length - 1, index));
    if (target === from) return;
    current.splice(from, 1);
    current.splice(target, 0, id);
    this.order.set(current);
    this.reordered.emit(current);
  }
  start(event: DragEvent, id: string): void {
    if (!this.reorderable()) return;
    this.dragged = id;
    event.dataTransfer?.setData('text/plain', id);
  }
  drop(event: DragEvent, id: string): void {
    event.preventDefault();
    if (this.reorderable() && this.dragged) {
      const order = this.normalizedOrder();
      this.move(this.dragged, order.indexOf(id));
    }
    this.dragged = null;
  }
  endDrag(): void { this.dragged = null; }
  key(event: KeyboardEvent, id: string): void {
    if (
      !this.reorderable() ||
      !event.altKey ||
      !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return;
    event.preventDefault();
    const order = this.normalizedOrder();
    this.move(id, order.indexOf(id) + (['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1));
  }
}
@Directive({
  selector: '[hyBentoTile]',
  host: {
    '[style.--hy-bento-columns]': 'safeColumns',
    '[attr.draggable]': 'bento?.reorderable() || null',
    '[attr.tabindex]': 'bento?.reorderable() ? 0 : null',
    '(dragstart)': 'bento?.start($event,tileId())',
    '(dragend)': 'bento?.endDrag()',
    '(dragover)': '$event.preventDefault()',
    '(drop)': 'bento?.drop($event,tileId())',
    '(keydown)': 'bento?.key($event,tileId())',
    '[style.grid-row]': '"span "+safeRows',
    '[style.grid-column]': '"span var(--hy-bento-span, "+safeColumns+")"',
    '[style.min-inline-size]': '"0"',
  },
})
export class HyBentoTile {
  readonly tileId = input(injectId('tile'));
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly bento = inject(HyBento, { optional: true });
  readonly columns = input(1, { transform: numberAttribute });
  readonly rows = input(1, { transform: numberAttribute });
  get safeColumns(): number {
    return Math.min(3, Math.max(1, Math.floor(this.columns()) || 1));
  }
  get safeRows(): number {
    return Math.min(6, Math.max(1, Math.floor(this.rows()) || 1));
  }
}
export const HY_BENTO = [HyBento, HyBentoTile] as const;
