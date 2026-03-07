import { D } from "@mobily/ts-belt"
import type { SetNonNullable } from "type-fest"

import { def } from "#ext/stdlib/existence"

/**
 * Returns a copy of {@link obj} with `null` and `undefined` properties filtered out.
 */
export function compact<T extends object>(obj: T): SetNonNullable<T> {
  return D.filter(obj, (it) => def(it)) as SetNonNullable<T>
}

/**
 * Calls {@link fn} for each {@link property} and {@link value} in {@link obj}.
 */
export function forEach<T extends Record<string, unknown>>(
  obj: T,
  fn: (property: keyof T, value: T[keyof T]) => void,
): void {
  for (const [property, value] of Object.entries(obj)) {
    fn(property, value as T[keyof T])
  }
}

/**
 * Maps {@link fn} for each {@link property} and {@link value} in {@link obj}.
 */
export function map<T extends Record<string, unknown>, R>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => R,
): R[] {
  const results = new Array<R>()
  for (const [key, value] of Object.entries(obj)) {
    results.push(fn(key, value as T[keyof T]))
  }
  return results
}

/**
 * Returns a copy of {@link obj} with only the given {@link keys}.
 */
export function pick<T, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  return D.selectKeys(obj, keys)
}
