import { EditorSelection } from "@codemirror/state"

/**
 * Returns true if the {@link selection} has a single range.
 */
export function isSingle(selection: EditorSelection): boolean {
  return selection.ranges.length === 1
}

/**
 * Returns true if the {@link selection} has a single, empty range (it represents a cursor).
 */
export function isSingleCursor(selection: EditorSelection): boolean {
  return isSingle(selection) && selection.main.empty
}

/**
 * Returns an {@link EditorSelection} with a single cursor.
 */
export function singleCursor({
  pos,
  assoc,
  bidiLevel,
  goalColumn,
}: {
  pos: number
  assoc?: number
  bidiLevel?: number | null
  goalColumn?: number
}): EditorSelection {
  return EditorSelection.create([
    EditorSelection.cursor(pos, assoc, bidiLevel as number | undefined, goalColumn),
  ])
}
