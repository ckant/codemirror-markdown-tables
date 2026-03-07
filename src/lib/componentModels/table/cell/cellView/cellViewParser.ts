import { DocInput } from "@codemirror/language"
import { Text } from "@codemirror/state"
import { NodeProp, type TreeCursor } from "@lezer/common"
import { getStyleTags, type Highlighter } from "@lezer/highlight"

import * as MarkdownParsers from "#ext/codemirror/lang-markdown/markdownParsers"
import * as Texts from "#ext/codemirror/state/texts"
import * as Cursors from "#ext/lezer/common/cursors"
import * as Arrays from "#ext/stdlib/arrays"
import { def } from "#ext/stdlib/existence"

import type {
  CellViewElement,
  CellViewElementLine,
} from "#componentModels/table/cell/cellView/cellViewElement"

import * as TextSanitizer from "#core/textSanitizer"

const tableCellParser = MarkdownParsers.tableCellLike()

export function parse(sanitizedText: Text, highlighter: Highlighter): CellViewElementLine[] {
  const text = TextSanitizer.unsanitize(sanitizedText)
  const baseClass = highlighter.style([]) ?? undefined

  const elementLines: CellViewElementLine[] = []
  Texts.forEachLine(text, (lineText) => {
    if (Texts.isEmpty(lineText)) {
      elementLines.push([])
      return
    }

    const document = tableCellParser.parse(new DocInput(lineText)).cursor()
    const paragraph = Cursors.firstChild(document)

    const elementLine: CellViewElementLine = []
    pushDescendentElements({
      cursor: paragraph,
      from: 0,
      to: paragraph.to,
      text: lineText,
      classes: def(baseClass) ? baseClass.split(" ") : [],
      highlighter,
      elementLine: elementLine,
    })
    elementLines.push(elementLine)
  })
  return elementLines
}

function pushDescendentElements({
  cursor,
  from,
  to,
  text,
  classes,
  passedClasses = [],
  highlighter,
  textOffset = 0,
  elementLine,
}: {
  cursor: TreeCursor
  from: number
  to: number
  text: Text
  classes: string[]
  passedClasses?: string[]
  highlighter: Highlighter
  textOffset?: number
  elementLine: CellViewElement[]
}): void {
  const hasFirstChild = cursor.firstChild()
  if (!hasFirstChild) {
    const overlayTree = cursor.tree?.prop(NodeProp.mounted)?.tree
    if (def(overlayTree)) {
      const overlayCursor = overlayTree.cursor()
      pushDescendentElements({
        cursor: overlayCursor,
        from: overlayCursor.from,
        to: overlayCursor.to,
        text,
        classes,
        passedClasses,
        highlighter,
        textOffset: textOffset + from,
        elementLine,
      })
    } else {
      elementLine.push({
        textContent: text.sliceString(textOffset + from, textOffset + to),
        classes: Arrays.nilIfEmpty(classes),
      })
    }
    return
  }

  let expectedFrom = from
  do {
    if (cursor.from > expectedFrom) {
      elementLine.push({
        textContent: text.sliceString(textOffset + expectedFrom, textOffset + cursor.from),
        classes: Arrays.nilIfEmpty(classes),
      })
    }
    expectedFrom = cursor.to

    const newTags = getStyleTags(cursor)
    const newClassString = highlighter.style(newTags?.tags ?? [])
    const newClasses = def(newClassString) ? newClassString.split(" ") : []

    pushDescendentElements({
      cursor,
      from: cursor.from,
      to: cursor.to,
      text,
      classes: [...passedClasses, ...newClasses],
      passedClasses:
        (newTags?.inherit ?? false) ? [...passedClasses, ...newClasses] : passedClasses,
      highlighter,
      textOffset,
      elementLine,
    })
  } while (cursor.nextSibling())

  if (expectedFrom < to)
    elementLine.push({
      textContent: text.sliceString(textOffset + expectedFrom, textOffset + to),
      classes: Arrays.nilIfEmpty(classes),
    })

  cursor.parent()
}
