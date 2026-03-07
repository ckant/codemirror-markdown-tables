const lexicographicalCollator = new Intl.Collator(navigator.language, {
  numeric: true,
  sensitivity: "base",
})

export function lexicographicalCompare(first: string, second: string): number {
  return lexicographicalCollator.compare(first, second)
}
