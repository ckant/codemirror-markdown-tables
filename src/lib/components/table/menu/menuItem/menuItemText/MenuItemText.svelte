<script lang="ts">
  import { type Snippet } from "svelte"

  let { children }: { children: Snippet } = $props()
</script>

<div class="tbl-menu-item-text">
  {@render children()}
</div>
