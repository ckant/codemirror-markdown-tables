import { type EditorState, RangeSetBuilder } from "@codemirror/state"
import { Decoration, type DecorationSet, type ReplaceDecorationSpec } from "@codemirror/view"

import { TableWidget } from "#codemirror/decoration/tableWidget.svelte"
import { TableDescription } from "#codemirror/state/tableDescription.svelte"

function tableReplaceDecorationSpec(
  tableDescription: TableDescription,
  state: EditorState,
): ReplaceDecorationSpec {
  return {
    widget: TableWidget.of(tableDescription, state),
    block: true,
    inclusive: true,
  }
}

function tableReplaceDecoration(
  tableDescription: TableDescription,
  state: EditorState,
): Decoration {
  return Decoration.replace(tableReplaceDecorationSpec(tableDescription, state))
}

export function of(tables: readonly TableDescription[], state: EditorState): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  for (const table of tables) {
    builder.add(table.from, table.to, tableReplaceDecoration(table, state))
  }
  return builder.finish()
}
