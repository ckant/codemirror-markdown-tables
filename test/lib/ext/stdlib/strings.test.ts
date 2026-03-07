import { describe, expect, it } from "vitest"

import * as Strings from "#ext/stdlib/strings"

describe("nilIfEmpty", () => {
  it("returns nil when empty", () => {
    expect(Strings.nilIfEmpty("")).toBeUndefined()
  })
  it("returns string when not empty", () => {
    expect(Strings.nilIfEmpty(" ")).toBe(" ")
  })
})
