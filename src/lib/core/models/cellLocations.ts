import * as Assert from "#ext/stdlib/assert"
import { def } from "#ext/stdlib/existence"
import * as Numbers from "#ext/stdlib/numbers"

import type { CellLocation } from "#core/models/cellLocation"
import type { RowOrCol } from "#core/models/rowOrCol"

/**
 * Returns true if {@link first} logically equals {@link second}.
 */
export function equals(first: CellLocation | undefined, second: CellLocation | undefined): boolean {
  return first?.row === second?.row && first?.col === second?.col
}

/**
 * Returns a new location with {@link row} shifted up (decreased) and {@link col} untouched.
 */
export function shiftUp({ row, col }: CellLocation): CellLocation {
  return { row: row - 1, col }
}
/**
 * Returns a new location with {@link col} shifted right (increased) and {@link row} untouched.
 */
export function shiftRight({ row, col }: CellLocation): CellLocation {
  return { row, col: col + 1 }
}
/**
 * Returns a new location with {@link row} shifted down (increased) and {@link col} untouched.
 */
export function shiftDown({ row, col }: CellLocation): CellLocation {
  return { row: row + 1, col }
}
/**
 * Returns a new location with {@link col} shifted left (decreased) and {@link row} untouched.
 */
export function shiftLeft({ row, col }: CellLocation): CellLocation {
  return { row, col: col - 1 }
}
/**
 * Returns a new location with {@link rowOrCol} of {@link cellLocation} shifted
 * in {@link direction} and column or row untouched.
 */
export function shift(
  rowOrCol: RowOrCol,
  cellLocation: CellLocation,
  direction: "backward" | "forward",
): CellLocation {
  if (rowOrCol === "row") {
    return direction === "backward" ? shiftUp(cellLocation) : shiftDown(cellLocation)
  } else {
    return direction === "backward" ? shiftLeft(cellLocation) : shiftRight(cellLocation)
  }
}

/**
 * Returns a new location representing the effect on the given {@link cellLocation}
 * when adding {@link count} {@link rowOrCol}s at the {@link start} location.
 *
 * Adding before {@link cellLocation} shifts it over by {@link count} to make room.
 * Adding after {@link cellLocation}, has no effect.
 *
 * {@link start} must be an integer.
 * {@link count} must be an integer greater than or equal to 0.
 */
export function shiftRowOrColByAddition(
  rowOrCol: RowOrCol,
  cellLocation: CellLocation,
  { start, count }: { start: number; count: number },
): CellLocation {
  Assert.integer(start)
  Assert.nonnegativeInteger(count)

  return withRowOrCol(
    rowOrCol,
    cellLocation,
    start <= cellLocation[rowOrCol] ? cellLocation[rowOrCol] + count : cellLocation[rowOrCol],
  )
}
/**
 * Returns a new location representing the effect on the given {@link cellLocation}
 * when subtracting {@link count} {@link rowOrCol}s at the {@link start} location or, if the
 * subtraction overlaps the {@link cellLocation} and a {@link boundary} is given, clamps
 * to the {@link cellLocation} to the {@link boundary}.
 *
 * Subtracting before {@link cellLocation} shifts it over by {@link count} to fill the void.
 * Subtracting after {@link cellLocation} has no effect.
 * Subtracting over {@link cellLocation} with a {@link boundary} minimally shifts the
 * {@link cellLocation} into the {@link boundary}.
 * Subtracting over {@link cellLocation} without a {@link boundary} removes the
 * {@link cellLocation} (returns nil).
 *
 * {@link start} must be an integer.
 * {@link count} must be an integer greater than or equal to 0.
 * {@link min} must be less than or equal to {@link max}.
 */
export function shiftOrClampRowOrColBySubtraction(
  rowOrCol: RowOrCol,
  cellLocation: CellLocation,
  {
    start,
    count,
    boundary,
  }: { start: number; count: number; boundary?: { min: number; max: number } },
): CellLocation | undefined {
  Assert.integer(start)
  Assert.nonnegativeInteger(count)
  if (def(boundary)) Assert.increasingOrEqual(boundary.min, boundary.max)

  if (start - count - 1 >= cellLocation[rowOrCol]) {
    return cellLocation
  } else if (start <= cellLocation[rowOrCol]) {
    return withRowOrCol(rowOrCol, cellLocation, cellLocation[rowOrCol] - count)
  } else if (def(boundary)) {
    return withRowOrCol(
      rowOrCol,
      cellLocation,
      Numbers.clamp(cellLocation[rowOrCol], { min: boundary.min, max: boundary.max }),
    )
  } else {
    return undefined
  }
}

export function withRowOrCol(
  rowOrCol: RowOrCol,
  cellLocation: CellLocation,
  value: number,
): CellLocation {
  return rowOrCol === "row"
    ? { row: value, col: cellLocation.col }
    : { row: cellLocation.row, col: value }
}
