<script lang="ts">
  import { onMount, type Snippet } from "svelte"

  import { def } from "#ext/stdlib/existence"

  import type { Point } from "#core/models/point"

  let {
    translate,
    children,
  }: { translate: (element: HTMLElement) => Promise<Point>; children: Snippet } = $props()

  let element: HTMLElement
  let translation = $state<Point | undefined>()

  onMount(() => {
    void translate(element).then((value) => (translation = value))
  })
</script>

<div
  class="tbl-menu"
  bind:this={element}
  style:visibility={def(translation) ? undefined : "hidden"}
  style:transform={def(translation)
    ? `translate3d(${translation.x}px, ${translation.y}px, 0px)`
    : undefined}
>
  {@render children()}
</div>
