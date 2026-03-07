import * as Numbers from "#ext/stdlib/numbers"
import type { Range } from "#ext/stdlib/range"
import * as Ranges from "#ext/stdlib/ranges"

import type { CellLocation } from "#core/models/cellLocation"
import type { RowOrCol } from "#core/models/rowOrCol"

export interface TableSectionProps {
  readonly row: Range
  readonly col: Range
}

export class TableSection {
  readonly row: Range
  readonly col: Range

  rowOrCol(rowOrCol: RowOrCol): Range {
    return rowOrCol === "row" ? this.row : this.col
  }

  get startRow(): number {
    return this.row.start
  }
  get startCol(): number {
    return this.col.start
  }
  startRowOrCol(rowOrCol: RowOrCol): number {
    return rowOrCol === "row" ? this.startRow : this.startCol
  }

  get endRow(): number {
    return this.row.endExclusive - 1
  }
  get endCol(): number {
    return this.col.endExclusive - 1
  }
  endRowOrCol(rowOrCol: RowOrCol): number {
    return rowOrCol === "row" ? this.endRow : this.endCol
  }

  get rowRange(): Range {
    return this.row
  }
  get colRange(): Range {
    return this.col
  }
  rowOrColRange(rowOrCol: RowOrCol): Range {
    return rowOrCol === "row" ? this.rowRange : this.colRange
  }

  get rowCount(): number {
    return this.row.endExclusive - this.row.start
  }
  get colCount(): number {
    return this.col.endExclusive - this.col.start
  }

  get topLeftCell(): CellLocation {
    return { row: this.startRow, col: this.startCol }
  }
  get topRightCell(): CellLocation {
    return { row: this.startRow, col: this.endCol }
  }
  get bottomRightCell(): CellLocation {
    return { row: this.endRow, col: this.endCol }
  }
  get bottomLeftCell(): CellLocation {
    return { row: this.endRow, col: this.startCol }
  }

  cornerCellAt(position: "top-left" | "top-right" | "bottom-right" | "bottom-left"): CellLocation {
    switch (position) {
      case "top-left": {
        return this.topLeftCell
      }
      case "top-right": {
        return this.topRightCell
      }
      case "bottom-right": {
        return this.bottomRightCell
      }
      case "bottom-left": {
        return this.bottomLeftCell
      }
    }
  }

  containsRow(row: number): boolean {
    return Ranges.includes(row, this.rowRange)
  }
  containsCol(col: number): boolean {
    return Ranges.includes(col, this.colRange)
  }
  containsCell({ row, col }: CellLocation): boolean {
    return this.containsRow(row) && this.containsCol(col)
  }

  containsOnEdge({ row, col }: CellLocation): {
    top: boolean
    right: boolean
    bottom: boolean
    left: boolean
  } {
    return this.containsCell({ row, col })
      ? {
          top: row === this.startRow,
          right: col === this.endCol,
          bottom: row === this.endRow,
          left: col === this.startCol,
        }
      : { top: false, right: false, bottom: false, left: false }
  }

  isSingleCell(): boolean {
    return this.rowCount === 1 && this.colCount === 1
  }

  shiftUp(): TableSection {
    return TableSection.of({
      row: { start: this.row.start - 1, endExclusive: this.row.endExclusive - 1 },
      col: { ...this.col },
    })
  }
  shiftRight(): TableSection {
    return TableSection.of({
      row: { ...this.row },
      col: { start: this.col.start + 1, endExclusive: this.col.endExclusive + 1 },
    })
  }
  shiftDown(): TableSection {
    return TableSection.of({
      row: { start: this.row.start + 1, endExclusive: this.row.endExclusive + 1 },
      col: { ...this.col },
    })
  }
  shiftLeft(): TableSection {
    return TableSection.of({
      row: { ...this.row },
      col: { start: this.col.start - 1, endExclusive: this.col.endExclusive - 1 },
    })
  }
  shift(rowOrCol: RowOrCol, direction: "backward" | "forward"): TableSection {
    if (rowOrCol === "row") {
      return direction === "backward" ? this.shiftUp() : this.shiftDown()
    } else {
      return direction === "backward" ? this.shiftLeft() : this.shiftRight()
    }
  }

  expandUp(): TableSection {
    return TableSection.of({
      row: { start: this.row.start - 1, endExclusive: this.row.endExclusive },
      col: { ...this.col },
    })
  }
  expandRight(): TableSection {
    return TableSection.of({
      row: { ...this.row },
      col: { start: this.col.start, endExclusive: this.col.endExclusive + 1 },
    })
  }
  expandDown(): TableSection {
    return TableSection.of({
      row: { start: this.row.start, endExclusive: this.row.endExclusive + 1 },
      col: { ...this.col },
    })
  }
  expandLeft(): TableSection {
    return TableSection.of({
      row: { ...this.row },
      col: { start: this.col.start - 1, endExclusive: this.col.endExclusive },
    })
  }

  contractUp(): TableSection {
    return TableSection.of({
      row: { start: this.row.start, endExclusive: this.row.endExclusive - 1 },
      col: { ...this.col },
    })
  }
  contractRight(): TableSection {
    return TableSection.of({
      row: { ...this.row },
      col: { start: this.col.start + 1, endExclusive: this.col.endExclusive },
    })
  }
  contractDown(): TableSection {
    return TableSection.of({
      row: { start: this.row.start + 1, endExclusive: this.row.endExclusive },
      col: { ...this.col },
    })
  }
  contractLeft(): TableSection {
    return TableSection.of({
      row: { ...this.row },
      col: { start: this.col.start, endExclusive: this.col.endExclusive - 1 },
    })
  }

  addForwardsByRowOrCol(
    rowOrCol: RowOrCol,
    { start, count }: { start: number; count: number },
  ): TableSection {
    if (start > this.endRowOrCol(rowOrCol)) return this

    const forwardShift = start <= this.startRowOrCol(rowOrCol) ? count : 0
    const growth = count

    return this.withRowOrCol(rowOrCol, {
      start: this.startRowOrCol(rowOrCol) + forwardShift,
      endExclusive: this.endRowOrCol(rowOrCol) + growth + 1,
    })
  }

  subtractBackwardsByRowOrCol(
    rowOrCol: RowOrCol,
    { start, count, min }: { start: number; count: number; min: number },
  ): TableSection | undefined {
    if (start - count - 1 >= this.endRowOrCol(rowOrCol)) return this
    if (start <= this.startRowOrCol(rowOrCol)) {
      const range = {
        start: Numbers.clamp(this.rowOrCol(rowOrCol).start - count, { min }),
        endExclusive: Numbers.clamp(this.rowOrCol(rowOrCol).endExclusive - count, { min }),
      }

      return Ranges.isEmpty(range) ? undefined : this.withRowOrCol(rowOrCol, range)
    }

    const originalRange = this.rowOrColRange(rowOrCol)
    const subtractedRange = { start: start - count, endExclusive: start }
    const shrunkenRange = {
      start: Numbers.max(originalRange.start, subtractedRange.start),
      endExclusive: Numbers.min(originalRange.endExclusive, subtractedRange.endExclusive),
    }

    const shrinkage = shrunkenRange.endExclusive - shrunkenRange.start
    const backwardShift = start > originalRange.endExclusive ? 0 : count - shrinkage

    const range = {
      start: Numbers.clamp(originalRange.start - backwardShift, { min }),
      endExclusive: Numbers.clamp(originalRange.endExclusive - backwardShift - shrinkage, { min }),
    }

    return Ranges.isEmpty(range) ? undefined : this.withRowOrCol(rowOrCol, range)
  }

  withRowOrCol(rowOrCol: RowOrCol, range: Range): TableSection {
    return rowOrCol === "row"
      ? TableSection.of({ row: range, col: { ...this.col } })
      : TableSection.of({ row: { ...this.row }, col: range })
  }

  static of(props: TableSectionProps): TableSection {
    return new TableSection(props)
  }

  static ofCell(cell: CellLocation): TableSection {
    return new TableSection({
      row: { start: cell.row, endExclusive: cell.row + 1 },
      col: { start: cell.col, endExclusive: cell.col + 1 },
    })
  }

  private constructor({ row, col }: TableSectionProps) {
    this.row = row
    this.col = col
  }
}
