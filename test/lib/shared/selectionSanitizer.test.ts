import { Text } from "@codemirror/state"
import { describe, expect, it } from "vitest"

import * as Texts from "#ext/codemirror/state/texts"

import * as Selections from "#core/models/selections"
import * as SelectionSanitizer from "#core/selectionSanitizer"

describe("sanitize", () => {
  it("sanitizes selection with trimmed whitespace", () => {
    const unsanitizedText = Text.of(
      " <br> \n <br> \n  foo\npipe here =>|  \n <br> \n   ".split("\n"),
    )
    const unsanitizedSelection = { anchor: 16, head: 33 }
    const sanitizedSelection = { anchor: 0, head: 21 }

    expect(
      SelectionSanitizer.sanitize(unsanitizedSelection, unsanitizedText, { trim: true }),
    ).toStrictEqual(sanitizedSelection)
    expect(
      SelectionSanitizer.sanitize(Selections.flip(unsanitizedSelection), unsanitizedText, {
        trim: true,
      }),
    ).toStrictEqual(Selections.flip(sanitizedSelection))
  })
  it("sanitizes selection with trimmed leading whitespace around selection", () => {
    const unsanitizedText = Text.of("    abc".split("\n"))
    const unsanitizedSelection = { anchor: 1, head: 3 }
    const sanitizedSelection = { anchor: 0, head: 0 }

    expect(
      SelectionSanitizer.sanitize(unsanitizedSelection, unsanitizedText, { trim: true }),
    ).toStrictEqual(sanitizedSelection)
    expect(
      SelectionSanitizer.sanitize(Selections.flip(unsanitizedSelection), unsanitizedText, {
        trim: true,
      }),
    ).toStrictEqual(Selections.flip(sanitizedSelection))
  })
  it("sanitizes selection with trimmed trailing whitespace around selection", () => {
    const unsanitizedText = Text.of("abc    ".split("\n"))
    const unsanitizedSelection = { anchor: 4, head: 6 }
    const sanitizedSelection = { anchor: 3, head: 3 }

    expect(
      SelectionSanitizer.sanitize(unsanitizedSelection, unsanitizedText, { trim: true }),
    ).toStrictEqual(sanitizedSelection)
    expect(
      SelectionSanitizer.sanitize(Selections.flip(unsanitizedSelection), unsanitizedText, {
        trim: true,
      }),
    ).toStrictEqual(Selections.flip(sanitizedSelection))
  })
  it("sanitizes selection", () => {
    const unsanitizedText = Text.of(
      " <br> \n <br> \n  foo\npipe here =>|  \n <br> \n   ".split("\n"),
    )
    const unsanitizedSelection = { anchor: 16, head: 33 }
    const sanitizedSelection = { anchor: 22, head: 43 }

    expect(
      SelectionSanitizer.sanitize(unsanitizedSelection, unsanitizedText, { trim: false }),
    ).toStrictEqual(sanitizedSelection)
    expect(
      SelectionSanitizer.sanitize(Selections.flip(unsanitizedSelection), unsanitizedText, {
        trim: false,
      }),
    ).toStrictEqual(Selections.flip(sanitizedSelection))
  })
})

describe("unsanitize", () => {
  it("unsanitizes selection", () => {
    const sanitizedText = Texts.ofString("foo<br>pipe here =>\\|")
    const sanitizedSelection = { anchor: 0, head: 21 }
    const unsanitizedSelection = { anchor: 0, head: 17 }

    expect(SelectionSanitizer.unsanitize(sanitizedSelection, sanitizedText)).toStrictEqual(
      unsanitizedSelection,
    )
    expect(
      SelectionSanitizer.unsanitize(Selections.flip(sanitizedSelection), sanitizedText),
    ).toStrictEqual(Selections.flip(unsanitizedSelection))
  })
})
