import { describe, expect, it } from "vitest"

import * as Ranges from "#ext/stdlib/ranges"

describe("includes", () => {
  it("returns true when value at start of upTo range", () => {
    expect(Ranges.includes(0, { start: 0, endExclusive: 5 })).toBe(true)
  })
  it("returns true when value at end of upTo range", () => {
    expect(Ranges.includes(4, { start: 0, endExclusive: 5 })).toBe(true)
  })
  it("returns false when value before upTo range", () => {
    expect(Ranges.includes(0, { start: 1, endExclusive: 5 })).toBe(false)
  })
  it("returns false when value after upTo range", () => {
    expect(Ranges.includes(5, { start: 1, endExclusive: 5 })).toBe(false)
  })
  it("returns true when value at start of downTo range", () => {
    expect(Ranges.includes(0, { start: 0, endExclusive: -5 })).toBe(true)
  })
  it("returns true when value at end of downTo range", () => {
    expect(Ranges.includes(-4, { start: 0, endExclusive: -5 })).toBe(true)
  })
  it("returns false when value before downTo range", () => {
    expect(Ranges.includes(1, { start: 0, endExclusive: -5 })).toBe(false)
  })
  it("returns false when value after downTo range", () => {
    expect(Ranges.includes(-5, { start: 0, endExclusive: -5 })).toBe(false)
  })
})
describe("isEmpty", () => {
  it("returns true when empty", () => {
    expect(Ranges.isEmpty({ start: 0, endExclusive: 0 })).toBe(true)
  })
  it("returns false when not empty", () => {
    expect(Ranges.isEmpty({ start: 0, endExclusive: 1 })).toBe(false)
  })
})
describe("isEqual", () => {
  it("returns false when unequal start", () => {
    expect(Ranges.equals({ start: 0, endExclusive: 2 }, { start: 1, endExclusive: 2 })).toBe(false)
  })
  it("returns false when unequal end", () => {
    expect(Ranges.equals({ start: 0, endExclusive: 2 }, { start: 0, endExclusive: 1 })).toBe(false)
  })
  it("returns false when first nil", () => {
    expect(Ranges.equals(undefined, { start: 0, endExclusive: 1 })).toBe(false)
  })
  it("returns false when second nil", () => {
    expect(Ranges.equals({ start: 0, endExclusive: 2 }, undefined)).toBe(false)
  })
  it("returns true when both nil", () => {
    expect(Ranges.equals(undefined, undefined)).toBe(true)
  })
  it("returns true when equal", () => {
    expect(Ranges.equals({ start: 0, endExclusive: 2 }, { start: 0, endExclusive: 2 })).toBe(true)
  })
})
