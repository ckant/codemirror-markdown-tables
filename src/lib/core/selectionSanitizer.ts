import { Text } from "@codemirror/state"

import { type Selection } from "#core/models/selection"
import * as Selections from "#core/models/selections"
import * as TextSanitizer from "#core/textSanitizer"

/**
 * Placeholder character for tracking selection movement.
 * Null control character.
 */
const selectionMark = "\u0000"

/**
 * Converts table editor cell {@link displaySelection} to Markdown cell selection based on
 * the underlying table editor cell {@link displayText}.
 * If {@link trim} is true, assumes trimming of starting and ending whitespace beforehand.
 *
 * e.g.
 * Given the following text and selection from the "f" at 16 to the pipe character at 33:
 * ` <br> \n <br> \n  foo\npipe here =>|  \n <br> \n   `
 * With {@link trim} true, text sanitization results in:
 * `foo<br>pipe here =>\|`
 * So selection sanitization results in `{ anchor: 0, head: 21 }`.
 * And with {@link trim} false, text sanitization results in:
 * ` <br> <br> <br> <br>  foo<br>pipe here =>\|  <br> <br> <br>   `
 * And so selection sanitization results in `{ anchor: 22, head: 43 }`.
 */
export function sanitize(
  displaySelection: Selection,
  displayText: Text,
  { trim }: { trim: boolean },
): Selection {
  const forward = Selections.isForward(displaySelection)
  const { from: displayFrom, to: displayTo } = Selections.toSpan(displaySelection)

  const displayString = displayText.toString()
  const selectedText = Text.of(
    `${displayString.slice(0, displayFrom)}${selectionMark}${displayString.slice(displayFrom, displayTo)}${selectionMark}${displayString.slice(displayTo)}`.split(
      "\n",
    ),
  )
  const replacedString = TextSanitizer.sanitize(selectedText, { trim }).toString()
  const from = replacedString.indexOf(selectionMark)
  const to = replacedString.lastIndexOf(selectionMark) - 1
  return forward ? { anchor: from, head: to } : { head: from, anchor: to }
}

/**
 * Converts Markdown cell {@link actualSelection} to table editor cell selection based on
 * the underlying Markdown cell {@link actualText}.
 *
 * e.g.
 * Given the following text and selection from the "f" at 0 to the pipe character at 21:
 * `foo<br>pipe here =>\|`
 * Text unsanitization results in:
 * `foo\npipe here =>|`
 * So selection unsanitization results in `{ anchor: 0, head: 17 }`.
 */
export function unsanitize(actualSelection: Selection, actualText: Text): Selection {
  const forward = Selections.isForward(actualSelection)
  const { from: actualFrom, to: actualTo } = Selections.toSpan(actualSelection)

  const actualString = actualText.toString()
  const selectedText = Text.of(
    `${actualString.slice(0, actualFrom)}${selectionMark}${actualString.slice(actualFrom, actualTo)}${selectionMark}${actualString.slice(actualTo)}`.split(
      "\n",
    ),
  )
  const replacedString = TextSanitizer.unsanitize(selectedText).toString()
  const from = replacedString.indexOf(selectionMark)
  const to = replacedString.lastIndexOf(selectionMark) - 1
  return forward ? { anchor: from, head: to } : { head: from, anchor: to }
}
