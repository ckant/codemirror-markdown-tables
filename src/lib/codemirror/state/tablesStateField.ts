import {
  type ChangeSpec,
  EditorState,
  type Extension,
  StateField,
  type StateFieldSpec,
  Transaction,
} from "@codemirror/state"
import { type DecorationSet, EditorView } from "@codemirror/view"

import * as Arrays from "#ext/stdlib/arrays"
import { nil } from "#ext/stdlib/existence"
import * as Spans from "#ext/stdlib/spans"

import * as TableDecorations from "#codemirror/decoration/tableDecorations"
import * as TableSpanParser from "#codemirror/parse/tableSpanParser"
import { TableDescription } from "#codemirror/state/tableDescription.svelte"
import * as TableTransactions from "#codemirror/transaction/tableTransactions"

export interface TableState {
  readonly complete: boolean
  readonly tables: readonly TableDescription[]
  readonly formatting: readonly ChangeSpec[]
  readonly decorations: DecorationSet
}

const tablesStateFieldSpec: StateFieldSpec<TableState> = {
  create(state: EditorState): TableState {
    return createTableState(state)
  },

  update(pastTableState: TableState, transaction: Transaction): TableState {
    if (TableTransactions.hasFocusEvent(transaction)) return createTableState(transaction.state)

    if (!transaction.docChanged && nil(transaction.selection) && pastTableState.complete)
      return pastTableState

    const {
      tables: pastTables,
      formatting: pastFormatting,
      decorations: pastDecorations,
    } = pastTableState

    if (!transaction.docChanged && pastTableState.complete) {
      return {
        tables: applyChanges(pastTables, transaction),
        formatting: pastFormatting,
        decorations: pastDecorations.map(transaction.changes),
        complete: true,
      }
    } else if (
      TableTransactions.hasInvalidationEvent(transaction) ||
      hasOutsideTableChange(transaction, pastTables)
    ) {
      return createTableState(transaction.state)
    }

    const pastSpans = applyChanges(pastTables, transaction).map((it) => it.span)
    const {
      complete: currentComplete,
      spans: currentSpans,
      formatting: currentFormatting,
    } = TableSpanParser.parseIncremental(transaction.state, pastSpans)

    if (Arrays.equals(pastSpans, currentSpans, Spans.equals)) {
      return {
        complete: currentComplete,
        tables: pastTables,
        formatting: currentFormatting,
        decorations: pastDecorations.map(transaction.changes),
      }
    } else {
      return createTableState(transaction.state)
    }
  },

  provide(field: StateField<TableState>): Extension {
    return EditorView.decorations.from(field, (tableState) => tableState.decorations)
  },
}

export const tablesStateField = StateField.define(tablesStateFieldSpec)

function createTableState(state: EditorState): TableState {
  const { spans, formatting, complete } = TableSpanParser.parseFull(state)
  const { doc, selection } = state
  const tables = spans.map((span) => TableDescription.of({ span, doc, selection }))

  return { complete, tables, formatting, decorations: TableDecorations.of(tables, state) }
}

function hasOutsideTableChange(
  transaction: Transaction,
  tables: readonly TableDescription[],
): boolean {
  return (
    !TableTransactions.hasTableEvent(transaction) &&
    tables.some((table) => transaction.changes.touchesRange(table.from, table.to) !== false)
  )
}

function applyChanges(
  tables: readonly TableDescription[],
  transaction: Transaction,
): readonly TableDescription[] {
  return Arrays.onEach(tables, (table) => table.applyTransaction(transaction))
}
