import type { TransactionExtenderSpec } from "@codemirror/state"

import { def } from "#ext/stdlib/existence"

import * as TableAnnotation from "#codemirror/transaction/tableAnnotation"
import * as TableEffect from "#codemirror/transaction/tableEffect"

export const tableEffectAnnotationExtenderSpec: TransactionExtenderSpec = (transaction) => {
  const tableEvent = transaction.effects.find((effect) => effect.is(TableEffect.type))?.value
  // eslint-disable-next-line unicorn/no-null -- TransactionExtenderSpec uses null
  return def(tableEvent) ? { annotations: TableAnnotation.of(tableEvent) } : null
}
