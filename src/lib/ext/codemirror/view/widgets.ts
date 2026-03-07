import type { EditorView } from "@codemirror/view"

import * as Nodes from "#ext/dom/nodes"

export const unknownHeight = -1

export function estimateHeight(view: EditorView, widgetElement: HTMLElement): number {
  const cmContent = document.createElement("div")
  cmContent.className = "cm-content"
  cmContent.appendChild(widgetElement)

  const cmScroller = document.createElement("div")
  cmScroller.className = "cm-scroller"
  cmScroller.appendChild(cmContent)

  const cmEditor = document.createElement("div")
  cmEditor.className = `cm-editor ${view.themeClasses}`
  cmEditor.appendChild(cmScroller)
  cmEditor.style = "visibility: hidden;"

  Nodes.doc(view.dom).body.appendChild(cmEditor)
  const { height } = widgetElement.getBoundingClientRect()
  Nodes.doc(view.dom).body.removeChild(cmEditor)

  return height
}
