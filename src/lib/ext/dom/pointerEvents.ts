export function isPrimaryButton(event: MouseEvent): boolean {
  return event.buttons === 1
}

export function capturePointer(event: PointerEvent, element: Element): () => void {
  element.setPointerCapture(event.pointerId)
  return () => element.releasePointerCapture(event.pointerId)
}
