import { on } from "svelte/events"

import * as PointerEvents from "#ext/dom/pointerEvents"
import { def } from "#ext/stdlib/existence"
import * as Functions from "#ext/stdlib/functions"

import {
  type ResizeHandle,
  type ResizeOperation,
  ResizeTracker,
} from "#componentActions/resize/resizeTracker"

import * as EmptyCellMeasurer from "#componentModels/table/cell/emptyCellMeasurer"
import type { TableState } from "#componentModels/table/tableState.svelte"

export interface ResizeActionProps {
  readonly event: PointerEvent
  readonly tableState: TableState
  readonly handle: ResizeHandle
}

export class ResizeActions {
  private readonly tableState: TableState
  private readonly resizeTracker: ResizeTracker

  private removeEventListeners: (() => void) | undefined

  private start(event: PointerEvent): void {
    event.preventDefault()

    const resizeResult = this.resizeTracker.start()

    this.tableState.resize = {}
    this.tableState.activeHandle = resizeResult.activeHandle

    this.tableState.focusTable()

    this.removeEventListeners = Functions.each(
      PointerEvents.capturePointer(event, this.tableState.tableElement!),
      on(this.tableState.tableElement!, "pointermove", (e) => this.drag(e)),
      on(this.tableState.tableElement!, "pointerup", () => this.end()),
    )
  }

  private drag(event: PointerEvent): void {
    event.preventDefault()

    const resizeResult = this.resizeTracker.drag({
      position: { x: event.clientX, y: event.clientY },
    })
    if (def(resizeResult)) {
      this.resizeTable(resizeResult.operation)

      this.tableState.activeHandle = resizeResult.activeHandle
      this.tableState.activeCell = resizeResult.activeCell
      this.tableState.anchorCell = resizeResult.anchorCell
      this.tableState.outlinedSection = resizeResult.outlinedSection
    }
  }

  private end(): void {
    this.removeEventListeners?.()

    const resizeResult = this.resizeTracker.end()

    if ("operation" in resizeResult) {
      this.resizeTable(resizeResult.operation)
      this.tableState.activeCell = resizeResult.activeCell
      this.tableState.anchorCell = resizeResult.anchorCell
      this.tableState.outlinedSection = resizeResult.outlinedSection
    }

    this.tableState.activeHandle = resizeResult.activeHandle

    this.tableState.resize = undefined
  }

  private resizeTable({ row, col }: ResizeOperation): void {
    if (def(row)) {
      const { action, index, count } = row
      if (action === "add") {
        this.tableState.table.addEmptyRowsAt({ row: index, count })
      } else {
        this.tableState.table.removeRowsAt({ row: index, count })
      }
    }
    if (def(col)) {
      const { action, index, count } = col
      if (action === "add") {
        this.tableState.table.addEmptyColsAt({ col: index, count })
      } else {
        this.tableState.table.removeColsAt({ col: index, count })
      }
    }
  }

  static startResize(props: ResizeActionProps): void {
    new ResizeActions(props).start(props.event)
  }

  private constructor({ event, tableState, handle }: ResizeActionProps) {
    this.tableState = tableState

    const { width, height } = EmptyCellMeasurer.measure(tableState)

    this.resizeTracker = ResizeTracker.of({
      tableState: this.tableState,
      handle,
      position: { x: event.clientX, y: event.clientY },
      cellSizePixels: { row: height, col: width },
      dragThresholdPixels: { row: height / 2, col: width / 2 },
    })
  }
}
