import { Transaction } from "@codemirror/state"

const userHistoryEvents = ["undo", "redo", "select.undo", "select.redo"] as const

export function isHistoryEvent(transaction: Transaction): boolean {
  return userHistoryEvents.some((event) => transaction.isUserEvent(event))
}

export function isSearchSelectEvent(transaction: Transaction): boolean {
  return isExactUserEvent(transaction, "select.search")
}

export function isCursorSelectEvent(transaction: Transaction): boolean {
  return isExactUserEvent(transaction, "select")
}

export function isForwardDeleteEvent(transaction: Transaction): boolean {
  return transaction.isUserEvent("delete.forward")
}

export function isBackwardDeleteEvent(transaction: Transaction): boolean {
  return transaction.isUserEvent("delete.backward")
}

function isExactUserEvent(transaction: Transaction, event: string): boolean {
  return transaction.annotation(Transaction.userEvent) === event
}
