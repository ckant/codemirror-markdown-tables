import { describe, expect, it } from "vitest"

import * as CellLocations from "#core/models/cellLocations"

describe("equals", () => {
  it("returns false when different row", () => {
    expect(CellLocations.equals({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(false)
  })
  it("returns false when different col", () => {
    expect(CellLocations.equals({ row: 0, col: 1 }, { row: 0, col: 0 })).toBe(false)
  })
  it("returns true when equal", () => {
    expect(CellLocations.equals({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(true)
  })
})

describe("shiftUp", () => {
  it("subtracts one from row", () => {
    expect(CellLocations.shiftUp({ row: 1, col: 1 })).toStrictEqual({ row: 0, col: 1 })
  })
})
describe("shiftRight", () => {
  it("adds one to col", () => {
    expect(CellLocations.shiftRight({ row: 1, col: 1 })).toStrictEqual({ row: 1, col: 2 })
  })
})
describe("shiftDown", () => {
  it("adds one to row", () => {
    expect(CellLocations.shiftDown({ row: 1, col: 1 })).toStrictEqual({ row: 2, col: 1 })
  })
})
describe("shiftLeft", () => {
  it("subtracts one from col", () => {
    expect(CellLocations.shiftLeft({ row: 1, col: 1 })).toStrictEqual({ row: 1, col: 0 })
  })
})
describe("shift", () => {
  it("shifts row backward", () => {
    expect(CellLocations.shift("row", { row: 1, col: 1 }, "backward")).toStrictEqual({
      row: 0,
      col: 1,
    })
  })
  it("shifts row forward", () => {
    expect(CellLocations.shift("row", { row: 1, col: 1 }, "forward")).toStrictEqual({
      row: 2,
      col: 1,
    })
  })
  it("shifts col backward", () => {
    expect(CellLocations.shift("col", { row: 1, col: 1 }, "backward")).toStrictEqual({
      row: 1,
      col: 0,
    })
  })
  it("shifts row forward", () => {
    expect(CellLocations.shift("col", { row: 1, col: 1 }, "forward")).toStrictEqual({
      row: 1,
      col: 2,
    })
  })
})

describe("shiftRowOrColByAddition", () => {
  it("throws when start is not an integer", () => {
    expect(() =>
      CellLocations.shiftRowOrColByAddition("row", { row: 1, col: 1 }, { start: 0.5, count: 1 }),
    ).toThrow(/not an integer/)
  })
  it("throws when count is negative", () => {
    expect(() =>
      CellLocations.shiftRowOrColByAddition("row", { row: 1, col: 1 }, { start: 0, count: -1 }),
    ).toThrow(/negative/)
  })
  it("shifts row or col forward when after addition", () => {
    expect(
      CellLocations.shiftRowOrColByAddition("row", { row: 1, col: 1 }, { start: 1, count: 5 }),
    ).toStrictEqual({ row: 6, col: 1 })
    expect(
      CellLocations.shiftRowOrColByAddition("col", { row: 1, col: 1 }, { start: 1, count: 5 }),
    ).toStrictEqual({ row: 1, col: 6 })
  })
  it("does not shift row or col forward when before addition", () => {
    expect(
      CellLocations.shiftRowOrColByAddition("row", { row: 1, col: 1 }, { start: 2, count: 5 }),
    ).toStrictEqual({ row: 1, col: 1 })
    expect(
      CellLocations.shiftRowOrColByAddition("col", { row: 1, col: 1 }, { start: 2, count: 5 }),
    ).toStrictEqual({ row: 1, col: 1 })
  })
})

describe("shiftOrClampRowOrColBySubtraction", () => {
  it("throws when start is not an integer", () => {
    expect(() =>
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "row",
        { row: 1, col: 1 },
        { start: 0.5, count: 1 },
      ),
    ).toThrow(/not an integer/)
  })
  it("throws when count is negative", () => {
    expect(() =>
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "row",
        { row: 1, col: 1 },
        { start: 0, count: -1 },
      ),
    ).toThrow(/negative/)
  })
  it("throws when boundary is invalid", () => {
    expect(() =>
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "row",
        { row: 1, col: 1 },
        { start: 0, count: 0, boundary: { min: 1, max: 0 } },
      ),
    ).toThrow(/0 is less than 1/)
  })
  it("does not shift row or col backward when after subtraction", () => {
    expect(
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "row",
        { row: 1, col: 1 },
        { start: 7, count: 5 },
      ),
    ).toStrictEqual({ row: 1, col: 1 })
    expect(
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "col",
        { row: 1, col: 1 },
        { start: 7, count: 5 },
      ),
    ).toStrictEqual({ row: 1, col: 1 })
  })
  it("shifts row or col backward when before subtraction", () => {
    expect(
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "row",
        { row: 7, col: 7 },
        { start: 7, count: 5 },
      ),
    ).toStrictEqual({ row: 2, col: 7 })
    expect(
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "col",
        { row: 7, col: 7 },
        { start: 7, count: 5 },
      ),
    ).toStrictEqual({ row: 7, col: 2 })
  })
  it("clamps row or col to boundary when part of subtraction", () => {
    expect(
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "row",
        { row: 7, col: 7 },
        { start: 8, count: 5, boundary: { min: 0, max: 5 } },
      ),
    ).toStrictEqual({ row: 5, col: 7 })
    expect(
      CellLocations.shiftOrClampRowOrColBySubtraction(
        "col",
        { row: 7, col: 7 },
        { start: 8, count: 5, boundary: { min: 0, max: 5 } },
      ),
    ).toStrictEqual({ row: 7, col: 5 })
  })
})
