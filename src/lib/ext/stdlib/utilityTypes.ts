/**
 * Make all properties in T required and exclude null and undefined from them.
 *
 * @example
 * ```typescript
 * type LooseType = { optional?: string; required: string | undefined }
 *
 * type StrictType = Defined<LooseType> // { optional: string; required: string }
 * ```
 */
export type Defined<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}
