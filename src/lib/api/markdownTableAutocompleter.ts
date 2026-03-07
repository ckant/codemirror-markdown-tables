import { type CompletionSource } from "@codemirror/autocomplete"

import * as Validate from "#ext/stdlib/validate"

import * as TableAutocompleter from "#codemirror/completion/tableAutocompleter"

/**
 * Creates a {@link CompletionSource} that shows an autocomplete menu for creating tables.
 *
 * Defaults to showing options for a `2x2`, `3x3`, and `4x4` table.
 *
 * The autocompleter pops up a menu after typing `|` on an empty line.
 * It displays the given list of table size options, with the first option preselected.
 *
 * @param config - The optional configuration for the autocompleter.
 *
 * `config.options` - The optional list of completions shown in the autocomplete popup.
 * Defaults to `[2x2, 3x3, 4x4]`.
 *
 * @example Add an extension that autocompletes a table after typing `|`.
 * ```typescript
 * import { autocompletion } from "@codemirror/autocomplete"
 * import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
 * import { EditorView } from "@codemirror/view"
 *
 * import { markdownTableAutocompleter } from "codemirror-markdown-tables"
 *
 * // Create markdown language with GitHub-flavored markdown support
 * const markdownLanguageSupport = markdown({ base: markdownLanguage })
 *
 * // Create markdown tables autocomplete extension (merges with other markdown autocomplete extensions)
 * const markdownTableAutocompletion = markdownLanguageSupport.language.data.of({
 *   autocomplete: markdownTableAutocompleter(),
 * })
 *
 * // Add all extensions to CodeMirror
 * new EditorView({
 *   extensions: [autocompletion(), markdownLanguageSupport, markdownTableAutocompletion],
 * })
 * ```
 *
 * @example Create an autocompleter that shows options for `3x3` and `2x2` with `3x3` preselected.
 * ```typescript
 * import { markdownTableAutocompleter } from "codemirror-markdown-tables"
 *
 * const customAutocompleter = markdownTableAutocompleter({
 *   options: [{ rows: 3, cols: 3 }, { rows: 2, cols: 2 }]
 * })
 * ```
 *
 * @throws Error if `config.options` are specified and `rows` and `cols` aren't positive integers.
 */
export function markdownTableAutocompleter(config?: {
  readonly options?: readonly { readonly rows: number; readonly cols: number }[]
}): CompletionSource {
  Validate.optionalEach(config?.options, ({ rows, cols }) => {
    Validate.positiveIntegers(rows, cols, "options[].{ rows, cols } must be positive integers")
  })

  return TableAutocompleter.of(config)
}
