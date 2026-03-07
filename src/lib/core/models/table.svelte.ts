import { type Line, Text } from "@codemirror/state"

import * as Texts from "#ext/codemirror/state/texts"
import * as Arrays from "#ext/stdlib/arrays"
import * as Assert from "#ext/stdlib/assert"
import { def } from "#ext/stdlib/existence"
import * as Numbers from "#ext/stdlib/numbers"
import type { Range } from "#ext/stdlib/range"
import * as Ranges from "#ext/stdlib/ranges"
import * as Repeat from "#ext/stdlib/repeat"
import * as SortedArrays from "#ext/stdlib/sortedArrays"
import type { Span } from "#ext/stdlib/span"

import { TableSection } from "#componentModels/table/tableSection"
import * as TableTexts from "#componentModels/table/tableTexts"

import type { Alignment } from "#core/models/alignment"
import type { CellLocation } from "#core/models/cellLocation"
import { type RowOrCol } from "#core/models/rowOrCol"
import * as TableParser from "#core/tableParser"

/**
 * Represents a formatted GFM table.
 *
 * All tables have 1 header row, 0 or more data rows, and 1 or more columns.
 * Tables with 0 cells can't exist in GFM, so there is no representation of an empty/deleted table.
 *
 * All rows in the table are the same length and all columns are the same length as well.
 * This is stricter than the GFM spec, which allows extra cells to be ignored and
 * missing cells to be implicit.
 * However, this doesn't work well for a table editor and this ability is likely rarely used.
 *
 * The underlying table is represented as {@link Text} which is optimized for reads and edits.
 * Column alignments and cell text are cached for quick read access.
 * Column widths and cell content lengths are also cached for quick determination of cell
 * and alignment positions and table reformat calculations.
 *
 * During modifications, an efficient and minimal set of edits are made to quickly modify and
 * (potentially reformat) only the affected text and update only the affected caches
 * without having to recreate everything from scratch.
 *
 * It would be _much_ simpler to continuously run the modified table text through a formatter, but
 * that produces a continuous stream of discarded strings. It also doesn't take advantage of the
 * {@link Text} format which is optimized for these kinds of small edits.
 * Additionally, the more complex "change stuff in table, fix formatting" work done here very
 * closely mimics the edits a user would make to Markdown tables to modify them and keep them tidy.
 *
 * The formatting is as follows:
 * - All cells are enclosed in pipes.
 * - All cells have 1 space of left padding.
 * - The width of each column is equal to the width of the cell with the longest text content plus
 *   1 preceding space of left padding and 1 following space of right padding.
 * - Cells that are smaller than the column are padded with extra spaces of right padding.
 * - Alignments that are smaller than the column are padded with extra hyphens of padding.
 *
 * e.g. The following is a formatted table:
 * | a | bc | d  | efg | h   | ijkl | m  | nop | q |       |
 * | - | -- | :- | :-- | :-: | :--: | -: | --: | - | ----- |
 * | 0 |    | 12 | 3   |     | 4  5 | 6  |     |   | 7   8 |
 *
 * e.g. The following is the smallest possible table with a single empty cell and no alignment:
 * |   |
 * | - |
 */
export interface Table {
  /**
   * Text representation of the entire table.
   *
   * e.g. The following table is Text of `| a |\n| - |\n| b |`:
   * | a |
   * | - |
   * | b |
   */
  get text(): Text
  /**
   * String representation of the alignment of each column in the table.
   *
   * e.g. The following table has alignments `["left", "none"]`:
   * | a  | b |
   * | :- | - |
   */
  get alignments(): readonly Alignment[]
  /**
   * Text representation of individual cells in the table by row.
   * Doesn't include the alignment cells.
   *
   * e.g. The following table has Text cells `[["a", "b"], ["c", ""]]`:
   * | a | b |
   * | - | - |
   * | c |   |
   */
  get cells(): Text[][]

  /**
   * Returns the Text representation of the given {@link cell}.
   *
   * {@link cell} must be a valid location within the table.
   */
  cellAt(cell: CellLocation): Text

  /**
   * Returns the absolute start and end positions of the first cell's content.
   */
  get firstCellSpan(): Span
  /**
   * Returns the absolute start and end positions of the last cell's content.
   */
  get lastCellSpan(): Span

  /**
   * Returns the absolute start and end positions of the given {@link cell}'s content.
   *
   * {@link cell} must be a valid location within the table.
   */
  cellSpan(cell: CellLocation): Span

  /**
   * Returns the cell closest to the given position in the table.
   *
   * If within a cell, returns the cell. If past a cell, returns the next cell. If there are no
   * more cells, returns the last cell.
   *
   * e.g. If within the alignment row, tries to return the first data row cell.
   * If there are no data rows, returns the last (header row) cell.
   *
   * {@link position} must be an integer greater than or equal to 0.
   */
  closestCellAtPosition(position: number): CellLocation

  /**
   * Index of the first row (0).
   */
  get firstRowIndex(): number
  /**
   * Index of the first column (0).
   */
  get firstColIndex(): number
  /**
   * Index of the header row (0).
   */
  get headerRowIndex(): number
  /**
   * Index of the first data row (1).
   */
  get firstDataRowIndex(): number
  /**
   * Index of the first {@link rowOrCol}.
   */
  firstRowOrColIndex(rowOrCol: RowOrCol): number

  /**
   * Index of the last row.
   */
  get lastRowIndex(): number
  /**
   * Index of the last col.
   */
  get lastColIndex(): number
  /**
   * Index of the last {@link rowOrCol}.
   */
  lastRowOrColIndex(rowOrCol: RowOrCol): number

  /**
   * Number of rows in the table, not including the alignment row.
   *
   * e.g. The following table has 2 rows:
   * | a |
   * | - |
   * | b |
   */
  get rowCount(): number
  /**
   * Number of columns in the table.
   */
  get colCount(): number
  /**
   * Numbers of {@link rowOrCol} in the table.
   */
  rowOrColCount(rowOrCol: RowOrCol): number

  /**
   * Range of the row indices within the table, not including the alignment row.
   *
   * e.g. The following table has row range of `[0, 2)` (row indices of 0 and 1 for the two rows):
   * | a |
   * | - |
   * | b |
   */
  get rowRange(): Range
  /**
   * Range of the col indices within the table.
   *
   * e.g. The following table has col range of `[0, 2)` (col indices of 0 and 1):
   * | a | b |
   * | - | - |
   */
  get colRange(): Range
  /**
   * Range of the {@link rowOrCol} indices within the table.
   */
  rowOrColRange(rowOrCol: RowOrCol): Range

  /**
   * Array of row indices within the table, not including the alignment row.
   *
   * e.g. The following table has row indices of `[0, 1]` for the two rows:
   * | a |
   * | - |
   * | b |
   */
  get rowIndices(): number[]
  /**
   * Array of column indices within the table.
   *
   * e.g. The following table has col indices of `[0, 1]` for the two columns:
   * | a | b |
   * | - | - |
   */
  get colIndices(): number[]
  /**
   * Array of indices of the data rows within the table, or empty if no data rows.
   *
   * e.g. The following table has data row indices of `[]` since there are no data rows:
   * | a | b |
   * | - | - |
   *
   * e.g. The following table has data row indices of `[1, 2]` since there are two data rows:
   * | a | b |
   * | - | - |
   * | c | d |
   * | e | f |
   */
  get dataRowIndices(): number[]

  /**
   * Row and column of the first cell in the table (row 0, column 0).
   */
  get firstCellLocation(): CellLocation
  /**
   * Row and column of the last cell in the table.
   */
  get lastCellLocation(): CellLocation

  /**
   * Number of cells in each row (equal to the number of columns).
   */
  get rowCellCount(): number
  /**
   * Number of cells in each column (equal to the number of rows).
   */
  get colCellCount(): number
  /**
   * Number of cells in each {@link rowOrCol}.
   */
  rowOrColCellCount(rowOrCol: RowOrCol): number

  /**
   * Returns true if there is a single (header) row in the table, not including the alignment row.
   */
  hasSingleRow(): boolean
  /**
   * Returns true if there is a single column in the table.
   */
  hasSingleCol(): boolean
  /**
   * Returns true if there is a single {@link rowOrCol} in the table.
   */
  hasSingleRowOrCol(rowOrCol: RowOrCol): boolean

  /**
   * Returns true if there are 1 or more data rows in the table, not including the alignment row.
   */
  hasDataRows(): boolean

  /**
   * Returns true if the table has the given {@link row}.
   */
  hasRowAt(row: number): boolean
  /**
   * Returns true if the table has the given {@link col}.
   */
  hasColAt(col: number): boolean
  /**
   * Returns true if the table has a {@link rowOrCol} at the given {@link index}.
   */
  hasRowOrColAt(rowOrCol: RowOrCol, index: number): boolean

  /**
   * Returns true if the table has the given {@link row} and it is empty.
   */
  hasEmptyRowAt(row: number): boolean
  /**
   * Returns true if the table has the given {@link col} and it is empty.
   */
  hasEmptyColAt(col: number): boolean
  /**
   * Returns true if the table has a {@link rowOrCol} at the given {@link index} and it is empty.
   */
  hasEmptyRowOrColAt(rowOrCol: RowOrCol, index: number): boolean

  /**
   * Calls {@link fn} with each {@link row} index in the table, not including the alignment row.
   */
  forEachRow(fn: (row: number) => void): void
  /**
   * Calls {@link fn} with each {@link col} index in the table.
   */
  forEachCol(fn: (col: number) => void): void

  /**
   * Calls {@link fn} with each {@link row} index in the table, not including the alignment row,
   * and returns the result as an array.
   */
  mapEachRow<T>(fn: (row: number) => T): T[]
  /**
   * Calls {@link fn} with each {@link col} index in the table and returns the result as an array.
   */
  mapEachCol<T>(fn: (col: number) => T): T[]

  /**
   * Returns true if the table is logically equivalent to {@link other}.
   */
  equals(other: Table): boolean

  /**
   * Copies a {@link section} of the table and returns it as a new table.
   * Copies over cells from the {@link section} and alignments from the corresponding columns.
   *
   * e.g.
   * Given the following table:
   *
   * | a  | b  | cd |
   * | :- | -: | -- |
   * | e  | f  | g  |
   * | h  | i  | j  |
   *
   * A slice of (last two) rows [1, 3) and (last two) columns [1, 3) returns the following table:
   *
   * | f  | g |
   * | -: | - |
   * | i  | j |
   *
   * Rows and columns of {@link section} must exist in the table.
   */
  sliceSectionAt(section: TableSection): Table

  /**
   * Sets the {@link content} of the given {@link cell}.
   *
   * {@link cell} must be a valid location in the table.
   */
  setCellAt(cell: CellLocation, content: Text): void
  /**
   * Sets the {@link alignment} of the given {@link col}.
   *
   * {@link col} must be a valid column in the table.
   */
  setAlignmentAt(col: number, alignment: Alignment): void

  /**
   * Clears all cells in the given {@link row}.
   *
   * {@link row} must be a valid row in the table.
   */
  clearRow(row: number): void
  /**
   * Clears all cells in the given {@link col}.
   *
   * {@link col} must be a valid column in the table.
   */
  clearCol(col: number): void
  /**
   * Clears all cells in {@link rowOrCol} at the given {@link index}.
   *
   * {@link index} must be a valid {@link rowOrCol} in the table.
   */
  clearRowOrCol(rowOrCol: RowOrCol, index: number): void
  /**
   * Clears all cells in the given {@link section}.
   *
   * {@link section} must be a valid section of the table.
   */
  clearSection(section: TableSection): void

  /**
   * Inserts {@link count} empty rows at the beginning of the table.
   *
   * {@Link count} must be an integer greater than or equal to 0.
   */
  prependEmptyRows(count: number): void
  /**
   * Inserts {@link count} empty columns at the beginning of the table.
   *
   * {@Link count} must be an integer greater than or equal to 0.
   */
  prependEmptyCols(count: number): void

  /**
   * Inserts {@link count} empty rows starting at {@link row}.
   * Shifts the rows at or after the given {@link row} over by {@link count}.
   *
   * {@Link row} must be a valid row in the table or one past the last row to append.
   * {@Link count} must be an integer greater than or equal to 0.
   */
  addEmptyRowsAt({ row, count }: { row: number; count: number }): void
  /**
   * Inserts {@link count} empty columns starting at {@link col}.
   * Shifts the columns at or after the given {@link col} over by {@link count}.
   *
   * {@Link col} must be a valid column in the table or one past the last column to append.
   * {@Link count} must be an integer greater than or equal to 0.
   */
  addEmptyColsAt({ col, count }: { col: number; count: number }): void
  /**
   * Inserts {@link count} empty {@link rowOrCol} starting at {@link index}.
   * Shifts the rows or columns at or after the given {@link index} over by {@link count}.
   *
   * {@Link index} must be a valid row or column in the table or one past
   * the last row or column to append.
   * {@Link count} must be an integer greater than or equal to 0.
   */
  addEmptyRowsOrColsAt(rowOrCol: RowOrCol, { index, count }: { index: number; count: number }): void

  /**
   * Inserts {@link count} empty rows at the end of the table.
   *
   * {@Link count} must be an integer greater than or equal to 0.
   */
  appendEmptyRows(count: number): void
  /**
   * Inserts {@link count} empty columns at the end of the table.
   *
   * {@Link count} must be an integer greater than or equal to 0.
   */
  appendEmptyCols(count: number): void

  /**
   * Inserts a copy of the given {@link row} after the row.
   * Shifts the rows after the given {@link row} over by one to make room.
   *
   * {@link row} must be a valid row in the table.
   */
  duplicateRowAt(row: number): void
  /**
   * Inserts a copy of the given {@link col} after the column.
   * Shifts the columns after the given {@link col} over by one to make room.
   *
   * {@link col} must be a valid column in the table.
   */
  duplicateColAt(col: number): void
  /**
   * Inserts a copy of {@link rowOrCol} at the given {@link index} after the row or column.
   * Shifts the rows or columns after the given {@link index} over by one to make room.
   *
   * {@link index} must be a valid {@link rowOrCol} in the table.
   */
  duplicateRowOrColAt(rowOrCol: RowOrCol, index: number): void

  /**
   * Moves row at position {@link fromIndex} to position {@link toIndex}.
   * Shifts the rows between the indices over by 1 to make room.
   *
   * e.g.
   * Given the following table:
   *
   * | 0 |
   * | - |
   * | 1 |
   * | 2 |
   * | 3 |
   *
   * Moving row 0 to row 2 results in the following table:
   *
   * | 1 |
   * | - |
   * | 2 |
   * | 0 |
   * | 3 |
   *
   * Both {@link fromIndex} and {@link toIndex} must be valid rows in the table.
   */
  moveRowAt(location: { fromIndex: number; toIndex: number }): void
  /**
   * Moves column at position {@link fromIndex} to position {@link toIndex}.
   * Shifts the columns between the indices over by 1 to make room.
   *
   * e.g.
   * Given the following table:
   *
   * | 0 | 1 | 2 | 3 |
   * | - | - | - | - |
   *
   * Moving column 0 to column 2 results in the following table:
   *
   * | 1 | 2 | 0 | 3 |
   * | - | - | - | - |
   *
   * Both {@link fromIndex} and {@link toIndex} must be valid columns in the table.
   */
  moveColAt(location: { fromIndex: number; toIndex: number }): void
  /**
   * Moves {@link rowOrCol} at position {@link fromIndex} to position {@link toIndex}.
   * Shifts the rows or columns between the indices over by 1 to make room.
   *
   * Both {@link fromIndex} and {@link toIndex} must be valid rows or columns in the table.
   */
  moveRowOrColAt(rowOrCol: RowOrCol, location: { fromIndex: number; toIndex: number }): void

  /**
   * Deletes {@link count} rows starting at (and including) {@link row}.
   * Shifts the rows after the deletion back by {@link count} to fill the void.
   *
   * {@link row} must be a valid row in the table.
   * {@link count} must be an integer greater than or equal to zero and less than
   * the total row count (i.e. the entire table can't be removed).
   */
  removeRowsAt({ row, count }: { row: number; count: number }): void
  /**
   * Deletes {@link count} columns starting at (and including) {@link col}.
   * Shifts the columns after the deletion back by {@link count} to fill the void.
   *
   * {@link col} must be a valid column in the table.
   * {@link count} must be an integer greater than or equal to zero and less than
   * the total column count (i.e. the entire table can't be removed).
   */
  removeColsAt({ col, count }: { col: number; count: number }): void
  /**
   * Deletes {@link count} rows or columns starting at (and including) {@link index}.
   * Shifts the rows or columns after the deletion back by {@link count} to fill the void.
   *
   * {@link index} must be a valid row or column in the table.
   * {@link count} must be an integer greater than or equal to zero and less than
   * the total row or column count (i.e. the entire table can't be removed).
   */
  removeRowsOrColsAt(rowOrCol: RowOrCol, { index, count }: { index: number; count: number }): void

  /**
   * Overlays the cells (and possibly alignments) of {@link table} onto this table with the top left
   * corner of the {@link table} at {@link location} within this table.
   *
   * If the {@link location} is within the header row, overlays the alignments of {@link table}
   * in addition to the cells.
   *
   * If the overlay extends beyond the bounds of this table, adds new empty rows or columns to
   * fill the void before the merge.
   *
   * e.g.
   * Given the following original table:
   *
   * | a | b | c |
   * | - | - | - |
   * | d | e | f |
   * | g | h | i |
   *
   * And the following table to merge:
   *
   * | 0  | 1  |
   * | :- | -: |
   * | 2  | 3  |
   *
   * A merge at (first) row 0 and (last) column 2 overlays the cells and alignments and results in:
   *
   * | a | b | 0  | 1  |
   * | - | - | :- | -: |
   * | d | e | 2  | 3  |
   * | g | h | i  |    |
   *
   * Whereas a merge at (second) row 1 and (last) column 2 overlays just the cells and results in:
   *
   * | a | b | c |   |
   * | - | - | - | - |
   * | d | e | 0 | 1 |
   * | g | h | 2 | 3 |
   *
   * {@link location} must be a valid location in this table.
   */
  merge(table: Table, location: CellLocation): void

  /**
   * Appends {@link rowRepeat} duplicates of the table in the row direction and {@link colRepeat}
   * duplicates of the table in the column direction.
   * When both {@link rowRepeat} and {@link colRepeat} are greater than 0, this performs
   * a duplication in one direction followed by one in the other direction.
   *
   * e.g.
   * Given the following table:
   *
   * | a | b |
   * | - | - |
   * | c | d |
   * | e | f |
   *
   * A tile with 1 row repetition and 2 column repetition results in the following table:
   *
   * | a | b | a | b | a | b |
   * | - | - | - | - | - | - |
   * | c | d | c | d | c | d |
   * | e | f | e | f | e | f |
   * | a | b | a | b | a | b |
   * | c | d | c | d | c | d |
   * | e | f | e | f | e | f |
   *
   * This has the same effect as a tile with 1 row repetition and 0 column repetitions followed
   * by a tile with 0 row repetitions and 2 column repetitions or vice versa.
   *
   * {@link rowRepeat} and {@link colRepeat} must be integers greater than or equal to 0.
   */
  tile({ rowRepeat, colRepeat }: { rowRepeat: number; colRepeat: number }): void

  /**
   * Reorders the data rows in the table with order derived by sorting the corresponding cells
   * in the {@link col} using the given {@link compareFn}.
   * The header row remains untouched and the header cell is not used in the comparison.
   *
   * e.g.
   * Given the following table:
   *
   * | 5 | 0 |
   * | - | - |
   * | 6 | 2 |
   * | 7 | 1 |
   * | 8 | 3 |
   *
   * A descending numerical sort by (last) column 1 results in the following table:
   *
   * | 5 | 0 |
   * | - | - |
   * | 8 | 3 |
   * | 6 | 2 |
   * | 7 | 1 |
   *
   * {@link col} must be a valid column in the table.
   */
  sortByColAt(col: number, compareFn: (firstCell: Text, secondCell: Text) => number): void

  /**
   * Overwrites the table state to that of a new table created with {@link unformattedText}.
   *
   * {@link unformattedText} must represent a (single) valid Markdown table.
   */
  reset(unformattedText: Text): void

  /**
   * @internal
   */
  _asInternal(): InternalTable
}
export namespace Table {
  /**
   * Creates a new {@link Table} from the given {@link unformattedText}.
   *
   * {@link unformattedText} must represent a (single) valid Markdown table.
   */
  export function of(unformattedText: Text): Table {
    return InternalTable.of(unformattedText)
  }
  /**
   * Creates a new {@link Table} from the given {@link unknownText} or returns undefined if the
   * {@link unknownText} doesn't represent a single valid Markdown table.
   */
  export function maybeOf(unknownText: Text): Table | undefined {
    return InternalTable.maybeOf(unknownText)
  }
}

const delimiterSize = 1
const padSize = 1
const leftPadSize = padSize
const alignmentFirstCharIndex = 1
const colPadding = padSize + padSize
const alignmentLineNum = 2
const alignmentContentSizeMap = new Map<Alignment, 1 | 2 | 3>([
  ["none", 1],
  ["left", 2],
  ["center", 3],
  ["right", 2],
])
function alignmentContentSize(alignment: Alignment): number {
  return alignmentContentSizeMap.get(alignment)!
}

function absoluteLocation(line: Line, lineLocation: Span): Span {
  const offset = line.from
  return { from: offset + lineLocation.from, to: offset + lineLocation.to }
}

function absolutePosition(line: Line, linePosition: number): number {
  return line.from + linePosition
}

/**
 * @internal
 */
export class InternalTable implements Table {
  /**
   * {@link Table.text}.
   */
  text: Text
  /**
   * {@link Table.alignments}.
   */
  alignments: Alignment[]
  /**
   * {@link Table.cells}.
   */
  cells: Text[][]
  /**
   * Character count of each column, including left and right padding.
   * This is the count of characters between the pipes.
   *
   * e.g. The following table has sizes `[4, 5]`:
   * | ab | de  |
   * | -- | :-: |
   */
  colSizes: number[]
  /**
   * Character count of each cell, excluding left and right padding.
   * Doesn't include the alignment cells.
   *
   * e.g. The following table has sizes `[[1, 1], [2, 0]]`:
   * | a  | b   |
   * | -- | :-: |
   * | cd |     |
   */
  contentSizes: number[][]

  /**
   * {@link Table.cellAt}.
   */
  cellAt({ row, col }: CellLocation): Text {
    Assert.integerInRange(row, this.rowRange)
    Assert.integerInRange(col, this.colRange)

    return this.cells[row][col]
  }

  /**
   * {@link Table.firstCellSpan}.
   */
  get firstCellSpan(): Span {
    return this.cellSpan(this.firstCellLocation)
  }
  /**
   * {@link Table.lastCellSpan}.
   */
  get lastCellSpan(): Span {
    return this.cellSpan(this.lastCellLocation)
  }
  /**
   * {@link Table.cellSpan}.
   */
  cellSpan(cell: CellLocation): Span {
    Assert.integerInRange(cell.row, this.rowRange)
    Assert.integerInRange(cell.col, this.colRange)

    return this.absoluteCellContentSpan(cell)
  }

  /**
   * {@link Table.closestCellAtPosition}.
   */
  closestCellAtPosition(position: number): CellLocation {
    Assert.nonnegativeInteger(position)

    if (position > this.text.length) return this.lastCellLocation

    const { number: textLineNum, from } = this.text.lineAt(position)
    if (textLineNum === alignmentLineNum) {
      return this.hasDataRows()
        ? { row: this.firstDataRowIndex, col: this.firstColIndex }
        : { row: this.headerRowIndex, col: this.lastColIndex }
    }
    const relativePosition = position - from

    const row = textLineNum === 1 ? this.headerRowIndex : textLineNum - 2

    let positionSum = delimiterSize
    const colStarts = this.mapEachCol((col) => {
      const start = positionSum
      positionSum += this.colSizes[col] + delimiterSize
      return start
    })

    const maybeCol = SortedArrays.lastIndexLessThanOrEqualTo(colStarts, relativePosition)
    if (maybeCol === -1) return { row, col: this.firstColIndex }

    return { row, col: maybeCol }
  }

  /**
   * {@link Table.firstRowIndex}.
   */
  readonly firstRowIndex = 0
  /**
   * {@link Table.firstColIndex}.
   */
  readonly firstColIndex = 0
  /**
   * {@link Table.headerRowIndex}.
   */
  readonly headerRowIndex = 0
  /**
   * {@link Table.firstDataRowIndex}.
   */
  readonly firstDataRowIndex = 1
  /**
   * {@link Table.firstRowOrColIndex}.
   */
  firstRowOrColIndex(_rowOrCol: RowOrCol): number {
    return 0
  }

  /**
   * {@link Table.lastRowIndex}.
   */
  get lastRowIndex(): number {
    return this.rowCount - 1
  }
  /**
   * {@link Table.lastColIndex}.
   */
  get lastColIndex(): number {
    return this.colCount - 1
  }
  /**
   * {@link Table.lastRowOrColIndex}.
   */
  lastRowOrColIndex(rowOrCol: RowOrCol): number {
    return rowOrCol === "row" ? this.lastRowIndex : this.lastColIndex
  }

  /**
   * {@link Table.rowCount}.
   */
  get rowCount(): number {
    return this.contentSizes.length
  }
  /**
   * {@link Table.colCount}.
   */
  get colCount(): number {
    return this.colSizes.length
  }
  /**
   * {@link Table.rowOrColCount}.
   */
  rowOrColCount(rowOrCol: RowOrCol): number {
    return rowOrCol === "row" ? this.rowCount : this.colCount
  }

  /**
   * {@link Table.rowRange}.
   */
  get rowRange(): Range {
    return { start: this.firstRowIndex, endExclusive: this.lastRowIndex + 1 }
  }
  /**
   * {@link Table.colRange}.
   */
  get colRange(): Range {
    return { start: this.firstColIndex, endExclusive: this.lastColIndex + 1 }
  }
  /**
   * {@link Table.rowOrColRange}.
   */
  rowOrColRange(rowOrCol: RowOrCol): Range {
    return rowOrCol === "row" ? this.rowRange : this.colRange
  }

  /**
   * {@link Table.rowIndices}.
   */
  get rowIndices(): number[] {
    return Repeat.rangeMap(this.rowRange, (row) => row)
  }
  /**
   * {@link Table.colIndices}.
   */
  get colIndices(): number[] {
    return Repeat.rangeMap(this.colRange, (col) => col)
  }
  /**
   * {@link Table.dataRowIndices}.
   */
  get dataRowIndices(): number[] {
    if (!this.hasDataRows()) return []

    return Repeat.rangeMap(
      { start: this.firstDataRowIndex, endExclusive: this.lastRowIndex + 1 },
      (dataRow) => dataRow,
    )
  }

  /**
   * {@link Table.firstCellLocation}.
   */
  readonly firstCellLocation: CellLocation = { row: this.firstRowIndex, col: this.firstColIndex }
  /**
   * {@link Table.lastCellLocation}.
   */
  get lastCellLocation(): CellLocation {
    return { row: this.lastRowIndex, col: this.lastColIndex }
  }

  /**
   * {@link Table.rowCellCount}.
   */
  get rowCellCount(): number {
    return this.colCount
  }
  /**
   * {@link Table.colCellCount}.
   */
  get colCellCount(): number {
    return this.rowCount
  }
  /**
   * {@link Table.rowOrColCellCount}.
   */
  rowOrColCellCount(rowOrCol: RowOrCol): number {
    return rowOrCol === "row" ? this.rowCellCount : this.colCellCount
  }

  /**
   * {@link Table.hasSingleRow}.
   */
  hasSingleRow(): boolean {
    return this.rowCount === 1
  }
  /**
   * {@link Table.hasSingleCol}.
   */
  hasSingleCol(): boolean {
    return this.colCount === 1
  }
  /**
   * {@link Table.hasSingleRowOrCol}.
   */
  hasSingleRowOrCol(rowOrCol: RowOrCol): boolean {
    return rowOrCol === "row" ? this.hasSingleRow() : this.hasSingleCol()
  }

  /**
   * {@link Table.hasDataRows}.
   */
  hasDataRows(): boolean {
    return this.rowCount > 1
  }

  /**
   * {@link Table.hasRowAt}.
   */
  hasRowAt(row: number): boolean {
    return Ranges.includes(row, this.rowRange)
  }
  /**
   * {@link Table.hasColAt}.
   */
  hasColAt(col: number): boolean {
    return Ranges.includes(col, this.colRange)
  }
  /**
   * {@link Table.hasRowOrColAt}.
   */
  hasRowOrColAt(rowOrCol: RowOrCol, index: number): boolean {
    return rowOrCol === "row" ? this.hasRowAt(index) : this.hasColAt(index)
  }

  /**
   * {@link Table.hasEmptyRowAt}.
   */
  hasEmptyRowAt(row: number): boolean {
    return this.hasRowAt(row) && this.contentSizes[row].every((size) => size === 0)
  }
  /**
   * {@link Table.hasEmptyColAt}.
   */
  hasEmptyColAt(col: number): boolean {
    return this.hasColAt(col) && this.contentSizes.every((row) => row[col] === 0)
  }
  /**
   * {@link Table.hasEmptyRowOrColAt}.
   */
  hasEmptyRowOrColAt(rowOrCol: RowOrCol, index: number): boolean {
    return rowOrCol === "row" ? this.hasEmptyRowAt(index) : this.hasEmptyColAt(index)
  }

  /**
   * {@link Table.forEachRow}.
   */
  forEachRow(fn: (row: number) => void): void {
    Repeat.range(this.rowRange, fn)
  }
  /**
   * {@link Table.forEachCol}.
   */
  forEachCol(fn: (col: number) => void): void {
    Repeat.range(this.colRange, fn)
  }

  /**
   * {@link Table.mapEachRow}.
   */
  mapEachRow<T>(fn: (row: number) => T): T[] {
    return Repeat.rangeMap(this.rowRange, fn)
  }
  /**
   * {@link Table.mapEachCol}.
   */
  mapEachCol<T>(fn: (col: number) => T): T[] {
    return Repeat.rangeMap(this.colRange, fn)
  }

  /**
   * {@link Table.equals}.
   */
  equals(other: Table): boolean {
    const otherInternal = other._asInternal()

    return (
      this.text.eq(otherInternal.text) &&
      Arrays.equals(
        this.alignments,
        otherInternal.alignments,
        (first, second) => first === second,
      ) &&
      Arrays.equals(this.cells, otherInternal.cells, (firstRow, secondRow) =>
        Arrays.equals(firstRow, secondRow, (firstCell, secondCell) => firstCell.eq(secondCell)),
      ) &&
      Arrays.equals(this.colSizes, otherInternal.colSizes, (first, second) => first === second) &&
      Arrays.equals(this.contentSizes, otherInternal.contentSizes, (firstRow, secondRow) =>
        Arrays.equals(firstRow, secondRow, (firstCell, secondCell) => firstCell === secondCell),
      )
    )
  }

  /**
   * {@link Table.sliceSectionAt}.
   */
  sliceSectionAt({ rowRange, colRange, startRow, startCol, endCol }: TableSection): InternalTable {
    Assert.upToIntegerRange(rowRange, { within: this.rowRange })
    Assert.upToIntegerRange(colRange, { within: this.colRange })

    const colSizes = Arrays.sliceRange(this.colSizes, colRange)
    const alignments = Arrays.sliceRange(this.alignments, colRange)

    const contentSizes: number[][] = []
    let text = Text.empty
    Repeat.range(rowRange, (row) => {
      contentSizes.push(Arrays.sliceRange(this.contentSizes[row], colRange))

      const cellStart = this.absoluteCellStart({ row, col: startCol }) - delimiterSize
      const cellEnd = this.absoluteCellEnd({ row, col: endCol }) + delimiterSize

      // Slice col segments
      if (row === startRow) {
        // Slice header cells
        text = text.append(this.sliceTextAt({ from: cellStart, to: cellEnd }))
        text = text.append(Texts.newline)

        // Slice alignment cells
        const alignmentStart = this.absoluteAlignmentStart(startCol) - delimiterSize
        const alignmentEnd = this.absoluteAlignmentEnd(endCol) + delimiterSize
        text = text.append(this.sliceTextAt({ from: alignmentStart, to: alignmentEnd }))
      } else {
        // Slice data cells
        text = text.append(Texts.newline)
        text = text.append(this.sliceTextAt({ from: cellStart, to: cellEnd }))
      }
    })

    const table = new InternalTable({ text, colSizes, contentSizes, alignments })
    table.forEachCol((col) => {
      const newColSize = table.calculateColSize(col)

      // Fix cell padding
      const colSizeDiff = newColSize - table.colSizes[col]
      table.forEachRow((row) => {
        table.addOrRemoveCellPadding({ row, col }, colSizeDiff)
      })

      // Fix alignment hyphens
      table.addOrRemoveAlignmentHyphens({ col, diff: colSizeDiff })

      // Recalculate col sizes
      table.colSizes[col] = newColSize
    })
    table.cells = table.parseCells()
    return table
  }

  /**
   * {@link Table.setCellAt}.
   */
  setCellAt(cell: CellLocation, content: Text): void {
    Assert.integerInRange(cell.row, this.rowRange)
    Assert.integerInRange(cell.col, this.colRange)

    const oldCellSpan = this.absoluteCellSpan(cell)
    const newContentSize = content.length

    this.contentSizes[cell.row][cell.col] = newContentSize
    const newColSize = this.calculateColSize(cell.col)

    const rightPaddingToAdd = newColSize - leftPadSize - newContentSize
    this.replaceTextAt(
      oldCellSpan,
      TableTexts.leftPadding.append(content).append(TableTexts.padding(rightPaddingToAdd)),
    )

    const colSizeDiff = newColSize - this.colSizes[cell.col]
    this.forEachRow((row) => {
      if (row === cell.row) return
      this.addOrRemoveCellPadding({ row, col: cell.col }, colSizeDiff)
    })

    this.addOrRemoveAlignmentHyphens({ col: cell.col, diff: colSizeDiff })

    this.colSizes[cell.col] = newColSize
    this.cells[cell.row][cell.col] = content
  }
  /**
   * {@link Table.setAlignmentAt}.
   */
  setAlignmentAt(col: number, alignment: Alignment): void {
    Assert.integerInRange(col, this.colRange)

    const oldAlignmentSpan = this.absoluteAlignmentSpan(col)

    const newAlignmentSize = alignmentContentSize(alignment)
    this.alignments[col] = alignment

    const newColSize = this.calculateColSize(col)

    const hyphens = newColSize - colPadding - newAlignmentSize
    const newAlignmentText = TableTexts.alignment(alignment, { hyphens })

    this.replaceTextAt(
      oldAlignmentSpan,
      TableTexts.leftPadding.append(newAlignmentText).append(TableTexts.alignmentRightPadding),
    )

    const colSizeDiff = newColSize - this.colSizes[col]
    this.forEachRow((row) => {
      this.addOrRemoveCellPadding({ row, col }, colSizeDiff)
    })

    this.colSizes[col] = newColSize
  }

  /**
   * {@link Table.clearRow}.
   */
  clearRow(row: number): void {
    Assert.integerInRange(row, this.rowRange)

    this.clearSection(
      TableSection.of({ row: { start: row, endExclusive: row + 1 }, col: this.colRange }),
    )
  }
  /**
   * {@link Table.clearCol}.
   */
  clearCol(col: number): void {
    Assert.integerInRange(col, this.colRange)

    this.clearSection(
      TableSection.of({ row: this.rowRange, col: { start: col, endExclusive: col + 1 } }),
    )
  }
  /**
   * {@link Table.clearRowOrCol}.
   */
  clearRowOrCol(rowOrCol: RowOrCol, index: number): void {
    if (rowOrCol === "row") {
      this.clearRow(index)
    } else {
      this.clearCol(index)
    }
  }
  /**
   * {@link Table.clearSection}.
   */
  clearSection({ rowRange, colRange }: TableSection): void {
    Assert.upToIntegerRange(rowRange, { within: this.rowRange })
    Assert.upToIntegerRange(colRange, { within: this.colRange })

    Repeat.range(colRange, (col) => {
      Repeat.range(rowRange, (row) => {
        this.contentSizes[row][col] = 0
        this.cells[row][col] = Text.empty
      })

      const newColSize = this.calculateColSize(col)

      Repeat.range(rowRange, (row) => {
        const cellSpan = this.absoluteCellSpan({ row, col })
        this.replaceTextAt(cellSpan, TableTexts.padding(newColSize))
      })

      const colSizeDiff = newColSize - this.colSizes[col]
      this.forEachRow((row) => {
        if (Ranges.includes(row, rowRange)) return
        this.addOrRemoveCellPadding({ row, col }, colSizeDiff)
      })

      this.addOrRemoveAlignmentHyphens({ col: col, diff: colSizeDiff })

      this.colSizes[col] = newColSize
    })
  }

  /**
   * {@link Table.prependEmptyRows}.
   */
  prependEmptyRows(count: number): void {
    this.addEmptyRowsAt({ row: this.firstRowIndex, count })
  }
  /**
   * {@link Table.prependEmptyCols}.
   */
  prependEmptyCols(count: number): void {
    this.addEmptyColsAt({ col: this.firstColIndex, count })
  }

  /**
   * {@link Table.addEmptyRowsAt}.
   */
  addEmptyRowsAt({ row, count }: { row: number; count: number }): void {
    Assert.integerInRange(row, { start: this.firstRowIndex, endExclusive: this.rowCount + 1 })
    Assert.nonnegativeInteger(count)

    if (count === 0) return

    const rowArray = this.colSizes.map((colSize) => `|${" ".repeat(colSize)}`)
    rowArray.push("|")
    const rowText = Texts.ofString(rowArray.join(""))

    if (row === this.headerRowIndex) {
      const headerRowLine = this.headerRowLine()
      const oldHeaderRowText = this.sliceTextAt(headerRowLine)
      this.replaceTextAt(headerRowLine, rowText)
      const afterAlignmentLine = this.alignmentLine().to
      this.addTextAt(oldHeaderRowText, afterAlignmentLine, { prependNewline: true })
      Repeat.times(count - 1, () =>
        this.addTextAt(rowText, afterAlignmentLine, { prependNewline: true }),
      )
    } else if (row === this.rowCount) {
      const afterLastLine = (
        this.hasSingleRow() ? this.alignmentLine() : this.rowLine(this.lastRowIndex)
      ).to
      Repeat.times(count, () => this.addTextAt(rowText, afterLastLine, { prependNewline: true }))
    } else {
      const beforeRowLine = this.rowLine(row).from
      Repeat.times(count, () => this.addTextAt(rowText, beforeRowLine, { appendNewline: true }))
    }

    this.contentSizes.splice(row, 0, ...Arrays.repeat2d(0, { rows: count, cols: this.colCount }))
    this.cells.splice(row, 0, ...Arrays.repeat2d(Text.empty, { rows: count, cols: this.colCount }))
  }
  /**
   * {@link Table.addEmptyColsAt}.
   */
  addEmptyColsAt({ col, count }: { col: number; count: number }): void {
    Assert.integerInRange(col, { start: this.firstColIndex, endExclusive: this.lastColIndex + 2 })
    Assert.nonnegativeInteger(count)

    if (count === 0) return

    if (col === this.firstColIndex) {
      const colsText = Texts.ofString("|   ".repeat(count))
      const alignmentsText = Texts.ofString("| - ".repeat(count))

      this.forEachRow((row) => {
        this.addTextAt(colsText, this.absoluteCellStart({ row, col }) - delimiterSize)
      })
      this.addTextAt(alignmentsText, this.absoluteAlignmentStart(col) - delimiterSize)
    } else {
      const colsText = Texts.ofString("   |".repeat(count))
      const alignmentsText = Texts.ofString(" - |".repeat(count))

      this.forEachRow((row) => {
        this.addTextAt(colsText, this.absoluteCellEnd({ row, col: col - 1 }) + delimiterSize)
      })
      this.addTextAt(alignmentsText, this.absoluteAlignmentEnd(col - 1) + delimiterSize)
    }

    this.colSizes.splice(col, 0, ...Arrays.repeat(3, { count }))
    this.alignments.splice(col, 0, ...Arrays.repeat<Alignment>("none", { count }))
    this.contentSizes.forEach((row) => row.splice(col, 0, ...Arrays.repeat(0, { count })))
    this.cells.forEach((row) => row.splice(col, 0, ...Arrays.repeat(Text.empty, { count })))
  }
  /**
   * {@link Table.addEmptyRowsOrColsAt}.
   */
  addEmptyRowsOrColsAt(
    rowOrCol: RowOrCol,
    { index, count }: { index: number; count: number },
  ): void {
    if (rowOrCol === "row") {
      this.addEmptyRowsAt({ row: index, count })
    } else {
      this.addEmptyColsAt({ col: index, count })
    }
  }

  /**
   * {@link Table.appendEmptyRows}.
   */
  appendEmptyRows(count: number): void {
    this.addEmptyRowsAt({ row: this.lastRowIndex + 1, count })
  }
  /**
   * {@link Table.appendEmptyCols}.
   */
  appendEmptyCols(count: number): void {
    this.addEmptyColsAt({ col: this.lastColIndex + 1, count })
  }

  /**
   * {@link Table.duplicateRowAt}.
   */
  duplicateRowAt(row: number): void {
    Assert.integerInRange(row, this.rowRange)

    if (row === this.headerRowIndex) {
      const rowText = this.sliceTextAt(this.rowLine(row))
      this.addTextAt(rowText, this.alignmentLine().to, { prependNewline: true })
    } else {
      const rowLine = this.rowLine(row)
      const rowText = this.sliceTextAt(rowLine)
      this.addTextAt(rowText, rowLine.to, { prependNewline: true })
    }

    this.contentSizes.splice(row + 1, 0, [...this.contentSizes[row]])
    this.cells.splice(row + 1, 0, [...this.cells[row]])
  }
  /**
   * {@link Table.duplicateColAt}.
   */
  duplicateColAt(col: number): void {
    Assert.integerInRange(col, this.colRange)

    this.forEachRow((row) => {
      const { from: cellStart, to: cellEnd } = this.absoluteCellSpan({ row, col })
      this.addTextAt(
        this.sliceTextAt({ from: cellStart, to: cellEnd + delimiterSize }),
        cellEnd + delimiterSize,
      )
    })

    const { from: alignmentStart, to: alignmentEnd } = this.absoluteAlignmentSpan(col)
    this.addTextAt(
      this.sliceTextAt({ from: alignmentStart, to: alignmentEnd + delimiterSize }),
      alignmentEnd + delimiterSize,
    )

    this.colSizes.splice(col + 1, 0, this.colSizes[col])
    this.alignments.splice(col + 1, 0, this.alignments[col])
    this.contentSizes.forEach((it) => it.splice(col + 1, 0, it[col]))
    this.cells.forEach((it) => it.splice(col + 1, 0, it[col]))
  }
  /**
   * {@link Table.duplicateRowOrColAt}.
   */
  duplicateRowOrColAt(rowOrCol: RowOrCol, index: number): void {
    if (rowOrCol === "row") {
      this.duplicateRowAt(index)
    } else {
      this.duplicateColAt(index)
    }
  }

  /**
   * {@link Table.moveRowAt}.
   */
  moveRowAt({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }): void {
    Assert.integerInRange(fromIndex, this.rowRange)
    Assert.integerInRange(toIndex, this.rowRange)

    if (fromIndex === toIndex) return

    // Move row text
    if (Numbers.abs(fromIndex - toIndex) === 1) {
      // Swap rows
      const [earlierIndex, laterIndex] =
        fromIndex < toIndex ? [fromIndex, toIndex] : [toIndex, fromIndex]
      const earlierRowLine = this.rowLine(earlierIndex)
      const earlierRowText = this.sliceTextAt(earlierRowLine)
      const laterRowLine = this.rowLine(laterIndex)
      const laterRowText = this.sliceTextAt(laterRowLine)

      this.replaceTextAt(laterRowLine, earlierRowText)
      this.replaceTextAt(earlierRowLine, laterRowText)
    } else if (fromIndex === this.headerRowIndex) {
      // Insert header copy at destination, remove first data row,
      // overwrite header with removed first data row
      const headerRowLine = this.headerRowLine()
      const headerRowText = this.sliceTextAt(headerRowLine)
      const firstDataRowLine = this.rowLine(this.firstDataRowIndex)
      const firstDataRowText = this.sliceTextAt(firstDataRowLine)
      const toRowLine = this.rowLine(toIndex)

      this.addTextAt(headerRowText, toRowLine.to, { prependNewline: true })
      this.removeTextAt(firstDataRowLine, { removeLeadingNewline: true })
      this.replaceTextAt(headerRowLine, firstDataRowText)
    } else if (toIndex === this.headerRowIndex) {
      // Remove source, insert header copy at first data row, replace header with removed source
      const fromRowLine = this.rowLine(fromIndex)
      const fromRowText = this.sliceTextAt(fromRowLine)
      const headerRowLine = this.headerRowLine()
      const headerRowText = this.sliceTextAt(headerRowLine)

      this.removeTextAt(fromRowLine, { removeLeadingNewline: true })
      this.addTextAt(headerRowText, this.alignmentLine().to, { prependNewline: true })
      this.replaceTextAt(headerRowLine, fromRowText)
    } else if (toIndex < fromIndex) {
      // Remove source, insert source copy at destination
      const fromRowLine = this.rowLine(fromIndex)
      const fromRowText = this.sliceTextAt(fromRowLine)
      const toRowLine = this.rowLine(toIndex)

      this.removeTextAt(fromRowLine, { removeLeadingNewline: true })
      this.addTextAt(fromRowText, toRowLine.from, { appendNewline: true })
    } else if (toIndex > fromIndex) {
      // Insert source copy at destination, remove source
      const fromRowLine = this.rowLine(fromIndex)
      const fromRowText = this.sliceTextAt(fromRowLine)
      const toRowLine = this.rowLine(toIndex)

      this.addTextAt(fromRowText, toRowLine.to, { prependNewline: true })
      this.removeTextAt(fromRowLine, { removeTrailingNewline: true })
    }

    // Move row content sizes and row cells
    Arrays.shiftElement(this.contentSizes, { fromIndex, toIndex })
    Arrays.shiftElement(this.cells, { fromIndex, toIndex })
  }
  /**
   * {@link Table.moveColAt}.
   */
  moveColAt({ fromIndex, toIndex }: { fromIndex: number; toIndex: number }): void {
    Assert.integerInRange(fromIndex, this.colRange)
    Assert.integerInRange(toIndex, this.colRange)

    if (fromIndex === toIndex) return

    // Move col text for each row
    if (toIndex < fromIndex) {
      // Remove each cell at source col and insert copy at destination col
      this.forEachRow((row) => {
        const fromCellSpan = this.absoluteCellSpan({ row, col: fromIndex })
        const fromCellText = this.sliceTextAt({
          from: fromCellSpan.from,
          to: fromCellSpan.to + delimiterSize,
        })
        const toCellStart = this.absoluteCellStart({ row, col: toIndex })
        this.removeTextAt({ from: fromCellSpan.from, to: fromCellSpan.to + delimiterSize })
        this.addTextAt(fromCellText, toCellStart)
      })
    } else {
      // Insert copy of each source cell at destination col and remove cell at source col
      this.forEachRow((row) => {
        const fromCellSpan = this.absoluteCellSpan({ row, col: fromIndex })
        const fromCellText = this.sliceTextAt({
          from: fromCellSpan.from - delimiterSize,
          to: fromCellSpan.to,
        })
        const toCellEnd = this.absoluteCellEnd({ row, col: toIndex })
        this.addTextAt(fromCellText, toCellEnd)
        this.removeTextAt({ from: fromCellSpan.from - delimiterSize, to: fromCellSpan.to })
      })
    }

    // Move col alignment text
    const fromAlignmentSpan = this.absoluteAlignmentSpan(fromIndex)
    if (toIndex < fromIndex) {
      // Remove alignment at source col and insert copy at destination col
      const fromAlignmentText = this.sliceTextAt({
        from: fromAlignmentSpan.from,
        to: fromAlignmentSpan.to + delimiterSize,
      })
      const toAlignmentStart = this.absoluteAlignmentStart(toIndex)
      this.removeTextAt({ from: fromAlignmentSpan.from, to: fromAlignmentSpan.to + delimiterSize })
      this.addTextAt(fromAlignmentText, toAlignmentStart)
    } else {
      // Insert copy of source alignment at destination col and remove alignment at source col
      const fromAlignmentText = this.sliceTextAt({
        from: fromAlignmentSpan.from - delimiterSize,
        to: fromAlignmentSpan.to,
      })
      const toAlignmentEnd = this.absoluteAlignmentEnd(toIndex)
      this.addTextAt(fromAlignmentText, toAlignmentEnd)
      this.removeTextAt({ from: fromAlignmentSpan.from - delimiterSize, to: fromAlignmentSpan.to })
    }

    // Move col sizes and alignments
    Arrays.shiftElement(this.colSizes, { fromIndex, toIndex })
    Arrays.shiftElement(this.alignments, { fromIndex, toIndex })

    // Move col content sizes and col cells for each row
    this.contentSizes.forEach((row) => Arrays.shiftElement(row, { fromIndex, toIndex }))
    this.cells.forEach((row) => Arrays.shiftElement(row, { fromIndex, toIndex }))
  }
  /**
   * {@link Table.moveRowOrColAt}.
   */
  moveRowOrColAt(rowOrCol: RowOrCol, location: { fromIndex: number; toIndex: number }): void {
    if (rowOrCol === "row") {
      this.moveRowAt(location)
    } else {
      this.moveColAt(location)
    }
  }

  /**
   * {@link Table.removeRowsAt}.
   */
  removeRowsAt({ row, count }: { row: number; count: number }): void {
    Assert.integerInRange(row, this.rowRange)
    Assert.integerInRange(count, { start: 0, endExclusive: this.rowCount })

    if (count === 0) return

    // Remove row text
    if (row === this.headerRowIndex) {
      // Remove requisite data rows + one extra, overwrite header with extra to promote it to header
      const newHeaderRowLine = this.rowLine(count)
      const newHeaderRowText = this.sliceTextAt(newHeaderRowLine)

      const { from: startDataRowStart } = this.rowLine(this.firstDataRowIndex)
      const { to: endDataRowEnd } = newHeaderRowLine
      this.removeTextAt(
        { from: startDataRowStart, to: endDataRowEnd },
        { removeLeadingNewline: true },
      )
      this.replaceTextAt(this.headerRowLine(), newHeaderRowText)
    } else {
      // Remove data rows
      const { from: startRowStart } = this.rowLine(row)
      const { to: endRowTo } = this.rowLine(row + count - 1)

      this.removeTextAt({ from: startRowStart, to: endRowTo }, { removeLeadingNewline: true })
    }

    // Move row content sizes and row cells
    this.contentSizes.splice(row, count)
    this.cells.splice(row, count)

    // Recalculate each col size and remove cell padding and alignment hyphens if col is smaller
    this.forEachCol((colIndex) => {
      const newColSize = this.calculateColSize(colIndex)
      const colSizeDiff = newColSize - this.colSizes[colIndex]

      this.forEachRow((rowIndex) => {
        this.addOrRemoveCellPadding({ row: rowIndex, col: colIndex }, colSizeDiff)
      })

      this.addOrRemoveAlignmentHyphens({ col: colIndex, diff: colSizeDiff })

      this.colSizes[colIndex] = newColSize
    })
  }
  /**
   * {@link Table.removeColsAt}.
   */
  removeColsAt({ col, count }: { col: number; count: number }): void {
    Assert.integerInRange(col, this.colRange)
    Assert.integerInRange(count, { start: 0, endExclusive: this.colCount })

    if (count === 0) return

    // Remove cols text for each row
    this.forEachRow((row) => {
      this.removeTextAt({
        from: this.absoluteCellStart({ row, col }),
        to: this.absoluteCellEnd({ row, col: col + count - 1 }) + delimiterSize,
      })
    })

    // Remove cols alignment text
    const { from: startAlignmentStart } = this.absoluteAlignmentSpan(col)
    const { to: endAlignmentEnd } = this.absoluteAlignmentSpan(col + count - 1)
    this.removeTextAt({ from: startAlignmentStart, to: endAlignmentEnd + delimiterSize })

    // Remove cols sizes and alignments
    this.colSizes.splice(col, count)
    this.alignments.splice(col, count)

    // Remove cols content sizes and cols cells for each row
    this.contentSizes.forEach((it) => it.splice(col, count))
    this.cells.forEach((it) => it.splice(col, count))
  }
  /**
   * {@link Table.removeRowsOrColsAt}.
   */
  removeRowsOrColsAt(rowOrCol: RowOrCol, { index, count }: { index: number; count: number }): void {
    if (rowOrCol === "row") {
      this.removeRowsAt({ row: index, count })
    } else {
      this.removeColsAt({ col: index, count })
    }
  }

  /**
   * {@link Table.merge}.
   */
  merge(table: Table, { row: rowOffset, col: colOffset }: CellLocation): void {
    Assert.integerInRange(rowOffset, this.rowRange)
    Assert.integerInRange(colOffset, this.colRange)

    // Overwrite alignments if header row is overwritten
    const mergeAlignments = rowOffset === this.headerRowIndex

    const newRows = Numbers.clamp(rowOffset + table.rowCount - this.rowCount, { min: 0 })
    const newCols = Numbers.clamp(colOffset + table.colCount - this.colCount, { min: 0 })

    const offsetRowRange = { start: rowOffset, endExclusive: rowOffset + table.rowCount }
    const offsetColRange = { start: colOffset, endExclusive: colOffset + table.colCount }

    // Pad table to new size, if necessary
    this.appendEmptyRows(newRows)
    this.appendEmptyCols(newCols)

    const internalTable = table._asInternal()

    // For each merged row, overwrite the content sizes, cells, and text
    Repeat.range(offsetRowRange, (row) => {
      this.contentSizes[row].splice(
        colOffset,
        internalTable.colCount,
        ...internalTable.contentSizes[row - rowOffset],
      )
      this.cells[row].splice(
        colOffset,
        internalTable.colCount,
        ...internalTable.cells[row - rowOffset],
      )

      const rowSection = {
        from: this.absoluteCellStart({ row, col: offsetColRange.start }) - delimiterSize,
        to: this.absoluteCellEnd({ row, col: offsetColRange.endExclusive - 1 }) + delimiterSize,
      }
      const tableRowText = internalTable.sliceTextAt(internalTable.rowLine(row - rowOffset))
      this.replaceTextAt(rowSection, tableRowText)
    })

    // Overwrite alignments and alignments text
    if (mergeAlignments) {
      this.alignments.splice(colOffset, internalTable.colCount, ...internalTable.alignments)

      const alignmentSection = {
        from: this.absoluteAlignmentStart(offsetColRange.start) - delimiterSize,
        to: this.absoluteAlignmentEnd(offsetColRange.endExclusive - 1) + delimiterSize,
      }
      const tableAlignmentText = internalTable.sliceTextAt(internalTable.alignmentLine())
      this.replaceTextAt(alignmentSection, tableAlignmentText)
    }

    // For each merged col, fix cell padding, alignment hyphens, and recalculate col sizes
    Repeat.range(offsetColRange, (col) => {
      const newColSize = this.calculateColSize(col)
      const colSizeDiff = newColSize - this.colSizes[col]
      const tableColSizeDiff = newColSize - internalTable.colSizes[col - colOffset]

      this.forEachRow((row) => {
        this.addOrRemoveCellPadding(
          { row, col },
          Ranges.includes(row, offsetRowRange) ? tableColSizeDiff : colSizeDiff,
        )
      })

      this.addOrRemoveAlignmentHyphens({
        col,
        diff: mergeAlignments ? tableColSizeDiff : colSizeDiff,
      })

      this.colSizes[col] = newColSize
    })
  }

  /**
   * {@link Table.tile}.
   */
  tile({ rowRepeat, colRepeat }: { rowRepeat: number; colRepeat: number }): void {
    Assert.nonnegativeInteger(rowRepeat)
    Assert.nonnegativeInteger(colRepeat)

    if (rowRepeat === 0 && colRepeat === 0) return

    if (colRepeat >= 1) {
      this.forEachRow((row) => {
        const { from: rowFrom, to: rowTo } = this.rowLine(row)
        const rowText = this.sliceTextAt({ from: rowFrom + delimiterSize, to: rowTo })
        this.addTextAt(Texts.repeat(rowText, colRepeat), rowTo)
      })

      const { from: alignmentFrom, to: alignmentTo } = this.alignmentLine()
      const colAlignmentText = this.sliceTextAt({
        from: alignmentFrom + delimiterSize,
        to: alignmentTo,
      })
      this.addTextAt(Texts.repeat(colAlignmentText, colRepeat), alignmentTo)

      this.alignments = Arrays.multiply(this.alignments, colRepeat + 1)
      this.colSizes = Arrays.multiply(this.colSizes, colRepeat + 1)

      this.forEachRow((row) => {
        this.contentSizes[row] = Arrays.multiply(this.contentSizes[row], colRepeat + 1)
        this.cells[row] = Arrays.multiply(this.cells[row], colRepeat + 1)
      })
    }

    if (rowRepeat >= 1) {
      const { from: alignmentFrom, to: alignmentTo } = this.alignmentLine()
      const allRowText = this.text.replace(alignmentFrom - delimiterSize, alignmentTo, Text.empty)
      this.appendText(
        Texts.repeat(Texts.withNewline(allRowText, { prependNewline: true }), rowRepeat),
      )

      const oldRowRange = this.rowRange
      Repeat.times(rowRepeat, () => {
        Repeat.range(oldRowRange, (row) => {
          this.contentSizes.push([...this.contentSizes[row]])
          this.cells.push([...this.cells[row]])
        })
      })
    }
  }

  /**
   * {@link Table.sortByColAt}.
   */
  sortByColAt(col: number, compareFn: (firstCell: Text, secondCell: Text) => number): void {
    Assert.integerInRange(col, this.colRange)

    if (this.rowCount === 1) return

    const dataRowRange = { start: this.firstDataRowIndex, endExclusive: this.lastRowIndex + 1 }

    const orderedRowNums = Repeat.rangeMap(dataRowRange, (i) => i).sort((firstRow, secondRow) =>
      compareFn(this.cellAt({ row: firstRow, col }), this.cellAt({ row: secondRow, col })),
    )

    const rowLines = this.rowLines()
    const rowTexts = rowLines.map(({ from, to }) => this.sliceTextAt({ from, to }))
    const oldContentSizes = [...this.contentSizes]
    const oldCells = [...this.cells]

    Repeat.range(dataRowRange, (row) => {
      const sortedRow = orderedRowNums[row - this.firstDataRowIndex]
      if (row === sortedRow) return
      this.replaceTextAt(rowLines[row], rowTexts[sortedRow])
      this.contentSizes[row] = oldContentSizes[sortedRow]
      this.cells[row] = oldCells[sortedRow]
    })
  }

  /**
   * {@link Table.reset}.
   */
  reset(unformattedText: Text): void {
    const { text, colSizes, alignments, contentSizes } = TableParser.parse(unformattedText)
    this.text = text
    this.colSizes = colSizes
    this.alignments = alignments
    this.contentSizes = contentSizes
    this.cells = this.parseCells()
  }

  /**
   * {@link Table._asInternal}.
   */
  _asInternal(): InternalTable {
    return this as InternalTable
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention -- JSON.stringify calls this
  toJSON(): {
    text: string
    colSizes: number[]
    alignments: Alignment[]
    contentSizes: number[][]
    cells: string[][]
  } {
    return {
      text: this.text.toString(),
      colSizes: $state.snapshot(this.colSizes),
      alignments: $state.snapshot(this.alignments),
      contentSizes: $state.snapshot(this.contentSizes),
      cells: this.cells.map((row) => row.map((cell) => cell.toString())),
    }
  }

  private addTextAt(
    text: Text,
    at: number,
    {
      prependNewline = false,
      appendNewline = false,
    }: { prependNewline?: boolean; appendNewline?: boolean } = {},
  ): void {
    this.text = Texts.withTextAdded(this.text, { text, at, prependNewline, appendNewline })
  }
  private appendText(
    text: Text,
    {
      prependNewline = false,
      appendNewline = false,
    }: { prependNewline?: boolean; appendNewline?: boolean } = {},
  ): void {
    this.text = Texts.withTextAppended(this.text, { text, prependNewline, appendNewline })
  }
  private removeTextAt(
    location: Span,
    {
      removeLeadingNewline = false,
      removeTrailingNewline = false,
    }: { removeLeadingNewline?: boolean; removeTrailingNewline?: boolean } = {},
  ): void {
    this.text = Texts.withTextRemoved(this.text, {
      location,
      removeLeadingNewline,
      removeTrailingNewline,
    })
  }
  private replaceTextAt(
    span: Span,
    text: Text,
    {
      prependNewline = false,
      appendNewline = false,
    }: { prependNewline?: boolean; appendNewline?: boolean } = {},
  ): void {
    this.text = Texts.withTextReplaced(this.text, { span, text, prependNewline, appendNewline })
  }
  private sliceTextAt({ from, to }: Span): Text {
    return this.text.slice(from, to)
  }

  private addAlignmentHyphens({ col, count }: { col: number; count: number }): void {
    // Always safe to add the 2nd alignment character
    this.addTextAt(
      TableTexts.alignmentHyphens(count),
      this.absoluteAlignmentStart(col) + leftPadSize + alignmentFirstCharIndex,
    )
  }
  private removeAlignmentHyphens({ col, count }: { col: number; count: number }): void {
    const absoluteAlignmentStart = this.absoluteAlignmentStart(col)

    // Always safe to remove the 2nd alignment character
    this.removeTextAt({
      from: absoluteAlignmentStart + leftPadSize + alignmentFirstCharIndex,
      to: absoluteAlignmentStart + leftPadSize + alignmentFirstCharIndex + count,
    })
  }
  private addOrRemoveAlignmentHyphens({ col, diff }: { col: number; diff: number }): void {
    if (diff < 0) {
      this.removeAlignmentHyphens({ col, count: -diff })
    } else if (diff > 0) {
      this.addAlignmentHyphens({ col, count: diff })
    }
  }

  private addCellPadding(cell: CellLocation, count: number): void {
    this.addTextAt(TableTexts.padding(count), this.absoluteCellContentEnd(cell) + 1)
  }
  private removeCellPadding(cell: CellLocation, count: number): void {
    const absoluteCellContentEnd = this.absoluteCellContentEnd(cell)
    this.removeTextAt({ from: absoluteCellContentEnd, to: absoluteCellContentEnd + count })
  }
  private addOrRemoveCellPadding(cell: CellLocation, diff: number): void {
    if (diff < 0) {
      this.removeCellPadding(cell, -diff)
    } else if (diff > 0) {
      this.addCellPadding(cell, diff)
    }
  }

  private alignmentLine(): Line {
    return this.text.line(alignmentLineNum)
  }
  private headerRowLine(): Line {
    return this.text.line(1)
  }
  private rowLine(row: number): Line {
    return this.text.line(row === this.headerRowIndex ? row + 1 : row + 2)
  }
  private rowLines(): Line[] {
    return Repeat.timesMap(this.text.lines - 1, (row) => {
      return this.text.line(row === this.headerRowIndex ? row + 1 : row + 2)
    })
  }

  private relativeCellStart(col: number): number {
    const delimitersBeforeCount = col + 1
    const delimitersBeforeSize = delimitersBeforeCount * delimiterSize
    const colsBeforeSize = Arrays.sum(this.colSizes, { start: 0, endExclusive: col })

    return delimitersBeforeSize + colsBeforeSize
  }
  private relativeCellStarts(): number[] {
    const runningColSizes = Arrays.runningSum(this.colSizes)
    return this.mapEachCol((col) => {
      const delimitersBeforeCount = col + 1
      const delimitersBeforeSize = delimitersBeforeCount * delimiterSize
      const colsBeforeSize = col === this.firstColIndex ? 0 : runningColSizes[col - 1]
      return delimitersBeforeSize + colsBeforeSize
    })
  }
  private relativeCellContentStart(col: number): number {
    return this.relativeCellStart(col) + leftPadSize
  }
  private relativeCellContentStarts(): number[] {
    return this.relativeCellStarts().map((cellStart) => cellStart + leftPadSize)
  }
  private relativeCellEnd(col: number): number {
    const delimitersBeforeCount = col + 1
    const delimitersBeforeSize = delimitersBeforeCount * delimiterSize
    const colsUpToSize = Arrays.sum(this.colSizes, { start: 0, endExclusive: col + 1 })

    return delimitersBeforeSize + colsUpToSize
  }
  private relativeCellSpan(col: number): Span {
    const from = this.relativeCellStart(col)
    return { from, to: from + this.colSizes[col] }
  }
  private relativeAlignmentStart(col: number): number {
    return this.relativeCellStart(col)
  }
  private relativeAlignmentEnd(col: number): number {
    return this.relativeCellEnd(col)
  }
  private relativeAlignmentSpan(col: number): Span {
    return this.relativeCellSpan(col)
  }

  private absoluteCellStart({ row, col }: CellLocation): number {
    return absolutePosition(this.rowLine(row), this.relativeCellStart(col))
  }
  private absoluteCellContentSpan({ row, col }: CellLocation): Span {
    const relativeStart = this.relativeCellStart(col) + leftPadSize
    const relativeEnd = relativeStart + this.contentSizes[row][col]
    return absoluteLocation(this.rowLine(row), { from: relativeStart, to: relativeEnd })
  }
  private absoluteCellContentEnd(cell: CellLocation): number {
    return absolutePosition(
      this.rowLine(cell.row),
      this.relativeCellContentStart(cell.col) + this.contentSizes[cell.row][cell.col],
    )
  }
  private absoluteCellEnd({ row, col }: CellLocation): number {
    return absolutePosition(this.rowLine(row), this.relativeCellEnd(col))
  }
  private absoluteCellSpan({ row, col }: CellLocation): Span {
    return absoluteLocation(this.rowLine(row), this.relativeCellSpan(col))
  }
  private absoluteAlignmentStart(col: number): number {
    return absolutePosition(this.alignmentLine(), this.relativeAlignmentStart(col))
  }
  private absoluteAlignmentEnd(col: number): number {
    return absolutePosition(this.alignmentLine(), this.relativeAlignmentEnd(col))
  }
  private absoluteAlignmentSpan(col: number): Span {
    return absoluteLocation(this.alignmentLine(), this.relativeAlignmentSpan(col))
  }

  private calculateColSize(col: number): number {
    const cellContentSizes = Repeat.timesMap(this.rowCount, (row) => this.contentSizes[row][col])
    const colAlignmentSize = alignmentContentSize(this.alignments[col])
    return Numbers.max(...cellContentSizes, colAlignmentSize) + colPadding
  }

  private parseCells(): Text[][] {
    const rowLines = this.rowLines()
    const relativeCellContentStarts = this.relativeCellContentStarts()
    return this.mapEachRow((row) => {
      return this.mapEachCol((col) => {
        const relativeCellContentSpan = {
          from: relativeCellContentStarts[col],
          to: relativeCellContentStarts[col] + this.contentSizes[row][col],
        }

        const { from, to } = absoluteLocation(rowLines[row], relativeCellContentSpan)
        return this.text.slice(from, to)
      })
    })
  }

  /**
   * {@link Table.of}.
   */
  static of(unformattedText: Text): InternalTable {
    return new InternalTable(TableParser.parse(unformattedText))
  }
  /**
   * {@link Table.maybeOf}.
   */
  static maybeOf(maybeUnformattedTableText: Text): InternalTable | undefined {
    const props = TableParser.parseOrNil(maybeUnformattedTableText)
    return def(props) ? new InternalTable(props) : undefined
  }
  private constructor({
    text,
    colSizes,
    alignments,
    contentSizes,
  }: {
    text: Text
    colSizes: number[]
    alignments: Alignment[]
    contentSizes: number[][]
  }) {
    this.text = $state(text)
    this.colSizes = $state(colSizes)
    this.alignments = $state(alignments)
    this.contentSizes = $state(contentSizes)
    this.cells = $state(this.parseCells())
  }
}
