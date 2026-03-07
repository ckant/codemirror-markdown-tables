import type { InvertedEffectsSpec } from "@codemirror/commands"

import { def } from "#ext/stdlib/existence"

import * as TableAnnotation from "#codemirror/transaction/tableAnnotation"
import * as TableEffect from "#codemirror/transaction/tableEffect"
import * as TableEvents from "#codemirror/transaction/tableEvents"

export const tableInvertedEffectsSpec: InvertedEffectsSpec = (transaction) => {
  const tableEvent = transaction.annotation(TableAnnotation.type)
  return def(tableEvent) ? [TableEffect.of(TableEvents.invert(tableEvent))] : []
}
