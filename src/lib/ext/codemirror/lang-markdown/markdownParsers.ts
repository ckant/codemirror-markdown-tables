import { markdown } from "@codemirror/lang-markdown"
import type { Parser } from "@lezer/common"
import { Table } from "@lezer/markdown"

import * as MarkdownConfigs from "#ext/lezer/markdown/markdownConfigs"

export function tableCellLike(): Parser {
  return markdown({
    extensions: MarkdownConfigs.tableCellLike,
    completeHTMLTags: false,
    addKeymap: false,
  }).language.parser
}

export function table(): Parser {
  return markdown({ extensions: Table, completeHTMLTags: false, addKeymap: false }).language.parser
}
