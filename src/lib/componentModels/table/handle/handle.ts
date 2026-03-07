import type { RowOrCol } from "#core/models/rowOrCol"

export type Handle = TableHandle | CellHandle
export type CellHandle = HeaderHandle | BorderHandle

export interface TableHandle {
  readonly type: "table"
  readonly location: "right" | "bottom-right" | "bottom"
}

export interface HeaderHandle {
  readonly type: "header"
  readonly location: RowOrCol
  readonly index: number
}

export interface BorderHandle {
  readonly type: "border"
  readonly location: "top" | "left" | RowOrCol
  readonly index: number
}
