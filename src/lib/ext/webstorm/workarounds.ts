/**
 * Workarounds for typescript issues in Webstorm (IntelliJ Svelte plugin bug)
 * {@link https://youtrack.jetbrains.com/issue/WEB-61819/Svelte-5-TypeScript-in-markup-expressions}
 */

// eslint-disable-next-line @typescript-eslint/naming-convention -- Chosen to be similar to `number`
export type number_ = number

export function alwaysDef<T>(value: T | undefined): T {
  return value as T
}

export function typed<T>(value: unknown): T {
  return value as T
}
