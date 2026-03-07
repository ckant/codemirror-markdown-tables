import type { Text } from "@codemirror/state"

import * as Assert from "#ext/stdlib/assert"
import { def } from "#ext/stdlib/existence"
import type { Span } from "#ext/stdlib/span"

/**
 * Computes the {@link doc} changes needed to insert a table over the given {@link span}
 * using the given {@link lineBreak} for new lines.
 *
 * Assumes that the table text itself has no preceding or following line breaks.
 * e.g. `| a |\n| - |\n| b |`
 *
 * Computes the minimum amount of line breaks needed to avoid all current or future ambiguity
 * and to allow the cursor to be placed before and after the table.
 * Note that this is stricter than the GFM table spec, which only requires
 * line breaks in certain circumstances to avoid ambiguity.
 *
 * The rules are as follows:
 * - If the table is at the start of the text, there must be a line break before it.
 *   This allows cursor placement before the table (start of the text).
 * - If the table is at the end of the text, there must be a line break after it
 *   This allows cursor placement after the table (end of the text).
 * - If the table is somewhere in the middle of the text, there must be 2 line breaks before it
 *   and 2 after it. This allows cursor placement before and after the table.
 *
 * {@link span} must be a valid span within the {@link doc}.
 */
export function computeInsertion(props: {
  doc: Text
  span: Span
  lineBreak: string
}): TableInsertion {
  Assert.upToIntegerRange(
    { start: props.span.from, endExclusive: props.span.to },
    { within: { start: 0, endExclusive: props.doc.length } },
  )

  const before = computeBeforeInsertion(props)
  const after = computeAfterInsertion(props)

  const changes: { from: number; insert: string }[] = []
  if (def(before)) changes.push({ from: before.at, insert: before.insert })
  if (def(after)) changes.push({ from: after.at, insert: after.insert })

  return { before, after, changes }
}

function computeBeforeInsertion({
  doc,
  span: { from },
  lineBreak,
}: {
  doc: Text
  span: Span
  lineBreak: string
}): TableInsertion["before"] {
  let beforeLineBreaks: 0 | 1 | 2
  if (from === 0) {
    beforeLineBreaks = 1
  } else if (from === 1) {
    const oneCharBefore = doc.sliceString(from - 1, from)
    beforeLineBreaks = oneCharBefore === lineBreak ? 0 : 2
  } else {
    const oneCharBefore = doc.sliceString(from - 1, from)
    const twoCharsBefore = doc.sliceString(from - 2, from - 1)
    if (oneCharBefore === lineBreak) {
      beforeLineBreaks = twoCharsBefore === lineBreak ? 0 : 1
    } else {
      beforeLineBreaks = 2
    }
  }
  if (beforeLineBreaks === 0) return undefined

  const beforePos = from === 0 ? 0 : from - 1
  return { at: beforePos, insert: lineBreak.repeat(beforeLineBreaks), count: beforeLineBreaks }
}

function computeAfterInsertion({
  doc,
  span: { to },
  lineBreak,
}: {
  doc: Text
  span: Span
  lineBreak: string
}): TableInsertion["after"] {
  let afterLineBreaks: 0 | 1 | 2
  if (to === doc.length) {
    afterLineBreaks = 1
  } else if (to === doc.length - 1) {
    const oneCharAfter = doc.sliceString(to, to + 1)
    afterLineBreaks = oneCharAfter === lineBreak ? 0 : 2
  } else {
    const oneCharAfter = doc.sliceString(to, to + 1)
    const twoCharsAfter = doc.sliceString(to + 1, to + 2)
    if (oneCharAfter === lineBreak) {
      afterLineBreaks = twoCharsAfter === lineBreak ? 0 : 1
    } else {
      afterLineBreaks = 2
    }
  }
  if (afterLineBreaks === 0) return undefined

  const afterPos = to === doc.length ? doc.length : to + 1
  return { at: afterPos, insert: lineBreak.repeat(afterLineBreaks), count: afterLineBreaks }
}

interface TableInsertion {
  before: { at: number; insert: string; count: number } | undefined
  after: { at: number; insert: string; count: number } | undefined
  changes: { from: number; insert: string }[]
}
