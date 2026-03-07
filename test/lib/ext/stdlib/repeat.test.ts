import { describe, expect, it } from "vitest"

import * as Repeat from "#ext/stdlib/repeat"

describe("timesMap", () => {
  it("throws when n is not a nonnegative integer", () => {
    expect(() => Repeat.timesMap(-1, () => true)).toThrow(/negative/)
  })
  it("maps 0 times", () => {
    expect(Repeat.timesMap(0, () => true)).toStrictEqual([])
  })
  it("maps n times", () => {
    expect(Repeat.timesMap(3, (i) => i)).toStrictEqual([0, 1, 2])
  })
})
describe("times", () => {
  it("throws when n is not a nonnegative integer", () => {
    expect(() => Repeat.times(-1, () => true)).toThrow(/negative/)
  })
  it("runs 0 times", () => {
    const result: boolean[] = []
    Repeat.times(0, () => {
      result.push(true)
    })

    expect(result).toStrictEqual([])
  })
  it("runs n times", () => {
    const result: number[] = []
    Repeat.times(3, (i) => {
      result.push(i)
    })

    expect(result).toStrictEqual([0, 1, 2])
  })
})
describe("rangeMap", () => {
  it("maps 0 times for empty range", () => {
    expect(Repeat.rangeMap({ start: 0, endExclusive: 0 }, () => true)).toStrictEqual([])
  })
  it("maps n times", () => {
    expect(Repeat.rangeMap({ start: 1, endExclusive: 4 }, (i) => i)).toStrictEqual([1, 2, 3])
  })
})
describe("range", () => {
  it("runs 0 times for empty range", () => {
    const result: boolean[] = []
    Repeat.rangeMap({ start: 0, endExclusive: 0 }, () => {
      result.push(true)
    })

    expect(result).toStrictEqual([])
  })
  it("runs n times", () => {
    const result: number[] = []
    Repeat.rangeMap({ start: 1, endExclusive: 4 }, (i) => {
      result.push(i)
    })

    expect(result).toStrictEqual([1, 2, 3])
  })
})
