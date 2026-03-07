import { type CellLocation } from "#core/models/cellLocation"
import { type Selection } from "#core/models/selection"

export interface CellSelection {
  readonly cell: CellLocation
  readonly section: Selection
}
