import * as Numbers from "#ext/stdlib/numbers"

/**
 * Returns the index of the last element in {@link sortedArray} that is
 * less than or equal to {@link value}, or -1 if all elements are greater than {@link value} or
 * if {@link sortedArray} is empty.
 *
 * Assumes that {@link sortedArray} is sorted, since this binary searches for the result.
 */
export function lastIndexLessThanOrEqualTo(sortedArray: number[], value: number): number {
  if (sortedArray.length === 0) return -1

  let left = 0
  let right = sortedArray.length - 1
  while (left !== right) {
    const mid = left + Numbers.ceil((right - left) / 2)
    if (sortedArray[mid] > value) {
      right = mid - 1
    } else {
      left = mid
    }
  }

  return sortedArray[left] <= value ? left : -1
}
