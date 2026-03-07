import type { MarkdownConfig } from "@codemirror/lang-markdown"
import type { Extension } from "@codemirror/state"
import type { KeyBinding } from "@codemirror/view"

import { TableStyle } from "#codemirror/config/tableStyle"
import { TableTheme } from "#codemirror/config/tableTheme"

export type CellEditorMarkdownConfig = Pick<
  MarkdownConfig,
  "extensions" | "completeHTMLTags" | "pasteURLAsLink" | "htmlTagLanguage"
>

export interface TableConfig {
  readonly theme: TableTheme | { readonly light: TableTheme; readonly dark: TableTheme }
  readonly style: TableStyle
  readonly selectionType: "codemirror" | "native"
  readonly lineWrapping: "wrap" | "nowrap"
  readonly handlePosition: "outside" | "inside"
  readonly markdownConfig: CellEditorMarkdownConfig
  readonly extensions: readonly Extension[]
  readonly globalKeyBindings: readonly KeyBinding[]
}
