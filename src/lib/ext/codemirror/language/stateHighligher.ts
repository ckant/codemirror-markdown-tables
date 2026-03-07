import { highlightingFor } from "@codemirror/language"
import type { EditorState } from "@codemirror/state"
import type { Highlighter, Tag } from "@lezer/highlight"

import { def } from "#ext/stdlib/existence"

export class StateHighlighter implements Highlighter {
  private readonly state: EditorState
  private readonly extraTags: readonly Tag[] | undefined

  style(tags: readonly Tag[]): string | null {
    return highlightingFor(this.state, def(this.extraTags) ? [...tags, ...this.extraTags] : tags)
  }

  static of(state: EditorState, extraTags?: readonly Tag[]): StateHighlighter {
    return new StateHighlighter(state, extraTags)
  }

  private constructor(state: EditorState, extraTags?: readonly Tag[]) {
    this.state = state
    this.extraTags = extraTags
  }
}
