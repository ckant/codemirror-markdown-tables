import type { Text } from "@codemirror/state"
import type { Highlighter } from "@lezer/highlight"

import * as HtmlTags from "#ext/dom/htmlTags"
import { def } from "#ext/stdlib/existence"

import type {
  CellViewElement,
  CellViewElementLine,
} from "#componentModels/table/cell/cellView/cellViewElement"
import * as CellViewParser from "#componentModels/table/cell/cellView/cellViewParser"

export function render(cell: Text, highlighter: Highlighter): string {
  return toHtml(CellViewParser.parse(cell, highlighter))
}

function toHtml(elementLines: CellViewElementLine[]): string {
  return elementLines
    .map((elementLine) => elementLine.map(elementToHtml).join(""))
    .join("<span data-br>\n</span>")
}

function elementToHtml({ textContent, classes }: CellViewElement): string {
  return def(classes)
    ? `<span class="${classes.join(" ")}">${HtmlTags.escapeContent(textContent)}</span>`
    : HtmlTags.escapeContent(textContent)
}
