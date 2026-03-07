import { Annotation } from "@codemirror/state"

import { type TableEvent } from "#codemirror/transaction/tableEvent"
import * as TableEvents from "#codemirror/transaction/tableEvents"

export const type = Annotation.define<TableEvent>()

const tableEventToAnnotation = new Map(
  TableEvents.all.map((tableEvent) => [tableEvent, type.of(tableEvent)]),
)

export function of(tableEvent: TableEvent): Annotation<TableEvent> {
  return tableEventToAnnotation.get(tableEvent)!
}
