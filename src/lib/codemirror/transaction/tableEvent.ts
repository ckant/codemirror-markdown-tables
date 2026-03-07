import * as TableEvents from "#codemirror/transaction/tableEvents"

export type TableEvent = (typeof TableEvents.all)[number]
