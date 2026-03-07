import { Text } from "@codemirror/state"

import * as Texts from "#ext/codemirror/state/texts"
import { def, nil } from "#ext/stdlib/existence"
import * as Numbers from "#ext/stdlib/numbers"

import * as DeleteActions from "#componentActions/delete/deleteActions"

import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

import { Table } from "#core/models/table.svelte"
import * as TableFormatter from "#core/tableFormatter"

export function copySelection(props: { event: ClipboardEvent; tableState: TableState }): void {
  copyOrCutSection(props, "copy")
}

export function cutSelection(props: { event: ClipboardEvent; tableState: TableState }): void {
  copyOrCutSection(props, "cut")
}

export function paste({
  event,
  tableState,
}: {
  event: ClipboardEvent
  tableState: TableState
}): void {
  if (nil(tableState.outlinedSection)) return

  const text = event.clipboardData!.getData("text/plain")
  const table = Table.maybeOf(Text.of(text.split(/\r\n|\n|\r/)))
  if (def(table)) {
    event.preventDefault()
    event.stopPropagation()

    pasteTable(table, tableState)
  } else if (!tableState.selection.isCell()) {
    event.preventDefault()
    event.stopPropagation()

    pasteTable(tableOfCell(text), tableState)
  }
}

function pasteTable(table: Table, tableState: TableState): void {
  const {
    startRow: outlinedStartRow,
    startCol: outlinedStartCol,
    rowCount: outlinedRowCount,
    colCount: outlinedColCount,
  } = tableState.outlinedSection!

  const rowMultiples = Numbers.floor(outlinedRowCount / table.rowCount)
  const colMultiples = Numbers.floor(outlinedColCount / table.colCount)
  table.tile({
    rowRepeat: Numbers.clamp(rowMultiples - 1, { min: 0 }),
    colRepeat: Numbers.clamp(colMultiples - 1, { min: 0 }),
  })

  tableState.table.merge(table, { row: outlinedStartRow, col: outlinedStartCol })

  tableState.outlinedSection = TableSection.of({
    row: { start: outlinedStartRow, endExclusive: outlinedStartRow + table.rowCount },
    col: { start: outlinedStartCol, endExclusive: outlinedStartCol + table.colCount },
  })

  if (nil(tableState.anchorCell)) tableState.anchorCell = tableState.activeCell!
  const anchorTop = tableState.anchorCell.row <= tableState.activeCell!.row
  const anchorLeft = tableState.anchorCell.col <= tableState.activeCell!.col
  tableState.anchorCell = tableState.outlinedSection.cornerCellAt(
    `${anchorTop ? "top" : "bottom"}-${anchorLeft ? "left" : "right"}`,
  )
  tableState.activeCell = tableState.outlinedSection.cornerCellAt(
    `${anchorTop ? "bottom" : "top"}-${anchorLeft ? "right" : "left"}`,
  )
  tableState.focusTable()
}

function tableOfCell(unsanitizedText: string): Table {
  const { text } = TableFormatter.format([[Texts.ofString(unsanitizedText)]], ["none"])
  return Table.of(text)
}

function copyOrCutSection(
  {
    event,
    tableState,
  }: {
    event: ClipboardEvent
    tableState: TableState
  },
  action: "copy" | "cut",
): void {
  if (nil(tableState.outlinedSection) || tableState.selection.isCell()) return
  event.preventDefault()
  event.stopPropagation()

  const subtable = tableState.table.sliceSectionAt(tableState.outlinedSection)
  event.clipboardData?.setData("text/plain", subtable.text.toString())
  if (action === "cut") DeleteActions.deleteSelection({ tableState })
}
