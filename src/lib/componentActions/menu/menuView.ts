import type { Alignment } from "#core/models/alignment"
import type { Point } from "#core/models/point"
import type { RowOrCol } from "#core/models/rowOrCol"

export interface MenuView {
  readonly type: RowOrCol
  readonly capabilities: {
    readonly addable: boolean
    readonly alignable: boolean
    readonly clearable: boolean
    readonly duplicatable: boolean
    readonly moveable: "backward" | "forward" | boolean
    readonly removable: boolean
    readonly sortable: boolean
  }
  readonly clickAdd: (direction: "before" | "after") => void
  readonly clickAlign: (alignment: Alignment) => void
  readonly clickClear: () => void
  readonly clickDuplicate: () => void
  readonly clickMove: (direction: "backward" | "forward") => void
  readonly clickRemove: () => void
  readonly clickSort: (direction: "ascending" | "descending") => void
  readonly computeTranslation: (element: HTMLElement) => Promise<Point>
}
