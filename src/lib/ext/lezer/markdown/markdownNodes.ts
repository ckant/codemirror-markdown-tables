import type { NodeDescription } from "@lezer/common"

export function isTable(node: NodeDescription): boolean {
  return node.name === "Table"
}

export function isTableDelimiter(node: NodeDescription): boolean {
  return node.name === "TableDelimiter"
}
