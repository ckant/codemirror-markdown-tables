import { Facet, type FacetSpec } from "@codemirror/state"

import * as Arrays from "#ext/stdlib/arrays"

import type { TableConfig } from "#codemirror/config/tableConfig"
import * as TableConfigs from "#codemirror/config/tableConfigs"

const tableConfigFacetSpec: FacetSpec<TableConfig, TableConfig> = {
  combine: (configs) => {
    // There realistically be exactly 1 TableConfig
    return Arrays.isEmpty(configs) ? TableConfigs.of() : Arrays.last(configs)
  },
}

export const tableConfigFacet = Facet.define(tableConfigFacetSpec)
