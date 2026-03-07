import type { Join } from "type-fest"

import type { TableEvent } from "#codemirror/transaction/tableEvent"

const baseEvents = [
  "table.correct",
  "table.delete",
  "table.edit",
  "table.focus",
  "table.format",
  "table.navigate",
  "table.select",
] as const
const undoEvents = baseEvents.map((event) => `${event}.undo`) as [
  Join<[(typeof baseEvents)[number], "undo"], ".">,
]
const redoEvents = baseEvents.map((event) => `${event}.redo`) as [
  Join<[(typeof baseEvents)[number], "redo"], ".">,
]
const inverseEvents = new Map([
  ...baseEvents.map((event) => [event, `${event}.undo`]),
  ...baseEvents.map((event) => [`${event}.undo`, `${event}.redo`]),
  ...baseEvents.map((event) => [`${event}.redo`, `${event}.undo`]),
] as [TableEvent, TableEvent][])
const invalidationEvents = new Set<TableEvent>([
  "table.correct.undo",
  "table.delete.undo",
  "table.format.undo",
])
const editHistoryModificationEvents = new Set<TableEvent>(["table.edit.undo", "table.edit.redo"])

export const all = [...baseEvents, ...undoEvents, ...redoEvents] as const

export function invert(event: TableEvent): TableEvent {
  return inverseEvents.get(event)!
}

export function invalidates(event: TableEvent): boolean {
  return invalidationEvents.has(event)
}

export function modifiesEditHistory(event: TableEvent): boolean {
  return editHistoryModificationEvents.has(event)
}
