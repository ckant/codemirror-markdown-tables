import * as Iterables from "#ext/stdlib/iterables"
import * as Numbers from "#ext/stdlib/numbers"

import type { CellLocation } from "#core/models/cellLocation"
import type { Point } from "#core/models/point"
import type { RowOrCol } from "#core/models/rowOrCol"

export interface RowOrColMeasurement {
  get start(): number
  get mid(): number
  get end(): number
  get size(): number
}

class InternalRowOrColMeasurement implements RowOrColMeasurement {
  start: number
  size: number

  get mid(): number {
    return this.start + this.size / 2
  }

  get end(): number {
    return this.start + this.size
  }

  static of(props: { start: number; size: number }): InternalRowOrColMeasurement {
    return new InternalRowOrColMeasurement(props)
  }

  private constructor({ start, size }: { start: number; size: number }) {
    this.start = start
    this.size = size
  }
}

export interface TableMeasurement {
  get rows(): RowOrColMeasurement[]
  get cols(): RowOrColMeasurement[]

  rowsOrCols(rowOrCol: RowOrCol): RowOrColMeasurement[]

  rowAt(row: number): RowOrColMeasurement
  colAt(col: number): RowOrColMeasurement
  rowOrColAt(rowOrCol: RowOrCol, index: number): RowOrColMeasurement

  get firstRow(): RowOrColMeasurement
  get firstCol(): RowOrColMeasurement
  firstRowOrCol(rowOrCol: RowOrCol): RowOrColMeasurement

  get lastRow(): RowOrColMeasurement
  get lastCol(): RowOrColMeasurement
  lastRowOrCol(rowOrCol: RowOrCol): RowOrColMeasurement

  get firstRowIndex(): number
  get firstColIndex(): number
  firstRowOrColIndex(rowOrCol: RowOrCol): number

  get lastRowIndex(): number
  get lastColIndex(): number
  lastRowOrColIndex(rowOrCol: RowOrCol): number

  get rowCount(): number
  get colCount(): number

  get minRowSize(): number
  get minColSize(): number

  moveRowOrColAt(
    rowOrCol: RowOrCol,
    { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
  ): void

  lastCellBeforePosition(position: Point): CellLocation
}

export namespace TableMeasurement {
  export function of(tableElement: HTMLTableElement, scrollOffset: Point): TableMeasurement {
    return InternalTableMeasurement.of(tableElement, scrollOffset)
  }
}

class InternalTableMeasurement implements TableMeasurement {
  readonly rows: InternalRowOrColMeasurement[]
  readonly cols: InternalRowOrColMeasurement[]

  rowsOrCols(rowOrCol: RowOrCol): InternalRowOrColMeasurement[] {
    return rowOrCol === "row" ? this.rows : this.cols
  }

  rowAt(row: number): InternalRowOrColMeasurement {
    return this.rows[row]
  }
  colAt(col: number): InternalRowOrColMeasurement {
    return this.cols[col]
  }
  rowOrColAt(rowOrCol: RowOrCol, index: number): InternalRowOrColMeasurement {
    return rowOrCol === "row" ? this.rowAt(index) : this.colAt(index)
  }

  get firstRow(): InternalRowOrColMeasurement {
    return this.rows[this.firstRowIndex]
  }
  get firstCol(): InternalRowOrColMeasurement {
    return this.cols[this.firstColIndex]
  }
  firstRowOrCol(rowOrCol: RowOrCol): InternalRowOrColMeasurement {
    return rowOrCol === "row" ? this.firstRow : this.firstCol
  }

  get lastRow(): InternalRowOrColMeasurement {
    return this.rows[this.lastRowIndex]
  }
  get lastCol(): InternalRowOrColMeasurement {
    return this.cols[this.lastColIndex]
  }
  lastRowOrCol(rowOrCol: RowOrCol): InternalRowOrColMeasurement {
    return rowOrCol === "row" ? this.lastRow : this.lastCol
  }

  readonly firstRowIndex = 0
  readonly firstColIndex = 0
  firstRowOrColIndex(_rowOrCol: RowOrCol): number {
    return 0
  }

  get lastRowIndex(): number {
    return this.rowCount - 1
  }
  get lastColIndex(): number {
    return this.colCount - 1
  }
  lastRowOrColIndex(rowOrCol: RowOrCol): number {
    return rowOrCol === "row" ? this.lastRowIndex : this.lastColIndex
  }

  get rowCount(): number {
    return this.rows.length
  }
  get colCount(): number {
    return this.cols.length
  }

  get minRowSize(): number {
    return Numbers.min(...this.rows.map((row) => row.size))
  }

  get minColSize(): number {
    return Numbers.min(...this.cols.map((col) => col.size))
  }

  moveRowOrColAt(
    rowOrCol: RowOrCol,
    { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
  ): void {
    if (fromIndex === toIndex) return

    const elements = this.rowsOrCols(rowOrCol)
    const element = elements[fromIndex]

    if (fromIndex < toIndex) {
      for (const i of Iterables.range({ start: fromIndex, endExclusive: toIndex })) {
        elements[i] = elements[i + 1]
        elements[i].start -= element.size
      }
      element.start = elements[toIndex].start + elements[toIndex].size
    } else {
      for (const i of Iterables.range({ start: fromIndex, endExclusive: toIndex })) {
        elements[i] = elements[i - 1]
        elements[i].start += element.size
      }
      element.start = elements[toIndex].start - element.size
    }

    elements[toIndex] = element
  }

  lastCellBeforePosition(position: Point): CellLocation {
    const maybeRow = this.rows.map((it) => it.start).findLastIndex((start) => start < position.y)
    const maybeCol = this.cols.map((it) => it.start).findLastIndex((start) => start < position.x)

    return { row: maybeRow === -1 ? 0 : maybeRow, col: maybeCol === -1 ? 0 : maybeCol }
  }

  static of(tableElement: HTMLTableElement, scrollOffset: Point): InternalTableMeasurement {
    return new InternalTableMeasurement(tableElement, scrollOffset)
  }

  private constructor(tableElement: HTMLTableElement, scrollOffset: Point) {
    const firstRowCells = [
      ...tableElement.querySelectorAll<HTMLTableCellElement>("tr:first-child > th"),
    ]
    const firstColCells: HTMLTableCellElement[] = [
      ...tableElement.querySelectorAll<HTMLTableCellElement>(
        "tr > th:first-child,tr > td:first-child",
      ),
    ]

    // Remove for 1px border on left and top
    this.rows = firstColCells.map((cell, i) => {
      const { top, height } = clientRect(cell, scrollOffset)
      const offset = i === 0 ? 0 : 0
      return InternalRowOrColMeasurement.of({ start: top + offset, size: height - offset })
    })
    this.cols = firstRowCells.map((cell, i) => {
      const { left, width } = clientRect(cell, scrollOffset)
      const offset = i === 0 ? 1 : 0
      return InternalRowOrColMeasurement.of({ start: left + offset, size: width - offset })
    })
  }
}

function clientRect(
  node: HTMLElement,
  scrollOffset: Point,
): Record<"top" | "left" | "width" | "height", number> {
  const { top, left, width, height } = node.getBoundingClientRect()
  return { top: top + scrollOffset.y, left: left + scrollOffset.x, width, height }
}
