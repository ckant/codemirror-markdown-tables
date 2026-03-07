import { StateEffect } from "@codemirror/state"

import { type TableEvent } from "#codemirror/transaction/tableEvent"
import * as TableEvents from "#codemirror/transaction/tableEvents"

export const type = StateEffect.define<TableEvent>()

const tableEventToEffect = new Map(TableEvents.all.map((event) => [event, type.of(event)]))

export function of(tableEvent: TableEvent): StateEffect<TableEvent> {
  return tableEventToEffect.get(tableEvent)!
}
