import type {
  CellHandle,
  Handle,
  HeaderHandle,
  TableHandle,
} from "#componentModels/table/handle/handle"

import type { CellLocation } from "#core/models/cellLocation"
import * as CellLocations from "#core/models/cellLocations"
import type { RowOrCol } from "#core/models/rowOrCol"

export const table: readonly TableHandle[] = [
  { type: "table", location: "bottom-right" },
  { type: "table", location: "right" },
  { type: "table", location: "bottom" },
]

export function ofCell(
  { row, col }: CellLocation,
  position: { left: boolean; top: boolean },
): readonly CellHandle[] {
  const topHandles: CellHandle[] = [
    { type: "header", location: "col", index: col },
    { type: "border", location: "top", index: row },
  ]

  const rowAndColHandles: CellHandle[] = [
    { type: "border", location: "col", index: col + 1 },
    { type: "border", location: "row", index: row + 1 },
  ]

  const leftHandles: CellHandle[] = [
    { type: "header", location: "row", index: row },
    { type: "border", location: "left", index: row },
  ]

  return [
    ...(position.top ? topHandles : []),
    ...rowAndColHandles,
    ...(position.left ? leftHandles : []),
  ]
}

export function reconstruct(
  { location, type }: Pick<CellHandle, "location" | "type">,
  cell: CellLocation,
): CellHandle {
  if (type === "header") {
    return { location, type, index: cell[location as RowOrCol] } as HeaderHandle
  } else if (location === "top") {
    return { location, type, index: cell.row }
  } else if (location === "left") {
    return { location, type, index: cell.col }
  } else {
    return { location, type, index: cell[location] + 1 }
  }
}

export function locateFirst({ type, location, index }: CellHandle): CellLocation {
  if (type === "header") {
    return CellLocations.withRowOrCol(location, { row: 0, col: 0 }, index)
  } else if (location === "top" || location === "left") {
    return { row: 0, col: 0 }
  } else {
    return CellLocations.withRowOrCol(location, { row: 0, col: 0 }, index - 1)
  }
}

export function equals(first: Handle | undefined, second: Handle | undefined): boolean {
  if (first?.type !== second?.type || first?.location !== second?.location) return false

  if (first?.type === "table" || second?.type === "table") return true
  return first?.index === second?.index
}
