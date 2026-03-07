import type { Span } from "#ext/stdlib/span"

/**
 * Returns true {@link first} and {@link second} have the same
 * {@link Span#from} and {@link Span#to} or are both nil.
 */
export function equals(first: Span | undefined, second: Span | undefined): boolean {
  return first?.from === second?.from && first?.to === second?.to
}

/**
 * Returns true if {@link needle} is a subspan of {@link haystack}.
 */
export function containsSpan({ needle, haystack }: { needle: Span; haystack: Span }): boolean {
  const needleSorted = needle.from <= needle.to ? needle : { from: needle.to, to: needle.from }
  const haystackSorted =
    haystack.from <= haystack.to ? haystack : { from: haystack.to, to: haystack.from }

  return needleSorted.from >= haystackSorted.from && needleSorted.to <= haystackSorted.to
}

/**
 * Returns true if {@link from} is equal to {@link to}.
 */
export function isEmpty({ from, to }: Span): boolean {
  return from === to
}
