import type { Rect, Tooltip, TooltipView } from "@codemirror/view"

import * as Nodes from "#ext/dom/nodes"

const uncoordinated: Rect = { top: 0, right: 0, bottom: 0, left: 0 }

export const menuTooltip: Tooltip = {
  pos: 0,
  clip: false,

  create(view): TooltipView {
    const div = Nodes.doc(view.dom).createElement("div")
    div.className = "tbl-menu-tooltip"

    return { dom: div, overlap: true, resize: false, getCoords: () => uncoordinated }
  },
}
