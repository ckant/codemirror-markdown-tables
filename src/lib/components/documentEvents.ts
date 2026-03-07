import * as Texts from "#ext/codemirror/state/texts"
import * as Nodes from "#ext/dom/nodes"
import * as DomSelections from "#ext/dom/selections"
import { nil } from "#ext/stdlib/existence"

import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

import * as CellNodes from "#components/table/cell/cellNodes"
import * as CellViewNodes from "#components/table/cell/cellView/cellViewNodes"

import * as CellLocations from "#core/models/cellLocations"
import { type Selection } from "#core/models/selection"
import * as SelectionSanitizer from "#core/selectionSanitizer"

export function onselectionchange(tableState: TableState): void {
  if (nil(tableState.tableElement) || DomSelections.isNone(tableState.document)) return

  const selectedNode = DomSelections.startNode(tableState.document)
  if (nil(selectedNode) || !Nodes.contains(tableState.tableElement, selectedNode)) return

  const cellNode = CellNodes.ancestorCell(selectedNode)
  if (nil(cellNode)) return

  const cellLocation = CellNodes.cellLocation(cellNode)!
  if (
    tableState.selection.isCell() &&
    CellLocations.equals(tableState.selection.cell, cellLocation)
  )
    return

  tableState.activeTable = false
  tableState.selectionValue = {
    cell: cellLocation,
    section: extractActualSelection(tableState.document, selectedNode),
  }
  tableState.activeCell = cellLocation
  tableState.anchorCell = cellLocation
  tableState.outlinedSection = TableSection.ofCell(cellLocation)
}

function extractActualSelection(ownerDocument: Document, selectedNode: Node): Selection {
  const cellViewNode = CellViewNodes.ancestorCellView(selectedNode)!

  const textBeforeNode =
    Nodes.textBetween({
      ancestor: cellViewNode,
      descendent: selectedNode,
      getText: (node) => (Nodes.isBreak(node) ? "\n" : (node.textContent ?? "")),
    }) ?? ""
  const nodeTextBeforeCursor = (selectedNode.textContent ?? "").slice(
    0,
    DomSelections.start(ownerDocument),
  )
  const allTextBeforeCursor = Texts.ofString(`${textBeforeNode}${nodeTextBeforeCursor}`)

  const displayCursorPosition = textBeforeNode.length + DomSelections.start(ownerDocument)!
  const displayCursor = { anchor: displayCursorPosition, head: displayCursorPosition }

  return SelectionSanitizer.sanitize(displayCursor, allTextBeforeCursor, { trim: false })
}
