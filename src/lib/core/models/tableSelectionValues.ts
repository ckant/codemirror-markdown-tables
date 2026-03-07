import * as Guards from "#ext/stdlib/guards"

import type { CellSelection } from "#core/models/cellSelection"
import * as CellSelections from "#core/models/cellSelections"
import type { TableSelectionValue } from "#core/models/tableSelectionValue"

export function isHidden(value: TableSelectionValue): value is "hidden" {
  return value === "hidden"
}
export function isAll(value: TableSelectionValue): value is "all" {
  return value === "all"
}
export function isNone(value: TableSelectionValue): value is "none" {
  return value === "none"
}

export function isCell(value: TableSelectionValue): value is CellSelection {
  return !Guards.isString(value)
}

export function equals(first: TableSelectionValue, second: TableSelectionValue): boolean {
  return isCell(first)
    ? isCell(second) && CellSelections.equals(first, second)
    : !isCell(second) && first === second
}
