<script lang="ts">
  import type { MarkdownConfig } from "@codemirror/lang-markdown"
  import { EditorState, type Extension, type Text, Transaction } from "@codemirror/state"
  import { EditorView, type KeyBinding } from "@codemirror/view"
  import { type Highlighter } from "@lezer/highlight"
  import { watch } from "runed"
  import { onMount } from "svelte"

  import * as Panels from "#ext/codemirror/view/panels"
  import { def } from "#ext/stdlib/existence"

  import * as CellEditor from "#componentModels/table/cell/cellEditor/cellEditor"

  import { type Selection } from "#core/models/selection"
  import * as Selections from "#core/models/selections"
  import * as SelectionSanitizer from "#core/selectionSanitizer"
  import * as TextSanitizer from "#core/textSanitizer"

  let {
    text = $bindable(),
    selection = $bindable(),
    selectionType,
    lineWrapping,
    extensions,
    rootEditor,
    globalKeyBindings,
    markdownConfig,
    highlighter,
    onbeforeinput,
    ondragstart,
    onkeydown,
    onpaste,
  }: {
    text: Text
    selection: Selection
    selectionType: "native" | "codemirror"
    lineWrapping: "wrap" | "nowrap"
    extensions: readonly Extension[]
    rootEditor: EditorView
    globalKeyBindings: readonly KeyBinding[]
    markdownConfig: Pick<
      MarkdownConfig,
      "extensions" | "completeHTMLTags" | "pasteURLAsLink" | "htmlTagLanguage"
    >
    highlighter: Highlighter
    onbeforeinput: (event: InputEvent) => void
    ondragstart: (event: DragEvent) => void
    onkeydown: (event: KeyboardEvent, state: EditorState) => void
    onpaste: (event: ClipboardEvent) => void
  } = $props()

  let element: HTMLDivElement
  let view: EditorView

  let lastUpdateFromProp = false
  let lastUpdateFromState = false

  function updateFromStateIfChanged(transaction: Transaction): void {
    const { docChanged, newDoc, selection: newDocSelection } = transaction
    if (lastUpdateFromProp) return

    const docSelectionChanged = def(newDocSelection)
    const stateChanged = docChanged || docSelectionChanged
    if (!stateChanged) return

    if (docChanged) {
      const newText = TextSanitizer.sanitize(newDoc, { trim: true })
      if (!newText.eq(text)) {
        text = newText
        lastUpdateFromState = true
      }
    }

    if (docSelectionChanged) {
      const { head, anchor } = newDocSelection.main
      const newSelection = SelectionSanitizer.sanitize({ head, anchor }, newDoc, { trim: true })
      if (!Selections.equals(newSelection, selection)) {
        selection = newSelection
        lastUpdateFromState = true
      }
    }
  }

  watch(
    [() => text, () => selection],
    () => {
      if (lastUpdateFromState) {
        lastUpdateFromState = false
        return
      }

      lastUpdateFromProp = true
      view.dispatch({
        changes: view.state.changes({
          from: 0,
          to: view.state.doc.length,
          insert: TextSanitizer.unsanitize(text),
        }),
        selection: SelectionSanitizer.unsanitize(selection, text),
      })
      lastUpdateFromProp = false
    },
    { lazy: true },
  )

  onMount(() => {
    view = CellEditor.of({
      doc: TextSanitizer.unsanitize(text),
      selection: SelectionSanitizer.unsanitize(selection, text),
      parent: element,
      selectionType,
      lineWrapping,
      extensions,
      markdownConfig,
      globalKeyBindings,
      rootEditor,
      highlighter,
      onChange: updateFromStateIfChanged,
      eventHandlers: {
        beforeinput: onbeforeinput,
        dragstart: ondragstart,
        keydown: (event, { state }) => onkeydown(event, state),
        paste: onpaste,
      },
    })

    if (!Panels.hasFocus(view)) view.focus()
    return () => view.destroy()
  })
</script>

<div class="tbl-cell-editor" bind:this={element}></div>
