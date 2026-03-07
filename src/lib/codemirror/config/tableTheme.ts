import { nil } from "#ext/stdlib/existence"
import * as Objects from "#ext/stdlib/objects"
import type { Defined } from "#ext/stdlib/utilityTypes"

export const tableThemePropNames = [
  "--tbl-theme-row-background",
  "--tbl-theme-header-row-background",
  "--tbl-theme-even-row-background",
  "--tbl-theme-odd-row-background",

  "--tbl-theme-border-color",
  "--tbl-theme-border-hover-color",
  "--tbl-theme-border-active-color",

  "--tbl-theme-outline-color",

  "--tbl-theme-text-color",

  "--tbl-theme-menu-border-color",
  "--tbl-theme-menu-background",
  "--tbl-theme-menu-hover-background",
  "--tbl-theme-menu-text-color",
  "--tbl-theme-menu-hover-text-color",

  "--tbl-theme-select-all-focus-overlay",
  "--tbl-theme-select-all-blur-overlay",
] as const satisfies (keyof TableThemeProps)[]

/**
 * Properties that define the CSS color scheme.
 *
 * Theme properties correspond directly to CSS variables of the same name defined in `:root` scope.
 * Create custom styles in code or override style properties in CSS.
 *
 * @example In code
 * ```typescript
 * import { TableTheme } from "codemirror-markdown-tables"
 *
 * const customDarkTheme = TableTheme.dark.with({
 *   "--tbl-theme-header-row-background": "gray",
 *   "--tbl-theme-outline-color": "green",
 * })
 * ```
 *
 * @example in CSS
 * ```css
 * :root {
 *   --tbl-theme-header-row-background: gray;
 *   --tbl-theme-outline-color: green;
 * }
 * ```
 */
export interface TableThemeProps {
  /* eslint-disable @typescript-eslint/naming-convention -- Matches CSS variable names */
  /**
   * Background color of all cells, unless overriden by
   * other `*-row-background` properties (CSS `color`).
   * @example "#ffffff"
   */
  "--tbl-theme-row-background"?: string | undefined

  /**
   * Background color of the cells in the header row.
   * @example "#ffffff"
   */
  "--tbl-theme-header-row-background"?: string | undefined

  /**
   * Background color of the cells in even rows.
   * @example "#ffffff"
   */
  "--tbl-theme-even-row-background"?: string | undefined

  /**
   * Background color of the cells in odd rows.
   * @example "#ffffff"
   */
  "--tbl-theme-odd-row-background"?: string | undefined

  /**
   * Color of borders.
   * @example "#ffffff"
   */
  "--tbl-theme-border-color"?: string | undefined

  /**
   * Color of hovered border.
   * @example "#ffffff"
   */
  "--tbl-theme-border-hover-color"?: string | undefined

  /**
   * Color of clicked border.
   * @example "#ffffff"
   */
  "--tbl-theme-border-active-color"?: string | undefined

  /**
   * Color of the outline around selected cells.
   * @example "#ffffff"
   */
  "--tbl-theme-outline-color"?: string | undefined

  /**
   * Color of text.
   * @example "#ffffff"
   */
  "--tbl-theme-text-color"?: string | undefined

  /**
   * Color of menu borders.
   * @example "#ffffff"
   */
  "--tbl-theme-menu-border-color"?: string | undefined

  /**
   * Background color of menu items.
   * @example "#ffffff"
   */
  "--tbl-theme-menu-background"?: string | undefined

  /**
   * Background color of a hovered menu item.
   * @example "#ffffff"
   */
  "--tbl-theme-menu-hover-background"?: string | undefined

  /**
   * Color of menu item text.
   * @example "#ffffff"
   */
  "--tbl-theme-menu-text-color"?: string | undefined

  /**
   * Color of hovered menu item text.
   * @example "#ffffff"
   */
  "--tbl-theme-menu-hover-text-color"?: string | undefined

  /**
   * Color of the layer overlaid on table when a <kbd>Select All</kbd> takes place and the editor
   * has focus.
   *
   * The overlay shows as an alpha layer _above the table_ whereas CodeMirror places its default
   * selection background _behind editor text_.
   * So specify an alpha overlay color that, when mixed with the table background color,
   * mimics the opaque CodeMirror selection background color.
   *
   * @example
   * ```typescript
   * // Alpha equivalent of CodeMirror's default focus selection background color on a white bg
   * "rgb(20 2 167 / 17%)"
   * ```
   */
  "--tbl-theme-select-all-focus-overlay"?: string | undefined

  /**
   * Color of the layer overlaid on table when a <kbd>Select All</kbd> takes place and the editor
   * _doesn't_ have focus.
   *
   * The overlay shows as an alpha layer _above the table_ whereas CodeMirror places its default
   * selection background _behind editor text_.
   * So specify an alpha overlay color that, when mixed with the table background color,
   * mimics the opaque CodeMirror selection background color.
   *
   * @example
   * ```typescript
   * // Alpha equivalent of CodeMirror's default blur selection background color on a white bg
   * "rgb(2 2 2 / 15%)"
   * ```
   */
  "--tbl-theme-select-all-blur-overlay"?: string | undefined
  /* eslint-enable @typescript-eslint/naming-convention -- Matches CSS variable names */
}

/**
 * Properties that define the CSS color scheme.
 *
 * Theme properties correspond directly to CSS variables of the same name defined in `:root` scope.
 * Create custom styles in code or override style properties in CSS.
 *
 * @example In code
 * ```typescript
 * import { TableTheme } from "codemirror-markdown-tables"
 *
 * const customDarkTheme = TableTheme.dark.with({
 *   "--tbl-theme-header-row-background": "gray",
 *   "--tbl-theme-outline-color": "green",
 * })
 * ```
 *
 * @example in CSS
 * ```css
 * :root {
 *   --tbl-theme-header-row-background: gray;
 *   --tbl-theme-outline-color: green;
 * }
 * ```
 */
export class TableTheme {
  /**
   * Basic light theme that works well with the CodeMirror default theme.
   */
  static readonly light: TableTheme = TableTheme.of({
    "--tbl-theme-row-background": "#ffffff",
    "--tbl-theme-header-row-background": "var(--tbl-theme-row-background)",
    "--tbl-theme-even-row-background": "var(--tbl-theme-row-background)",
    "--tbl-theme-odd-row-background": "var(--tbl-theme-row-background)",

    "--tbl-theme-border-color": "#dcdcdc",
    "--tbl-theme-border-hover-color":
      "color-mix(in srgb, var(--tbl-theme-border-color), #000000 10%)",
    "--tbl-theme-border-active-color":
      "color-mix(in srgb, var(--tbl-theme-border-color), #000000 20%)",

    "--tbl-theme-outline-color": "#2483e2",

    "--tbl-theme-text-color": "inherit",

    "--tbl-theme-menu-border-color": "var(--tbl-theme-border-color)",
    "--tbl-theme-menu-background": "var(--tbl-theme-header-row-background)",
    "--tbl-theme-menu-hover-background": "var(--tbl-theme-outline-color)",
    "--tbl-theme-menu-text-color": "#000000",
    "--tbl-theme-menu-hover-text-color": "#ffffff",

    "--tbl-theme-select-all-focus-overlay": "rgb(20 2 167 / 17%)",
    "--tbl-theme-select-all-blur-overlay": "rgb(2 2 2 / 15%)",
  })

  /**
   * Basic dark theme.
   */
  static readonly dark: TableTheme = TableTheme.of({
    "--tbl-theme-row-background": "#1d2024",
    "--tbl-theme-header-row-background": "var(--tbl-theme-row-background)",
    "--tbl-theme-even-row-background": "var(--tbl-theme-row-background)",
    "--tbl-theme-odd-row-background": "var(--tbl-theme-row-background)",

    "--tbl-theme-border-color": "#464646",
    "--tbl-theme-border-hover-color": `color-mix(in srgb, var(--tbl-theme-border-color), #708499 25%)`,
    "--tbl-theme-border-active-color": `color-mix(in srgb, var(--tbl-theme-border-color), #708499 65%)`,

    "--tbl-theme-outline-color": "#2483e2",

    "--tbl-theme-text-color": "inherit",

    "--tbl-theme-menu-border-color": "var(--tbl-theme-border-color)",
    "--tbl-theme-menu-background": `color-mix(in srgb, var(--tbl-theme-header-row-background), #ffffff 5%)`,
    "--tbl-theme-menu-hover-background": "var(--tbl-theme-outline-color)",
    "--tbl-theme-menu-text-color": `color-mix(in srgb, var(--tbl-theme-header-row-background), #ffffff 90%)`,
    "--tbl-theme-menu-hover-text-color": "var(--tbl-theme-menu-text-color)",

    "--tbl-theme-select-all-focus-overlay": "rgb(252 246 239 / 35%)",
    "--tbl-theme-select-all-blur-overlay": "rgb(246 232 214 / 18%)",
  })

  // noinspection JSUnusedGlobalSymbols -- Exported by package
  /**
   * Theme based on table colors in GitHub's light theme.
   */
  static readonly githubLight: TableTheme = TableTheme.light.with({
    "--tbl-theme-header-row-background": "#ffffff",
    "--tbl-theme-even-row-background": "#ffffff",
    "--tbl-theme-odd-row-background": "#f6f8fa",

    "--tbl-theme-border-color": "#d1d9e0",

    "--tbl-theme-menu-text-color":
      "color-mix(in srgb, var(--tbl-theme-header-row-background), #000000 90%)",
  })

  // noinspection JSUnusedGlobalSymbols -- Exported by package
  /**
   * Theme based on table colors in GitHub's dark theme.
   */
  static readonly githubDark: TableTheme = TableTheme.dark.with({
    "--tbl-theme-header-row-background": "#0d1117",
    "--tbl-theme-even-row-background": "#0d1117",
    "--tbl-theme-odd-row-background": "#151b23",

    "--tbl-theme-border-color": "#3d444d",

    "--tbl-theme-select-all-focus-overlay": "rgb(254 248 238 / 39%)",
    "--tbl-theme-select-all-blur-overlay": "rgb(252 239 219 / 23%)",
  })

  // noinspection JSUnusedGlobalSymbols -- Exported by package
  /**
   * Theme based on table colors in GitHub's soft dark theme.
   */
  static readonly githubSoftDark: TableTheme = TableTheme.dark.with({
    "--tbl-theme-header-row-background": "#212830",
    "--tbl-theme-even-row-background": "#212830",
    "--tbl-theme-odd-row-background": "#262c36",

    "--tbl-theme-border-color": "#3d444d",

    "--tbl-theme-select-all-focus-overlay": "rgb(251 237 222 / 34%)",
    "--tbl-theme-select-all-blur-overlay": "rgb(252 215 173 / 16%)",
  })

  /**
   * Dark theme that works well with
   * [`@codemirror/theme-one-dark`](https://github.com/codemirror/theme-one-dark).
   */
  static readonly oneDark: TableTheme = TableTheme.dark.with({
    "--tbl-theme-row-background": "#282c34",

    "--tbl-theme-border-color": "#3b4048",

    "--tbl-theme-outline-color": "#568af2",

    "--tbl-theme-menu-background": "#21252b",
    "--tbl-theme-menu-hover-background": "#2c313a",
    "--tbl-theme-menu-text-color": "#abb2bf",

    "--tbl-theme-select-all-focus-overlay": "rgb(187 204 245 / 15%)",
    "--tbl-theme-select-all-blur-overlay": "rgb(187 204 245 / 15%)",
  })

  /**
   * Properties that define the CSS color scheme.
   */
  readonly props: Defined<TableThemeProps>

  /**
   * Returns a copy of this {@link TableTheme} with the given {@link props} applied.
   *
   * @param props - The optional property changes to apply to the copy.
   * If specified, props override properties in the original {@link TableTheme}.
   * Properties that are set to `undefined` or omitted use the original values.
   *
   * @example
   * ```typescript
   * const customDarkTheme = TableTheme.dark.with({
   *   "--tbl-theme-header-row-background": "gray",
   *   "--tbl-theme-outline-color": "green",
   * })
   * ```
   */
  with(props?: TableThemeProps): TableTheme {
    if (nil(props)) return TableTheme.of({ ...this.props })

    return TableTheme.of({
      ...this.props,
      ...Objects.compact(Objects.pick(props, tableThemePropNames)),
    })
  }

  private static of(props: Defined<TableThemeProps>): TableTheme {
    return new TableTheme(props)
  }

  private constructor(props: Defined<TableThemeProps>) {
    this.props = props
  }
}
