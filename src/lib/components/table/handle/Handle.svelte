<script lang="ts">
  import { boolAttr } from "runed"

  import type { Handle } from "#componentModels/table/handle/handle"

  import * as HandleNodes from "#components/table/handle/handleNodes"

  let {
    of,
    state,
    toggle = false,
  }: { of: Handle; state: "active" | "hover" | undefined; toggle?: boolean } = $props()

  const handleToGrip: Partial<
    Record<Handle["type"], Partial<Record<Handle["location"], "vertical" | "horizontal">>>
  > = {
    table: { right: "vertical", bottom: "horizontal" },
    header: { row: "vertical", col: "horizontal" },
  }

  const grip = $derived(handleToGrip[of.type]?.[of.location])
</script>

<div
  class="tbl-handle"
  data-component={HandleNodes.component}
  data-type={of.type}
  data-location={of.location}
  data-active={boolAttr(state === "active")}
  data-hover={boolAttr(state === "hover")}
  data-toggle={boolAttr(toggle)}
  role="button"
  aria-hidden="true"
  style:opacity="var(--tbl-handle-opacity, 0)"
>
  {#if grip === "horizontal"}
    <svg
      class="tbl-handle-grip"
      width="15"
      height="3"
      fill="currentColor"
      viewBox="0 0 15 3"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="1.5" cy="1.5" r="1.5" />
      <circle cx="7.5" cy="1.5" r="1.5" />
      <circle cx="13.5" cy="1.5" r="1.5" />
    </svg>
  {:else if grip === "vertical"}
    <svg
      class="tbl-handle-grip"
      width="3"
      height="15"
      fill="currentColor"
      viewBox="0 0 3 15"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cy="1.5" cx="1.5" r="1.5" />
      <circle cy="7.5" cx="1.5" r="1.5" />
      <circle cy="13.5" cx="1.5" r="1.5" />
    </svg>
  {/if}
</div>
