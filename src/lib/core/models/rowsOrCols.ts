import type { Coordinate } from "#core/models/coordinate"
import type { RowOrCol } from "#core/models/rowOrCol"

export function toCoordinate(rowOrCol: "row"): "y"
export function toCoordinate(rowOrCol: "col"): "x"
export function toCoordinate(rowOrCol: RowOrCol): Coordinate
export function toCoordinate(rowOrCol: RowOrCol): Coordinate {
  return rowOrCol === "row" ? "y" : "x"
}
