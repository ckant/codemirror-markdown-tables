import { markdown, type MarkdownConfig } from "@codemirror/lang-markdown"
import { syntaxHighlighting } from "@codemirror/language"
import { type Extension, Prec, Text, type Transaction } from "@codemirror/state"
import {
  type DOMEventHandlers,
  drawSelection,
  EditorView,
  type KeyBinding,
  keymap,
} from "@codemirror/view"
import type { Highlighter } from "@lezer/highlight"

import * as Css from "#ext/dom/css"
import * as MarkdownConfigs from "#ext/lezer/markdown/markdownConfigs"
import { def } from "#ext/stdlib/existence"

import type { Selection } from "#core/models/selection"

export function of({
  doc,
  selection,
  parent,
  extensions,
  markdownConfig,
  selectionType,
  lineWrapping,
  globalKeyBindings,
  rootEditor,
  highlighter,
  onChange,
  eventHandlers,
}: {
  doc: Text
  selection: Selection
  parent: Element
  extensions: readonly Extension[]
  markdownConfig: Pick<
    MarkdownConfig,
    "extensions" | "completeHTMLTags" | "pasteURLAsLink" | "htmlTagLanguage"
  >
  selectionType: "native" | "codemirror"
  lineWrapping: "wrap" | "nowrap"
  globalKeyBindings: readonly KeyBinding[]
  rootEditor: EditorView
  highlighter: Highlighter
  onChange: (transaction: Transaction) => void
  eventHandlers: DOMEventHandlers<unknown>
}): EditorView {
  return new EditorView({
    doc,
    selection,
    parent,
    extensions: [
      extensions,
      Prec.lowest([
        EditorView.editorAttributes.of((view) => {
          const rootClasses = new Set(Css.splitClasses(rootEditor.themeClasses))
          const cellEditorClasses = new Set(Css.splitClasses(view.themeClasses))

          const additionalClasses = rootClasses.difference(cellEditorClasses)

          return { class: [...additionalClasses].join(" ") }
        }),
        keymap.of([
          ...globalKeyBindings.map((keyBinding) => ({
            ...keyBinding,
            run: def(keyBinding.run) ? () => keyBinding.run!(rootEditor) : undefined,
            shift: def(keyBinding.shift) ? () => keyBinding.shift!(rootEditor) : undefined,
          })),
        ]),
        selectionType === "codemirror" ? drawSelection() : [],
        syntaxHighlighting(highlighter),
        markdown({
          extensions: [MarkdownConfigs.tableCellLike, markdownConfig.extensions ?? []],
          addKeymap: false,
          completeHTMLTags: markdownConfig.completeHTMLTags,
          pasteURLAsLink: markdownConfig.pasteURLAsLink,
          htmlTagLanguage: markdownConfig.htmlTagLanguage,
        }),
        EditorView.domEventObservers(eventHandlers),
        lineWrapping === "wrap" ? EditorView.lineWrapping : [],
      ]),
    ],
    dispatchTransactions: (transactions, view) => {
      view.update(transactions)
      transactions.forEach(onChange)
    },
  })
}
