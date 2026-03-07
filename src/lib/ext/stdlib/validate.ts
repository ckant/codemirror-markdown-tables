import { nil } from "#ext/stdlib/existence"

export function optionalEach<T>(
  iterable: Iterable<T> | undefined,
  validate: (item: T) => void,
): void {
  if (nil(iterable)) return
  for (const item of iterable) {
    validate(item)
  }
}

export function optional<T>(item: T | undefined, validate: (item: T) => void): void {
  if (nil(item)) return
  validate(item)
}

export function positiveIntegers(first: number, second: number, message: string): void {
  if (!Number.isInteger(first) || first <= 0) throw new Error(message)
  if (!Number.isInteger(second) || second <= 0) throw new Error(message)
}
