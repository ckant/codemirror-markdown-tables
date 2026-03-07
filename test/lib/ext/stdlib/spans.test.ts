import { describe, expect, it } from "vitest"

import * as Spans from "#ext/stdlib/spans"

describe("equals", () => {
  it("returns false when different from", () => {
    expect(Spans.equals({ from: 0, to: 5 }, { from: 1, to: 5 })).toBe(false)
  })
  it("returns false when different to", () => {
    expect(Spans.equals({ from: 0, to: 5 }, { from: 0, to: 4 })).toBe(false)
  })
  it("returns false when first nil", () => {
    expect(Spans.equals(undefined, { from: 0, to: 4 })).toBe(false)
  })
  it("returns false when second nil", () => {
    expect(Spans.equals({ from: 0, to: 5 }, undefined)).toBe(false)
  })
  it("returns true when equal", () => {
    expect(Spans.equals({ from: 0, to: 5 }, { from: 0, to: 5 })).toBe(true)
  })
  it("returns true when both nil", () => {
    expect(Spans.equals(undefined, undefined)).toBe(true)
  })
})

describe("containsSpan", () => {
  it("returns false when ascending span before ascending span", () => {
    expect(Spans.containsSpan({ needle: { from: 0, to: 5 }, haystack: { from: 5, to: 7 } })).toBe(
      false,
    )
  })
  it("returns false when descending span before ascending span", () => {
    expect(Spans.containsSpan({ needle: { from: 4, to: 0 }, haystack: { from: 5, to: 10 } })).toBe(
      false,
    )
  })
  it("returns false when descending span before descending span", () => {
    expect(Spans.containsSpan({ needle: { from: 10, to: 7 }, haystack: { from: 7, to: 5 } })).toBe(
      false,
    )
  })
  it("returns false when ascending span before descending span", () => {
    expect(Spans.containsSpan({ needle: { from: 8, to: 10 }, haystack: { from: 7, to: 5 } })).toBe(
      false,
    )
  })
  it("returns false when ascending span after ascending span", () => {
    expect(Spans.containsSpan({ needle: { from: 7, to: 9 }, haystack: { from: 5, to: 7 } })).toBe(
      false,
    )
  })
  it("returns false when descending span after ascending span", () => {
    expect(Spans.containsSpan({ needle: { from: 7, to: 5 }, haystack: { from: 0, to: 5 } })).toBe(
      false,
    )
  })
  it("returns false when descending span after descending span", () => {
    expect(Spans.containsSpan({ needle: { from: 10, to: 7 }, haystack: { from: 7, to: 5 } })).toBe(
      false,
    )
  })
  it("returns false when ascending span after descending span", () => {
    expect(Spans.containsSpan({ needle: { from: 0, to: 5 }, haystack: { from: 7, to: 5 } })).toBe(
      false,
    )
  })
  it("returns true when ascending span in ascending span", () => {
    expect(Spans.containsSpan({ needle: { from: 0, to: 5 }, haystack: { from: 0, to: 6 } })).toBe(
      true,
    )
  })
  it("returns true when ascending span in descending span", () => {
    expect(Spans.containsSpan({ needle: { from: 0, to: 5 }, haystack: { from: 10, to: 0 } })).toBe(
      true,
    )
  })
  it("returns true when descending span in ascending span", () => {
    expect(Spans.containsSpan({ needle: { from: 5, to: 2 }, haystack: { from: 0, to: 5 } })).toBe(
      true,
    )
  })
  it("returns true when descending span in descending span", () => {
    expect(Spans.containsSpan({ needle: { from: 10, to: 5 }, haystack: { from: 10, to: 0 } })).toBe(
      true,
    )
  })
})

describe("isEmpty", () => {
  it("returns false when not empty", () => {
    expect(Spans.isEmpty({ from: 0, to: 1 })).toBe(false)
  })
  it("returns false when not empty", () => {
    expect(Spans.isEmpty({ from: 0, to: 0 })).toBe(true)
  })
})
