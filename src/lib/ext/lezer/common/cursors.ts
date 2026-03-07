import type { Tree, TreeCursor } from "@lezer/common"

import * as Nodes from "#ext/lezer/common/nodes"

export function firstChild(cursor: TreeCursor): TreeCursor {
  cursor.firstChild()
  return cursor
}

export function nextSibling(cursor: TreeCursor): TreeCursor {
  cursor.nextSibling()
  return cursor
}

export function mapEachSibling<T>(cursor: TreeCursor, fn: (cursor: TreeCursor) => T): T[] {
  const results: T[] = []
  while (cursor.nextSibling()) {
    results.push(fn(cursor))
  }
  return results
}

export function forEachDocumentChild(tree: Tree, fn: (cursor: TreeCursor) => void): void {
  const cursor = tree.cursor()
  for (let hasNext = cursor.next(true); hasNext; hasNext = cursor.next(Nodes.isDocument(cursor))) {
    fn(cursor)
  }
}
