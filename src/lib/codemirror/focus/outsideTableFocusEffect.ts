import type { FocusChangeEffectSpec } from "@codemirror/view"

import * as TableEditorState from "#codemirror/state/tableEditorState"
import * as TableEffect from "#codemirror/transaction/tableEffect"

export const outsideTableFocusEffectSpec: FocusChangeEffectSpec = (state, focusing) => {
  if (
    !focusing ||
    !TableEditorState.getTableState(state).tables.some((table) => table.containsSelection())
  )
    // eslint-disable-next-line unicorn/no-null -- FocusChangeEffectSpec uses null
    return null

  // Refocus table when editor receives focus, but selection is inside table
  // This can happen if a key binding pressed inside the table changes the doc
  // and focuses the editor
  return TableEffect.of("table.focus")
}
