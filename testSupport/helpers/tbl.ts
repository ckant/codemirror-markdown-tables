import { InternalTable, Table } from "#core/models/table.svelte"

import { txt } from "./txt"

export function tbl(arr: TemplateStringsArray): InternalTable {
  return Table.of(txt(arr))._asInternal()
}
