import type { EditorState } from "@codemirror/state"
import { type AttrSource, EditorView } from "@codemirror/view"

import * as Browsers from "#ext/dom/browsers"

import * as TableEditorState from "#codemirror/state/tableEditorState"

export function tableEditorAttributesSpec(state: EditorState): AttrSource {
  const { handlePosition, selectionType, lineWrapping } = TableEditorState.getTableConfig(state)

  return {
    // Enable styling hoverability based on element data
    // CodeMirror support for media queries has parsing issues
    ...(Browsers.hoverable(window) ? { "data-tbl-hoverable": "" } : {}),
    // Enable styling light and dark themes based on element data since
    // CodeMirror only supports reading `darkTheme` property in javascript
    "data-tbl-theme-mode": state.facet(EditorView.darkTheme) ? "dark" : "light",
    "data-tbl-handle-position": handlePosition,
    "data-tbl-selection-type": selectionType,
    "data-tbl-line-wrapping": lineWrapping,
  }
}
