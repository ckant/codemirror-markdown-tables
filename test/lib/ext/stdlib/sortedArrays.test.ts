import { describe, expect, it } from "vitest"

import * as SortedArrays from "#ext/stdlib/sortedArrays"

describe("lastIndexLessThanOrEqualTo", () => {
  it("returns -1 when empty", () => {
    expect(SortedArrays.lastIndexLessThanOrEqualTo([], 0)).toBe(-1)
  })
  it("returns -1 when all are greater", () => {
    expect(SortedArrays.lastIndexLessThanOrEqualTo([2, 5, 7, 10], 0)).toBe(-1)
  })
  it("returns first index when first is last less that or equal to", () => {
    expect(SortedArrays.lastIndexLessThanOrEqualTo([2, 5, 7, 10], 4.5)).toBe(0)
  })
  it("returns index when even array length", () => {
    expect(SortedArrays.lastIndexLessThanOrEqualTo([2, 5, 7, 10], 6)).toBe(1)
  })
  it("returns index when odd array length", () => {
    expect(SortedArrays.lastIndexLessThanOrEqualTo([2, 5, 7], 6)).toBe(1)
  })
  it("returns last index when last all are less that or equal to", () => {
    expect(SortedArrays.lastIndexLessThanOrEqualTo([2, 5, 7, 10], 10.5)).toBe(3)
  })
})
