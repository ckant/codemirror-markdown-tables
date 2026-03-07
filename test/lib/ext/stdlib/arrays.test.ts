import { describe, expect, it } from "vitest"

import * as Arrays from "#ext/stdlib/arrays"
import * as Numbers from "#ext/stdlib/numbers"

describe("first", () => {
  it("throws if empty", () => {
    expect(() => Arrays.first([])).toThrow(/empty/)
  })
  it("returns first element", () => {
    expect(Arrays.first(["foo", "bar"])).toBe("foo")
  })
})

describe("last", () => {
  it("throws if empty", () => {
    expect(() => Arrays.last([])).toThrow(/empty/)
  })
  it("returns last element", () => {
    expect(Arrays.last(["foo", "bar"])).toBe("bar")
  })
})

describe("onEach", () => {
  it("runs function on each element and returns array", () => {
    const array = ["foo", "bar"]
    const result: string[] = []
    const output = Arrays.onEach(array, (element) => result.push(`output_${element}`))

    expect(output).toBe(array)
    expect(result).toStrictEqual(["output_foo", "output_bar"])
  })
})

describe("map2d", () => {
  it("maps function to table", () => {
    expect(
      Arrays.map2d(
        [
          ["foo", "bar"],
          ["abc", "def"],
        ],
        (element) => `${element}_mapped`,
      ),
    ).toStrictEqual([
      ["foo_mapped", "bar_mapped"],
      ["abc_mapped", "def_mapped"],
    ])
  })
})

describe("clamp", () => {
  it("throws if min is not an nonnegative integer", () => {
    expect(() => Arrays.clamp(["foo", "bar"], { min: 1.5, max: 5, fillWith: "extra" })).toThrow(
      /integer/,
    )
  })
  it("throws if max is not an nonnegative integer", () => {
    expect(() => Arrays.clamp(["foo", "bar"], { min: 1, max: 4.5, fillWith: "extra" })).toThrow(
      /integer/,
    )
  })
  it("throws if min > max", () => {
    expect(() => Arrays.clamp(["foo", "bar"], { min: 4, max: 2, fillWith: "extra" })).toThrow(
      /less than/,
    )
  })
  it("returns array if already within range", () => {
    expect(Arrays.clamp(["foo", "bar"], { min: 1, max: 2, fillWith: "never" })).toStrictEqual([
      "foo",
      "bar",
    ])
  })
  it("clamps to min", () => {
    expect(Arrays.clamp(["foo", "bar"], { min: 4, max: 5, fillWith: "fill" })).toStrictEqual([
      "foo",
      "bar",
      "fill",
      "fill",
    ])
  })
  it("clamps to max", () => {
    expect(
      Arrays.clamp(["foo", "bar", "extra1", "extra2"], { min: 1, max: 2, fillWith: "fill" }),
    ).toStrictEqual(["foo", "bar"])
  })
})

describe("sum", () => {
  it("throws if range invalid", () => {
    expect(() => Arrays.sum([0, 0], { start: 0, endExclusive: 3 })).toThrow(/not in range/)
  })
  it("sums empty array", () => {
    expect(Arrays.sum([])).toBe(0)
  })
  it("sums default range", () => {
    expect(Arrays.sum([10, 25, -5, 4])).toBe(34)
  })
  it("sums range", () => {
    expect(Arrays.sum([10, 25, -5, 4], { start: 1, endExclusive: 3 })).toBe(20)
  })
  it("sums entire range", () => {
    expect(Arrays.sum([10, 25, -5, 4], { start: 0, endExclusive: 4 })).toBe(34)
  })
})

describe("sliceRange", () => {
  it("throws if range invalid", () => {
    expect(() => Arrays.sliceRange(["foo", "bar"], { start: 1, endExclusive: 0 })).toThrow(
      /upTo range/,
    )
  })
  it("slices default range", () => {
    const array = ["foo", "bar"]

    const sliced = Arrays.sliceRange(array)

    expect(sliced).toStrictEqual(["foo", "bar"])
    expect(sliced).not.toBe(array)
  })
  it("slices partial range", () => {
    expect(Arrays.sliceRange(["foo", "bar"], { start: 1, endExclusive: 2 })).toStrictEqual(["bar"])
  })
  it("slices empty range", () => {
    expect(Arrays.sliceRange(["foo", "bar"], { start: 0, endExclusive: 0 })).toStrictEqual([])
  })
})

describe("runningSum", () => {
  it("returns empty when empty", () => {
    expect(Arrays.runningSum([])).toStrictEqual([])
  })
  it("returns running sum", () => {
    expect(Arrays.runningSum([4, -5, 2.25, 18])).toStrictEqual([4, -1, 1.25, 19.25])
  })
})

describe("nilIfEmpty", () => {
  it("returns nil when empty", () => {
    expect(Arrays.nilIfEmpty([])).toBeNullable()
  })
  it("returns array when not empty", () => {
    const array = ["foo", "bar"]
    expect(Arrays.nilIfEmpty(array)).toBe(array)
  })
})

describe("minBy", () => {
  it("throws when empty", () => {
    expect(() => Arrays.minBy([], (first, second) => first - second)).toThrow(/empty/)
  })
  it("returns first when min", () => {
    expect(Arrays.minBy([-5, 2, -4], (first, second) => first - second)).toBe(-5)
  })
  it("returns min", () => {
    expect(Arrays.minBy([-5, -12, -7], (first, second) => first - second)).toBe(-12)
  })
  it("returns last when min", () => {
    expect(Arrays.minBy([-5, 2, -7], (first, second) => first - second)).toBe(-7)
  })
})

describe("repeat", () => {
  it("throws when count is invalid", () => {
    expect(() => Arrays.repeat("foo", { count: -5 })).toThrow(/negative/)
  })
  it("returns empty array when count is 0", () => {
    expect(Arrays.repeat("foo", { count: 0 })).toStrictEqual([])
  })
  it("returns element repeated", () => {
    expect(Arrays.repeat("foo", { count: 5 })).toStrictEqual(["foo", "foo", "foo", "foo", "foo"])
  })
})

describe("repeat2d", () => {
  it("throws when rows is invalid", () => {
    expect(() => Arrays.repeat2d("foo", { rows: 0, cols: 5 })).toThrow(/positive/)
  })
  it("throws when cols is invalid", () => {
    expect(() => Arrays.repeat2d("foo", { rows: 1, cols: 0 })).toThrow(/positive/)
  })
  it("returns element repeated", () => {
    expect(Arrays.repeat2d("foo", { rows: 2, cols: 4 })).toStrictEqual([
      ["foo", "foo", "foo", "foo"],
      ["foo", "foo", "foo", "foo"],
    ])
  })
})

describe("multiply", () => {
  it("throws when count is negative", () => {
    expect(() => Arrays.multiply(["foo"], -1)).toThrow(/negative/)
  })
  it("returns empty when multiplied by 0 ", () => {
    expect(Arrays.multiply(["foo", "bar"], 0)).toStrictEqual([])
  })
  it("returns copy when multiplied by 1 ", () => {
    const array = ["foo", "bar"]
    const multiplied = Arrays.multiply(array, 1)
    expect(multiplied).toStrictEqual(array)
    expect(multiplied).not.toBe(array)
  })
  it("returns multiplied array ", () => {
    expect(Arrays.multiply(["foo", "bar"], 4)).toStrictEqual([
      "foo",
      "bar",
      "foo",
      "bar",
      "foo",
      "bar",
      "foo",
      "bar",
    ])
  })
})

describe("compact", () => {
  it("filters arrays of nils to empty", () => {
    // eslint-disable-next-line unicorn/no-null -- Testing null
    expect(Arrays.compact([null, undefined, undefined, null])).toStrictEqual([])
  })
  it("filters nil elements", () => {
    // eslint-disable-next-line unicorn/no-null -- Testing null
    expect(Arrays.compact(["foo", null, "bar", undefined, null])).toStrictEqual(["foo", "bar"])
  })
})

describe("isEmpty", () => {
  it("returns true when empty", () => {
    expect(Arrays.isEmpty([])).toBe(true)
  })
  it("returns false when not empty", () => {
    expect(Arrays.isEmpty(["foo"])).toBe(false)
  })
})

describe("tailOrEmpty", () => {
  it("returns empty when empty", () => {
    expect(Arrays.tailOrEmpty([])).toStrictEqual([])
  })
  it("returns empty when one element", () => {
    expect(Arrays.tailOrEmpty(["foo"])).toStrictEqual([])
  })
  it("returns tail when more than one element", () => {
    expect(Arrays.tailOrEmpty(["foo", "bar", "2000"])).toStrictEqual(["bar", "2000"])
  })
})

describe("range", () => {
  it("returns empty range when empty", () => {
    expect(Arrays.range([])).toStrictEqual({ start: 0, endExclusive: 0 })
  })
  it("returns range of array", () => {
    expect(Arrays.range(["foo", "bar"])).toStrictEqual({ start: 0, endExclusive: 2 })
  })
})

describe("shiftElement", () => {
  it("throws when fromIndex out of range", () => {
    expect(() => Arrays.shiftElement(["foo"], { fromIndex: 1, toIndex: 0 })).toThrow(/range/)
  })
  it("throws when toIndex out of range", () => {
    expect(() => Arrays.shiftElement(["foo"], { fromIndex: 0, toIndex: 1 })).toThrow(/range/)
  })
  it("does nothing when fromIndex is the same as toIndex", () => {
    const array = ["foo", "bar", 2000]

    Arrays.shiftElement(array, { fromIndex: 1, toIndex: 1 })

    expect(array).toStrictEqual(["foo", "bar", 2000])
  })
  it("shifts element backwards", () => {
    const array = ["foo", "bar", 2000]

    Arrays.shiftElement(array, { fromIndex: 2, toIndex: 0 })

    expect(array).toStrictEqual([2000, "foo", "bar"])
  })
  it("shifts element forwards", () => {
    const array = ["foo", "bar", 2000]

    Arrays.shiftElement(array, { fromIndex: 0, toIndex: 2 })

    expect(array).toStrictEqual(["bar", 2000, "foo"])
  })
})

describe("equals", () => {
  it("returns true when both nil", () => {
    expect(Arrays.equals(undefined, undefined, () => false)).toBe(true)
  })
  it("returns false when one is nil", () => {
    expect(Arrays.equals(undefined, ["foo"], () => true)).toBe(false)
  })
  it("returns true when equal", () => {
    expect(
      Arrays.equals(
        [5, 2.25],
        [5.5, 2],
        (first, second) => Numbers.floor(first) === Numbers.floor(second),
      ),
    ).toBe(true)
  })
  it("returns false when unequal", () => {
    expect(Arrays.equals([1, 1], [1, 2], (first, second) => first === second)).toBe(false)
  })
})

describe("includesBy", () => {
  it("returns true when includes element", () => {
    expect(
      Arrays.includesBy(
        [1, 2],
        2.25,
        (first, second) => Numbers.floor(first) === Numbers.floor(second),
      ),
    ).toBe(true)
  })
  it("returns false when doesn't include element", () => {
    expect(
      Arrays.includesBy(
        [1, 2],
        3.25,
        (first, second) => Numbers.floor(first) === Numbers.floor(second),
      ),
    ).toBe(false)
  })
})
