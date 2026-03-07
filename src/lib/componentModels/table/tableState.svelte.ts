import type { MarkdownConfig } from "@codemirror/lang-markdown"
import type { Extension } from "@codemirror/state"
import type { EditorView, KeyBinding } from "@codemirror/view"
import { type Highlighter, tags } from "@lezer/highlight"
import { type Getter, watch } from "runed"

import { StateHighlighter } from "#ext/codemirror/language/stateHighligher"
import * as Browsers from "#ext/dom/browsers"
import * as DomSelections from "#ext/dom/selections"
import { def, nil } from "#ext/stdlib/existence"

import type { MenuView } from "#componentActions/menu/menuView"
import type { MoveView } from "#componentActions/move/moveView"
import type { OutlineView } from "#componentActions/outline/outlineView"
import type { ResizeView } from "#componentActions/resize/resizeView"

import { type CellHandle, type Handle } from "#componentModels/table/handle/handle"
import * as Handles from "#componentModels/table/handle/handles"
import { TableSection } from "#componentModels/table/tableSection"

import * as CellNodes from "#components/table/cell/cellNodes"

import { type CellLocation } from "#core/models/cellLocation"
import type { RowOrCol } from "#core/models/rowOrCol"
import { Table } from "#core/models/table.svelte"
import { type TableSelection } from "#core/models/tableSelection.svelte"
import { type TableSelectionValue } from "#core/models/tableSelectionValue"
import * as TableSelectionValues from "#core/models/tableSelectionValues"

export interface TableStateProps {
  readonly table: Getter<Table>
  readonly selection: Getter<TableSelection>
  readonly scrollElement: Getter<HTMLElement>
  readonly rootEditor: Getter<EditorView>
  readonly menuRootElement: Getter<HTMLElement>
  readonly extensions: Getter<readonly Extension[]>
  readonly markdownConfig: Getter<
    Pick<MarkdownConfig, "extensions" | "completeHTMLTags" | "pasteURLAsLink" | "htmlTagLanguage">
  >
  readonly globalKeyBindings: Getter<readonly KeyBinding[]>
  readonly selectionType: Getter<"codemirror" | "native">
  readonly lineWrapping: Getter<"wrap" | "nowrap">
  readonly onUndo: Getter<() => void>
  readonly onRedo: Getter<() => void>
  readonly onNavigate: Getter<(direction: "before" | "after") => void>
  readonly onDelete: Getter<() => void>
}

export class TableState {
  readonly table: Table
  private readonly _selection: TableSelection

  selectionChanged: boolean

  readonly rootEditor: EditorView
  readonly extensions: readonly Extension[]
  readonly markdownConfig: Pick<
    MarkdownConfig,
    "extensions" | "completeHTMLTags" | "pasteURLAsLink" | "htmlTagLanguage"
  >

  readonly globalKeyBindings: readonly KeyBinding[]
  readonly selectionType: "codemirror" | "native"
  readonly lineWrapping: "wrap" | "nowrap"

  private readonly onUndo: () => void
  private readonly onRedo: () => void
  private readonly onNavigate: (direction: "before" | "after") => void
  private readonly onDelete: () => void

  private readonly headerCellHighlighter: Highlighter
  private readonly dataCellHighlighter: Highlighter

  wrapperElement: HTMLElement | undefined
  tableElement: HTMLTableElement | undefined
  readonly scrollElement: HTMLElement
  readonly menuRootElement: HTMLElement

  activeTable: boolean

  activeCell: CellLocation | undefined
  anchorCell: CellLocation | undefined
  hoveredCell: CellLocation | undefined

  outlinedSection: TableSection | undefined

  activeHandle: { readonly state: "active" | "hover"; readonly handle: Handle } | undefined

  menu: MenuView | undefined
  move: MoveView | undefined
  outline: OutlineView | undefined
  resize: ResizeView | undefined
  interactive: boolean

  pointerDown: boolean

  static of(props: TableStateProps): TableState {
    return new TableState(props)
  }

  focusTable(): void {
    this.activeTable = true
    this.tableElement!.focus({ preventScroll: true })
    this.selectionValue = "hidden"
    DomSelections.unselectAll(this.document)
  }

  scrollToCell(cell: CellLocation): void {
    requestAnimationFrame(() => {
      CellNodes.descendentCell(this.tableElement!, cell)?.scrollIntoView({
        inline: "nearest",
        block: "nearest",
      })
    })
  }

  scrollToFirstCell(rowOrCol: RowOrCol, index: number): void {
    requestAnimationFrame(() => {
      CellNodes.descendentCell(this.tableElement!, {
        ...this.table.firstCellLocation,
        [rowOrCol]: index,
      })?.scrollIntoView({
        inline: "nearest",
        block: "nearest",
      })
    })
  }

  get document(): Document {
    return this.rootEditor.dom.ownerDocument
  }

  get window(): typeof window {
    return this.document.defaultView ?? window
  }

  get rootScrollElement(): HTMLElement {
    return this.rootEditor.scrollDOM
  }

  get scrollOffsetX(): number {
    return this.rootScrollElement.scrollLeft + this.scrollElement.scrollLeft
  }

  get scrollOffsetY(): number {
    return this.rootScrollElement.scrollTop + this.scrollElement.scrollTop
  }

  deleteTable(): void {
    this.onDelete()
  }

  navigate(direction: "before" | "after"): void {
    this.onNavigate(direction)
  }

  undo(): void {
    this.onUndo()
  }

  redo(): void {
    this.onRedo()
  }

  get selection(): Omit<TableSelection, "value"> {
    return this._selection
  }

  get selectionValue(): TableSelectionValue {
    return this._selection.value
  }

  set selectionValue(value: TableSelectionValue) {
    if (TableSelectionValues.equals(this._selection.value, value)) return

    this._selection.value = value
    this.selectionChanged = true
  }

  highlighter({ row }: CellLocation): Highlighter {
    return row === this.table.firstRowIndex ? this.headerCellHighlighter : this.dataCellHighlighter
  }

  cellHandleState(cell: CellLocation, handle: CellHandle): "active" | "hover" | undefined {
    if (handle.type === "border" || this.activeHandle?.state == "active") {
      return Handles.equals(this.activeHandle?.handle, handle)
        ? this.activeHandle?.state
        : undefined
    } else {
      return Handles.equals(this.activeHandle?.handle, handle) ||
        cell[handle.location] === this.activeCell?.[handle.location]
        ? "hover"
        : undefined
    }
  }

  private constructor({
    table,
    selection,
    scrollElement,
    rootEditor,
    menuRootElement,
    extensions,
    markdownConfig,
    globalKeyBindings,
    selectionType,
    lineWrapping,
    onUndo,
    onRedo,
    onNavigate,
    onDelete,
  }: TableStateProps) {
    this.table = $derived(table())
    this._selection = $derived(selection())
    this.selectionChanged = $state(false)

    const initialSelectedCell = this.selection.isCell() ? this.selection.cell : undefined

    this.activeCell = $state.raw(initialSelectedCell)
    this.anchorCell = $state.raw(initialSelectedCell)
    this.outlinedSection = $state.raw(
      def(initialSelectedCell) ? TableSection.ofCell(initialSelectedCell) : undefined,
    )

    this.rootEditor = $derived(rootEditor())
    this.extensions = $derived(extensions())
    this.markdownConfig = $derived(markdownConfig())
    this.globalKeyBindings = $derived(globalKeyBindings())
    this.selectionType = $derived(selectionType())
    this.lineWrapping = $derived(lineWrapping())

    this.wrapperElement = $state.raw(undefined)
    this.tableElement = $state.raw(undefined)
    this.scrollElement = $derived(scrollElement())
    this.menuRootElement = $derived(menuRootElement())

    this.headerCellHighlighter = $derived(
      StateHighlighter.of(this.rootEditor.state, [tags.heading]),
    )
    this.dataCellHighlighter = $derived(StateHighlighter.of(this.rootEditor.state))

    this.onUndo = $derived(onUndo())
    this.onRedo = $derived(onRedo())
    this.onNavigate = $derived(onNavigate())
    this.onDelete = $derived(onDelete())

    this.activeTable = $state.raw(false)

    this.hoveredCell = $state.raw(undefined)

    this.activeHandle = $state.raw(undefined)

    this.menu = $state.raw(undefined)
    this.move = $state.raw(undefined)
    this.outline = $state.raw(undefined)
    this.resize = $state.raw(undefined)
    this.interactive = $derived(
      nil(this.move) && nil(this.resize) && nil(this.menu) && nil(this.outline),
    )

    this.pointerDown = $state.raw(false)

    const cursor = $derived.by(() => {
      if (!Browsers.hoverable(this.window)) return undefined

      if (def(this.menu)) {
        return "default"
      } else if (def(this.activeHandle)) {
        const { type, location } = this.activeHandle.handle

        if (type === "table") {
          if (location === "right") {
            return "col-resize"
          } else if (location === "bottom-right") {
            return "nwse-resize"
          } else if (location === "bottom") {
            return "row-resize"
          }
        } else if (type === "border") {
          if (location === "top") {
            return "row-resize"
          } else if (location === "left") {
            return "col-resize"
          } else {
            return `${location}-resize`
          }
        } else if (type === "header") {
          return this.pointerDown
            ? "grabbing"
            : this.activeHandle.state === "hover"
              ? "pointer"
              : undefined
        }
      } else if (this.outline?.outlined ?? false) {
        return "cell"
      } else if (def(this.hoveredCell)) {
        return "text"
      }
      return undefined
    })

    watch([() => this.selectionValue], () => {
      if (this.selectionChanged) {
        this.selectionChanged = false
        return
      }

      if (this.selection.isCell()) {
        this.activeCell = this.selection.cell
        this.anchorCell = this.selection.cell
        this.outlinedSection = TableSection.ofCell(this.selection.cell)
      } else if (this.selection.isHidden()) {
        this.focusTable()

        this.activeCell = undefined
        this.anchorCell = undefined
        this.outlinedSection = undefined
      } else {
        this.activeTable = false
        this.activeCell = undefined
        this.anchorCell = undefined
        this.outlinedSection = undefined
      }
    })

    $effect(() => {
      this.document.body.style.cursor = cursor ?? ""
    })
  }
}
