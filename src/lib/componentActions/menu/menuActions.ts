import { autoPlacement, computePosition, shift } from "@floating-ui/dom"
import { on } from "svelte/events"

import * as Nodes from "#ext/dom/nodes"
import * as Numbers from "#ext/dom/numbers"
import * as Strings from "#ext/dom/strings"
import { nil } from "#ext/stdlib/existence"
import * as Functions from "#ext/stdlib/functions"

import * as CloseMenuKeys from "#componentActions/menu/closeMenuKeys"

import type { HeaderHandle } from "#componentModels/table/handle/handle"
import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

import type { Alignment } from "#core/models/alignment"
import * as CellLocations from "#core/models/cellLocations"
import type { Point } from "#core/models/point"
import type { RowOrCol } from "#core/models/rowOrCol"

export interface MenuActionsProps {
  readonly tableState: TableState
  readonly handle: HeaderHandle
  readonly point: Point
}

export class MenuActions {
  private readonly tableState: TableState
  private readonly handle: HeaderHandle
  private readonly point: Point

  private removeEventListeners: (() => void) | undefined

  private get rowOrCol(): RowOrCol {
    return this.handle.location
  }

  private get index(): number {
    return this.handle.index
  }

  private open(): void {
    const body = this.tableState.document.body
    this.removeEventListeners = Functions.each(
      on(body, "pointerdown", (event) => {
        event.preventDefault()
        if (nil(event.target) || !Nodes.contains(this.tableState.menuRootElement, event.target))
          this.close()
      }),
      on(body, "wheel", (event) => event.preventDefault(), {
        passive: false,
      }),
      on(body, "keydown", (event) => {
        event.preventDefault()
        if (CloseMenuKeys.pressed(event)) this.close()
      }),
    )

    this.tableState.focusTable()
    this.tableState.activeHandle = { state: "active", handle: this.handle }
    this.tableState.outlinedSection = TableSection.of(
      this.rowOrCol === "row"
        ? {
            row: { start: this.index, endExclusive: this.index + 1 },
            col: this.tableState.table.colRange,
          }
        : {
            row: this.tableState.table.rowRange,
            col: { start: this.index, endExclusive: this.index + 1 },
          },
    )

    const lastCell =
      this.rowOrCol === "row"
        ? { row: this.index, col: this.tableState.table.lastColIndex }
        : { row: this.tableState.table.lastRowIndex, col: this.index }
    this.tableState.activeCell = lastCell
    this.tableState.anchorCell = lastCell

    const moveableBackward = this.index !== this.tableState.table.firstRowOrColIndex(this.rowOrCol)
    const moveableForward = this.index !== this.tableState.table.lastRowOrColIndex(this.rowOrCol)
    let moveable: "backward" | "forward" | boolean = false
    if (moveableBackward) {
      moveable = moveableForward ? true : "backward"
    } else if (moveableForward) {
      moveable = "forward"
    }

    this.tableState.menu = {
      type: this.rowOrCol,
      capabilities: {
        addable: true,
        alignable: this.rowOrCol === "col",
        clearable: true,
        duplicatable: true,
        moveable,
        removable: !this.tableState.table.hasSingleRowOrCol(this.rowOrCol),
        sortable: this.rowOrCol === "col",
      },
      clickAdd: (direction) => this.clickAdd(direction),
      clickAlign: (alignment) => this.clickAlign(alignment),
      clickClear: () => this.clickClear(),
      clickDuplicate: () => this.clickDuplicate(),
      clickMove: (direction) => this.clickMove(direction),
      clickRemove: () => this.clickRemove(),
      clickSort: (direction) => this.clickSort(direction),
      computeTranslation: (element: HTMLElement) => this.computeTranslation(element),
    }
  }

  private close(): void {
    this.removeEventListeners?.()
    this.tableState.menu = undefined
    this.tableState.activeHandle = undefined
  }

  private async computeTranslation(menuElement: HTMLElement): Promise<Point> {
    const position = await computePosition(
      {
        getBoundingClientRect: () => ({
          x: this.point.x,
          y: this.point.y,
          top: this.point.y,
          right: this.point.x,
          bottom: this.point.y,
          left: this.point.x,
          width: 0,
          height: 0,
        }),
      },
      menuElement,
      {
        middleware: [
          autoPlacement({
            allowedPlacements:
              this.rowOrCol === "row" ? ["right-start", "right-end"] : ["right-start", "right"],
          }),
          shift({ crossAxis: true }),
        ],
      },
    )

    const win = Nodes.win(menuElement)
    return {
      x: Numbers.roundByDpr(position.x, win),
      y: Numbers.roundByDpr(position.y, win),
    }
  }

  private clickAdd(direction: "before" | "after"): void {
    this.tableState.table.addEmptyRowsOrColsAt(this.rowOrCol, {
      index: direction === "before" ? this.index : this.index + 1,
      count: 1,
    })

    if (direction === "after") {
      this.tableState.outlinedSection = this.tableState.outlinedSection?.shift(
        this.rowOrCol,
        "forward",
      )

      const nextCell = CellLocations.shift(this.rowOrCol, this.tableState.activeCell!, "forward")
      this.tableState.activeCell = nextCell
      this.tableState.anchorCell = nextCell
    }

    this.close()
  }

  private clickAlign(alignment: Alignment): void {
    this.tableState.table.setAlignmentAt(this.index, alignment)
    this.close()
  }

  private clickClear(): void {
    this.tableState.table.clearRowOrCol(this.rowOrCol, this.index)
    this.close()
  }

  private clickDuplicate(): void {
    this.tableState.table.duplicateRowOrColAt(this.rowOrCol, this.index)
    this.close()
  }

  private clickMove(direction: "backward" | "forward"): void {
    this.tableState.table.moveRowOrColAt(this.rowOrCol, {
      fromIndex: this.index,
      toIndex: direction === "backward" ? this.index - 1 : this.index + 1,
    })

    this.tableState.outlinedSection = this.tableState.outlinedSection?.shift(
      this.rowOrCol,
      direction,
    )

    const nextCell = CellLocations.shift(this.rowOrCol, this.tableState.activeCell!, direction)
    this.tableState.activeCell = nextCell
    this.tableState.anchorCell = nextCell

    this.close()
  }

  private clickRemove(): void {
    this.tableState.table.removeRowsOrColsAt(this.rowOrCol, { index: this.index, count: 1 })

    if (!this.tableState.table.hasRowOrColAt(this.rowOrCol, this.index)) {
      this.tableState.outlinedSection = this.tableState.outlinedSection?.shift(
        this.rowOrCol,
        "backward",
      )

      const nextCell = CellLocations.shift(this.rowOrCol, this.tableState.activeCell!, "backward")
      this.tableState.activeCell = nextCell
      this.tableState.anchorCell = nextCell
    }

    this.close()
  }

  private clickSort(direction: "ascending" | "descending"): void {
    this.tableState.table.sortByColAt(
      this.index,
      direction === "ascending"
        ? (first, second) => Strings.lexicographicalCompare(first.toString(), second.toString())
        : (first, second) => Strings.lexicographicalCompare(second.toString(), first.toString()),
    )

    this.close()
  }

  static showMenu(props: MenuActionsProps): void {
    new MenuActions(props).open()
  }

  private constructor({ tableState, handle, point }: MenuActionsProps) {
    this.tableState = tableState
    this.handle = handle
    this.point = point
  }
}
