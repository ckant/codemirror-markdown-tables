import { Text } from "@codemirror/state"

import * as Repeat from "#ext/stdlib/repeat"
import type { Span } from "#ext/stdlib/span"

export const newline = Text.of(["", ""])

export function withTextAdded(
  originalText: Text,
  {
    text,
    at,
    prependNewline = false,
    appendNewline = false,
  }: { text: Text; at: number; prependNewline?: boolean; appendNewline?: boolean },
): Text {
  return withTextInsertedAt({
    needle: withNewline(text, { prependNewline, appendNewline }),
    haystack: originalText,
    at,
  })
}

export function withTextAppended(
  originalText: Text,
  {
    text,
    prependNewline = false,
    appendNewline = false,
  }: { text: Text; prependNewline?: boolean; appendNewline?: boolean },
): Text {
  return originalText.append(withNewline(text, { prependNewline, appendNewline }))
}

export function withTextRemoved(
  originalText: Text,
  {
    location,
    removeLeadingNewline = false,
    removeTrailingNewline = false,
  }: { location: Span; removeLeadingNewline?: boolean; removeTrailingNewline?: boolean },
): Text {
  const from = removeLeadingNewline ? location.from - 1 : location.from
  const to = removeTrailingNewline ? location.to + 1 : location.to

  if (from === to) return originalText
  return originalText.replace(from, to, Text.empty)
}

export function withTextReplaced(
  originalText: Text,
  {
    span: { from, to },
    text,
    prependNewline = false,
    appendNewline = false,
  }: { span: Span; text: Text; prependNewline?: boolean; appendNewline?: boolean },
): Text {
  return originalText.replace(from, to, withNewline(text, { prependNewline, appendNewline }))
}

export function ofString(value: string): Text {
  return Text.of([value])
}

export function isEmpty(text: Text): boolean {
  return text.eq(Text.empty)
}

export function forEachLine(text: Text, fn: (line: Text, lineNum: number) => void): void {
  const lines = text.lines
  if (lines === 1) {
    fn(text, 1)
    return
  }

  Repeat.times(lines, (i) => {
    const line = text.line(i + 1)
    fn(text.slice(line.from, line.to), i + 1)
  })
}

export function sliceSpan(text: Text, { from, to }: Span): Text {
  return text.slice(from, to)
}

export function repeat(text: Text, count: number): Text {
  if (count === 0) return Text.empty
  if (count === 1) return text

  let repeatedText = text
  Repeat.times(count - 1, () => {
    repeatedText = repeatedText.append(text)
  })

  return repeatedText
}

export function withTextInsertedAt({
  needle,
  haystack,
  at,
}: {
  needle: Text
  haystack: Text
  at: number
}): Text {
  return haystack.slice(0, at).append(needle).append(haystack.slice(at))
}

export function withNewline(
  text: Text,
  {
    prependNewline = false,
    appendNewline = false,
  }: { prependNewline?: boolean; appendNewline?: boolean },
): Text {
  let newlined = text
  if (prependNewline) newlined = newline.append(newlined)
  if (appendNewline) newlined = newlined.append(newline)
  return newlined
}
