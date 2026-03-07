import { StateField, type StateFieldSpec } from "@codemirror/state"
import { EditorView } from "@codemirror/view"

export interface ViewState {
  view: EditorView | undefined
}

const viewStateFieldSpec: StateFieldSpec<ViewState> = {
  create(): ViewState {
    return { view: undefined }
  },

  update(viewState: ViewState): ViewState {
    return viewState
  },
}

export const viewStateField = StateField.define(viewStateFieldSpec)
