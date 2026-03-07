import { type MarkdownConfig } from "@lezer/markdown"

const blockParsers = [
  "ATXHeading",
  "Blockquote",
  "BulletList",
  "FencedCode",
  "HTMLBlock",
  "HorizontalRule",
  "IndentedCode",
  "LinkReference",
  "OrderedList",
  "SetextHeading",
] as const
const removeBlockParsers: MarkdownConfig = { remove: blockParsers }

export const tableCellLike: MarkdownConfig[] = [removeBlockParsers]
