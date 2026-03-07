import type { NodeDescription } from "@lezer/common"

/**
 * Functions on lezer syntax nodes.
 */
export function isDocument(node: NodeDescription): boolean {
  return node.name === "Document"
}
