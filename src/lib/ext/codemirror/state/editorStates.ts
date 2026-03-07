import { redoDepth, undoDepth } from "@codemirror/commands"
import type { EditorState } from "@codemirror/state"

export function hasHistory(state: EditorState): boolean {
  return undoDepth(state) > 0 || redoDepth(state) > 0
}
