import { type SyncCompletionSource } from "@codemirror/autocomplete"

import * as TableCompletion from "#codemirror/completion/tableCompletion"

const defaultOptions = [
  { rows: 2, cols: 2 },
  { rows: 3, cols: 3 },
  { rows: 4, cols: 4 },
] as const

/**
 * Provides table autocompletion {@link options} after a `|` is typed on an empty line,
 * adding line breaks around table if necessary.
 *
 * Defaults to 2x2, 3x3, and 4x4 options.
 */
export function of(config?: {
  options?: readonly { readonly rows: number; readonly cols: number }[]
}): SyncCompletionSource {
  const options = config?.options ?? defaultOptions

  return ({ state, pos }) => {
    const line = state.doc.lineAt(pos)

    // Require cursor to be at the end of line containing only a pipe
    // eslint-disable-next-line unicorn/no-null -- CompletionSource uses null
    if (pos !== line.from + 1 || line.length !== 1) return null
    const char = line.text.slice(0, 1)

    // eslint-disable-next-line unicorn/no-null -- CompletionSource uses null
    if (char !== "|") return null

    const { doc, lineBreak } = state
    return {
      from: pos,
      options: options.map(({ rows, cols }) =>
        TableCompletion.of({ pos, doc, lineBreak, rows, cols }),
      ),
    }
  }
}
