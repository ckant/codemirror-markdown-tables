import { Transaction } from "@codemirror/state"

import { def } from "#ext/stdlib/existence"

import * as TableAnnotation from "#codemirror/transaction/tableAnnotation"
import { type TableEvent } from "#codemirror/transaction/tableEvent"
import * as TableEvents from "#codemirror/transaction/tableEvents"

export function hasTableEvent(transaction: Transaction): boolean {
  return def(getTableEvent(transaction))
}

export function hasInvalidationEvent(transaction: Transaction): boolean {
  const tableEvent = getTableEvent(transaction)
  return def(tableEvent) && TableEvents.invalidates(tableEvent)
}

export function hasFocusEvent(transaction: Transaction): boolean {
  const tableEvent = getTableEvent(transaction)
  return def(tableEvent) && tableEvent === "table.focus"
}

export function hasEditHistoryModificationEvent(transaction: Transaction): boolean {
  const tableEvent = getTableEvent(transaction)
  return def(tableEvent) && TableEvents.modifiesEditHistory(tableEvent)
}

function getTableEvent(transaction: Transaction): TableEvent | undefined {
  return transaction.annotation(TableAnnotation.type)
}
