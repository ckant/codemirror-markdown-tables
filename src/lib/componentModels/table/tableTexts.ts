import { Text } from "@codemirror/state"

import * as Texts from "#ext/codemirror/state/texts"

import type { Alignment } from "#core/models/alignment"

const singlePadding = Texts.ofString(" ")
export const leftPadding = singlePadding
export const alignmentRightPadding = singlePadding

export function alignment(
  alignmentModel: Alignment,
  { hyphens = 0 }: { hyphens?: number } = {},
): Text {
  if (alignmentModel === "none") {
    return Texts.ofString("-").append(alignmentHyphens(hyphens))
  } else if (alignmentModel === "left") {
    return Texts.ofString(":-").append(alignmentHyphens(hyphens))
  } else if (alignmentModel === "center") {
    return Texts.ofString(":-").append(alignmentHyphens(hyphens)).append(Texts.ofString(":"))
  } else {
    return alignmentHyphens(hyphens).append(Texts.ofString("-:"))
  }
}

export function alignmentHyphens(count: number): Text {
  return Texts.ofString("-".repeat(count))
}

export function padding(count: number): Text {
  return Texts.ofString(" ".repeat(count))
}
