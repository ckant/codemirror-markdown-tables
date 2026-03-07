import type { EditorView } from "@codemirror/view"

import * as Nodes from "#ext/dom/nodes"
import { def } from "#ext/stdlib/existence"

export function hasFocus(view: EditorView): boolean {
  return def(Nodes.doc(view.dom).activeElement?.closest(".cm-panels"))
}
