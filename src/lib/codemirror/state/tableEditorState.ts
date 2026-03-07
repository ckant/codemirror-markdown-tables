import { EditorState } from "@codemirror/state"
import type { EditorView } from "@codemirror/view"

import type { TableConfig } from "#codemirror/config/tableConfig"
import { tableConfigFacet } from "#codemirror/config/tableConfigFacet"
import { tablesStateField, type TableState } from "#codemirror/state/tablesStateField"
import { viewStateField } from "#codemirror/state/viewStateField"

export function getTableConfig(state: EditorState): TableConfig {
  return state.facet(tableConfigFacet)
}

export function getTableState(state: EditorState): TableState {
  return state.field(tablesStateField)
}

export function getView(state: EditorState): EditorView | undefined {
  return state.field(viewStateField).view
}
