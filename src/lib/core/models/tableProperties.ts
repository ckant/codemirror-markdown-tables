import { Text } from "@codemirror/state"

import type { Alignment } from "#core/models/alignment"

export interface TableProperties {
  readonly text: Text
  readonly colSizes: number[]
  readonly alignments: Alignment[]
  readonly contentSizes: number[][]
}
