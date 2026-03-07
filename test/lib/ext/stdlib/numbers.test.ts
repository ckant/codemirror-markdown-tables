import { describe, expect, it } from "vitest"

import * as Numbers from "#ext/stdlib/numbers"

describe("clamp", () => {
  it("throws when min is greater than max", () => {
    expect(() => Numbers.clamp(4, { min: 5, max: 3 })).toThrow(/less than/)
  })
  it("returns number when already within range", () => {
    expect(Numbers.clamp(4, { min: 3, max: 5 })).toBe(4)
  })
  it("returns number when already min", () => {
    expect(Numbers.clamp(4, { min: 3 })).toBe(4)
  })
  it("returns number when already max", () => {
    expect(Numbers.clamp(4, { max: 5 })).toBe(4)
  })
  it("clamps to min only", () => {
    expect(Numbers.clamp(2, { min: 3 })).toBe(3)
  })
  it("clamps to min", () => {
    expect(Numbers.clamp(2, { min: 3, max: 5 })).toBe(3)
  })
  it("clamps to max only", () => {
    expect(Numbers.clamp(6, { max: 5 })).toBe(5)
  })
  it("clamps to max", () => {
    expect(Numbers.clamp(6, { min: 3, max: 5 })).toBe(5)
  })
})
