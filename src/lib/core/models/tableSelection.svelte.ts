import { type CellLocation } from "#core/models/cellLocation"
import type { CellSelection } from "#core/models/cellSelection"
import { type Selection } from "#core/models/selection"
import { type TableSelectionValue } from "#core/models/tableSelectionValue"
import * as TableSelectionValues from "#core/models/tableSelectionValues"

export class TableSelection {
  value: TableSelectionValue

  isHidden(): this is { value: "hidden"; get cell(): undefined; get cellSection(): undefined } {
    return TableSelectionValues.isHidden(this.value)
  }

  isAll(): this is { value: "all"; get cell(): undefined; get cellSection(): undefined } {
    return TableSelectionValues.isAll(this.value)
  }

  isNone(): this is { value: "none"; get cell(): undefined; get cellSection(): undefined } {
    return TableSelectionValues.isNone(this.value)
  }

  isCell(): this is {
    value: CellSelection
    get cell(): CellLocation
    get cellSection(): Selection
  } {
    return TableSelectionValues.isCell(this.value)
  }

  get cell(): CellLocation | undefined {
    return this.isCell() ? this.value.cell : undefined
  }

  get cellSection(): Selection | undefined {
    return this.isCell() ? this.value.section : undefined
  }

  equals(other: TableSelection): boolean {
    return TableSelectionValues.equals(this.value, other.value)
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention -- JSON.stringify calls this
  toJSON(): { value: TableSelectionValue } {
    return this.isCell()
      ? { value: { cell: this.cell, section: this.cellSection } }
      : { value: this.value }
  }

  static of(value: TableSelectionValue): TableSelection {
    return new TableSelection(value)
  }

  private constructor(value: TableSelectionValue) {
    this.value = $state(value)
  }
}
