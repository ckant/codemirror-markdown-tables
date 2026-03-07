import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import * as Time from "#ext/stdlib/time"

describe("delay", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("resolves a promise after millis pass", async () => {
    let resolved = false
    const millis = 1000 * 60 * 60 * 24
    void Time.delay({ millis }).then(() => (resolved = true))

    expect(resolved).toBe(false)
    await vi.advanceTimersByTimeAsync(millis - 1)
    expect(resolved).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(resolved).toBe(true)
  })
})
