import { nil } from "#ext/stdlib/existence"
import * as Objects from "#ext/stdlib/objects"
import type { Defined } from "#ext/stdlib/utilityTypes"

export const tableStylePropNames = [
  "--tbl-style-font-family",
  "--tbl-style-font-size",

  "--tbl-style-menu-font-family",
  "--tbl-style-menu-font-size",

  "--tbl-style-default-header-alignment",
] as const satisfies (keyof TableStyleProps)[]

/**
 * Properties that define font and other CSS styles.
 *
 * Style properties correspond directly to CSS variables of the same name defined in `:root` scope.
 * Create custom styles in code or override style properties in CSS.
 *
 * @example In code
 * ```typescript
 * import { TableStyle } from "codemirror-markdown-tables"
 *
 * const customStyle = TableStyle.default.with({
 *   "--tbl-style-font-family": '"Comic Sans", sans-serif',
 *   "--tbl-style-font-size": "16px",
 * })
 * ```
 *
 * @example In CSS
 * ```css
 * :root {
 *   --tbl-style-font-family: "Comic Sans, sans-serif";
 *   --tbl-style-font-size: 16px;
 * }
 * ```
 */
export interface TableStyleProps {
  /* eslint-disable @typescript-eslint/naming-convention -- Matches CSS variable names */
  /**
   * Font family of text (CSS `font-family`).
   * @example '"Comic Sans"'
   */
  "--tbl-style-font-family"?: string | undefined

  /**
   * Font size of text (CSS `font-size`).
   * @example "16px"
   */
  "--tbl-style-font-size"?: string | undefined

  /**
   * Font family of menu item text (CSS `font-family`).
   * @example '"Comic Sans"'
   */
  "--tbl-style-menu-font-family"?: string | undefined

  /**
   * Font size of menu item text (CSS `font-size`).
   * @example "16px"
   */
  "--tbl-style-menu-font-size"?: string | undefined

  /**
   * Alignment of text in header cell when its column is otherwise unaligned.
   * @example "left"
   */
  "--tbl-style-default-header-alignment"?: "left" | "center" | "right" | undefined
  /* eslint-enable @typescript-eslint/naming-convention -- Matches CSS variable names */
}

/**
 * Properties that define font and other CSS styles.
 *
 * Style properties correspond directly to CSS variables of the same name defined in `:root` scope.
 * Create custom styles in code or override style properties in CSS.
 *
 * @example In code
 * ```typescript
 * import { TableStyle } from "codemirror-markdown-tables"
 *
 * const customStyle = TableStyle.default.with({
 *   "--tbl-style-font-family": '"Comic Sans", sans-serif',
 *   "--tbl-style-font-size": "16px",
 * })
 * ```
 *
 * @example In CSS
 * ```css
 * :root {
 *   --tbl-style-font-family: "Comic Sans, sans-serif";
 *   --tbl-style-font-size: 16px;
 * }
 * ```
 */
export class TableStyle {
  /**
   * Basic style with sensible defaults.
   */
  static readonly default: TableStyle = TableStyle.of({
    "--tbl-style-font-family": "system-ui",
    "--tbl-style-font-size": "inherit",

    "--tbl-style-menu-font-family": "system-ui",
    "--tbl-style-menu-font-size": "inherit",

    "--tbl-style-default-header-alignment": "left",
  })

  /**
   * Properties that define font and other CSS styles.
   */
  readonly props: Defined<TableStyleProps>

  /**
   * Returns a copy of this {@link TableStyle} with the given {@link props} applied.
   *
   * @param props - The optional property changes to apply to the copy.
   * If specified, props override properties in the original {@link TableStyle}.
   * Properties that are set to `undefined` or omitted use the original values.
   *
   * @example
   * ```typescript
   * const customStyle = TableStyle.default.with({
   *   "--tbl-style-font-family": '"Comic Sans", sans-serif',
   *   "--tbl-style-font-size": "16px",
   * })
   * ```
   */
  with(props?: TableStyleProps): TableStyle {
    if (nil(props)) return TableStyle.of({ ...this.props })

    return TableStyle.of({
      ...this.props,
      ...Objects.compact(Objects.pick(props, tableStylePropNames)),
    })
  }

  private static of(props: Defined<TableStyleProps>): TableStyle {
    return new TableStyle(props)
  }

  private constructor(props: Defined<TableStyleProps>) {
    this.props = props
  }
}
