import * as Assert from "#ext/stdlib/assert"
import type { Range } from "#ext/stdlib/range"

/**
 * Returns an {@link IteratorObject} that yields the integers from
 * {@link start} up to (but not including) {@link endExclusive}.
 *
 * {@link start} and {@link endExclusive} must be integers.
 */
export function range({ start, endExclusive }: Range): IteratorObject<number> {
  Assert.integer(start)
  Assert.integer(endExclusive)

  return Iterator.from(
    start <= endExclusive
      ? {
          *[Symbol.iterator](): Generator<number> {
            for (let value = start; value < endExclusive; value++) {
              yield value
            }
          },
        }
      : {
          *[Symbol.iterator](): Generator<number> {
            for (let value = start; value > endExclusive; value--) {
              yield value
            }
          },
        },
  )
}
