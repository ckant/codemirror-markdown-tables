import type { Tester } from "@vitest/expect"

export function ofEquality<T>({
  isInstance,
  isEqual,
}: {
  isInstance: (value: unknown) => value is T
  isEqual: (first: T, second: T) => boolean
}): Tester {
  return (first: unknown, second: unknown): boolean | undefined => {
    const isFirstInstanceOf = isInstance(first)
    const isSecondInstanceOf = isInstance(second)

    if (isFirstInstanceOf && isSecondInstanceOf) {
      return isEqual(first, second)
    } else if (isFirstInstanceOf === isSecondInstanceOf) {
      return undefined
    } else {
      return false
    }
  }
}
