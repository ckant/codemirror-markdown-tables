import * as Nodes from "#ext/dom/nodes"

export function onResize(
  element: HTMLElement,
  callback: ({ height }: { height: number }) => void,
): () => void {
  const win = Nodes.win(element)
  const resizeObserver = new win.ResizeObserver(([entry], _observer) => {
    const {
      borderBoxSize: [size],
    } = entry

    callback({ height: size.blockSize })
  })
  resizeObserver.observe(element, { box: "border-box" })
  return () => resizeObserver.disconnect()
}
