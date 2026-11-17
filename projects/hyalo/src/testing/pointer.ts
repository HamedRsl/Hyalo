export function pointer(element: Element, type: string, x: number, y: number, id = 1): void {
 const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 });
 Object.defineProperties(event, { pointerId: { value: id }, isPrimary: { value: true }, pointerType: { value: 'touch' } });
 element.dispatchEvent(event);
}
