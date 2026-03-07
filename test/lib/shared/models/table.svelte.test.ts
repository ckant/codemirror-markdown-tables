import { describe, expect, it } from "vitest"

import * as Strings from "#ext/dom/strings"

import { TableSection } from "#componentModels/table/tableSection"

import { Table } from "#core/models/table.svelte"

import { tbl } from "../../../../testSupport/helpers/tbl"
import { txt } from "../../../../testSupport/helpers/txt"
import { expectDef, expectNil } from "../../../../testSupport/vitest/existence"

describe("Table", () => {
  describe("of", () => {
    it("throws if not a table", () => {
      const text = txt`
         | a | b |
         | - |
      `
      expect(() => Table.of(text)).toThrow(/not a table/)
    })
    it("throws if more than one table", () => {
      const text = txt`
         | a |
         | - |

         | b |
         | - |
      `
      expect(() => Table.of(text)).toThrow(/not a table/)
    })
    it("creates a table", () => {
      const text = txt`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      const table = Table.of(text)._asInternal()

      expect(table.text).toStrictEqual(text)
      expect(table.alignments).toStrictEqual(["none", "none"])
      expect(table.cells).toStrictEqual([
        [txt`a`, txt`bcde`],
        [txt`fg`, txt`hij`],
      ])
      expect(table.colSizes).toStrictEqual([4, 6])
      expect(table.contentSizes).toStrictEqual([
        [1, 4],
        [2, 3],
      ])
    })
  })

  describe("maybeOf", () => {
    it("returns nil when not a table", () => {
      const text = txt`
         | a | b |
         | - |
      `

      const table = Table.maybeOf(text)
      expectNil(table)
    })
    it("returns nil when multiple tables", () => {
      const text = txt`
         | a |
         | - |

         | b |
         | - |
      `

      const table = Table.maybeOf(text)
      expectNil(table)
    })
    it("creates a table when valid", () => {
      const unformattedText = txt`
         a|bcde
        --|----
        fg|hij
      `
      const formattedText = txt`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      const table = Table.maybeOf(unformattedText)?._asInternal()

      expectDef(table)
      expect(table.text).toStrictEqual(formattedText)
      expect(table.colSizes).toStrictEqual([4, 6])
      expect(table.alignments).toStrictEqual(["none", "none"])
      expect(table.contentSizes).toStrictEqual([
        [1, 4],
        [2, 3],
      ])
      expect(table.cells).toStrictEqual([
        [txt`a`, txt`bcde`],
        [txt`fg`, txt`hij`],
      ])
    })
  })

  describe("cellAt", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.cellAt({ row: 1, col: 0 })).toThrow(/not in range/)
    })
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.cellAt({ row: 0, col: 1 })).toThrow(/not in range/)
    })
    it("returns cell at location", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      expect(table.cellAt({ row: 0, col: 1 })).toStrictEqual(txt`bcde`)
    })
  })

  describe("firstCellSpan", () => {
    it("returns first cell span", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      expect(table.firstCellSpan).toStrictEqual({ from: 2, to: 3 })
    })
  })
  describe("lastCellSpan", () => {
    it("returns last cell span", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      expect(table.lastCellSpan).toStrictEqual({ from: 35, to: 38 })
    })
  })
  describe("cellSpan", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.cellSpan({ row: 1, col: 0 })).toThrow(/not in range/)
    })
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.cellSpan({ row: 0, col: 1 })).toThrow(/not in range/)
    })
    it("returns cell span", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      expect(table.cellSpan({ row: 0, col: 1 })).toStrictEqual({ from: 7, to: 11 })
    })
  })

  describe("closestCellAtPosition", () => {
    it("throws when position is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.closestCellAtPosition(-1)).toThrow(/negative/)
    })
    it("returns last cell when beyond text length", () => {
      const table = tbl`
       | a | bc |
       | - | -- |
       | d | e  |
      `
      expect(table.closestCellAtPosition(33)).toStrictEqual({ row: 1, col: 1 })
    })
    it("returns first data cell when within alignment line", () => {
      const table = tbl`
       | a | bc |
       | - | -- |
       | d | e  |
      `
      expect(table.closestCellAtPosition(11)).toStrictEqual({ row: 1, col: 0 })
    })
    it("returns last header cell when within alignment line", () => {
      const table = tbl`
       | a | bc |
       | - | -- |
      `
      expect(table.closestCellAtPosition(11)).toStrictEqual({ row: 0, col: 1 })
    })
    it("returns first cell in row when before cell start", () => {
      const table = tbl`
       | a | bc |
       | - | -- |
       | d | e  |
      `
      expect(table.closestCellAtPosition(22)).toStrictEqual({ row: 1, col: 0 })
    })
    it("returns cell", () => {
      const table = tbl`
       | a | bc |
       | - | -- |
      `
      expect(table.closestCellAtPosition(5)).toStrictEqual({ row: 0, col: 1 })
    })
    it("returns last cell in row when after cell end", () => {
      const table = tbl`
       | a | bc |
       | - | -- |
       | d | e  |
       | f | g  |
      `
      expect(table.closestCellAtPosition(32)).toStrictEqual({ row: 1, col: 1 })
    })
  })

  describe("firstRowIndex", () => {
    it("is 0", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.firstRowIndex).toBe(0)
    })
  })
  describe("firstColIndex", () => {
    it("is 0", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.firstColIndex).toBe(0)
    })
  })
  describe("headerRowIndex", () => {
    it("is 0", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.headerRowIndex).toBe(0)
    })
  })
  describe("firstDataRowIndex", () => {
    it("is 1", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.firstDataRowIndex).toBe(1)
    })
  })
  describe("firstRowOrColIndex", () => {
    it("is 0", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.firstRowOrColIndex("row")).toBe(0)
      expect(table.firstRowOrColIndex("col")).toBe(0)
    })
  })

  describe("lastRowIndex", () => {
    it("is last row", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.lastRowIndex).toBe(1)
    })
  })
  describe("lastColIndex", () => {
    it("is last col", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.lastColIndex).toBe(1)
    })
  })
  describe("lastRowOrColIndex", () => {
    it("is last row or col", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.lastRowOrColIndex("row")).toBe(1)
      expect(table.lastRowOrColIndex("col")).toBe(1)
    })
  })

  describe("rowCount", () => {
    it("is number of rows", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.rowCount).toBe(2)
    })
  })
  describe("colCount", () => {
    it("is number of cols", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.colCount).toBe(2)
    })
  })
  describe("rowOrColCount", () => {
    it("is number of rows or cols", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.rowOrColCount("row")).toBe(2)
      expect(table.rowOrColCount("col")).toBe(2)
    })
  })

  describe("rowRange", () => {
    it("is [firstRow, lastRow + 1)", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.rowRange).toStrictEqual({ start: 0, endExclusive: 2 })
    })
  })
  describe("colRange", () => {
    it("is [firstCol, lastCol + 1)", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.colRange).toStrictEqual({ start: 0, endExclusive: 2 })
    })
  })
  describe("rowOrColRange", () => {
    it("is [firstRow, lastRow + 1) or [firstCol, lastCol + 1)", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.rowOrColRange("row")).toStrictEqual({ start: 0, endExclusive: 2 })
      expect(table.rowOrColRange("col")).toStrictEqual({ start: 0, endExclusive: 2 })
    })
  })

  describe("rowIndices", () => {
    it("is [firstRow, secondRow, ..., lastRow]", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.rowIndices).toStrictEqual([0, 1])
    })
  })
  describe("colIndices", () => {
    it("is [firstCol, secondCol, ..., lastCol]", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.colIndices).toStrictEqual([0, 1])
    })
  })
  describe("dataRowIndices", () => {
    it("is [secondRow, thirdRow, ..., lastRow]", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.dataRowIndices).toStrictEqual([1])
    })
    it("is empty when no data rows", () => {
      const table = tbl`
        | a | b |
        | - | - |
      `

      expect(table.dataRowIndices).toStrictEqual([])
    })
  })

  describe("firstCellLocation", () => {
    it("is { row: 0, col: 0 }", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.firstCellLocation).toStrictEqual({ row: 0, col: 0 })
    })
  })
  describe("lastCellLocation", () => {
    it("is { row: lastRow, col: lastCol }", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.lastCellLocation).toStrictEqual({ row: 1, col: 1 })
    })
  })

  describe("rowCellCount", () => {
    it("is col count", () => {
      const table = tbl`
        | a | b |
        | - | - |
      `

      expect(table.rowCellCount).toBe(2)
    })
  })
  describe("colCellCount", () => {
    it("is row count", () => {
      const table = tbl`
        | a | b |
        | - | - |
      `

      expect(table.colCellCount).toBe(1)
    })
  })
  describe("rowOrColCellCount", () => {
    it("is number of cells in a row or col", () => {
      const table = tbl`
        | a | b |
        | - | - |
      `

      expect(table.rowOrColCellCount("row")).toBe(2)
      expect(table.rowOrColCellCount("col")).toBe(1)
    })
  })

  describe("hasSingleRow", () => {
    it("returns true when one row", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasSingleRow()).toBe(true)
    })
    it("returns false when more than one row", () => {
      const table = tbl`
        | a |
        | - |
        | b |
      `

      expect(table.hasSingleRow()).toBe(false)
    })
  })
  describe("hasSingleCol", () => {
    it("returns true when one col", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasSingleCol()).toBe(true)
    })
    it("returns false when more than one col", () => {
      const table = tbl`
        | a | b |
        | - | - |
      `

      expect(table.hasSingleCol()).toBe(false)
    })
  })
  describe("hasSingleRowOrCol", () => {
    it("returns true when one row / col", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasSingleRowOrCol("row")).toBe(true)
      expect(table.hasSingleRowOrCol("col")).toBe(true)
    })
    it("returns false when more than one row / col", () => {
      const table = tbl`
        | a | b |
        | - | - |
        | c | d |
      `

      expect(table.hasSingleRowOrCol("row")).toBe(false)
      expect(table.hasSingleRowOrCol("col")).toBe(false)
    })
  })

  describe("hasDataRows", () => {
    it("returns true when more than one row", () => {
      const table = tbl`
        | a |
        | - |
        | b |
      `

      expect(table.hasDataRows()).toBe(true)
    })
    it("returns false when only one row", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasDataRows()).toBe(false)
    })
  })

  describe("hasRowAt", () => {
    it("returns true when row in table", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasRowAt(0)).toBe(true)
    })
    it("returns false when row not in table", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasRowAt(1)).toBe(false)
    })
  })
  describe("hasColAt", () => {
    it("returns true when col in table", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasColAt(0)).toBe(true)
    })
    it("returns false when col not in table", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasColAt(1)).toBe(false)
    })
  })
  describe("hasRowOrColAt", () => {
    it("returns true when row / col in table", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasRowOrColAt("row", 0)).toBe(true)
      expect(table.hasRowOrColAt("col", 0)).toBe(true)
    })
    it("returns false when row / col not in table", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(table.hasRowOrColAt("row", 1)).toBe(false)
      expect(table.hasRowOrColAt("col", 1)).toBe(false)
    })
  })

  describe("hasEmptyRowAt", () => {
    it("returns true when empty row in table", () => {
      const table = tbl`
        |   |   |
        | - | - |
      `

      expect(table.hasEmptyRowAt(0)).toBe(true)
    })
    it("returns false when row not in table", () => {
      const table = tbl`
        |   |   |
        | - | - |
      `

      expect(table.hasEmptyRowAt(1)).toBe(false)
    })
    it("returns false when row not empty", () => {
      const table = tbl`
        |   | a |
        | - | - |
      `

      expect(table.hasEmptyRowAt(0)).toBe(false)
    })
  })
  describe("hasEmptyColAt", () => {
    it("returns true when empty col in table", () => {
      const table = tbl`
        |   |
        | - |
        |   |
      `

      expect(table.hasEmptyColAt(0)).toBe(true)
    })
    it("returns false when col not in table", () => {
      const table = tbl`
        |   |
        | - |
        |   |
      `

      expect(table.hasEmptyColAt(1)).toBe(false)
    })
    it("returns false when col not empty", () => {
      const table = tbl`
        |   |
        | - |
        | a |
      `

      expect(table.hasEmptyColAt(0)).toBe(false)
    })
  })
  describe("hasEmptyRowOrColAt", () => {
    it("returns true when empty row / col in table", () => {
      const table = tbl`
        |   |   |
        | - | - |
        |   |   |
      `

      expect(table.hasEmptyRowOrColAt("row", 1)).toBe(true)
      expect(table.hasEmptyRowOrColAt("col", 1)).toBe(true)
    })
    it("returns false when row / col not in table", () => {
      const table = tbl`
        |   |   |
        | - | - |
        |   |   |
      `

      expect(table.hasEmptyRowOrColAt("row", 2)).toBe(false)
      expect(table.hasEmptyRowOrColAt("col", 2)).toBe(false)
    })
    it("returns false when row / col not empty", () => {
      const table = tbl`
        |   |   |
        | - | - |
        |   | a |
      `

      expect(table.hasEmptyRowOrColAt("row", 1)).toBe(false)
      expect(table.hasEmptyRowOrColAt("col", 1)).toBe(false)
    })
  })

  describe("forEachRow", () => {
    it("iterates each row", () => {
      const table = tbl`
        |   |
        | - |
        |   |
      `

      const yields: number[] = []
      table.forEachRow((i) => yields.push(i))

      expect(yields).toStrictEqual([0, 1])
    })
  })
  describe("forEachCol", () => {
    it("iterates each col", () => {
      const table = tbl`
        |   |   |
        | - | - |
      `

      const yields: number[] = []
      table.forEachCol((i) => yields.push(i))

      expect(yields).toStrictEqual([0, 1])
    })
  })

  describe("mapEachRow", () => {
    it("maps each row", () => {
      const table = tbl`
        |   |
        | - |
        |   |
      `

      expect(table.mapEachRow((i) => i)).toStrictEqual([0, 1])
    })
  })
  describe("mapEachCol", () => {
    it("maps each col", () => {
      const table = tbl`
        |   |   |
        | - | - |
      `

      expect(table.mapEachCol((i) => i)).toStrictEqual([0, 1])
    })
  })

  describe("equals", () => {
    it("returns true when other table is equivalent", () => {
      const firstTable = tbl`
        | a  | bcde |
        | :- | ---- |
      `
      const secondTable = tbl`
        | a  | bcde |
        | :- | ---- |
      `

      expect(firstTable.equals(secondTable)).toBe(true)
    })
    it("returns false when other table is different", () => {
      const firstTable = tbl`
        | a  | bcde |
        | :- | ---- |
      `
      const secondTable = tbl`
        | a | bcde |
        | - | ---- |
      `

      expect(firstTable.equals(secondTable)).toBe(false)
    })
  })

  describe("sliceSectionAt", () => {
    it("throws when row range is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.sliceSectionAt(TableSection.ofCell({ row: -1, col: 0 }))).toThrow(
        /not in range/,
      )
    })
    it("throws when col range is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.sliceSectionAt(TableSection.ofCell({ row: 0, col: -1 }))).toThrow(
        /not in range/,
      )
    })
    it("slices cell of table", () => {
      const table = tbl`
        | a   | bcde | f |
        | :-- | :--: | - |
        | gh  | ijk  | l |
        | mmo | pqr  |   |
      `

      expect(table.sliceSectionAt(TableSection.ofCell({ row: 0, col: 0 }))).toStrictEqual(tbl`
        | a  |
        | :- |
      `)
    })
    it("slices part of table", () => {
      const table = tbl`
        | a   | bcde | f |
        | :-- | :--: | - |
        | gh  | ijk  | l |
        | mmo | pqr  |   |
      `

      expect(
        table.sliceSectionAt(
          TableSection.of({
            row: { start: 1, endExclusive: 3 },
            col: { start: 1, endExclusive: 3 },
          }),
        ),
      ).toStrictEqual(tbl`
        | ijk | l |
        | :-: | - |
        | pqr |   |
      `)
    })
    it("slices full table", () => {
      const table = tbl`
        | a   | bcde | f |
        | :-- | :--: | - |
        | gh  | ijk  | l |
        | mmo | pqr  |   |
      `

      expect(
        table.sliceSectionAt(TableSection.of({ row: table.rowRange, col: table.colRange })),
      ).toStrictEqual(table)
    })
  })

  describe("setCellAt", () => {
    it("throws when cell row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.setCellAt({ row: 1, col: 0 }, txt``)).toThrow(/not in range/)
    })
    it("throws when cell col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.setCellAt({ row: 0, col: 1 }, txt``)).toThrow(/not in range/)
    })
    it("sets cell content", () => {
      const table = tbl`
        | abc |
        | :-- |
        | de  |
      `

      table.setCellAt({ row: 1, col: 0 }, txt`x`)

      expect(table).toStrictEqual(tbl`
        | abc |
        | :-- |
        | x   |
      `)
    })
    it("sets empty content", () => {
      const table = tbl`
        | abc |
        | :-- |
        | de  |
      `

      table.setCellAt({ row: 1, col: 0 }, txt``)

      expect(table).toStrictEqual(tbl`
        | abc |
        | :-- |
        |     |
      `)
    })
    it("shrinks col when cell is no longer largest", () => {
      const table = tbl`
        | abc |
        | :-- |
        | de  |
      `

      table.setCellAt({ row: 0, col: 0 }, txt`x`)

      expect(table).toStrictEqual(tbl`
        | x  |
        | :- |
        | de |
      `)
    })
    it("grows col when cell is now largest", () => {
      const table = tbl`
        | a  |
        | :- |
        | bc |
      `

      table.setCellAt({ row: 0, col: 0 }, txt`xyz`)

      expect(table).toStrictEqual(tbl`
        | xyz |
        | :-- |
        | bc  |
      `)
    })
  })
  describe("setAlignmentAt", () => {
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.setAlignmentAt(1, "none")).toThrow(/not in range/)
    })
    it("sets alignment", () => {
      const table = tbl`
        | abc | d  |
        | :-- | -: |
      `

      table.setAlignmentAt(1, "left")

      expect(table).toStrictEqual(tbl`
        | abc | d  |
        | :-- | :- |
      `)
    })
    it("shrinks col when alignment is no longer largest", () => {
      const table = tbl`
        | abc | d  |
        | :-- | -: |
      `

      table.setAlignmentAt(1, "none")

      expect(table).toStrictEqual(tbl`
        | abc | d |
        | :-- | - |
      `)
    })
    it("grows col when alignment is now largest", () => {
      const table = tbl`
        | abc | d |
        | :-- | - |
      `

      table.setAlignmentAt(1, "center")

      expect(table).toStrictEqual(tbl`
        | abc | d   |
        | :-- | :-: |
      `)
    })
  })

  describe("clearRow", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.clearRow(1)).toThrow(/not in range/)
    })
    it("clears row", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.clearRow(0)

      expect(table).toStrictEqual(tbl`
        |    |     |
        | -- | --- |
        | fg | hij |
      `)
    })
  })
  describe("clearCol", () => {
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.clearCol(1)).toThrow(/not in range/)
    })
    it("clears col", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.clearCol(1)

      expect(table).toStrictEqual(tbl`
        | a  |   |
        | -- | - |
        | fg |   |
      `)
    })
  })
  describe("clearRowOrCol", () => {
    it("throws when row or col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.clearRowOrCol("row", 1)).toThrow(/not in range/)
      expect(() => table.clearRowOrCol("col", 1)).toThrow(/not in range/)
    })
    it("clears row or col", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.clearRowOrCol("row", 1)
      table.clearRowOrCol("col", 1)

      expect(table).toStrictEqual(tbl`
        | a |   |
        | - | - |
        |   |   |
      `)
    })
  })
  describe("clearSection", () => {
    it("throws when row range is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.clearSection(TableSection.ofCell({ row: 1, col: 0 }))).toThrow(
        /not in range/,
      )
    })
    it("throws when col range is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.clearSection(TableSection.ofCell({ row: 0, col: 1 }))).toThrow(
        /not in range/,
      )
    })
    it("clears all cells in section", () => {
      const table = tbl`
        | a  | bcde | fgh |
        | -- | :--: | :-- |
        | ij | klm  | no  |
        | p  | qrs  | tu  |
      `

      table.clearSection(
        TableSection.of({ row: { start: 1, endExclusive: 2 }, col: { start: 1, endExclusive: 3 } }),
      )

      expect(table).toStrictEqual(tbl`
        | a  | bcde | fgh |
        | -- | :--: | :-- |
        | ij |      |     |
        | p  | qrs  | tu  |
      `)
    })
  })

  describe("prependEmptyRows", () => {
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.prependEmptyRows(-1)).toThrow(/negative/)
    })
    it("prepends rows with empty cells", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.prependEmptyRows(2)

      expect(table).toStrictEqual(tbl`
        |    |      |
        | -- | ---- |
        |    |      |
        | a  | bcde |
        | fg | hij  |
      `)
    })
  })
  describe("prependEmptyCols", () => {
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.prependEmptyCols(-1)).toThrow(/negative/)
    })
    it("prepends cols with empty cells", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.prependEmptyCols(2)

      expect(table).toStrictEqual(tbl`
        |   |   | a  | bcde |
        | - | - | -- | ---- |
        |   |   | fg | hij  |
      `)
    })
  })

  describe("addEmptyRowsAt", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.addEmptyRowsAt({ row: 2, count: 1 })).toThrow(/not in range/)
    })
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.addEmptyRowsAt({ row: 0, count: -1 })).toThrow(/negative/)
    })
    it("does nothing when adding 0 rows", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.addEmptyRowsAt({ row: 1, count: 0 })

      expect(table).toStrictEqual(table)
    })
    it("prepends rows when adding at header row", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.addEmptyRowsAt({ row: 0, count: 2 })

      expect(table).toStrictEqual(tbl`
        |    |      |
        | -- | ---- |
        |    |      |
        | a  | bcde |
        | fg | hij  |
      `)
    })
    it("appends rows when adding past last row with single row", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
      `

      table.addEmptyRowsAt({ row: 1, count: 2 })

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        |    |      |
        |    |      |
      `)
    })
    it("appends rows when adding past last row with multiple rows", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.addEmptyRowsAt({ row: 2, count: 2 })

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
        |    |      |
        |    |      |
      `)
    })
    it("inserts rows when adding in middle of table", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.addEmptyRowsAt({ row: 1, count: 2 })

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        |    |      |
        |    |      |
        | fg | hij  |
      `)
    })
  })
  describe("addEmptyColsAt", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.addEmptyColsAt({ col: 2, count: 1 })).toThrow(/not in range/)
    })
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.addEmptyColsAt({ col: 0, count: -1 })).toThrow(/negative/)
    })
    it("does nothing when adding 0 cols", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.addEmptyColsAt({ col: 1, count: 0 })

      expect(table).toStrictEqual(table)
    })
    it("prepends cols when adding at first col index", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.addEmptyColsAt({ col: 0, count: 2 })

      expect(table).toStrictEqual(tbl`
        |   |   | a  | bcde |
        | - | - | -- | ---- |
        |   |   | fg | hij  |
      `)
    })
    it("inserts cols when adding in middle of table", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.addEmptyColsAt({ col: 1, count: 2 })

      expect(table).toStrictEqual(tbl`
        | a  |   |   | bcde |
        | -- | - | - | ---- |
        | fg |   |   | hij  |
      `)
    })
  })
  describe("addEmptyRowsOrColsAt", () => {
    it("adds empty rows or cols", () => {
      const table = tbl`
        | a |
        | - |
      `

      table.addEmptyRowsOrColsAt("row", { index: 1, count: 2 })
      table.addEmptyRowsOrColsAt("col", { index: 1, count: 2 })

      expect(table).toStrictEqual(tbl`
        | a |   |   |
        | - | - | - |
        |   |   |   |
        |   |   |   |
      `)
    })
  })

  describe("appendEmptyRows", () => {
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.appendEmptyRows(-1)).toThrow(/negative/)
    })
    it("appends rows with empty cells", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.appendEmptyRows(2)

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
        |    |      |
        |    |      |
      `)
    })
  })
  describe("appendEmptyCols", () => {
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.appendEmptyCols(-1)).toThrow(/negative/)
    })
    it("appends cols with empty cells", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.appendEmptyCols(2)

      expect(table).toStrictEqual(tbl`
        | a  | bcde |   |   |
        | -- | ---- | - | - |
        | fg | hij  |   |   |
      `)
    })
  })

  describe("duplicateRowAt", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.duplicateRowAt(1)).toThrow(/not in range/)
    })
    it("duplicates header row", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.duplicateRowAt(0)

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        | a  | bcde |
        | fg | hij  |
      `)
    })
    it("duplicates data row", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.duplicateRowAt(1)

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
        | fg | hij  |
      `)
    })
  })
  describe("duplicateColAt", () => {
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.duplicateColAt(1)).toThrow(/not in range/)
    })
    it("duplicates col", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.duplicateColAt(0)

      expect(table).toStrictEqual(tbl`
        | a  | a  | bcde |
        | -- | -- | ---- |
        | fg | fg | hij  |
      `)
    })
  })
  describe("duplicateRowOrColAt", () => {
    it("throws when row or col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.duplicateRowOrColAt("row", 1)).toThrow(/not in range/)
      expect(() => table.duplicateRowOrColAt("col", 1)).toThrow(/not in range/)
    })
    it("duplicates row / col", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.duplicateRowOrColAt("row", 0)
      table.duplicateRowOrColAt("col", 0)

      expect(table).toStrictEqual(tbl`
        | a  | a  | bcde |
        | -- | -- | ---- |
        | a  | a  | bcde |
        | fg | fg | hij  |
      `)
    })
  })

  describe("moveRowAt", () => {
    it("throws when from index is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.moveRowAt({ fromIndex: 1, toIndex: 0 })).toThrow(/not in range/)
    })
    it("throws when to index is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.moveRowAt({ fromIndex: 0, toIndex: 1 })).toThrow(/not in range/)
    })
    it("does nothing when row hasn't moved", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.moveRowAt({ fromIndex: 0, toIndex: 0 })

      expect(table).toStrictEqual(table)
    })
    it("moves row down 1 by swapping", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.moveRowAt({ fromIndex: 0, toIndex: 1 })

      expect(table).toStrictEqual(tbl`
        | fg | hij  |
        | -- | ---- |
        | a  | bcde |
      `)
    })
    it("moves row up 1 by swapping", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `

      table.moveRowAt({ fromIndex: 1, toIndex: 0 })

      expect(table).toStrictEqual(tbl`
        | fg | hij  |
        | -- | ---- |
        | a  | bcde |
      `)
    })
    it("promotes first data row to header row when moving from header row", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
        | k  | lm   |
      `

      table.moveRowAt({ fromIndex: 0, toIndex: 2 })

      expect(table).toStrictEqual(tbl`
        | fg | hij  |
        | -- | ---- |
        | k  | lm   |
        | a  | bcde |
      `)
    })
    it("demotes header row to first data row when moving to header row", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
        | k  | lm   |
      `

      table.moveRowAt({ fromIndex: 2, toIndex: 0 })

      expect(table).toStrictEqual(tbl`
        | k  | lm   |
        | -- | ---- |
        | a  | bcde |
        | fg | hij  |
      `)
    })
    it("removes and reinserts row when moving row earlier", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
        | k  | lm   |
        | no | pqr  |
      `

      table.moveRowAt({ fromIndex: 3, toIndex: 1 })

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        | no | pqr  |
        | fg | hij  |
        | k  | lm   |
      `)
    })
    it("reinserts and removes row when moving row later", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
        | k  | lm   |
        | no | pqr  |
      `

      table.moveRowAt({ fromIndex: 1, toIndex: 3 })

      expect(table).toStrictEqual(tbl`
        | a  | bcde |
        | -- | ---- |
        | k  | lm   |
        | no | pqr  |
        | fg | hij  |
      `)
    })
  })

  describe("moveColAt", () => {
    it("throws when from index is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.moveColAt({ fromIndex: 1, toIndex: 0 })).toThrow(/not in range/)
    })
    it("throws when to index is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.moveColAt({ fromIndex: 0, toIndex: 1 })).toThrow(/not in range/)
    })
    it("does nothing when col hasn't moved", () => {
      const table = tbl`
        | a  | bcde | fgh |
        | -- | ---: | :-- |
        | ij | klm  | nop |
      `

      table.moveColAt({ fromIndex: 0, toIndex: 0 })

      expect(table).toStrictEqual(table)
    })
    it("removes and reinserts col when moving col earlier", () => {
      const table = tbl`
        | a  | bcde | fgh |
        | -- | ---: | :-- |
        | ij | klm  | nop |
      `

      table.moveColAt({ fromIndex: 2, toIndex: 0 })

      expect(table).toStrictEqual(tbl`
        | fgh | a  | bcde |
        | :-- | -- | ---: |
        | nop | ij | klm  |
      `)
    })
    it("reinserts and removes col when moving col later", () => {
      const table = tbl`
        | a  | bcde | fgh |
        | -- | ---: | :-- |
        | ij | klm  | nop |
      `

      table.moveColAt({ fromIndex: 0, toIndex: 2 })

      expect(table).toStrictEqual(tbl`
        | bcde | fgh | a  |
        | ---: | :-- | -- |
        | klm  | nop | ij |
      `)
    })
  })
  describe("moveRowOrColAt", () => {
    it("throws when from index is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.moveRowOrColAt("row", { fromIndex: 1, toIndex: 0 })).toThrow(
        /not in range/,
      )
      expect(() => table.moveRowOrColAt("col", { fromIndex: 1, toIndex: 0 })).toThrow(
        /not in range/,
      )
    })
    it("throws when to index is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.moveRowOrColAt("row", { fromIndex: 0, toIndex: 1 })).toThrow(
        /not in range/,
      )
      expect(() => table.moveRowOrColAt("col", { fromIndex: 0, toIndex: 1 })).toThrow(
        /not in range/,
      )
    })
    it("moves row or col", () => {
      const table = tbl`
        | a  | bcde | fgh |
        | -- | ---: | :-- |
        | ij | klm  | nop |
        | qr | s    | t   |
      `

      table.moveRowOrColAt("row", { fromIndex: 2, toIndex: 0 })
      table.moveRowOrColAt("col", { fromIndex: 2, toIndex: 0 })

      expect(table).toStrictEqual(tbl`
        | t   | qr | s    |
        | :-- | -- | ---: |
        | fgh | a  | bcde |
        | nop | ij | klm  |
      `)
    })
  })

  describe("removeRowsAt", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.removeRowsAt({ row: 1, count: 1 })).toThrow(/not in range/)
    })
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.removeRowsAt({ row: 0, count: 2 })).toThrow(/not in range/)
    })
    it("removes no rows when count is 0", () => {
      const table = tbl`
        | a   | bcd |
        | --- | --- |
        | ef  | gh  |
      `

      table.removeRowsAt({ row: 0, count: 0 })
      expect(table).toStrictEqual(table)
    })

    it("removes header and data rows", () => {
      const table = tbl`
        | a   | bcd |
        | --- | --- |
        | ef  | gh  |
        | ijk | l   |
        | mn  | opq |
      `

      table.removeRowsAt({ row: 0, count: 2 })

      expect(table).toStrictEqual(tbl`
        | ijk | l   |
        | --- | --- |
        | mn  | opq |
      `)
    })
    it("removes data rows", () => {
      const table = tbl`
        | a   | bc  |
        | --- | --- |
        | de  | fgh |
        | ij  | k   |
        | lm  | no  |
      `

      table.removeRowsAt({ row: 1, count: 2 })

      expect(table).toStrictEqual(tbl`
        | a   | bc  |
        | --- | --- |
        | lm  | no  |
      `)
    })
  })

  describe("removeColsAt", () => {
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.removeColsAt({ col: 1, count: 1 })).toThrow(/not in range/)
    })
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.removeColsAt({ col: 0, count: 2 })).toThrow(/not in range/)
    })
    it("removes no cols when count is 0", () => {
      const table = tbl`
        | a   | bcd |
        | --- | :-- |
        | ef  | gh  |
      `

      table.removeColsAt({ col: 0, count: 0 })
      expect(table).toStrictEqual(table)
    })
    it("removes cols", () => {
      const table = tbl`
        | a   | bc | d   |
        | --- | :- | :-: |
        | efg | hi | jk  |
        | l   | m  | no  |
      `

      table.removeColsAt({ col: 0, count: 2 })

      expect(table).toStrictEqual(tbl`
        | d   |
        | :-: |
        | jk  |
        | no  |
      `)
    })
  })

  describe("removeRowsOrColsAt", () => {
    it("throws when index is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.removeRowsOrColsAt("row", { index: 1, count: 1 })).toThrow(/not in range/)
      expect(() => table.removeRowsOrColsAt("col", { index: 1, count: 1 })).toThrow(/not in range/)
    })
    it("throws when count is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.removeRowsOrColsAt("row", { index: 0, count: 2 })).toThrow(/not in range/)
      expect(() => table.removeRowsOrColsAt("col", { index: 0, count: 2 })).toThrow(/not in range/)
    })
    it("removes rows or cols", () => {
      const table = tbl`
        | a   | bc | d    |
        | --- | :- | :--: |
        | efg | hi | jklm |
        | n   | o  | p    |
      `

      table.removeRowsOrColsAt("row", { index: 1, count: 2 })
      table.removeRowsOrColsAt("col", { index: 0, count: 2 })

      expect(table).toStrictEqual(tbl`
        | d   |
        | :-: |
      `)
    })
  })

  describe("merge", () => {
    it("throws when row is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `
      const mergedTable = tbl`
        | b |
        | - |
      `

      expect(() => table.merge(mergedTable, { row: 1, col: 0 })).toThrow(/not in range/)
    })
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `
      const mergedTable = tbl`
        | b |
        | - |
      `

      expect(() => table.merge(mergedTable, { row: 0, col: 1 })).toThrow(/not in range/)
    })
    it("merges table and alignments", () => {
      const table = tbl`
        | a   | bc | d    |
        | --- | :- | :--: |
        | efg | hi | jklm |
        | n   | o  | p    |
      `

      table.merge(
        tbl`
        | x | yz    |
        | - | :---- |
        | 1 | 34567 |
      `,
        { row: 0, col: 1 },
      )

      expect(table).toStrictEqual(tbl`
        | a   | x | yz    |
        | --- | - | :---- |
        | efg | 1 | 34567 |
        | n   | o | p     |
      `)
    })
    it("merges table without alignments", () => {
      const table = tbl`
        | a   | bc | d    |
        | --- | :- | :--: |
        | efg | hi | jklm |
        | n   | o  | p    |
      `

      table.merge(
        tbl`
        | x  | yz    |
        | :- | :---- |
        | 1  | 23456 |
      `,
        { row: 2, col: 2 },
      )

      expect(table).toStrictEqual(tbl`
        | a   | bc | d    |       |
        | --- | :- | :--: | ----- |
        | efg | hi | jklm |       |
        | n   | o  | x    | yz    |
        |     |    | 1    | 23456 |
      `)
    })
    it("replaces entire table when merged table overlaps it entirely", () => {
      const table = tbl`
        | x  | yz    |
        | :- | :---- |
        | 1  | 23456 |
      `

      table.merge(
        tbl`
        | a | bc    | d    |
        | - | :---- | :--: |
        | x | yz    | jklm |
        | 1 | 23456 | p    |
      `,
        { row: 0, col: 0 },
      )

      expect(table).toStrictEqual(tbl`
        | a | bc    | d    |
        | - | :---- | :--: |
        | x | yz    | jklm |
        | 1 | 23456 | p    |
      `)
    })
  })

  describe("tile", () => {
    it("throws when row repeat is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.tile({ rowRepeat: -1, colRepeat: 0 })).toThrow(/negative/)
    })
    it("throws when col repeat is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.tile({ rowRepeat: 0, colRepeat: -1 })).toThrow(/negative/)
    })
    it("does nothing when repeated 0 times", () => {
      const table = tbl`
        | a   | bc |
        | --- | :- |
        | def | gh |
      `

      table.tile({ rowRepeat: 0, colRepeat: 0 })

      expect(table).toStrictEqual(table)
    })
    it("tiles rows", () => {
      const table = tbl`
        | a   | bc |
        | --- | :- |
        | def | gh |
      `

      table.tile({ rowRepeat: 3, colRepeat: 0 })

      expect(table).toStrictEqual(tbl`
        | a   | bc |
        | --- | :- |
        | def | gh |
        | a   | bc |
        | def | gh |
        | a   | bc |
        | def | gh |
        | a   | bc |
        | def | gh |
      `)
    })
    it("tiles cols", () => {
      const table = tbl`
        | a   | bc |
        | --- | :- |
        | def | gh |
      `

      table.tile({ rowRepeat: 0, colRepeat: 4 })

      expect(table).toStrictEqual(tbl`
        | a   | bc | a   | bc | a   | bc | a   | bc | a   | bc |
        | --- | :- | --- | :- | --- | :- | --- | :- | --- | :- |
        | def | gh | def | gh | def | gh | def | gh | def | gh |
      `)
    })
    it("tiles rows and cols", () => {
      const table = tbl`
        | a   | bc |
        | --- | :- |
        | def | gh |
      `

      table.tile({ rowRepeat: 1, colRepeat: 3 })

      expect(table).toStrictEqual(tbl`
        | a   | bc | a   | bc | a   | bc | a   | bc |
        | --- | :- | --- | :- | --- | :- | --- | :- |
        | def | gh | def | gh | def | gh | def | gh |
        | a   | bc | a   | bc | a   | bc | a   | bc |
        | def | gh | def | gh | def | gh | def | gh |
      `)
    })
  })

  describe("sortByColAt", () => {
    it("throws when col is invalid", () => {
      const table = tbl`
        | a |
        | - |
      `

      expect(() => table.sortByColAt(1, () => 0)).toThrow(/not in range/)
    })
    it("does nothing when single row", () => {
      const table = tbl`
        | c  | xy  |
        | -- | :-- |
      `

      table.sortByColAt(0, (first, second) =>
        Strings.lexicographicalCompare(first.toString(), second.toString()),
      )

      expect(table).toStrictEqual(table)
    })
    it("does nothing when already sorted", () => {
      const table = tbl`
        | c  | xy  |
        | -- | :-- |
        |    |     |
        | 1  | ab  |
        | z  | 2   |
      `

      table.sortByColAt(0, (first, second) =>
        Strings.lexicographicalCompare(first.toString(), second.toString()),
      )

      expect(table).toStrictEqual(table)
    })
    it("sorts by col", () => {
      const table = tbl`
        | c  | xy  |
        | -- | :-- |
        | 1  | ab  |
        | z  | 2   |
        |    |     |
      `

      table.sortByColAt(0, (first, second) =>
        Strings.lexicographicalCompare(first.toString(), second.toString()),
      )

      expect(table).toStrictEqual(tbl`
        | c  | xy  |
        | -- | :-- |
        |    |     |
        | 1  | ab  |
        | z  | 2   |
      `)
    })
  })

  describe("reset", () => {
    it("throws if not a table", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `
      const newText = txt`
         | a | b |
         | - |
      `
      expect(() => table.reset(newText)).toThrow(/not a table/)
    })
    it("throws if more than one table", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `
      const newText = txt`
         | a |
         | - |

         | b |
         | - |
      `
      expect(() => table.reset(newText)).toThrow(/not a table/)
    })
    it("reassigns properties", () => {
      const table = tbl`
        | a  | bcde |
        | -- | ---- |
        | fg | hij  |
      `
      const newText = txt`
        | abcd | e     |
        | :--- | :---: |
        | f    | ghijk |
      `

      table.reset(newText)

      expect(table.text).toStrictEqual(newText)
      expect(table.colSizes).toStrictEqual([6, 7])
      expect(table.alignments).toStrictEqual(["left", "center"])
      expect(table.contentSizes).toStrictEqual([
        [4, 1],
        [1, 5],
      ])
      expect(table.cells).toStrictEqual([
        [txt`abcd`, txt`e`],
        [txt`f`, txt`ghijk`],
      ])
    })
  })
})
