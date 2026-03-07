import * as Numbers from "#ext/stdlib/numbers"

export function roundByDpr(value: number, win: Window): number {
  const dpr = win.devicePixelRatio
  return Numbers.round(value * dpr) / dpr
}
