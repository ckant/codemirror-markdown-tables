import * as CellLocations from "#core/models/cellLocations"
import type { CellSelection } from "#core/models/cellSelection"
import * as Selections from "#core/models/selections"

export function equals(
  first: CellSelection | undefined,
  second: CellSelection | undefined,
): boolean {
  return (
    CellLocations.equals(first?.cell, second?.cell) &&
    Selections.equals(first?.section, second?.section)
  )
}
