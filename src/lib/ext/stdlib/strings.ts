import { S } from "@mobily/ts-belt"

/**
 * Returns true if the string is empty.
 */
export const isEmpty = S.isEmpty

/**
 * Returns the string appended to itself n times.
 */
export const repeat = S.repeat

/**
 * Returns {@link value} if it is not empty, nil otherwise.
 */
export function nilIfEmpty(value: string): string | undefined {
  return value === "" ? undefined : value
}
