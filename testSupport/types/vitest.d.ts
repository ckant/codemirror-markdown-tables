// noinspection JSUnusedGlobalSymbols -- Custom matchers

import "vitest"

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type -- Custom matchers
  interface Matchers<T = any> extends CustomMatchers<T> {}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Custom matchers
interface CustomMatchers<R = unknown> {
  toContainExactlyEntry(key: unknown, value: unknown): T
  toContainExactlyItem(value: unknown): T
}
