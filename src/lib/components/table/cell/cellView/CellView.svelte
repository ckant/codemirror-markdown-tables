<script lang="ts">
  import { boolAttr } from "runed"
  import type { Snippet } from "svelte"

  import * as CellViewNodes from "#components/table/cell/cellView/cellViewNodes"

  const { hidden, children }: { hidden: boolean; children: Snippet } = $props()
</script>

<div
  class="tbl-cell-view"
  contenteditable
  tabindex="-1"
  data-component={CellViewNodes.component}
  data-hidden={boolAttr(hidden)}
>
  {@render children()}
</div>
