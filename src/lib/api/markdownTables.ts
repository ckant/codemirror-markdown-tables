import type { LanguageSupport } from "@codemirror/language"
import type { Extension } from "@codemirror/state"
import { type KeyBinding } from "@codemirror/view"
import type { MarkdownExtension } from "@lezer/markdown"

import * as TableConfigs from "#codemirror/config/tableConfigs"
import type { TableStyle } from "#codemirror/config/tableStyle"
import type { TableTheme } from "#codemirror/config/tableTheme"
import * as TableExtensions from "#codemirror/tableExtensions"

export type { Defined } from "#ext/stdlib/utilityTypes"
export { TableTheme, type TableThemeProps } from "#codemirror/config/tableTheme"
export { TableStyle, type TableStyleProps } from "#codemirror/config/tableStyle"

/**
 * The optional configuration for the {@link markdownTables} extension.
 *
 * If specified, properties in this config override properties in the default configuration.
 * Properties that are set to `undefined` or omitted take the default values.
 */
export interface MarkdownTablesConfig {
  /**
   * Color scheme for the table.
   *
   * When set to a `light` and `dark` theme, the theme adjusts based on the
   * **CodeMirror light and dark mode configuration** (_not_ CSS `prefers-color-scheme`).
   *
   * When set to a _single_ theme, the theme applies in both modes
   * (i.e. `theme: SomeTheme` is equivalent to `theme: { light: SomeTheme, dark: SomeTheme }`).
   *
   * Defaults to `{ light: TableTheme.light, dark: TableTheme.dark }`.
   */
  readonly theme?:
    | TableTheme
    | { readonly light: TableTheme; readonly dark: TableTheme }
    | undefined

  /**
   * Fonts and other styles for the table.
   *
   * Defaults to `TableStyle.default`.
   */
  readonly style?: TableStyle | undefined

  /**
   * Text cursor and selection implementation for the table cell editor.
   *
   * When set to `"codemirror"`, the editor uses CodeMirror's implementation.
   * Essentially, the CodeMirror editor _embedded inside cells_ enables the
   * [`drawSelection`](https://codemirror.net/docs/ref/#view.drawSelection) extension along with
   * some CSS that hides the browser's native cursor and selection.
   *
   * When set to `native`, the editor uses the browser's implementation.
   *
   * Specify `native` only if [`drawSelection`](https://codemirror.net/docs/ref/#view.drawSelection) isn't enabled
   * in the _root_ CodeMirror editor (it's enabled by default with `basicSetup` and `minimalSetup`).
   *
   * Defaults to `"codemirror"`.
   */
  readonly selectionType?: "codemirror" | "native" | undefined

  /**
   * Position of the row and column header grips.
   *
   * When set to `"outside"`, handles appear beyond the top/left edge of the table.
   * This requires a sufficient left margin to keep the table edge aligned with the _root_ CodeMirror editor edge,
   * but it's much easier to click and drag the handles, especially on mobile.
   *
   * When set to `"inside"`, handles appear on the top/left table border itself.
   * This requires no extra left margin, but it's difficult to click and drag the handles, especially on mobile.
   *
   * Defaults to `"outside"`
   */
  readonly handlePosition?: "outside" | "inside" | undefined

  /**
   * Wrapping mode of the table.
   *
   * When set to `"wrap"`, wraps long table cell text.
   * Essentially, the CodeMirror editor _embedded inside cells_ enables the
   * [`lineWrapping`](https://codemirror.net/docs/ref/#view.EditorView^lineWrapping) extension
   * along with the CSS `"word-break": "normal", "overflow-wrap": "break-word"`.
   *
   * When set to `"nowrap"`, the editor does _not_ wrap long table cell text.
   * The editor sets the CSS to `white-space: "pre"`.
   *
   * Defaults to `"wrap"`.
   */
  readonly lineWrapping?: "wrap" | "nowrap" | undefined

  /**
   * Extensions for the table cell editor.
   *
   * The CodeMirror editor _embedded inside cells_ (not the _root_ CodeMirror editor) enables the given extensions.
   *
   * The table cell editor doesn't automatically inherit _root_ CodeMirror editor extensions.
   * Instead, specify basic editor extensions like
   * [`highlightWhitespace`](https://codemirror.net/docs/ref/#view.highlightWhitespace)
   * here to enable them inside cells.
   *
   * Keyboard shortcuts specified here execute actions on the CodeMirror editor _embedded inside cells_,
   * rather than the _root_ CodeMirror editor.
   * They operate on the text _inside the cell_ in isolation, rather than the text of the document _as a whole_.
   *
   * Specify KeyBindings from [`defaultKeymap`](https://codemirror.net/docs/ref/#commands.defaultKeymap) or similar here
   * to enable basic shortcuts inside the cell editor.
   * [`defaultKeymap`](https://codemirror.net/docs/ref/#commands.defaultKeymap) defines shortcuts like
   * <kbd>Ctrl+A</kbd>/<kbd>Ctrl+A</kbd> which should select all the _cell_ text rather than all the _document_ text.
   *
   * Conversely, specify KeyBindings from [`historyKeymap`](https://codemirror.net/docs/ref/#commands.historyKeymap)
   * and [`searchKeymap`](https://codemirror.net/docs/ref/#search.searchKeymap) in {@link globalKeyBindings} instead,
   * since these keyboard shortcuts operate on the _root_ CodeMirror editor and the document _as a whole_.
   *
   * Defaults to `[]`.
   */
  readonly extensions?: readonly Extension[] | undefined

  /**
   * Markdown language configuration for the table cell editor.
   *
   * The CodeMirror _editor embedded inside cells_ calls the
   * [`markdown()` function in `@codemirror/lang-markdown`](https://github.com/codemirror/lang-markdown?tab=readme-ov-file#user-content-markdown)
   * with the specified options.
   *
   * The table cell editor doesn't automatically inherit the _root_ CodeMirror markdown language configuration.
   *
   * [See `@codemirror/lang-markdown` for descriptions](https://github.com/codemirror/lang-markdown?tab=readme-ov-file#user-content-markdown^config).
   *
   * Defaults to `{}`.
   */
  readonly markdownConfig?: {
    /**
     * [See `@codemirror/lang-markdown`](https://github.com/codemirror/lang-markdown?tab=readme-ov-file#user-content-markdown^config.extensions).
     */
    extensions?: MarkdownExtension

    /**
     * [See `@codemirror/lang-markdown`](https://github.com/codemirror/lang-markdown?tab=readme-ov-file#user-content-markdown^config.completehtmltags).
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- MarkdownConfig naming
    completeHTMLTags?: boolean

    /**
     * [See `@codemirror/lang-markdown`](https://github.com/codemirror/lang-markdown?tab=readme-ov-file#user-content-markdown^config.pasteurlaslink).
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention -- MarkdownConfig naming
    pasteURLAsLink?: boolean

    /**
     * [See `@codemirror/lang-markdown`](https://github.com/codemirror/lang-markdown?tab=readme-ov-file#user-content-markdown^config.htmltaglanguage).
     */
    htmlTagLanguage?: LanguageSupport
  }

  /**
   * Keyboard shortcuts for the table cell editor that delegate to the _root_ CodeMirror editor.
   *
   * Keyboard shortcuts specified here execute actions on the _root_ CodeMirror editor,
   * rather than the CodeMirror editor _embedded inside cells_.
   * They operate on the text of the document _as a whole_, rather than the text _inside the cell_ in isolation.
   *
   * Specify KeyBindings from [`historyKeymap`](https://codemirror.net/docs/ref/#commands.historyKeymap)
   * or similar here to enable history shortcuts while inside the cell editor.
   * [`historyKeymap`](https://codemirror.net/docs/ref/#commands.historyKeymap) defines keyboard shortcuts like
   * <kbd>Ctrl+Z</kbd>/<kbd>Cmd+Z</kbd> which should undo across the _document_ text rather than just the _cell_ text.
   * Another example is [`searchKeymap`](https://codemirror.net/docs/ref/#search.searchKeymap) which defines
   * keyboard shortcuts that should search across the entire _document_ text rather than just the _cell_ text.
   *
   * Conversely, specify KeyBindings from [`defaultKeymap`](https://codemirror.net/docs/ref/#commands.defaultKeymap)
   * in {@link extensions} instead, since these keyboard shortcuts operate on the CodeMirror editor
   * _embedded inside cells_ and the text _inside the cell_ in isolation.
   *
   * Defaults to `[]`.
   */
  readonly globalKeyBindings?: readonly KeyBinding[] | undefined
}

/**
 * Creates an {@link Extension} that turns markdown tables into interactive components.
 *
 * Defaults to the following configuration:
 * ```typescript
 * {
 *   theme: { light: TableTheme.light, dark: TableTheme.dark },
 *   style: TableStyle.default,
 *   selectionType: "codemirror",
 *   handlePosition: "outside",
 *   lineWrapping: "wrap",
 *   markdownConfig: {
 *     extensions: undefined,       // Results in CM MarkdownConfig default: []
 *     completeHTMLTags: undefined, // Results in CM MarkdownConfig default: true
 *     pasteURLAsLink: undefined,   // Results in CM MarkdownConfig default: true
 *     htmlTagLanguage: undefined,  // Results in CM MarkdownConfig default: default html language
 *   },
 *   extensions: [],
 *   globalKeyBindings: [],
 * }
 * ```
 *
 * @param config - The optional configuration for the extension.
 * If specified, properties in this config override properties in the default configuration.
 * Properties that are set to `undefined` or omitted use the default values.
 *
 * @example Register the extension with defaults.
 * ```typescript
 * import { EditorView } from "@codemirror/view"
 *
 * import { markdownTables } from "codemirror-markdown-tables"
 *
 * // Add markdown tables extension to CodeMirror
 * new EditorView({
 *   extensions: [markdownTables()],
 * })
 * ```
 *
 * @example Create a custom extension.
 * ```typescript
 * import { defaultKeymap, historyKeymap } from "@codemirror/commands"
 * import { searchKeymap } from "@codemirror/search"
 * import { highlightSpecialChars, keymap } from "@codemirror/view"
 * import { Autolink, Emoji, Strikethrough, Subscript, Superscript } from "@lezer/markdown"
 *
 * import { markdownTables, TableStyle, TableTheme } from "codemirror-markdown-tables"
 *
 * const customMarkdownTables = markdownTables({
 *   theme: {
 *     light: TableTheme.light,
 *     dark: TableTheme.dark.with({
 *       "--tbl-theme-row-background": "#000",
 *       "--tbl-theme-text-color": "#ccc",
 *       "--tbl-theme-menu-background": "#000",
 *       "--tbl-theme-menu-text-color": "#ccc",
 *     }),
 *   },
 *   style: TableStyle.default.with({
 *     "--tbl-style-font-size": "16px",
 *     "--tbl-style-menu-font-size": "14px",
 *     "--tbl-style-default-header-alignment": "center",
 *   }),
 *   markdownConfig: {
 *     extensions: [Strikethrough, Autolink, Subscript, Superscript, Emoji],
 *   },
 *   extensions: [highlightSpecialChars(), keymap.of(defaultKeymap)],
 *   globalKeyBindings: [...historyKeymap, ...searchKeymap],
 * })
 * ```
 */
export function markdownTables(config?: MarkdownTablesConfig): Extension {
  return TableExtensions.of(TableConfigs.of(config))
}
