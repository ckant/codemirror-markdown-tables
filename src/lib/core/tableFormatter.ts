import { Text } from "@codemirror/state"

import * as Arrays from "#ext/stdlib/arrays"
import * as Assert from "#ext/stdlib/assert"
import * as Numbers from "#ext/stdlib/numbers"
import * as Repeat from "#ext/stdlib/repeat"
import * as Strings from "#ext/stdlib/strings"

import type { Alignment } from "#core/models/alignment"
import type { TableProperties } from "#core/models/tableProperties"
import * as TextSanitizer from "#core/textSanitizer"

const pipe = "|"
const leftPad = " "
const rightPad = " "
const leftPadSize = 1
const rightPadSize = 1

const alignmentContentSizes = new Map<Alignment, 1 | 2 | 3>([
  ["none", 1],
  ["left", 2],
  ["center", 3],
  ["right", 2],
])

const alignmentPrefixes = new Map<Alignment, "" | ":">([
  ["none", ""],
  ["left", ":"],
  ["center", ":"],
  ["right", ""],
])

const alignmentSuffixes = new Map<Alignment, "" | ":">([
  ["none", ""],
  ["left", ""],
  ["center", ":"],
  ["right", ":"],
])

/**
 * Assembles GFM table props from {@link unsanitizedRows} and {@link alignments}.
 *
 * All rows in the table are the same length and all columns are the same length as well.
 * This is stricter than the GFM spec, which allows extra cells to be ignored and
 * missing cells to be implicit.
 * However, this doesn't work well for a table editor and this ability is likely rarely used.
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
 *
 * There must be at least one row, at least one cell (column), and at least one alignment.
 * All rows in {@link unsanitizedRows} must have the same number of cells which must
 * match the number of {@Link alignments} (columns).
 */
export function format(
  unsanitizedRows: readonly Text[][],
  alignments: readonly Alignment[],
): TableProperties {
  Assert.nonEmpty(unsanitizedRows)
  Assert.nonEmpty(alignments)
  Assert.length2d(unsanitizedRows, alignments.length)

  const rows = Arrays.map2d(unsanitizedRows, (cell) =>
    TextSanitizer.sanitize(cell, { trim: true }),
  ).map((row) => row.map((cell) => cell.toString()))
  const headerRow = Arrays.first(rows)
  const dataRows = Arrays.tailOrEmpty(rows)

  const rowCount = rows.length
  const colCount = headerRow.length

  const cols = Repeat.timesMap(colCount, (col) =>
    Repeat.timesMap(rowCount, (row) => rows[row][col]),
  )
  const colContentSizes = cols.map((col, i) => calculateColContentSize(col, alignments[i]))

  const headerLine = createRow(headerRow, colContentSizes)
  const alignmentLine = createAlignmentRow(alignments, colContentSizes)
  const dataLines = dataRows.map((row) => createRow(row, colContentSizes))

  const text = Text.of([headerLine, alignmentLine, ...dataLines])
  const colSizes = colContentSizes.map((it) => leftPadSize + it + rightPadSize)
  const contentSizes = Arrays.map2d(rows, (cell) => cell.length)

  return { text, colSizes, alignments: [...alignments], contentSizes }
}

function createRow(cells: string[], contentSizes: number[]): string {
  const row = [pipe]
  cells.forEach((cell, colNum) => {
    row.push(leftPad, cell, padding(contentSizes[colNum] - cell.length), rightPad, pipe)
  })
  return row.join("")
}

function createAlignmentRow(alignments: readonly Alignment[], contentSizes: number[]): string {
  const alignmentRow = [pipe]
  alignments.forEach((alignment, colNum) => {
    const prefix = alignmentPrefix(alignment)
    const suffix = alignmentSuffix(alignment)
    const hyphens = hyphening(contentSizes[colNum] - prefix.length - suffix.length)

    alignmentRow.push(leftPad, prefix, hyphens, suffix, rightPad, pipe)
  })
  return alignmentRow.join("")
}

function padding(count: number): string {
  return Strings.repeat(" ", count)
}

function hyphening(count: number): string {
  return Strings.repeat("-", count)
}

function alignmentContentSize(alignment: Alignment): number {
  return alignmentContentSizes.get(alignment)!
}

function alignmentPrefix(alignment: Alignment): "" | ":" {
  return alignmentPrefixes.get(alignment)!
}

function alignmentSuffix(alignment: Alignment): "" | ":" {
  return alignmentSuffixes.get(alignment)!
}

function calculateColContentSize(col: string[], alignment: Alignment): number {
  return Numbers.max(alignmentContentSize(alignment), ...col.map((cell) => cell.length))
}
