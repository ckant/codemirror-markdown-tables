import { EditorSelection, type SelectionRange } from "@codemirror/state"

export function copy(
  source: SelectionRange,
  {
    anchor,
    head,
    goalColumn,
    bidiLevel,
  }: { anchor?: number; head?: number; goalColumn?: number; bidiLevel?: number } = {},
): SelectionRange {
  return EditorSelection.range(
    anchor ?? source.anchor,
    head ?? source.head,
    goalColumn ?? source.goalColumn,
    bidiLevel ?? source.bidiLevel ?? undefined,
  )
}
