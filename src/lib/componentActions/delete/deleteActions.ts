import { nil } from "#ext/stdlib/existence"
import * as Iterables from "#ext/stdlib/iterables"
import * as Ranges from "#ext/stdlib/ranges"

import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

export function deleteSelection({
  tableState,
  event,
}: {
  tableState: TableState
  event?: KeyboardEvent
}): void {
  if (nil(tableState.outlinedSection)) return

  event?.preventDefault()

  const allRowsSelected = Ranges.equals(
    tableState.outlinedSection.rowRange,
    tableState.table.rowRange,
  )

  const allColsSelected = Ranges.equals(
    tableState.outlinedSection.colRange,
    tableState.table.colRange,
  )

  const deletesRows =
    allColsSelected &&
    !allRowsSelected &&
    Iterables.range(tableState.outlinedSection.rowRange).every((row) =>
      tableState.table.hasEmptyRowAt(row),
    )
  const deletesCols =
    allRowsSelected &&
    !allColsSelected &&
    Iterables.range(tableState.outlinedSection.colRange).every((col) =>
      tableState.table.hasEmptyColAt(col),
    )
  const deletesTable =
    allRowsSelected &&
    allColsSelected &&
    Iterables.range(tableState.outlinedSection.colRange).every((col) =>
      tableState.table.hasEmptyColAt(col),
    )

  if (deletesRows) {
    tableState.table.removeRowsAt({
      row: tableState.outlinedSection.startRow,
      count: tableState.outlinedSection.rowCount,
    })

    const nextRow = tableState.table.hasRowAt(tableState.outlinedSection.startRow)
      ? tableState.outlinedSection.startRow
      : tableState.table.lastRowIndex
    const lastCell = { row: nextRow, col: tableState.table.lastColIndex }

    tableState.outlinedSection = TableSection.of({
      row: { start: nextRow, endExclusive: nextRow + 1 },
      col: tableState.table.colRange,
    })
    tableState.activeCell = lastCell
    tableState.anchorCell = lastCell
  } else if (deletesCols) {
    tableState.table.removeColsAt({
      col: tableState.outlinedSection.startCol,
      count: tableState.outlinedSection.colCount,
    })
    const nextCol = tableState.table.hasColAt(tableState.outlinedSection.startCol)
      ? tableState.outlinedSection.startCol
      : tableState.table.lastColIndex
    const lastCell = { row: tableState.table.lastRowIndex, col: nextCol }

    tableState.outlinedSection = TableSection.of({
      row: tableState.table.rowRange,
      col: { start: nextCol, endExclusive: nextCol + 1 },
    })
    tableState.activeCell = lastCell
    tableState.anchorCell = lastCell
  } else if (deletesTable) {
    tableState.deleteTable()
  } else {
    tableState.table.clearSection(tableState.outlinedSection)
  }
}
