import type { StateCommand } from "@codemirror/state"

import * as Arrays from "#ext/stdlib/arrays"
import * as Assert from "#ext/stdlib/assert"

import * as TableInserter from "#core/tableInserter"

const defaultSize = { rows: 2, cols: 2 } as const

/**
 * Replaces the current selection with an empty table of the given {@link size},
 * adding line breaks around the table if necessary.
 *
 * Defaults to a 2x2 table.
 */
export function of(options?: {
  readonly size?: { readonly rows: number; readonly cols: number }
}): StateCommand {
  const { rows, cols } = options?.size ?? defaultSize
  Assert.positiveInteger(rows)
  Assert.positiveInteger(cols)

  return ({ state, dispatch }) => {
    const { anchor, head } = state.selection.main
    const { from, to } = anchor <= head ? { from: anchor, to: head } : { from: head, to: anchor }

    const { before, after } = TableInserter.computeInsertion({
      doc: state.doc,
      lineBreak: state.lineBreak,
      span: { from, to },
    })

    const [headerRow, ...dataRows] = Arrays.repeat(`${"|   ".repeat(cols)}|`, { count: rows })
    const alignmentRow = `${"| - ".repeat(cols)}|`
    const table = `${before?.insert ?? ""}${[headerRow, alignmentRow, ...dataRows].join(state.lineBreak)}${after?.insert ?? ""}`

    dispatch(
      state.update({
        changes: { from, to, insert: table },
        selection: { anchor: from + 2 + (before?.count ?? 0) },
      }),
    )

    return true
  }
}
