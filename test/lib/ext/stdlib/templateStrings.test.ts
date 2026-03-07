import { describe, expect, it } from "vitest"

import { trimIndent } from "#ext/stdlib/templateStrings"

describe("trimIndent", () => {
  it("trims indent from single-line string", () => {
    const trimmed = trimIndent`        eightSpaces`

    expect(trimmed).toBe("eightSpaces")
  })
  it("trims indent from multi-line string", () => {
    const trimmed = trimIndent`
        eightSpaces
       sevenSpaces
      sixSpaces
      sixSpaces
       sevenSpaces
        eightSpaces
    `

    expect(trimmed).toBe(
      "  eightSpaces\n sevenSpaces\nsixSpaces\nsixSpaces\n sevenSpaces\n  eightSpaces",
    )
  })
})
