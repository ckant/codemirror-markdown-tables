import { Text } from "@codemirror/state"

import * as Texts from "#ext/codemirror/state/texts"

/**
 * Pattern for a pipe character that is not escaped.
 * An even number of backslashes followed by a pipe.
 */
const unescapedPipePattern = new RegExp(/(?<!\\)(\\\\)*\|/g)

/**
 * Patterns for whitespace at the start of the text.
 * Any amount of space characters or `<br>` elements at the start
 * surrounded by 2 optional selection marks.
 */
const startingWhitespacePatterns = [
  new RegExp(/^(\s|<br>)+/g),
  // eslint-disable-next-line no-control-regex -- Uses null control characters as markers
  new RegExp(/(?<=^\u0000)(\s|<br>)+/g),
  // eslint-disable-next-line no-control-regex -- Uses null control characters as markers
  new RegExp(/(?<=^\u0000\u0000)(\s|<br>)+/g),
]

/**
 * Patterns for whitespace at the end of the text.
 * Any amount of space characters or `<br>` elements at the end
 * surrounded by 2 optional selection marks.
 */
const endingWhitespacePatterns = [
  new RegExp(/(\s|<br>)+$/g),
  // eslint-disable-next-line no-control-regex -- Uses null control characters as markers
  new RegExp(/(\s|<br>)+(?=\u0000$)/g),
  // eslint-disable-next-line no-control-regex -- Uses null control characters as markers
  new RegExp(/(\s|<br>)+(?=\u0000\u0000$)/g),
]
/**
 * Pattern for newline characters on all platforms.
 * CRLF (windows), LF (mac/*nix), CR (classic mac).
 */
const lineBreakPattern = new RegExp(/\r\n|\n|\r/g)

/**
 * Converts table editor cell {@link displayText} to Markdown cell text.
 * If {@link trim} is true, trims all starting and ending whitespace beforehand.
 *
 * 1. If {@link trim} is true, trims all leading and trailing whitespace (including `<br>`s).
 * 2. Replaces line breaks with `<br>`s.
 * 3. Escapes unescaped pipe characters.
 *
 * e.g.
 * Given the following text:
 * ` <br> \n <br> \n  foo\npipe here =>|  \n <br> \n   `
 * With {@link trim} true, sanitization results in:
 * `foo<br>pipe here =>\|`
 * And with {@link trim} false, sanitization results in:
 * ` <br> <br> <br> <br>  foo<br>pipe here =>\|  <br> <br> <br>   `
 */
export function sanitize(displayText: Text, options: { trim: boolean }): Text {
  return Texts.ofString(sanitizeString(displayText.toString(), options))
}

/**
 * Converts Markdown cell {@link actualText} to table editor cell text.
 *
 * 1. Replaces `<br>`s with line breaks.
 * 2. Unescapes escaped pipe characters.
 *
 * e.g.
 * Given the following text:
 * `foo<br>pipe here =>\|`
 * Unsanitization results in:
 * `foo\npipe here =>|`
 */
export function unsanitize(actualText: Text): Text {
  return Text.of(unsanitizeString(actualText.toString()).split("\n"))
}

function sanitizeString(displayString: string, { trim }: { trim: boolean }): string {
  return (trim ? trimWhitespace(displayString) : displayString)
    .replaceAll(lineBreakPattern, "<br>")
    .replaceAll(unescapedPipePattern, "\\$&")
}

function unsanitizeString(actualString: string): string {
  return actualString.replaceAll("<br>", "\n").replaceAll("\\|", "|")
}

function trimWhitespace(text: string): string {
  let trimmedText = text
  for (const startingWhitespacePattern of startingWhitespacePatterns) {
    trimmedText = trimmedText.replaceAll(startingWhitespacePattern, "")
  }
  for (const endingWhitespacePattern of endingWhitespacePatterns) {
    trimmedText = trimmedText.replaceAll(endingWhitespacePattern, "")
  }
  return trimmedText
}
