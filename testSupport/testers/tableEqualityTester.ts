import { InternalTable } from "#core/models/table.svelte"

import * as Testers from "./testers"

export const TableEqualityTester = Testers.ofEquality({
  isInstance: (value: unknown) => value instanceof InternalTable,
  isEqual: (first, second) => first.equals(second),
})
