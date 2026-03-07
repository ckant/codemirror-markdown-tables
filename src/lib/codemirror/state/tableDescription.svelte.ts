import type { EditorSelection, Text, Transaction } from "@codemirror/state"

import * as Numbers from "#ext/stdlib/numbers"
import { type Span } from "#ext/stdlib/span"
import * as Spans from "#ext/stdlib/spans"

import * as TableTransactions from "#codemirror/transaction/tableTransactions"

import type { CellSelection } from "#core/models/cellSelection"
import { Table } from "#core/models/table.svelte"
import { TableSelection } from "#core/models/tableSelection.svelte"
import { type TableSelectionValue } from "#core/models/tableSelectionValue"
import * as TableSelectionValues from "#core/models/tableSelectionValues"

export interface TableDescriptionProps {
  readonly span: Span
  readonly doc: Text
  readonly selection: EditorSelection
}

export class TableDescription {
  private _span: Span

  readonly table: Table
  readonly selection: TableSelection

  private _editorTableText: Text
  private _editorSelectionValue: TableSelectionValue

  get editorTableText(): Text {
    return this._editorTableText
  }

  get editorSelectionValue(): TableSelectionValue {
    return this._editorSelectionValue
  }

  get span(): Span {
    return this._span
  }

  private set span(span: Span) {
    this._span = span
  }

  get from(): number {
    return this._span.from
  }

  get to(): number {
    return this._span.to
  }

  get isValid(): boolean {
    return this.from < this.to
  }

  containsSelection(): boolean {
    return this.selection.isCell() || this.selection.isHidden()
  }

  markSynchronized(): void {
    this._editorTableText = this.table.text
    this._editorSelectionValue = this.selection.value
  }

  applyTransaction(transaction: Transaction): void {
    if (transaction.docChanged) {
      this.applyStateChange(transaction)
    } else {
      this.applySelectionChange(transaction)
    }
  }

  private applyStateChange(transaction: Transaction): void {
    const { from: oldFrom, to: oldTo } = this.span

    this.span = {
      from: transaction.changes.mapPos(this.from, 1),
      to: transaction.changes.mapPos(this.to),
    }

    if (!this.isValid) return

    this.applySelectionChange(transaction)

    if (TableTransactions.hasEditHistoryModificationEvent(transaction)) {
      const textChanged = transaction.changes.touchesRange(oldFrom, oldTo) !== false
      if (textChanged) {
        const newText = transaction.newDoc.slice(this.from, this.to)
        this.table.reset(newText)
        this._editorTableText = newText
      }
    }
  }

  private applySelectionChange(transaction: Transaction): void {
    if (!this.isValid) return

    const newSelection = this.computeSelection(transaction.newSelection)
    const selectionChanged = !TableSelectionValues.equals(this.selection.value, newSelection)
    if (selectionChanged) {
      this.selection.value = newSelection
      this._editorSelectionValue = newSelection
    }
  }

  private computeSelection(
    editorSelection: EditorSelection,
  ): CellSelection | "all" | "hidden" | "none" {
    if (
      editorSelection.main.head === this.from + 1 &&
      editorSelection.main.anchor === this.from + 1
    ) {
      return "hidden"
    } else if (Spans.containsSpan({ needle: this.span, haystack: editorSelection.main })) {
      return "all"
    } else if (Spans.containsSpan({ needle: editorSelection.main, haystack: this.span })) {
      const cell = this.table.closestCellAtPosition(editorSelection.main.anchor - this.from)
      const { from, to } = this.table.cellSpan(cell)

      return {
        cell,
        section: {
          anchor:
            Numbers.clamp(editorSelection.main.anchor - this.from, { min: from, max: to }) - from,
          head: Numbers.clamp(editorSelection.main.head - this.from, { min: from, max: to }) - from,
        },
      }
    } else {
      return "none"
    }
  }

  static of(props: TableDescriptionProps): TableDescription {
    return new TableDescription(props)
  }

  private constructor({ span, doc, selection }: TableDescriptionProps) {
    this._span = span
    this.table = Table.of(doc.slice(this.from, this.to))
    this.selection = TableSelection.of(this.computeSelection(selection))

    this._editorTableText = $state(this.table.text)
    this._editorSelectionValue = $state(this.selection.value)
  }
}
