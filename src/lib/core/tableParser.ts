import { DocInput } from "@codemirror/language"
import { Text } from "@codemirror/state"
import { type Tree, type TreeCursor } from "@lezer/common"

import * as MarkdownParsers from "#ext/codemirror/lang-markdown/markdownParsers"
import * as Texts from "#ext/codemirror/state/texts"
import * as Cursors from "#ext/lezer/common/cursors"
import * as MarkdownNodes from "#ext/lezer/markdown/markdownNodes"
import * as Arrays from "#ext/stdlib/arrays"
import type { Span } from "#ext/stdlib/span"

import type { Alignment } from "#core/models/alignment"
import type { TableProperties } from "#core/models/tableProperties"
import * as TableFormatter from "#core/tableFormatter"

const markdownTableParser = MarkdownParsers.table()

/**
 * Parses, formats, and assembles GFM table props from Markdown table {@link unformattedText}.
 *
 * The structure of the Markdown syntax tree for a single GFM table is as follows:
 * - `Document` :: (1 always-present) root
 *   - `Table`     :: (1 always-present) table wrapper
 *     - `TableHeader`  :: (1 always-present) table header row
 *       - `TableDelimiter` :: (0 or 1 possibly-present) first delimiter
 *       - `TableCell`      :: (0 or 1 possibly-present) first cell content (not present when cell is empty)
 *       - `TableDelimiter` :: (0 or 1 always-present) first cell delimiter
 *       - `...`
 *       - `TableCell`      :: (0 or 1 possibly-present) last cell content
 *       - `TableDelimiter` :: (0 or 1 possibly-present) last delimiter
 *     - `TableDelimiter`  :: (always-present) table alignment row (no children)
 *     - `TableRow`  :: (0 or more always-present) table data row
 *       - Same children as `TableHeader` above
 *
 * Note:
 * - `TableCell` spans do not include any leading or trailing whitespace in the cell.
 * - There is always a beginning and/or ending `TableDelimiter` for each row and alignment row.
 * - There is always both a beginning and ending `TableDelimiter` for each row with a single cell.
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
 * {@link unformattedText} must be a single, valid Markdown table.
 */
export function parse(unformattedText: Text): TableProperties {
  const tree = markdownTableParser.parse(new DocInput(unformattedText))
  if (!isSingleTable(tree)) throw new Error("Text is not a table")

  return parseInternal(unformattedText, tree)
}

/**
 * Parses, formats, and assembles GFM table props from Markdown table {@link maybeTableText},
 * or returns nil if {@link maybeTableText} is not a single, valid Markdown table.
 *
 * See {@link parse}.
 */
export function parseOrNil(maybeTableText: Text): TableProperties | undefined {
  const tree = markdownTableParser.parse(new DocInput(maybeTableText))
  if (!isSingleTable(tree)) return undefined

  return parseInternal(maybeTableText, tree)
}

function parseInternal(unsafeText: Text, tree: Tree): TableProperties {
  const document = tree.cursor()
  const table = Cursors.firstChild(document)
  const tableHeader = Cursors.firstChild(table)
  const headerRow = parseTableCellContentSpans(tableHeader).map((span) =>
    Texts.sliceSpan(unsafeText, span),
  )
  const colCount = headerRow.length

  const tableDelimiter = Cursors.nextSibling(tableHeader)
  const alignments = parseAlignments(Texts.sliceSpan(unsafeText, tableDelimiter))
  const dataRows = Cursors.mapEachSibling(tableDelimiter, (tableRow) =>
    Arrays.clamp(
      parseTableCellContentSpans(tableRow).map((span) => Texts.sliceSpan(unsafeText, span)),
      { min: colCount, max: colCount, fillWith: Text.empty },
    ),
  )

  const rows = [headerRow, ...dataRows]
  const { text, colSizes, contentSizes } = TableFormatter.format(rows, alignments)
  return { text, colSizes, alignments, contentSizes }
}

function parseTableCellContentSpans(tableRow: TreeCursor): Span[] {
  const cursor = tableRow
  tableRow.firstChild()
  const cellOrDelimiter = cursor

  const cellContentSpans: Span[] = []
  let last: "delimiter" | "cell" | undefined = undefined
  do {
    const { from, to } = cellOrDelimiter
    // Two delimiters in a row means a cell in between with no content.
    if (MarkdownNodes.isTableDelimiter(cellOrDelimiter)) {
      if (last === "delimiter") cellContentSpans.push({ from, to: from })
      last = "delimiter"
      continue
    }
    last = "cell"
    // Span doesn't include leading or trailing whitespace.
    cellContentSpans.push({ from, to })
  } while (cellOrDelimiter.nextSibling())

  cellOrDelimiter.parent()
  return cellContentSpans
}

function parseAlignments(text: Text): Alignment[] {
  const parts = text.toString().split("|")

  const alignments: Alignment[] = []

  for (const part of parts) {
    if (!part.includes("-")) continue

    const hasLeft = part.includes(":-")
    const hasRight = part.includes("-:")

    if (hasLeft) {
      if (hasRight) {
        alignments.push("center")
      } else {
        alignments.push("left")
      }
    } else if (hasRight) {
      alignments.push("right")
    } else {
      alignments.push("none")
    }
  }

  return alignments
}

function isSingleTable(tree: Tree): boolean {
  const document = tree.cursor()
  const maybeTable = Cursors.firstChild(document)
  return MarkdownNodes.isTable(maybeTable) && !maybeTable.nextSibling()
}
