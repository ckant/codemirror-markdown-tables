import type { MatchersObject, MatcherState } from "@vitest/expect"

/**
 * Matchers for {@link Set}s.
 */
export const SetMatchers: MatchersObject = {
  /**
   * Matches an {@link actual} {@link Set} that contains exactly the given {@link item}.
   */
  toContainExactlyItem(this: MatcherState, actual: Set<unknown>, item: unknown) {
    const expected = new Set([item])

    return {
      pass: this.equals(expected, actual, [this.utils.iterableEquality], true),
      message: () => `Expected Set to ${this.isNot ? "not " : ""}contain exactly the given item`,
      expected: this.utils.stringify(expected),
      actual: this.utils.stringify(actual),
    }
  },
}
