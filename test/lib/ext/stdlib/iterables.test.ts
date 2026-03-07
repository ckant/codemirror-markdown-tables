import { describe, expect, it } from "vitest"

import * as Iterables from "#ext/stdlib/iterables"

describe("range", () => {
  it("throws when start is not an integer", () => {
    expect(() => Iterables.range({ start: 1.5, endExclusive: 4 })).toThrow(/integer/)
  })
  it("throws when endExclusive is not an integer", () => {
    expect(() => Iterables.range({ start: 1, endExclusive: 4.5 })).toThrow(/integer/)
  })
  it("iterates normal range", () => {
    expect([...Iterables.range({ start: 1, endExclusive: 4 })]).toStrictEqual([1, 2, 3])
  })
  it("iterates reverse range", () => {
    expect([...Iterables.range({ start: 3, endExclusive: 0 })]).toStrictEqual([3, 2, 1])
  })
})
