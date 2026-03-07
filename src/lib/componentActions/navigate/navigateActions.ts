import { nil } from "#ext/stdlib/existence"

import type { NavigateKey } from "#componentActions/navigate/navigateKey"

import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

import { type CellLocation } from "#core/models/cellLocation"
import * as CellLocations from "#core/models/cellLocations"

export interface NavigateActionsProps {
  readonly event: KeyboardEvent
  readonly tableState: TableState
  readonly position: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  readonly key: NavigateKey
}

export class NavigateActions {
  private readonly event: KeyboardEvent
  private readonly tableState: TableState
  private readonly position: { top: boolean; right: boolean; bottom: boolean; left: boolean }

  static navigate(props: NavigateActionsProps): void {
    new NavigateActions(props)[`navigate${props.key}`]()
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateTab(): void {
    this.moveRight({ createRow: true, position: "end" })
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateShiftTab(): void {
    this.moveLeft({ createRow: true, position: "end" })
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateEnter(): void {
    this.moveDown({ createRow: true, position: "end" })
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateArrowLeft(): void {
    if (!this.position.left) return
    this.moveLeft({ createRow: false, position: "end" })
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateArrowUp(): void {
    if (!this.position.top) return
    this.moveUp({ createRow: false, position: "end" })
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateArrowRight(): void {
    if (!this.position.right) return
    this.moveRight({ createRow: false, position: "start" })
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateArrowDown(): void {
    if (!this.position.bottom) return
    this.moveDown({ createRow: false, position: "end" })
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateShiftArrowLeft(): void {
    if (
      !this.position.left ||
      nil(this.tableState.outlinedSection) ||
      nil(this.tableState.activeCell)
    )
      return

    this.event.preventDefault()
    this.tableState.focusTable()

    if (nil(this.tableState.anchorCell)) this.tableState.anchorCell = this.tableState.activeCell

    if (this.tableState.outlinedSection.endCol === this.tableState.anchorCell.col) {
      if (this.tableState.outlinedSection.startCol === this.tableState.table.firstColIndex) return
      this.tableState.outlinedSection = this.tableState.outlinedSection.expandLeft()
    } else {
      this.tableState.outlinedSection = this.tableState.outlinedSection.contractLeft()
    }
    this.tableState.activeCell = CellLocations.shiftLeft(this.tableState.activeCell)
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateShiftArrowUp(): void {
    if (
      !this.position.top ||
      nil(this.tableState.outlinedSection) ||
      nil(this.tableState.activeCell)
    )
      return

    this.event.preventDefault()
    this.tableState.focusTable()

    if (nil(this.tableState.anchorCell)) this.tableState.anchorCell = this.tableState.activeCell

    if (this.tableState.outlinedSection.endRow === this.tableState.anchorCell.row) {
      if (this.tableState.outlinedSection.startRow === this.tableState.table.firstRowIndex) return
      this.tableState.outlinedSection = this.tableState.outlinedSection.expandUp()
    } else {
      this.tableState.outlinedSection = this.tableState.outlinedSection.contractUp()
    }
    this.tableState.activeCell = CellLocations.shiftUp(this.tableState.activeCell)
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateShiftArrowRight(): void {
    if (
      !this.position.right ||
      nil(this.tableState.outlinedSection) ||
      nil(this.tableState.activeCell)
    )
      return

    this.event.preventDefault()
    this.tableState.focusTable()

    if (nil(this.tableState.anchorCell)) this.tableState.anchorCell = this.tableState.activeCell

    if (this.tableState.outlinedSection.startCol === this.tableState.anchorCell.col) {
      if (this.tableState.outlinedSection.endCol === this.tableState.table.lastColIndex) return
      this.tableState.outlinedSection = this.tableState.outlinedSection.expandRight()
    } else {
      this.tableState.outlinedSection = this.tableState.outlinedSection.contractRight()
    }
    this.tableState.activeCell = CellLocations.shiftRight(this.tableState.activeCell)
  }

  // noinspection JSUnusedGlobalSymbols -- Called dynamically
  navigateShiftArrowDown(): void {
    if (
      !this.position.bottom ||
      nil(this.tableState.outlinedSection) ||
      nil(this.tableState.activeCell)
    )
      return

    this.event.preventDefault()
    this.tableState.focusTable()

    if (nil(this.tableState.anchorCell)) this.tableState.anchorCell = this.tableState.activeCell

    if (this.tableState.outlinedSection.startRow === this.tableState.anchorCell.row) {
      if (this.tableState.outlinedSection.endRow === this.tableState.table.lastRowIndex) return
      this.tableState.outlinedSection = this.tableState.outlinedSection.expandDown()
    } else {
      this.tableState.outlinedSection = this.tableState.outlinedSection.contractDown()
    }
    this.tableState.activeCell = CellLocations.shiftDown(this.tableState.activeCell)
  }

  private moveLeft({
    createRow,
    position,
  }: {
    createRow: boolean
    position: "start" | "end"
  }): void {
    if (nil(this.tableState.activeCell)) return

    this.event.preventDefault()

    if (CellLocations.equals(this.tableState.activeCell, this.tableState.table.firstCellLocation)) {
      if (!createRow) {
        this.tableState.navigate("before")
        return
      }
      this.tableState.table.prependEmptyRows(1)
      this.tableState.activeCell = {
        row: this.tableState.activeCell.row + 1,
        col: this.tableState.activeCell.col,
      }
    }

    this.moveTo(
      this.tableState.activeCell.col === this.tableState.table.firstColIndex
        ? { row: this.tableState.activeCell.row - 1, col: this.tableState.table.lastColIndex }
        : { row: this.tableState.activeCell.row, col: this.tableState.activeCell.col - 1 },
      position,
    )
  }

  private moveUp({ createRow, position }: { createRow: boolean; position: "start" | "end" }): void {
    if (nil(this.tableState.activeCell)) return

    this.event.preventDefault()

    if (this.tableState.activeCell.row === this.tableState.table.firstRowIndex) {
      if (!createRow) {
        this.tableState.navigate("before")
        return
      }
      this.tableState.table.prependEmptyRows(1)
      this.tableState.activeCell = {
        row: this.tableState.activeCell.row + 1,
        col: this.tableState.activeCell.col,
      }
    }

    this.moveTo(
      { row: this.tableState.activeCell.row - 1, col: this.tableState.activeCell.col },
      position,
    )
  }

  private moveRight({
    createRow,
    position,
  }: {
    createRow: boolean
    position: "start" | "end"
  }): void {
    if (nil(this.tableState.activeCell)) return

    this.event.preventDefault()

    if (CellLocations.equals(this.tableState.activeCell, this.tableState.table.lastCellLocation)) {
      if (!createRow) {
        this.tableState.navigate("after")
        return
      }
      this.tableState.table.appendEmptyRows(1)
    }

    this.moveTo(
      this.tableState.activeCell.col === this.tableState.table.lastColIndex
        ? { row: this.tableState.activeCell.row + 1, col: this.tableState.table.firstColIndex }
        : { row: this.tableState.activeCell.row, col: this.tableState.activeCell.col + 1 },
      position,
    )
  }

  private moveDown({
    createRow,
    position,
  }: {
    createRow: boolean
    position: "start" | "end"
  }): void {
    if (nil(this.tableState.activeCell)) return

    this.event.preventDefault()

    if (this.tableState.activeCell.row === this.tableState.table.lastRowIndex) {
      if (!createRow) {
        this.tableState.navigate("after")
        return
      }
      this.tableState.table.appendEmptyRows(1)
    }

    this.moveTo(
      { row: this.tableState.activeCell.row + 1, col: this.tableState.activeCell.col },
      position,
    )
  }

  private moveTo(location: CellLocation, position: "start" | "end"): void {
    this.tableState.activeCell = location
    this.tableState.anchorCell = location

    this.tableState.outlinedSection = TableSection.ofCell(location)

    if (this.tableState.selection.isCell()) {
      const cursor = position === "start" ? 0 : this.tableState.table.cellAt(location).length
      this.tableState.selectionValue = { cell: location, section: { anchor: cursor, head: cursor } }
    }
  }

  private constructor({ event, tableState, position }: NavigateActionsProps) {
    this.event = event
    this.tableState = tableState
    this.position = position
  }
}
