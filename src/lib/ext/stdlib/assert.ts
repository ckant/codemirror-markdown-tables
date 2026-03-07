import { def as isDef, nil } from "#ext/stdlib/existence"
import type { Range, UpToRange } from "#ext/stdlib/range"

const assertEnabled = import.meta.env.DEV

/**
 * Asserts that {@link number} is an integer.
 */
export function integer(number: number): void {
  if (!assertEnabled) return
  if (!Number.isInteger(number)) throw new Error(`${number} is not an integer`)
}

/**
 * Asserts that {@link number} is a nonnegative integer.
 */
export function nonnegativeInteger(number: number): void {
  if (!assertEnabled) return
  if (!Number.isInteger(number)) throw new Error(`${number} is not an integer`)
  if (number < 0) throw new Error(`${number} is negative`)
}

/**
 * Asserts that {@link number} is a positive integer.
 */
export function positiveInteger(number: number): void {
  if (!assertEnabled) return
  if (!Number.isInteger(number)) throw new Error(`${number} is not an integer`)
  if (number <= 0) throw new Error(`${number} is not positive`)
}

/**
 * Asserts that {@link first} is less than or equal to {@link second}
 */
export function increasingOrEqual(first: number, second: number): void {
  if (!assertEnabled) return
  if (second < first) throw new Error(`${second} is less than ${first}`)
}

/**
 * Asserts that integer {@link number} is inside range from {@link start} to {@link endExclusive}.
 */
export function integerInRange(number: number, { start, endExclusive }: Range): void {
  if (!assertEnabled) return
  if (!Number.isInteger(number)) throw new Error(`${number} is not an integer`)

  if (start <= endExclusive) {
    if (number < start || number >= endExclusive)
      throw new Error(`${number} is not in range [${start},${endExclusive})`)
  } else {
    if (number > start || number <= endExclusive)
      throw new Error(`${number} is not in range [${start},${endExclusive})`)
  }
}

/**
 * Asserts that {@link value} is non-nil.
 */
export function def<T>(value: T): asserts value is NonNullable<T> {
  if (!assertEnabled) return
  if (nil(value)) throw new Error("value is nil")
}

/**
 * Asserts that {@link collection} is non-empty.
 */
export function nonEmpty(collection: { readonly length: number }): void {
  if (!assertEnabled) return
  if (collection.length === 0) throw new Error("collection is empty")
}

/**
 * Asserts that each element of {@link iterable} has length equal to {@link expectedLength}.
 */
export function length2d(
  iterable: Iterable<{ readonly length: number }>,
  expectedLength: number,
): void {
  if (!assertEnabled) return
  for (const element of iterable) {
    if (element.length !== expectedLength)
      throw new Error(`length ${element.length} is not equal to ${expectedLength}`)
  }
}

/**
 * Asserts that {@link start} and {@link endExclusive} are integers and {@link start} is less than
 * or equal to {@link endExclusive}.
 *
 * If {@link within} is provided, asserts that range is a subset of {@link within}.
 */
export function upToIntegerRange(
  { start, endExclusive }: Range,
  { within }: { within?: UpToRange } = {},
): void {
  if (!assertEnabled) return
  if (isDef(within) && within.start > within.endExclusive)
    throw new Error(`[${within.start},${within.endExclusive}) is not an upTo range`)

  if (!Number.isInteger(start)) throw new Error(`${start} is not an integer`)
  if (!Number.isInteger(endExclusive)) throw new Error(`${endExclusive} is not an integer`)

  if (start > endExclusive) throw new Error(`[${start},${endExclusive}) is not an upTo range`)

  if (isDef(within) && start < within.start)
    throw new Error(`${start} is not in range [${within.start},${within.endExclusive})`)
  if (isDef(within) && endExclusive > within.endExclusive)
    throw new Error(`${endExclusive} is not in range [${within.start},${within.endExclusive})`)
}
