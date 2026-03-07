import { Text } from "@codemirror/state"
import { describe, expect, it } from "vitest"

import * as Texts from "#ext/codemirror/state/texts"

import * as TextSanitizer from "#core/textSanitizer"

describe("sanitize", () => {
  it("sanitizes text and trims whitespace", () => {
    const unsanitizedText = Text.of(
      " <br> \n <br> \n  foo\npipe here =>|  \n <br> \n   ".split("\n"),
    )
    const sanitizedText = Texts.ofString("foo<br>pipe here =>\\|")

    expect(TextSanitizer.sanitize(unsanitizedText, { trim: true })).toStrictEqual(sanitizedText)
  })
  it("sanitizes text", () => {
    const unsanitizedText = Text.of(
      " <br> \n <br> \n  foo\npipe here =>|  \n <br> \n   ".split("\n"),
    )
    const sanitizedText = Texts.ofString(
      " <br> <br> <br> <br>  foo<br>pipe here =>\\|  <br> <br> <br>   ",
    )

    expect(TextSanitizer.sanitize(unsanitizedText, { trim: false })).toStrictEqual(sanitizedText)
  })
})

describe("unsanitize", () => {
  it("unsanitizes text", () => {
    const sanitizedText = Texts.ofString("foo<br>pipe here =>\\|")
    const unsanitizedText = Text.of("foo\npipe here =>|".split("\n"))

    expect(TextSanitizer.unsanitize(sanitizedText)).toStrictEqual(unsanitizedText)
  })
})
