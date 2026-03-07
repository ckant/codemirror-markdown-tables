import * as Numbers from "#ext/dom/numbers"

import type { Point } from "#core/models/point"

export function roundedByDpr({ x, y }: Point, win: Window): Point {
  return { x: Numbers.roundByDpr(x, win), y: Numbers.roundByDpr(y, win) }
}
