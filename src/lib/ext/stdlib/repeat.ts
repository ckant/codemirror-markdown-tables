import * as Iterables from "#ext/stdlib/iterables"
import type { Range } from "#ext/stdlib/range"

import * as Assert from "./assert"

/**
 * Runs {@link fn} {@Link n} times, passing values 0...n-1 and maps results to new array.
 *
 * {@link n} must be an integer greater than or equal to 0.
 */
export function timesMap<T>(n: number, fn: (i: number) => T): T[] {
  Assert.nonnegativeInteger(n)

  const results = new Array<T>(n)
  for (let i = 0; i < n; i++) {
    results[i] = fn(i)
  }
  return results
}

/**
 * Runs {@link fn} {@Link n} times, passing values 0...n-1.
 *
 * {@link n} must be an integer greater than or equal to 0.
 */
export function times(n: number, fn: (i: number) => void): void {
  Assert.nonnegativeInteger(n)

  for (let i = 0; i < n; i++) {
    fn(i)
  }
}

/**
 * Runs {@link fn} for each value of {@link of}, and maps results to new array.
 */
export function rangeMap<T>(of: Range, fn: (i: number) => T): T[] {
  return Iterables.range(of)
    .map((num) => fn(num))
    .toArray()
}

/**
 * Runs {@link fn} for each value of {@link of}.
 */
export function range(of: Range, fn: (i: number) => void): void {
  return Iterables.range(of).forEach((num) => fn(num))
}
