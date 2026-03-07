import type { EditorView, PluginValue } from "@codemirror/view"

import { viewStateField } from "#codemirror/state/viewStateField"

export class ViewStateFieldPlugin implements PluginValue {
  static of(view: EditorView): ViewStateFieldPlugin {
    view.state.field(viewStateField).view = view
    return new ViewStateFieldPlugin()
  }
  private constructor() {
    // Empty
  }
}
