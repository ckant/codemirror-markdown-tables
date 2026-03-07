import type { TableState } from "#componentModels/table/tableState.svelte"

import * as CellNodes from "#components/table/cell/cellNodes"
import * as CellViewNodes from "#components/table/cell/cellView/cellViewNodes"

export function measure(tableState: TableState): { width: number; height: number } {
  const cellElement = CellNodes.descendentCell(
    tableState.tableElement!,
    tableState.table.firstCellLocation,
  )!
  const cellViewElement = CellViewNodes.descendentCellView(cellElement)!

  const { minWidth } = getComputedStyle(cellElement)
  const { lineHeight, paddingTop, paddingBottom } = getComputedStyle(cellViewElement)

  const width = parseFloat(minWidth) + 1
  const height = parseFloat(lineHeight) + parseFloat(paddingTop) + parseFloat(paddingBottom) + 1

  return { width, height }
}
