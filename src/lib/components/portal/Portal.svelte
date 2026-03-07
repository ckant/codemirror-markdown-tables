<script lang="ts">
  import { getAllContexts, mount, onMount, type Snippet, unmount } from "svelte"

  import PortalTarget from "#components/portal/PortalTarget.svelte"

  const { to, children }: { to: HTMLElement; children: Snippet } = $props()

  onMount(() => {
    const portalTarget = mount(PortalTarget, {
      target: to,
      context: getAllContexts(),
      props: { children },
    })
    return () => void unmount(portalTarget)
  })
</script>
