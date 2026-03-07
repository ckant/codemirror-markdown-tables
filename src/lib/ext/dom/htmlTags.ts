import { clsx } from "clsx"

import type { AttributeValue } from "#ext/dom/attributeValue"
import * as Strings from "#ext/stdlib/strings"

export function escapeContent(content: string): string {
  return content.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}
export function attributeValuesOrNil(...inputs: AttributeValue[]): string | undefined {
  return Strings.nilIfEmpty(clsx(...inputs))
}
