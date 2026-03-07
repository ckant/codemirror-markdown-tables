import { type StateCommand } from "@codemirror/state"

import * as Validate from "#ext/stdlib/validate"

import * as InsertEmptyTableCommand from "#codemirror/command/insertEmptyTableCommand"

/**
 * Creates a {@link StateCommand} that smartly inserts a new markdown table.
 *
 * Defaults to a `2x2` table.
 *
 * The command inserts an empty markdown table at the cursor or replaces the current selection.
 * It adds line breaks around table when necessary to prevent overlap with surrounding text.
 *
 * @param config - The optional configuration for the command.
 *
 * `config.size` - The optional size of the inserted table. Defaults to `2x2`.
 *
 * @example Add a keyboard shortcut that inserts a `2x2` markdown table.
 * ```typescript
 * import { EditorView, keymap } from "@codemirror/view"
 *
 * import { insertEmptyMarkdownTable } from "codemirror-markdown-tables"
 *
 * // Create key binding that inserts a 2x2 table
 * const insertTableKeyBinding = {
 *   key: "Alt-Mod-t",
 *   run: insertEmptyMarkdownTable(),
 * }
 *
 * // Wrap the key binding inside a keymap and add the extension to CodeMirror
 * new EditorView({
 *   extensions: keymap.of([insertTableKeyBinding]),
 * })
 * ```
 *
 * @example Create a command that inserts a `5x5` markdown table.
 * ```typescript
 * import { insertEmptyMarkdownTable } from "codemirror-markdown-tables"
 *
 * const insertLargeTable = insertEmptyMarkdownTable({ size: { rows: 5, cols: 5 } })
 * ```
 *
 * @throws Error if `size` is specified and `size.rows` and `size.cols` aren't positive integers.
 */
export function insertEmptyMarkdownTable(config?: {
  readonly size?: { readonly rows: number; readonly cols: number }
}): StateCommand {
  Validate.optional(config?.size, ({ rows, cols }) => {
    Validate.positiveIntegers(rows, cols, "size.{rows, cols} must be positive integers")
  })

  return InsertEmptyTableCommand.of(config)
}
