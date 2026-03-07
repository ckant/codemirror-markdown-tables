import { A } from "@mobily/ts-belt"

import type { Range, UpToRange } from "#ext/stdlib/range"

import * as Assert from "./assert"
import { def, nil } from "./existence"

/**
 * Returns the first element in {@link array}.
 *
 * Throws if {@link array} is empty.
 */
export function first<T>(array: readonly T[]): T {
  Assert.nonEmpty(array)
  return array[0]
}

/**
 * Returns the last element in {@link array}.
 *
 * Throws if {@link array} is empty.
 */
export function last<T>(array: readonly T[]): T {
  Assert.nonEmpty(array)
  return array[array.length - 1]
}

/**
 * Runs {@link fn} on each element in {@link array} and returns {@link array}.
 */
export function onEach<T>(array: T[], fn: (element: T) => void): T[]
export function onEach<T>(array: readonly T[], fn: (element: T) => void): readonly T[]
export function onEach<T>(array: T[] | readonly T[], fn: (element: T) => void): T[] | readonly T[] {
  for (const element of array) {
    fn(element)
  }
  return array
}

/**
 * Maps {@link fn} over the given table {@link array} and returns a new table array of cells.
 */
export function map2d<I, O>(array: readonly I[][], fn: (input: I) => O): O[][] {
  const mapped: O[][] = []
  for (const row of array) {
    const mappedRow = []
    for (const col of row) {
      mappedRow.push(fn(col))
    }
    mapped.push(mappedRow)
  }
  return mapped
}

/**
 * Clamps the size of {@link array} between {@link min} and {@link max} and returns a new array.
 * If size is below {@link min}, fills remainder with {@link fillWith}.
 *
 * {@link min} and {@link max} must be non-negative integers
 * where {@link min} is less than or equal to {@link max}.
 */
export function clamp<T>(
  array: readonly T[],
  options: { min: number; max: number; fillWith: T },
): T[] {
  Assert.nonnegativeInteger(options.min)
  Assert.nonnegativeInteger(options.max)
  Assert.increasingOrEqual(options.min, options.max)

  if (array.length < options.min) {
    return array.toSpliced(
      array.length,
      0,
      ...A.repeat(options.min - array.length, options.fillWith),
    )
  } else if (array.length > options.max) {
    return array.toSpliced(options.max, array.length - options.max)
  } else {
    return [...array]
  }
}

/**
 * Returns the sum of the numbers in {@link array} between {@link start} and {@link endExclusive}.
 *
 * {@link start} and {@link endExclusive} must be indices of {@link array} and an {@link UpToRange}.
 */
export function sum(
  array: readonly number[],
  { start, endExclusive }: UpToRange = { start: 0, endExclusive: array.length },
): number {
  Assert.upToIntegerRange(
    { start, endExclusive },
    { within: { start: 0, endExclusive: array.length } },
  )

  let total = 0
  for (let i = start; i < endExclusive; i++) {
    total += array[i]
  }
  return total
}

/**
 * Returns a slice of {@link array} between {@link start} and {@link endExclusive}.
 *
 * {@link start} and {@link endExclusive} must be indices of {@link array} and an {@link UpToRange}.
 */
export function sliceRange<T>(
  array: readonly T[],
  { start, endExclusive }: UpToRange = { start: 0, endExclusive: array.length },
): T[] {
  Assert.upToIntegerRange(
    { start, endExclusive },
    { within: { start: 0, endExclusive: array.length } },
  )
  return array.slice(start, endExclusive)
}

/**
 * Returns a new array representing the running sums of the numbers in {@link array} from
 * left to right.
 *
 * If {@link array} is empty, returns a new empty array.
 */
export function runningSum(array: readonly number[]): number[] {
  if (array.length === 0) return []

  const sums = new Array<number>(array.length)
  sums[0] = array[0]
  for (let i = 1; i < array.length; i++) {
    sums[i] = sums[i - 1] + array[i]
  }
  return sums
}

/**
 * Returns the given {@link array}, or nil if {@link array} is empty.
 */
export function nilIfEmpty<T>(array: T[]): T[] | undefined
export function nilIfEmpty<T>(array: readonly T[]): readonly T[] | undefined
export function nilIfEmpty<T>(array: T[] | readonly T[]): T[] | readonly T[] | undefined {
  return array.length === 0 ? undefined : array
}

/**
 * Returns the min element in {@link array} using the given {@link comparatorFn}.
 *
 * Throws if {@link array} is empty.
 */
export function minBy<T>(array: readonly T[], comparatorFn: (first: T, second: T) => number): T {
  Assert.nonEmpty(array)

  let lowest = array[0]
  for (let i = 1; i < array.length; i++) {
    if (comparatorFn(array[i], lowest) < 0) lowest = array[i]
  }

  return lowest
}

/**
 * Returns an array of the given {@link value} repeated {@link count} times.
 *
 * {@link count} must be an integer greater than or equal to 0.
 */
export function repeat<T>(value: T, { count }: { count: number }): T[] {
  Assert.nonnegativeInteger(count)
  return A.repeat(count, value)
}

/**
 * Returns a table array of the given {@link value} repeated for
 * all {@link rows} and {@link cols}.
 *
 * Both {@link rows} and {@link cols} must be integers greater than or equal to 1.
 */
export function repeat2d<T>(value: T, { rows, cols }: { rows: number; cols: number }): T[][] {
  Assert.positiveInteger(rows)
  Assert.positiveInteger(cols)

  const repeated: T[][] = []
  for (let row = 0; row < rows; row++) {
    repeated.push(A.repeat(cols, value))
  }
  return repeated
}

/**
 * Creates a new array with {@link count} copies of {@link array} appended to one another.
 * e.g. [A, B, C] * 3 = [A, B, C, A, B, C, A, B, C]
 *
 * Returns an empty array if {@link count} is 0.
 * Returns a copy of {@link array} if {@link count} is 1.
 *
 * {@link count} must be an integer greater than or equal to 0.
 */
export function multiply<T>(array: readonly T[], count: number): T[] {
  Assert.nonnegativeInteger(count)

  if (count === 0) return []
  if (count === 1) return [...array]

  const multiplied = new Array<T>(count * array.length)
  for (let pass = 0; pass < count; pass++) {
    const offset = pass * array.length
    for (let i = 0; i < array.length; i++) {
      multiplied[offset + i] = array[i]
    }
  }
  return multiplied
}

/**
 * Returns a copy of {@link array} with `null` and `undefined` values filtered out.
 */
export function compact<T>(array: readonly T[]): readonly NonNullable<T>[] {
  return array.filter((it) => def(it))
}

/**
 * Returns true if {@link array} has 0 elements.
 */
export function isEmpty<T>(array: readonly T[]): boolean {
  return array.length === 0
}

/**
 * Returns a copy of {@link array} without the first element.
 *
 * Returns an empty element if {@link array} has only one element.
 */
export function tailOrEmpty<T>(array: readonly T[]): T[] {
  return A.tailOrEmpty(array as T[])
}

/**
 * Returns a {@link Range} over all the indices of {@link array}.
 */
export function range<T>(array: readonly T[]): Range {
  return { start: 0, endExclusive: array.length }
}

/**
 * Slides an element of {@link array} from {@link fromIndex} to {@link toIndex}.
 *
 * When the shift is down, elements [fromIndex+1...toIndex] shift up by one to fill the space.
 * e.g. When B shifts to D in [A, B, C, D, E], the result is  [A, C, D, B, E].
 *
 * When the shift up, elements [toIndex...fromIndex-1] shift down by one to fill the space.
 * e.g. When D shifts to B in [A, B, C, D, E], the result is  [A, D, B, C, E].
 *
 * Both {@link fromIndex} and {@link toIndex} must be indices of {@link array}.
 */
export function shiftElement<T>(
  array: T[],
  { fromIndex, toIndex }: { fromIndex: number; toIndex: number },
): void {
  Assert.integerInRange(fromIndex, range(array))
  Assert.integerInRange(toIndex, range(array))

  if (fromIndex === toIndex) return

  const element = array[fromIndex]
  if (fromIndex < toIndex) {
    for (let i = fromIndex; i < toIndex; i++) {
      array[i] = array[i + 1]
    }
  } else {
    for (let i = fromIndex; i > toIndex; i--) {
      array[i] = array[i - 1]
    }
  }

  array[toIndex] = element
}

/**
 * Returns true if {@link firstArray} is equal to {@link secondArray} using the given
 * element {@link comparatorFn} or if both arrays are nil.
 */
export function equals<T>(
  firstArray: readonly T[] | undefined,
  secondArray: readonly T[] | undefined,
  comparatorFn: (first: T, second: T) => boolean,
): boolean {
  if (nil(firstArray) || nil(secondArray)) return firstArray === secondArray

  return A.eq(firstArray as T[], secondArray as T[], comparatorFn)
}

/**
 * Returns true if {@link array} contains {@link item} using the given {@link equalsFn}
 * to compare equality of {@link item} with each element.
 */
export function includesBy<T>(
  array: readonly T[],
  item: T,
  equalsFn: (first: T, second: T) => boolean,
): boolean {
  return array.some((element) => equalsFn(element, item))
}
