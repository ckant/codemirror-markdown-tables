import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import * as Functions from "#ext/stdlib/functions"

describe("each", () => {
  it("returns a function that calls all functions sequentially", () => {
    const output: number[] = []

    Functions.each(
      () => output.push(1),
      () => output.push(2),
      () => output.push(3),
    )()

    expect(output).toStrictEqual([1, 2, 3])
  })
})

describe("falseUntil", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("returns a function that returns true after delay", async () => {
    const delayMillis = 1000 * 60 * 60 * 24
    const fn = Functions.falseUntil({ delayMillis })

    expect(fn()).toBe(false)
    await vi.advanceTimersByTimeAsync(delayMillis - 1)
    expect(fn()).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(fn()).toBe(true)
    await vi.advanceTimersByTimeAsync(delayMillis)
    expect(fn()).toBe(true)
  })
})
