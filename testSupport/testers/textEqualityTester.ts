import { Text } from "@codemirror/state"

import * as Testers from "./testers"

export const TextEqualityTester = Testers.ofEquality({
  isInstance: (value: unknown) => value instanceof Text,
  isEqual: (first, second) => first.eq(second),
})
