import { describe, expect, it } from "vitest"

import * as Assert from "#ext/stdlib/assert"

describe("integer", () => {
  it("throws when number is not an integer", () => {
    expect(() => Assert.integer(2.5)).toThrow(/^2\.5 is not an integer$/)
  })
  it("doesn't throw when number is an integer", () => {
    expect(() => Assert.integer(2)).not.toThrow()
  })
})

describe("nonnegativeInteger", () => {
  it("throws when number is not an integer", () => {
    expect(() => Assert.nonnegativeInteger(2.5)).toThrow(/^2\.5 is not an integer$/)
  })
  it("throws when number is negative", () => {
    expect(() => Assert.nonnegativeInteger(-1)).toThrow(/^-1 is negative$/)
  })
  it("doesn't throw when number is 0", () => {
    expect(() => Assert.nonnegativeInteger(0)).not.toThrow()
  })
  it("doesn't throw when number is a positive integer", () => {
    expect(() => Assert.nonnegativeInteger(1)).not.toThrow()
  })
})

describe("positiveInteger", () => {
  it("throws when number is not an integer", () => {
    expect(() => Assert.positiveInteger(2.5)).toThrow(/^2\.5 is not an integer$/)
  })
  it("throws when number is negative", () => {
    expect(() => Assert.positiveInteger(-1)).toThrow(/^-1 is not positive$/)
  })
  it("throws when number is 0", () => {
    expect(() => Assert.positiveInteger(0)).toThrow(/^0 is not positive$/)
  })
  it("doesn't throw when number is a positive integer", () => {
    expect(() => Assert.positiveInteger(1)).not.toThrow()
  })
})

describe("increasingOrEqual", () => {
  it("throws when decreasing", () => {
    expect(() => Assert.increasingOrEqual(3, 2.5)).toThrow(/^2\.5 is less than 3$/)
  })
  it("doesn't throw when equal", () => {
    expect(() => Assert.increasingOrEqual(1, 1)).not.toThrow()
  })
  it("doesn't throw when increasing", () => {
    expect(() => Assert.increasingOrEqual(1, 2)).not.toThrow()
  })
})

describe("integerInRange", () => {
  it("throws when not an integer", () => {
    expect(() => Assert.integerInRange(2.5, { start: 0, endExclusive: 4 })).toThrow(
      /^2\.5 is not an integer$/,
    )
  })
  it("throws when before upTo range", () => {
    expect(() => Assert.integerInRange(0, { start: 1, endExclusive: 4 })).toThrow(
      /^0 is not in range \[1,4\)$/,
    )
  })
  it("throws when after upTo range", () => {
    expect(() => Assert.integerInRange(4, { start: 1, endExclusive: 4 })).toThrow(
      /^4 is not in range \[1,4\)$/,
    )
  })
  it("throws when before downTo range", () => {
    expect(() => Assert.integerInRange(4, { start: 3, endExclusive: 0 })).toThrow(
      /^4 is not in range \[3,0\)$/,
    )
  })
  it("throws when after downTo range", () => {
    expect(() => Assert.integerInRange(0, { start: 3, endExclusive: 0 })).toThrow(
      /^0 is not in range \[3,0\)$/,
    )
  })
  it("throws when range is empty", () => {
    expect(() => Assert.integerInRange(0, { start: 0, endExclusive: 0 })).toThrow(
      /^0 is not in range \[0,0\)$/,
    )
  })
  it("doesn't throw when at start of upTo range", () => {
    expect(() => Assert.integerInRange(1, { start: 1, endExclusive: 4 })).not.toThrow()
  })
  it("doesn't throw when in upTo range", () => {
    expect(() => Assert.integerInRange(2, { start: 1, endExclusive: 4 })).not.toThrow()
  })
  it("doesn't throw when at end of upTo range", () => {
    expect(() => Assert.integerInRange(3, { start: 1, endExclusive: 4 })).not.toThrow()
  })
  it("doesn't throw when at start of downTo range", () => {
    expect(() => Assert.integerInRange(3, { start: 3, endExclusive: 0 })).not.toThrow()
  })
  it("doesn't throw when in downTo range", () => {
    expect(() => Assert.integerInRange(2, { start: 3, endExclusive: 0 })).not.toThrow()
  })
  it("doesn't throw when at end of downTo range", () => {
    expect(() => Assert.integerInRange(1, { start: 3, endExclusive: 0 })).not.toThrow()
  })
})

describe("def", () => {
  it("throws when undefined", () => {
    expect(() => Assert.def(undefined)).toThrow(/^value is nil$/)
  })
  it("throws when null", () => {
    // eslint-disable-next-line unicorn/no-null -- Testing null
    expect(() => Assert.def(null)).toThrow(/^value is nil$/)
  })
  it("doesn't throw when def", () => {
    expect(() => Assert.def("")).not.toThrow()
  })
})

describe("nonEmpty", () => {
  it("throws when empty", () => {
    expect(() => Assert.nonEmpty({ length: 0 })).toThrow(/^collection is empty$/)
  })
  it("doesn't throw when not empty", () => {
    expect(() => Assert.nonEmpty({ length: 1 })).not.toThrow()
  })
})

describe("length2d", () => {
  it("throws when unexpected lengths", () => {
    expect(() => Assert.length2d([{ length: 2 }, { length: 0 }], 2)).toThrow(
      /^length 0 is not equal to 2$/,
    )
  })
  it("doesn't throw when expected lengths", () => {
    expect(() => Assert.length2d([{ length: 1 }, { length: 1 }, { length: 1 }], 1)).not.toThrow()
  })
  it("doesn't throw empty", () => {
    expect(() => Assert.length2d([], 1)).not.toThrow()
  })
})

describe("upToIntegerRange", () => {
  it("throws when within is not an upTo range", () => {
    expect(() =>
      Assert.upToIntegerRange(
        { start: 0, endExclusive: 3 },
        { within: { start: 5, endExclusive: 2 } },
      ),
    ).toThrow(/^\[5,2\) is not an upTo range$/)
  })
  it("throws when start is not an integer", () => {
    expect(() => Assert.upToIntegerRange({ start: -2.5, endExclusive: 5 })).toThrow(
      /^-2\.5 is not an integer$/,
    )
  })
  it("throws when endExclusive is not an integer", () => {
    expect(() => Assert.upToIntegerRange({ start: -2, endExclusive: 5.5 })).toThrow(
      /^5\.5 is not an integer$/,
    )
  })
  it("throws when range is not an upTo range", () => {
    expect(() => Assert.upToIntegerRange({ start: 5, endExclusive: 2 })).toThrow(
      /^\[5,2\) is not an upTo range$/,
    )
  })
  it("throws when before within range", () => {
    expect(() =>
      Assert.upToIntegerRange(
        { start: 2, endExclusive: 4 },
        { within: { start: 3, endExclusive: 6 } },
      ),
    ).toThrow(/^2 is not in range \[3,6\)$/)
  })
  it("throws when after within range", () => {
    expect(() =>
      Assert.upToIntegerRange(
        { start: 2, endExclusive: 4 },
        { within: { start: 2, endExclusive: 3 } },
      ),
    ).toThrow(/^4 is not in range \[2,3\)$/)
  })
  it("doesn't throw when range is an upto integer range", () => {
    expect(() => Assert.upToIntegerRange({ start: -2, endExclusive: 5 })).not.toThrow()
  })
  it("doesn't throw when range is an upto integer range within bounds", () => {
    expect(() =>
      Assert.upToIntegerRange(
        { start: -2, endExclusive: 5 },
        { within: { start: -4, endExclusive: 6 } },
      ),
    ).not.toThrow()
  })
})
