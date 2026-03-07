import type { CellLocation } from "#core/models/cellLocation"
import type { Point } from "#core/models/point"

export interface MoveView {
  cellMovement(cellLocation: CellLocation): CellMovement
}

export interface CellMovement {
  readonly border: { top: boolean; right: boolean; bottom: boolean; left: boolean }
  readonly state: "moving" | "shiftable"
  readonly translate: Point | undefined
}
