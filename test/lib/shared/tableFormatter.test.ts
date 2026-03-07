import { Text } from "@codemirror/state"
import { describe, expect, it } from "vitest"

import * as Texts from "#ext/codemirror/state/texts"
import * as Arrays from "#ext/stdlib/arrays"

import * as TableFormatter from "#core/tableFormatter"

import { txt } from "../../../testSupport/helpers/txt"

describe("format", () => {
  it("throws when empty rows", () => {
    expect(() => TableFormatter.format([], ["none"])).toThrow(/empty/)
  })
  it("throws when empty alignments", () => {
    expect(() => TableFormatter.format([[Text.empty]], [])).toThrow(/empty/)
  })
  it("throws when rows have too few cells", () => {
    expect(() =>
      TableFormatter.format([[Text.empty, Text.empty], [Text.empty]], ["none", "none"]),
    ).toThrow(/not equal/)
  })
  it("throws when rows have too many cells", () => {
    expect(() =>
      TableFormatter.format(
        [
          [Text.empty, Text.empty],
          [Text.empty, Text.empty, Text.empty],
        ],
        ["none", "none"],
      ),
    ).toThrow(/not equal/)
  })
  it("throws when fewer columns than alignments", () => {
    expect(() => TableFormatter.format([[Text.empty]], ["none", "none"])).toThrow(/not equal/)
  })
  it("throws when more columns than alignments", () => {
    expect(() => TableFormatter.format([[Text.empty, Text.empty]], ["none"])).toThrow(/not equal/)
  })
  it("formats table", () => {
    const unsanitizedRows = Arrays.map2d(
      [
        ["   ", "   a    ", "b", "   c de  ", "", " "],
        ["", "fg", "h", "ij", "", " "],
      ],
      (cell) => Texts.ofString(cell),
    )
    const alignments = ["none", "none", "center", "left", "none", "right"] as const

    const {
      text,
      colSizes,
      alignments: actualAlignments,
      contentSizes,
    } = TableFormatter.format(unsanitizedRows, alignments)

    expect(text).toStrictEqual(txt`
        |   | a  | b   | c de |   |    |
        | - | -- | :-: | :--- | - | -: |
        |   | fg | h   | ij   |   |    |
      `)
    expect(colSizes).toStrictEqual([3, 4, 5, 6, 3, 4])
    expect(actualAlignments).toStrictEqual(alignments)
    expect(contentSizes).toStrictEqual([
      [0, 1, 1, 4, 0, 0],
      [0, 2, 1, 2, 0, 0],
    ])
  })
})
