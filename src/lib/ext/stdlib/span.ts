/**
 * A half-open span starting at {@link from} and ending at (but not including) {@link to}.
 */
export interface Span {
  readonly from: number
  readonly to: number
}
