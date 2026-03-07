import type { Range } from "#ext/stdlib/range"

/**
 * Returns true if {@link value} is between {@link start} and {@link Range#endExclusive}.
 */
export function includes(value: number, { start, endExclusive }: Range): boolean {
  if (start <= endExclusive) {
    return value >= start && value < endExclusive
  } else {
    return value <= start && value > endExclusive
  }
}

/**
 * Returns true {@link start} equals {@link endExclusive}.
 */
export function isEmpty({ start, endExclusive }: Range): boolean {
  return start === endExclusive
}

/**
 * Returns true {@link first} and {@link second} have the same
 * {@link Range#start} and {@link Range#endExclusive} or are both nil.
 */
export function equals(first: Range | undefined, second: Range | undefined): boolean {
  return first?.start === second?.start && first?.endExclusive === second?.endExclusive
}
