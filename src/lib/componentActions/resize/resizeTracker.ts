import { def, nil } from "#ext/stdlib/existence"
import * as Iterables from "#ext/stdlib/iterables"
import * as Numbers from "#ext/stdlib/numbers"

import type { BorderHandle, TableHandle } from "#componentModels/table/handle/handle"
import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

import { type CellLocation } from "#core/models/cellLocation"
import * as CellLocations from "#core/models/cellLocations"
import type { Point } from "#core/models/point"
import { type RowOrCol } from "#core/models/rowOrCol"
import * as RowsOrCols from "#core/models/rowsOrCols"

export interface ResizeTrackerProps {
  readonly tableState: TableState
  readonly handle: ResizeHandle
  readonly position: Point
  readonly cellSizePixels: { row: number; col: number }
  readonly dragThresholdPixels: { row: number; col: number }
}

export class ResizeTracker {
  private readonly tableState: TableState
  private readonly type: RowOrCol | "table"
  private readonly initialHandle: BorderHandle | TableHandle
  private readonly initialRowOrColCount: { readonly row: number; readonly col: number }
  private readonly initialPosition: Point
  private readonly initialOutlinedSection: TableSection | undefined
  private readonly initialActiveCell: CellLocation | undefined
  private readonly initialAnchorCell: CellLocation | undefined
  private readonly cellSizePixels: { readonly row: number; readonly col: number }
  private readonly dragThresholdPixels: { readonly row: number; readonly col: number }

  private dragged: boolean

  start(): ResizeStartResult {
    return { activeHandle: { state: "active", handle: this.initialHandle } }
  }

  drag(resizeEvent: ResizeEvent): ResizeDragResult | undefined {
    this.dragged = true
    return this.calculateDrag(resizeEvent)
  }

  end(): ResizeDragEndResult | ResizeClickResult {
    return this.dragged ? { activeHandle: undefined } : this.calculateClick()
  }

  private calculateClick(): ResizeClickResult {
    if (this.type !== "table") return this.calculateClickRowOrCol(this.type)
    if (this.initialHandle.location === "right") return this.calculateClickRowOrCol("col")
    if (this.initialHandle.location === "bottom") return this.calculateClickRowOrCol("row")

    const rowCalculation = this.calculateClickRowOrCol("row")
    const colCalculation = this.calculateClickRowOrCol("col")
    return {
      operation: { row: rowCalculation.operation.row, col: colCalculation.operation.col },
      activeHandle: rowCalculation.activeHandle,
      activeCell:
        def(rowCalculation.activeCell) && def(colCalculation.activeCell)
          ? { row: rowCalculation.activeCell.row, col: colCalculation.activeCell.col }
          : undefined,
      anchorCell:
        def(rowCalculation.anchorCell) && def(colCalculation.anchorCell)
          ? { row: rowCalculation.anchorCell.row, col: colCalculation.anchorCell.col }
          : undefined,
      outlinedSection:
        def(rowCalculation.outlinedSection) && def(colCalculation.outlinedSection)
          ? TableSection.of({
              row: rowCalculation.outlinedSection.row,
              col: colCalculation.outlinedSection.col,
            })
          : undefined,
    }
  }

  private calculateClickRowOrCol(rowOrCol: RowOrCol): ResizeClickResult {
    const handleIndex =
      this.type === "table"
        ? this.tableState.table.lastRowOrColIndex(rowOrCol) + 1
        : (this.initialHandle as BorderHandle).index

    return {
      operation: { [rowOrCol]: { action: "add", index: handleIndex, count: 1 } },
      activeHandle:
        this.type === "table"
          ? undefined
          : {
              state: "hover",
              handle: {
                type: "border",
                location: this.handleLocationAt(handleIndex)!,
                index: handleIndex,
              },
            },
      ...this.calculateCellMovement(rowOrCol, 1),
    }
  }

  private calculateDrag(event: ResizeEvent): ResizeDragResult | undefined {
    if (this.type !== "table") return this.calculateDragRowOrCol(this.type, event)
    if (this.initialHandle.location === "right") return this.calculateDragRowOrCol("col", event)
    if (this.initialHandle.location === "bottom") return this.calculateDragRowOrCol("row", event)

    const rowCalculation = this.calculateDragRowOrCol("row", event)
    const colCalculation = this.calculateDragRowOrCol("col", event)
    if (nil(rowCalculation) && nil(colCalculation)) return undefined

    const rowMovement =
      rowCalculation ?? this.calculateCellMovement("row", this.rowOrColDiff("row"))
    const colMovement =
      colCalculation ?? this.calculateCellMovement("col", this.rowOrColDiff("col"))

    return {
      operation: { row: rowCalculation?.operation.row, col: colCalculation?.operation.col },
      activeHandle: rowCalculation?.activeHandle ?? colCalculation?.activeHandle,
      activeCell:
        def(rowMovement.activeCell) && def(colMovement.activeCell)
          ? { row: rowMovement.activeCell.row, col: colMovement.activeCell.col }
          : undefined,
      anchorCell:
        def(rowMovement.anchorCell) && def(colMovement.anchorCell)
          ? { row: rowMovement.anchorCell.row, col: colMovement.anchorCell.col }
          : undefined,
      outlinedSection:
        def(rowMovement.outlinedSection) && def(colMovement.outlinedSection)
          ? TableSection.of({
              row: rowMovement.outlinedSection.row,
              col: colMovement.outlinedSection.col,
            })
          : undefined,
    }
  }

  private calculateDragRowOrCol(
    rowOrCol: RowOrCol,
    event: ResizeEvent,
  ): ResizeDragResult | undefined {
    const coordinate = RowsOrCols.toCoordinate(rowOrCol)
    const totalMovementDiff = event.position[coordinate] - this.initialPosition[coordinate]

    const fullRowsOrColsDiff = Numbers.trunc(totalMovementDiff / this.cellSizePixels[rowOrCol])
    const remainingMovementDiff = totalMovementDiff % this.cellSizePixels[rowOrCol]
    const maybePartialRowsOrCols =
      remainingMovementDiff >= this.dragThresholdPixels[rowOrCol] ? 1 : 0

    const currentRowOrColDiff =
      this.tableState.table.rowOrColCount(rowOrCol) - this.initialRowOrColCount[rowOrCol]

    const totalRowOrColDiff = fullRowsOrColsDiff + maybePartialRowsOrCols

    const diff = totalRowOrColDiff - currentRowOrColDiff
    const start =
      this.type === "table"
        ? this.tableState.table.lastRowOrColIndex(rowOrCol) + 1
        : (this.initialHandle as BorderHandle).index + currentRowOrColDiff

    if (diff === 0) return undefined

    return diff > 0
      ? this.calculateDragRowOrColMore({ rowOrCol, start, length: diff })
      : this.calculateDragRowOrColLess({
          rowOrCol,
          start,
          length: Numbers.min(-diff, start, this.tableState.table.lastRowOrColIndex(rowOrCol)),
        })
  }

  private calculateDragRowOrColLess({
    rowOrCol,
    start,
    length,
  }: {
    rowOrCol: RowOrCol
    start: number
    length: number
  }): ResizeDragResult | undefined {
    let consecutiveEmptyElements = 0
    for (const i of Iterables.range({ start: start - 1, endExclusive: start - length - 1 })) {
      if (!this.tableState.table.hasEmptyRowOrColAt(rowOrCol, i)) break
      consecutiveEmptyElements++
    }
    if (consecutiveEmptyElements === 0) return undefined

    const newHandleIndex = start - (consecutiveEmptyElements - 1) - 1

    return {
      operation: {
        [rowOrCol]: {
          action: "remove",
          index: start - consecutiveEmptyElements,
          count: consecutiveEmptyElements,
        },
      },
      activeHandle:
        this.type === "table"
          ? { state: "active", handle: this.initialHandle }
          : {
              state: "active",
              handle: {
                type: "border",
                location: this.handleLocationAt(newHandleIndex)!,
                index: newHandleIndex,
              },
            },
      ...this.calculateCellMovement(
        rowOrCol,
        this.rowOrColDiff(rowOrCol) - consecutiveEmptyElements,
      ),
    }
  }

  private calculateDragRowOrColMore({
    rowOrCol,
    start,
    length,
  }: {
    rowOrCol: RowOrCol
    start: number
    length: number
  }): ResizeDragResult | undefined {
    return {
      operation: { [rowOrCol]: { action: "add", index: start, count: length } },
      activeHandle: {
        state: "active",
        handle:
          this.type === "table"
            ? this.initialHandle
            : {
                type: "border",
                location: this.handleLocationAt(start + length)!,
                index: start + length,
              },
      },
      ...this.calculateCellMovement(rowOrCol, this.rowOrColDiff(rowOrCol) + length),
    }
  }

  private calculateCellMovement(
    rowOrCol: RowOrCol,
    diff: number,
  ): {
    outlinedSection: TableSection | undefined
    activeCell: CellLocation | undefined
    anchorCell: CellLocation | undefined
  } {
    const start =
      this.type === "table"
        ? this.initialRowOrColCount[rowOrCol]
        : (this.initialHandle as BorderHandle).index

    if (diff >= 0) {
      return {
        outlinedSection: this.initialOutlinedSection?.addForwardsByRowOrCol(rowOrCol, {
          start,
          count: diff,
        }),
        activeCell: def(this.initialActiveCell)
          ? CellLocations.shiftRowOrColByAddition(rowOrCol, this.initialActiveCell, {
              start,
              count: diff,
            })
          : undefined,
        anchorCell: def(this.initialAnchorCell)
          ? CellLocations.shiftRowOrColByAddition(rowOrCol, this.initialAnchorCell, {
              start,
              count: diff,
            })
          : undefined,
      }
    } else {
      const subtracted = -diff

      const outlinedSection = this.initialOutlinedSection?.subtractBackwardsByRowOrCol(rowOrCol, {
        start,
        count: subtracted,
        min: this.tableState.table.firstRowOrColIndex(rowOrCol),
      })

      const boundary = def(outlinedSection)
        ? {
            min: outlinedSection.startRowOrCol(rowOrCol),
            max: outlinedSection.endRowOrCol(rowOrCol),
          }
        : undefined

      const activeCell = def(this.initialActiveCell)
        ? CellLocations.shiftOrClampRowOrColBySubtraction(rowOrCol, this.initialActiveCell, {
            start,
            count: subtracted,
            boundary,
          })
        : undefined

      const anchorCell = def(this.initialAnchorCell)
        ? CellLocations.shiftOrClampRowOrColBySubtraction(rowOrCol, this.initialAnchorCell, {
            start,
            count: subtracted,
            boundary,
          })
        : undefined

      return { outlinedSection, activeCell, anchorCell }
    }
  }

  private rowOrColDiff(rowOrCol: RowOrCol): number {
    return this.tableState.table.rowOrColCount(rowOrCol) - this.initialRowOrColCount[rowOrCol]
  }

  private handleLocationAt(index: number): BorderHandle["location"] | undefined {
    if (this.type === "table") return undefined
    if (this.type === "row" && index === this.tableState.table.firstRowIndex) return "top"
    if (this.type === "col" && index === this.tableState.table.firstColIndex) return "left"

    return this.type
  }

  private handleToType(resizeHandle: ResizeHandle): RowOrCol | "table" {
    if (resizeHandle.type === "table") return "table"
    if (resizeHandle.location === "top") return "row"
    if (resizeHandle.location === "left") return "col"
    return resizeHandle.location
  }

  static of(props: ResizeTrackerProps): ResizeTracker {
    return new ResizeTracker(props)
  }

  private constructor({
    tableState,
    handle,
    position,
    cellSizePixels,
    dragThresholdPixels,
  }: ResizeTrackerProps) {
    this.tableState = tableState
    this.type = this.handleToType(handle)
    this.initialHandle = handle
    this.initialPosition = position
    this.initialRowOrColCount = { row: tableState.table.rowCount, col: tableState.table.colCount }
    this.initialActiveCell = tableState.activeCell
    this.initialAnchorCell = tableState.anchorCell
    this.initialOutlinedSection = tableState.outlinedSection
    this.cellSizePixels = cellSizePixels
    this.dragThresholdPixels = dragThresholdPixels
    this.dragged = false
  }
}

export interface ResizeStartResult {
  readonly activeHandle: { state: "active" | "hover"; handle: ResizeHandle } | undefined
}

export interface ResizeClickResult {
  readonly operation: ResizeOperation
  readonly activeHandle: { state: "active" | "hover"; handle: ResizeHandle } | undefined
  readonly activeCell: CellLocation | undefined
  readonly anchorCell: CellLocation | undefined
  readonly outlinedSection: TableSection | undefined
}

export interface ResizeDragResult {
  readonly operation: ResizeOperation
  readonly activeHandle: { state: "active" | "hover"; handle: ResizeHandle } | undefined
  readonly activeCell: CellLocation | undefined
  readonly anchorCell: CellLocation | undefined
  readonly outlinedSection: TableSection | undefined
}

export interface ResizeDragEndResult {
  readonly activeHandle: undefined
}

export type ResizeHandle = BorderHandle | TableHandle

export interface ResizeOperation {
  readonly row?: { action: "add" | "remove"; index: number; count: number }
  readonly col?: { action: "add" | "remove"; index: number; count: number }
}

interface ResizeEvent {
  readonly position: Point
}
