import * as Assert from "#ext/stdlib/assert"
import { def } from "#ext/stdlib/existence"

/**
 * Returns {@link num} clamped between {@link min} and/or {@link max}.
 *
 * If both {@link min} and {@link max} are specified, {@link min} must be less than or equal to {@link max}.
 */
export function clamp(num: number, { min }: { min: number }): number
export function clamp(num: number, { max }: { max: number }): number
export function clamp(num: number, { min, max }: { min: number; max: number }): number
export function clamp(num: number, { min, max }: { min?: number; max?: number }): number {
  if (def(min) && def(max)) Assert.increasingOrEqual(min, max)

  if (def(min) && num <= min) return min
  if (def(max) && num >= max) return max
  return num
}

/**
 * Alias for {@link Math#abs}.
 */
export const abs = Math.abs

/**
 * Alias for {@link Math#ceil}.
 */
export const ceil = Math.ceil

/**
 * Alias for {@link Math#floor}.
 */
export const floor = Math.floor

/**
 * Alias for {@link Math#max}.
 */
export const max = Math.max

/**
 * Alias for {@link Math#min}.
 */
export const min = Math.min

/**
 * Alias for {@link Math#round}.
 */
export const round = Math.round

/**
 * Alias for {@link Math#trunc}.
 */
export const trunc = Math.trunc

/**
 * Alias for {@link parseInt}.
 */
export const parseInt = globalThis.parseInt
