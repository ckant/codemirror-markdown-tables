import { Text } from "@codemirror/state"
import type { ClipboardInputFilterSpec } from "@codemirror/view"

import * as EditorSelections from "#ext/codemirror/state/editorSelections"
import { nil } from "#ext/stdlib/existence"

import * as TableInserter from "#core/tableInserter"
import * as TableParser from "#core/tableParser"

/**
 * Formats, prettifies, and adds line breaks around pasted tables.
 */
export const tableClipboardInputFilterSpec: ClipboardInputFilterSpec = (
  pastedText,
  { selection, doc, lineBreak },
) => {
  if (!EditorSelections.isSingle(selection)) return pastedText

  const tableProps = TableParser.parseOrNil(Text.of(pastedText.split(/\r\n|\n|\r/)))
  if (nil(tableProps)) return pastedText

  const { from, to } = selection.main
  const { before, after } = TableInserter.computeInsertion({ doc, lineBreak, span: { from, to } })
  return `${before?.insert ?? ""}${tableProps.text.toString()}${after?.insert ?? ""}`
}
