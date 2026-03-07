<script lang="ts">
  import type { MarkdownConfig } from "@codemirror/lang-markdown"
  import type { Extension } from "@codemirror/state"
  import type { EditorView, KeyBinding } from "@codemirror/view"
  import { boolAttr } from "runed"
  import { onMount } from "svelte"
  import { on } from "svelte/events"

  import { def, nil } from "#ext/stdlib/existence"
  import * as Functions from "#ext/stdlib/functions"
  import { alwaysDef, type number_, typed } from "#ext/webstorm/workarounds"

  import * as CellViewRenderer from "#componentModels/table/cell/cellView/cellViewRenderer"
  import * as Handles from "#componentModels/table/handle/handles"
  import { TableState } from "#componentModels/table/tableState.svelte"

  import * as BodyEvents from "#components/bodyEvents"
  import * as DocumentEvents from "#components/documentEvents"
  import Portal from "#components/portal/Portal.svelte"
  import BlockingOverlay from "#components/table/blockingOverlay/BlockingOverlay.svelte"
  import Cell from "#components/table/cell/Cell.svelte"
  import CellEditor from "#components/table/cell/cellEditor/CellEditor.svelte"
  import * as CellEditorEvents from "#components/table/cell/cellEditor/cellEditorEvents"
  import CellView from "#components/table/cell/cellView/CellView.svelte"
  import Handle from "#components/table/handle/Handle.svelte"
  import Menu from "#components/table/menu/Menu.svelte"
  import MenuItem from "#components/table/menu/menuItem/MenuItem.svelte"
  import * as MenuItemEvents from "#components/table/menu/menuItem/menuItemEvents"
  import MenuItemIcon from "#components/table/menu/menuItem/menuItemIcon/MenuItemIcon.svelte"
  import MenuItemText from "#components/table/menu/menuItem/menuItemText/MenuItemText.svelte"
  import MenuSeparator from "#components/table/menu/menuSeparator/MenuSeparator.svelte"
  import SelectAllOverlay from "#components/table/selectAllOverlay/SelectAllOverlay.svelte"
  import * as TableEvents from "#components/table/tableEvents"
  import * as TableWrapperEvents from "#components/tableWrapperEvents"

  import * as CellLocations from "#core/models/cellLocations"
  import { Table } from "#core/models/table.svelte"
  import { type TableSelection } from "#core/models/tableSelection.svelte"

  let {
    table,
    selection,
    scrollElement,
    rootEditor,
    menuRootElement,
    extensions,
    markdownConfig,
    globalKeyBindings,
    selectionType,
    lineWrapping,
    onUndo,
    onRedo,
    onNavigate,
    onDelete,
  }: {
    table: Table
    selection: TableSelection
    scrollElement: HTMLElement
    rootEditor: EditorView
    menuRootElement: HTMLElement
    extensions: readonly Extension[]
    markdownConfig: Pick<
      MarkdownConfig,
      "extensions" | "completeHTMLTags" | "pasteURLAsLink" | "htmlTagLanguage"
    >
    globalKeyBindings: readonly KeyBinding[]
    selectionType: "codemirror" | "native"
    lineWrapping: "wrap" | "nowrap"
    onUndo: () => void
    onRedo: () => void
    onNavigate: (direction: "before" | "after") => void
    onDelete: () => void
  } = $props()

  const tableState = TableState.of({
    table: () => table,
    selection: () => selection,
    scrollElement: () => scrollElement,
    rootEditor: () => rootEditor,
    menuRootElement: () => menuRootElement,
    extensions: () => extensions,
    markdownConfig: () => markdownConfig,
    globalKeyBindings: () => globalKeyBindings,
    selectionType: () => selectionType,
    lineWrapping: () => lineWrapping,
    onUndo: () => onUndo,
    onRedo: () => onRedo,
    onNavigate: () => onNavigate,
    onDelete: () => onDelete,
  })

  onMount(() => {
    return Functions.each(
      on(tableState.document, "selectionchange", () =>
        DocumentEvents.onselectionchange(tableState),
      ),
      on(tableState.document.body, "pointerdown", () => BodyEvents.onpointerdown(tableState), {
        capture: true,
        passive: true,
      }),
      on(tableState.document.body, "pointerup", () => BodyEvents.onpointerup(tableState), {
        capture: true,
        passive: true,
      }),
      on(tableState.document.body, "pointerleave", () => BodyEvents.onpointerleave(tableState), {
        capture: true,
        passive: true,
      }),
      on(tableState.document.body, "copy", (event) => BodyEvents.oncopy(event, tableState)),
      on(tableState.document.body, "cut", (event) => BodyEvents.oncut(event, tableState)),
      on(tableState.document.body, "paste", (event) => BodyEvents.onpaste(event, tableState)),
    )
  })
</script>

<!-- svelte-ignore a11y_mouse_events_have_key_events, a11y_no_static_element_interactions -->
<div
  class="tbl-table-wrapper"
  bind:this={tableState.wrapperElement}
  data-select-all={boolAttr(tableState.selection.isAll())}
  onmouseover={(event) => TableWrapperEvents.onmouseover(event, tableState)}
  onmouseout={(event) => TableWrapperEvents.onmouseout(event, tableState)}
  onpointerdown={(event) => TableWrapperEvents.onpointerdown(event, tableState)}
  ondragover={(event) => TableWrapperEvents.ondragover(event)}
>
  <!--suppress JSAnnotator -->
  <table
    class="tbl-table"
    role="grid"
    tabindex="-1"
    bind:this={tableState.tableElement}
    onkeydown={(event) => TableEvents.onkeydown(event, tableState)}
    oncopy={(event) => TableEvents.oncopy(event, tableState)}
    oncut={(event) => TableEvents.oncut(event, tableState)}
    onpaste={(event) => TableEvents.onpaste(event, tableState)}
  >
    {#snippet tr(row: number_)}
      <tr class="tbl-table-row">
        {#each tableState.table.colIndices as col (col)}
          {@const location = { row, col }}
          {@const position = {
            top: row === tableState.table.firstRowIndex,
            left: col === tableState.table.firstColIndex,
          }}
          {@const selected =
            tableState.selection.isCell() &&
            CellLocations.equals(location, tableState.selection.cell)}
          <Cell
            {location}
            alignment={tableState.table.alignments[col]}
            {selected}
            {position}
            outline={tableState.outlinedSection?.containsOnEdge(location) ?? {
              top: false,
              right: false,
              bottom: false,
              left: false,
            }}
            movement={tableState.move?.cellMovement(location)}
            win={tableState.window}
          >
            {#each Handles.ofCell(location, position) as handle (handle)}
              <Handle
                of={handle}
                state={tableState.cellHandleState(location, handle)}
                toggle={def(tableState.resize)}
              />
            {/each}
            <CellView hidden={selected}>
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html CellViewRenderer.render(
                tableState.table.cellAt(location),
                tableState.highlighter(location),
              )}
            </CellView>
            {#if selected}
              <!--suppress CommaExpressionJS -- Function bindings not supported by Webstorm Svelte plugin -->
              <CellEditor
                bind:text={
                  () => tableState.table.cellAt(location),
                  (editorText) => tableState.table.setCellAt(location, typed(editorText))
                }
                bind:selection={
                  () => alwaysDef(tableState.selection.cellSection),
                  (editorSelection) => {
                    tableState.selectionValue = { cell: location, section: typed(editorSelection) }
                  }
                }
                selectionType={tableState.selectionType}
                lineWrapping={tableState.lineWrapping}
                extensions={tableState.extensions}
                markdownConfig={tableState.markdownConfig}
                rootEditor={tableState.rootEditor}
                globalKeyBindings={tableState.globalKeyBindings}
                highlighter={tableState.highlighter(location)}
                onbeforeinput={(event) =>
                  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Safe, false positive */
                  CellEditorEvents.onbeforeinput(event, tableState)}
                ondragstart={(event) =>
                  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Safe, false positive */
                  CellEditorEvents.ondragstart(event)}
                onkeydown={(event, editorState) =>
                  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Safe, false positive */
                  CellEditorEvents.onkeydown(event, editorState, tableState)}
                onpaste={(event) =>
                  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Safe, false positive */
                  CellEditorEvents.onpaste(event, tableState)}
              />
            {/if}
          </Cell>
        {/each}
      </tr>
    {/snippet}
    <thead class="tbl-table-head">
      {@render tr(tableState.table.headerRowIndex)}
    </thead>
    {#if tableState.table.hasDataRows()}
      <tbody class="tbl-table-body">
        {#each tableState.table.dataRowIndices as row (row)}
          {@render tr(row)}
        {/each}
      </tbody>
    {/if}
  </table>

  {#if def(tableState.menu)}
    {@const rowOrColumn = tableState.menu.type === "row" ? "row" : "column"}
    <Portal to={tableState.menuRootElement}>
      <!-- eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Safe, false positive -->
      <Menu translate={(element) => alwaysDef(tableState.menu).computeTranslation(element)}>
        {@const { addable, alignable, clearable, duplicatable, moveable, removable, sortable } =
          tableState.menu.capabilities}
        {#if sortable}
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "sort", direction: "ascending" }, tableState)}
          >
            <MenuItemIcon name="sort-ascending" />
            <MenuItemText>Sort by {rowOrColumn} (A-Z)</MenuItemText>
          </MenuItem>
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "sort", direction: "descending" }, tableState)}
          >
            <MenuItemIcon name="sort-descending" />
            <MenuItemText>Sort by {rowOrColumn} (Z-A)</MenuItemText>
          </MenuItem>
          <MenuSeparator />
        {/if}
        {#if alignable}
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "align", alignment: "none" }, tableState)}
          >
            <MenuItemIcon name="align-none" />
            <MenuItemText>Align none</MenuItemText>
          </MenuItem>
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "align", alignment: "left" }, tableState)}
          >
            <MenuItemIcon name="align-left" />
            <MenuItemText>Align left</MenuItemText>
          </MenuItem>
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "align", alignment: "center" }, tableState)}
          >
            <MenuItemIcon name="align-center" />
            <MenuItemText>Align center</MenuItemText>
          </MenuItem>
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "align", alignment: "right" }, tableState)}
          >
            <MenuItemIcon name="align-right" />
            <MenuItemText>Align right</MenuItemText>
          </MenuItem>
          <MenuSeparator />
        {/if}
        {#if addable}
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "add", direction: "before" }, tableState)}
          >
            <MenuItemIcon name="add-before" />
            <MenuItemText
              >Add {rowOrColumn} {rowOrColumn === "row" ? "above" : "before"}</MenuItemText
            >
          </MenuItem>
          <MenuItem
            onclick={() =>
              MenuItemEvents.onclick({ action: "add", direction: "after" }, tableState)}
          >
            <MenuItemIcon name="add-after" />
            <MenuItemText
              >Add {rowOrColumn} {rowOrColumn === "row" ? "below" : "after"}</MenuItemText
            >
          </MenuItem>
          <MenuSeparator />
        {/if}
        {#if moveable !== false}
          {#if moveable === "backward" || moveable === true}
            <MenuItem
              onclick={() =>
                MenuItemEvents.onclick({ action: "move", direction: "backward" }, tableState)}
            >
              <MenuItemIcon name={`move-${rowOrColumn === "row" ? "up" : "left"}`} />
              <MenuItemText>Move {rowOrColumn} {rowOrColumn === "row" ? "up" : "left"}</MenuItemText
              >
            </MenuItem>
          {/if}
          {#if moveable === "forward" || moveable === true}
            <MenuItem
              onclick={() =>
                MenuItemEvents.onclick({ action: "move", direction: "forward" }, tableState)}
            >
              <MenuItemIcon name={`move-${rowOrColumn === "row" ? "down" : "right"}`} />
              <MenuItemText
                >Move {rowOrColumn} {rowOrColumn === "row" ? "down" : "right"}</MenuItemText
              >
            </MenuItem>
          {/if}
          <MenuSeparator />
        {/if}
        {#if duplicatable}
          <MenuItem onclick={() => MenuItemEvents.onclick({ action: "duplicate" }, tableState)}>
            <MenuItemIcon name="duplicate" />
            <MenuItemText>Duplicate {rowOrColumn}</MenuItemText>
          </MenuItem>
        {/if}
        {#if clearable}
          <MenuItem onclick={() => MenuItemEvents.onclick({ action: "clear" }, tableState)}>
            <MenuItemIcon name="clear" />
            <MenuItemText>Clear {rowOrColumn}</MenuItemText>
          </MenuItem>
        {/if}
        {#if removable}
          <MenuItem onclick={() => MenuItemEvents.onclick({ action: "remove" }, tableState)}>
            <MenuItemIcon name="remove" />
            <MenuItemText>Delete {rowOrColumn}</MenuItemText>
          </MenuItem>
        {/if}
      </Menu>
    </Portal>
  {/if}

  {#each Handles.table as handle (handle)}
    <Handle
      of={handle}
      state={Handles.equals(tableState.activeHandle?.handle, handle)
        ? alwaysDef(tableState.activeHandle).state
        : undefined}
    />
  {/each}

  {#if !tableState.interactive && nil(tableState.outline)}
    <BlockingOverlay />
  {/if}

  {#if tableState.selection.isAll()}
    <SelectAllOverlay />
  {/if}
</div>
