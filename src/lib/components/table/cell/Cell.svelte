<script lang="ts">
  import { boolAttr } from "runed"
  import type { Snippet } from "svelte"

  import * as HtmlTags from "#ext/dom/htmlTags"
  import { def, nil } from "#ext/stdlib/existence"

  import type { CellMovement } from "#componentActions/move/moveView"

  import * as CellNodes from "#components/table/cell/cellNodes"

  import type { Alignment } from "#core/models/alignment"
  import type { CellLocation } from "#core/models/cellLocation"
  import * as Points from "#core/models/points"

  let {
    location,
    alignment,
    selected,
    position,
    outline,
    movement,
    win,
    children,
  }: {
    location: CellLocation
    alignment: Alignment
    selected: boolean
    position: { top: boolean; left: boolean }
    outline: { top: boolean; right: boolean; bottom: boolean; left: boolean }
    movement: CellMovement | undefined
    win: Window
    children: Snippet
  } = $props()

  const dataBorder = $derived(
    HtmlTags.attributeValuesOrNil(
      def(movement)
        ? movement.border
        : { top: position.top, right: true, bottom: true, left: position.left },
    ),
  )

  const dataOutline = $derived(HtmlTags.attributeValuesOrNil(outline))

  // noinspection JSUnusedGlobalSymbols -- Used in style:transform
  const transform = $derived.by(() => {
    if (nil(movement?.translate)) return undefined
    const { x, y } =
      movement.state === "moving"
        ? Points.roundedByDpr(movement.translate, win)
        : movement.translate
    return `translate3d(${x}px, ${y}px, 0px)`
  })
</script>

{#if position.top}
  <th
    class="tbl-cell tbl-header-cell"
    align={alignment === "none" ? undefined : alignment}
    data-component={CellNodes.component}
    data-row={location.row}
    data-col={location.col}
    data-border={dataBorder}
    data-outline={dataOutline}
    data-selected={boolAttr(selected)}
    data-state={movement?.state}
    style:transform
  >
    {@render children()}
  </th>
{:else}
  <td
    class="tbl-cell tbl-data-cell"
    align={alignment === "none" ? undefined : alignment}
    data-component={CellNodes.component}
    data-row={location.row}
    data-col={location.col}
    data-border={dataBorder}
    data-outline={dataOutline}
    data-selected={boolAttr(selected)}
    data-state={movement?.state}
    style:transform
  >
    {@render children()}
  </td>
{/if}
