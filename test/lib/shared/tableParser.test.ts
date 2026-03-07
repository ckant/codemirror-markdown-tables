import { describe, expect, it } from "vitest"

import * as TableParser from "#core/tableParser"

import { txt } from "../../../testSupport/helpers/txt"
import { expectDef, expectNil } from "../../../testSupport/vitest/existence"

describe("parse", () => {
  it("throws when not a table", () => {
    expect(() => TableParser.parse(txt``)).toThrow(/^Text is not a table$/)
  })
  it("parses table", () => {
    const unformattedText = txt`
        |      | a  | b   | c de |   |    |
        | ---  |-----| :-: | :--| - | -: |
        |   | fg | h   | ij   |   |    |
        k|||n||p
      `

    const { text, colSizes, alignments, contentSizes } = TableParser.parse(unformattedText)

    expect(text).toStrictEqual(txt`
        |   | a  | b   | c de |   |    |
        | - | -- | :-: | :--- | - | -: |
        |   | fg | h   | ij   |   |    |
        | k |    |     | n    |   | p  |
      `)
    expect(colSizes).toStrictEqual([3, 4, 5, 6, 3, 4])
    expect(alignments).toStrictEqual(["none", "none", "center", "left", "none", "right"])
    expect(contentSizes).toStrictEqual([
      [0, 1, 1, 4, 0, 0],
      [0, 2, 1, 2, 0, 0],
      [1, 0, 0, 1, 0, 1],
    ])
  })
})

describe("parseOrNil", () => {
  it("returns nil when not a table", () => {
    expectNil(TableParser.parseOrNil(txt``))
  })
  it("parses table", () => {
    const unformattedText = txt`
        |      | a  | b   | c de |   |    |
        | ---  |-----| :-: | :--| - | -: |
        |   | fg | h   | ij   |   |    |
        k|||n||p
      `

    const tableProps = TableParser.parseOrNil(unformattedText)

    expectDef(tableProps)
    const { text, colSizes, alignments, contentSizes } = tableProps
    expect(text).toStrictEqual(txt`
        |   | a  | b   | c de |   |    |
        | - | -- | :-: | :--- | - | -: |
        |   | fg | h   | ij   |   |    |
        | k |    |     | n    |   | p  |
      `)
    expect(colSizes).toStrictEqual([3, 4, 5, 6, 3, 4])
    expect(alignments).toStrictEqual(["none", "none", "center", "left", "none", "right"])
    expect(contentSizes).toStrictEqual([
      [0, 1, 1, 4, 0, 0],
      [0, 2, 1, 2, 0, 0],
      [1, 0, 0, 1, 0, 1],
    ])
  })
})
