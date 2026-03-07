<script lang="ts">
  import { type Snippet } from "svelte"

  let { onclick, children }: { onclick: (event: MouseEvent) => void; children: Snippet } = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="tbl-menu-item" role="menuitem" {onclick} tabindex="-1">
  {@render children()}
</div>
