import { on } from "svelte/events"

import { AutoScroller } from "#ext/dom/autoScroller"
import * as PointerEvents from "#ext/dom/pointerEvents"
import { nil } from "#ext/stdlib/existence"
import * as Functions from "#ext/stdlib/functions"

import { TableMeasurement } from "#componentModels/table/tableMeasurement"
import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

import { type CellLocation } from "#core/models/cellLocation"
import * as CellLocations from "#core/models/cellLocations"

export interface OutlineActionsProps {
  readonly event: PointerEvent
  readonly tableState: TableState
  readonly cellLocation: CellLocation
}

export class OutlineActions {
  private readonly tableState: TableState
  private readonly tableMeasurement: TableMeasurement
  private readonly autoScroller: Pick<AutoScroller, "updatePosition" | "destroy">
  private readonly shouldAutoScroll: () => boolean

  private removeEventListeners: (() => void) | undefined
  private currentCell: CellLocation

  private start(): void {
    this.tableState.activeCell = this.currentCell
    this.tableState.anchorCell = this.currentCell
    this.tableState.outlinedSection = TableSection.ofCell(this.currentCell)

    this.tableState.outline = { outlined: false }

    this.removeEventListeners = Functions.each(
      on(this.tableState.window, "pointermove", (e) => this.drag(e)),
      on(this.tableState.window, "pointerup", () => this.end()),
      on(this.tableState.window, "pointerleave", () => this.end()),
    )
  }

  private resizeAndContinue(event: PointerEvent): void {
    event.preventDefault()
    if (nil(this.tableState.anchorCell)) this.tableState.anchorCell = this.currentCell
    this.expandOrContract(this.currentCell)

    this.tableState.outline = { outlined: true }

    this.removeEventListeners = Functions.each(
      on(this.tableState.window, "pointermove", (e) => this.drag(e)),
      on(this.tableState.window, "pointerup", () => this.end()),
      on(this.tableState.window, "pointerleave", () => this.end()),
    )
  }

  private drag(event: PointerEvent): void {
    if (!PointerEvents.isPrimaryButton(event)) {
      this.end()
      return
    }

    event.preventDefault()

    if (this.shouldAutoScroll()) this.autoScroller.updatePosition(event.clientX, event.clientY)

    const cell = this.tableMeasurement.lastCellBeforePosition({
      x: event.clientX + this.tableState.scrollOffsetX,
      y: event.clientY + this.tableState.scrollOffsetY,
    })

    if (CellLocations.equals(cell, this.currentCell)) return

    this.currentCell = cell
    this.tableState.outline = { outlined: true }
    this.expandOrContract(cell)
  }

  private end(): void {
    this.removeEventListeners?.()
    this.autoScroller.destroy()
    this.tableState.outline = undefined
  }

  private expandOrContract(boundary: CellLocation): void {
    this.tableState.focusTable()

    const [startRow, endRow] =
      boundary.row <= this.tableState.anchorCell!.row
        ? [boundary.row, this.tableState.anchorCell!.row]
        : [this.tableState.anchorCell!.row, boundary.row]

    const [startCol, endCol] =
      boundary.col <= this.tableState.anchorCell!.col
        ? [boundary.col, this.tableState.anchorCell!.col]
        : [this.tableState.anchorCell!.col, boundary.col]

    this.tableState.outlinedSection = TableSection.of({
      row: { start: startRow, endExclusive: endRow + 1 },
      col: { start: startCol, endExclusive: endCol + 1 },
    })
    this.tableState.activeCell = boundary
  }

  static startOutline(props: OutlineActionsProps): void {
    new OutlineActions(props).start()
  }

  static resizeAndContinueOutline(props: OutlineActionsProps): void {
    new OutlineActions(props).resizeAndContinue(props.event)
  }

  private constructor({ tableState, cellLocation }: OutlineActionsProps) {
    this.tableState = tableState
    this.currentCell = cellLocation

    this.autoScroller = AutoScroller.of({
      offset: 10,
      maxScroll: 32,
      boundaryElement: { x: tableState.scrollElement, y: tableState.rootScrollElement },
      scrollElement: { x: tableState.scrollElement, y: tableState.rootScrollElement },
    })
    this.shouldAutoScroll = Functions.falseUntil({ delayMillis: 500 })

    this.tableMeasurement = TableMeasurement.of(tableState.tableElement!, {
      x: tableState.scrollOffsetX,
      y: tableState.scrollOffsetY,
    })
  }
}
