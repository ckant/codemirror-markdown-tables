/**
 * A half-open range from {@link start} to (but not including) {@link endExclusive}.
 *
 * Ranges can be "upTo" (start up to endExclusive) or "downTo" (start down to endExclusive).
 */
export interface Range {
  readonly start: number
  readonly endExclusive: number
}

/**
 * Marks a range as one where {@link start} must be less than or equal to {@link endExclusive}.
 */
export type UpToRange = Range
