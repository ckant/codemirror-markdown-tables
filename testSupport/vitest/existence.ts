import { expect } from "vitest"

export function expectDef<T>(value: T): asserts value is NonNullable<T> {
  expect(value).not.toBeNullable()
}

export function expectNil<T>(value: T): asserts value is Extract<T, null | undefined> {
  expect(value).toBeNullable()
}
