import * as Arrays from "#ext/stdlib/arrays"
import { def, nil } from "#ext/stdlib/existence"
import * as Numbers from "#ext/stdlib/numbers"
import type { Range } from "#ext/stdlib/range"
import * as Ranges from "#ext/stdlib/ranges"

import type { CellMovement, MoveView } from "#componentActions/move/moveView"

import { TableMeasurement } from "#componentModels/table/tableMeasurement"
import { TableSection } from "#componentModels/table/tableSection"

import type { CellLocation } from "#core/models/cellLocation"
import type { Coordinate } from "#core/models/coordinate"
import type { Point } from "#core/models/point"
import type { RowOrCol } from "#core/models/rowOrCol"

export interface MoveTrackerProps {
  readonly rowOrCol: RowOrCol
  readonly index: number
  readonly position: Point
  readonly subject: TableSection
  readonly tableElement: HTMLTableElement
  readonly scrollOffsetX: () => number
  readonly scrollOffsetY: () => number
}

export class MoveTracker {
  private readonly coordinate: Coordinate
  private readonly initialIndex: number
  private readonly size: number
  private readonly initialPosition: number
  private readonly minBound: number
  private readonly maxBound: number
  private readonly scrollOffsetX: () => number
  private readonly scrollOffsetY: () => number
  private readonly subject: TableSection
  private readonly rowOrCol: RowOrCol
  private readonly tableMeasurement: TableMeasurement

  private currentIndex: number
  private currentPosition: number
  private dragged: boolean

  start(): MoveView {
    return { cellMovement: (cellLocation) => this.cellMovement(cellLocation) }
  }

  drag(position: Point): MoveView {
    this.currentPosition = position[this.coordinate]

    const { currentIndex, move } = this.calculateDrag()
    this.currentIndex = currentIndex
    if (this.initialIndex !== this.currentIndex) this.dragged = true

    if (def(move)) this.tableMeasurement.moveRowOrColAt(this.rowOrCol, move)

    return { cellMovement: (cellLocation) => this.cellMovement(cellLocation) }
  }

  end(): { moved: false; dragged: boolean } | { moved: true; toIndex: number } {
    return this.initialIndex === this.currentIndex
      ? { moved: false, dragged: this.dragged }
      : { moved: true, toIndex: this.currentIndex }
  }

  private cellMovement(cellLocation: CellLocation): CellMovement {
    return {
      border: this.cellBorder(cellLocation),
      state: this.cellState(cellLocation),
      translate: this.cellTranslate(cellLocation),
    }
  }

  private cellBorder(cellLocation: CellLocation): {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  } {
    const rowOrColBorder = this.isRowOrColExposed(cellLocation[this.rowOrCol])
    const isSubject = this.subject.containsCell(cellLocation)

    return this.rowOrCol === "row"
      ? {
          top: rowOrColBorder,
          right: true,
          bottom: !isSubject || cellLocation.row === this.tableMeasurement.lastRowIndex,
          left: this.tableMeasurement.firstColIndex === cellLocation.col,
        }
      : {
          top: this.tableMeasurement.firstRowIndex === cellLocation.row,
          right: !isSubject || cellLocation.col === this.tableMeasurement.lastColIndex,
          bottom: true,
          left: rowOrColBorder,
        }
  }

  private cellState(cellLocation: CellLocation): "moving" | "shiftable" {
    return this.subject.containsCell(cellLocation) ? "moving" : "shiftable"
  }

  private cellTranslate(cellLocation: CellLocation): Point {
    const rowOrColTranslate = this.rowOrColTranslate(cellLocation[this.rowOrCol])

    return this.rowOrCol === "row" ? { x: 0, y: rowOrColTranslate } : { x: rowOrColTranslate, y: 0 }
  }

  private isRowOrColExposed(index: number): boolean {
    const reorderedIndex = this.reorderIndex(index)

    const isFirst = reorderedIndex === this.tableMeasurement.firstRowOrColIndex(this.rowOrCol)
    const isRightAfterSubject = reorderedIndex === this.currentIndex + 1

    return isFirst || isRightAfterSubject
  }

  private get rowOrColShift(): RowOrColShift | undefined {
    if (this.currentIndex === this.initialIndex) return undefined
    return this.currentIndex < this.initialIndex
      ? {
          direction: "forwards",
          range: { start: this.currentIndex, endExclusive: this.initialIndex },
          indexDiff: 1,
          positionDiff: this.size - 1,
        }
      : {
          direction: "backwards",
          range: { start: this.initialIndex + 1, endExclusive: this.currentIndex + 1 },
          indexDiff: -1,
          positionDiff: 1 - this.size,
        }
  }

  private rowOrColTranslate(index: number): number {
    if (index === this.initialIndex) {
      return Numbers.clamp(this.currentPosition - this.initialPosition, {
        min: this.minBound,
        max: this.maxBound,
      })
    }

    const shift = this.rowOrColShift
    if (nil(shift)) return 0

    return Ranges.includes(index, shift.range) ? shift.positionDiff : 0
  }

  private reorderIndex(originalIndex: number): number {
    const shift = this.rowOrColShift
    if (nil(shift)) return originalIndex
    if (originalIndex === this.initialIndex) return this.currentIndex

    if (Ranges.includes(originalIndex, shift.range)) return originalIndex + shift.indexDiff

    return originalIndex
  }

  private calculateDrag(): ReorderInstruction {
    const elements = this.tableMeasurement.rowsOrCols(this.rowOrCol)

    const currentSlot = {
      name: "current",
      index: this.currentIndex,
      mid: elements[this.currentIndex].mid,
    }

    const leftSlot =
      this.currentIndex !== this.tableMeasurement.firstRowOrColIndex(this.rowOrCol)
        ? {
            name: "left",
            index: this.currentIndex - 1,
            mid: elements[this.currentIndex - 1].start + elements[this.currentIndex].size / 2,
          }
        : undefined

    const rightSlot =
      this.currentIndex !== this.tableMeasurement.lastRowOrColIndex(this.rowOrCol)
        ? {
            name: "right",
            index: this.currentIndex + 1,
            mid:
              elements[this.currentIndex].start +
              elements[this.currentIndex + 1].size +
              elements[this.currentIndex].size / 2,
          }
        : undefined

    const closestSlot = Arrays.minBy(
      Arrays.compact([currentSlot, leftSlot, rightSlot]),
      (first, second) =>
        Numbers.abs(this.currentPosition - first.mid) -
        Numbers.abs(this.currentPosition - second.mid),
    )

    return closestSlot.name === "current"
      ? { currentIndex: this.currentIndex, move: undefined }
      : {
          currentIndex: closestSlot.index,
          move: { fromIndex: this.currentIndex, toIndex: closestSlot.index },
        }
  }

  static of(props: MoveTrackerProps): MoveTracker {
    return new MoveTracker(props)
  }

  private constructor({
    rowOrCol,
    index,
    position,
    subject,
    tableElement,
    scrollOffsetX,
    scrollOffsetY,
  }: MoveTrackerProps) {
    this.scrollOffsetX = scrollOffsetX
    this.scrollOffsetY = scrollOffsetY

    const tableMeasurement = TableMeasurement.of(tableElement, {
      x: this.scrollOffsetX(),
      y: this.scrollOffsetY(),
    })

    this.rowOrCol = rowOrCol
    this.coordinate = rowOrCol === "row" ? "y" : "x"
    this.initialIndex = index
    this.initialPosition = position[this.coordinate]
    this.minBound =
      tableMeasurement.firstRowOrCol(this.rowOrCol).start -
      tableMeasurement.rowOrColAt(this.rowOrCol, index).start
    this.maxBound =
      tableMeasurement.lastRowOrCol(this.rowOrCol).end -
      tableMeasurement.rowOrColAt(this.rowOrCol, index).end
    this.size = tableMeasurement.rowOrColAt(this.rowOrCol, index).size
    this.subject = subject
    this.dragged = false
    this.tableMeasurement = tableMeasurement
    this.currentIndex = index
    this.currentPosition = position[this.coordinate]
  }
}

export interface ReorderInstruction {
  readonly currentIndex: number
  readonly move: { readonly fromIndex: number; readonly toIndex: number } | undefined
}

interface RowOrColShift {
  readonly direction: "forwards" | "backwards"
  readonly indexDiff: -1 | 1
  readonly positionDiff: number
  readonly range: Range
}
