import { def, nil } from "#ext/stdlib/existence"
import * as Strings from "#ext/stdlib/strings"

export function getStringOrNil(name: string): string | undefined {
  const paramValue = new URLSearchParams(window.location.search).get(name)
  return def(paramValue) ? paramValue : undefined
}

export function getBoolOrNil(name: string): boolean | undefined {
  const paramValue = getStringOrNil(name)
  if (nil(paramValue)) return undefined
  return Strings.isEmpty(paramValue) ? true : stringToBoolOrNil(paramValue)
}

export function getValueOrNil<T extends string>(name: string, values: readonly T[]): T | undefined {
  const str = getStringOrNil(name)
  if (nil(str)) return undefined

  return values.includes(str as T) ? (str as T) : undefined
}

function stringToBoolOrNil(str: string): boolean | undefined {
  if (str === "true") return true
  if (str === "false") return false
  return undefined
}
