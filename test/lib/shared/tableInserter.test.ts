import { describe, expect, it } from "vitest"

import * as Texts from "#ext/codemirror/state/texts"

import * as TableInserter from "#core/tableInserter"

describe("computeInsertion", () => {
  const spanLength = 2

  it("throws when span is not within doc", () => {
    expect(() =>
      TableInserter.computeInsertion({
        doc: Texts.ofString("x"),
        span: { from: 1, to: 2 },
        lineBreak: "\n",
      }),
    ).toThrow(/not in range/)
  })

  it("computes 1 preceding line break when at first char", () => {
    const start = 0

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("xx\n\n"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: { at: start, insert: "\n", count: 1 },
      after: undefined,
      changes: [{ from: start, insert: "\n" }],
    })
  })

  it("computes 0 preceding line breaks when at second char with 1 preceding line break", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\nxx\n\n"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: undefined,
      changes: [],
    })
  })

  it("computes 2 preceding line break when at second char with 0 preceding line breaks", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("xx\n\n"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: { at: start - 1, insert: "\n\n", count: 2 },
      after: undefined,
      changes: [{ from: start - 1, insert: "\n\n" }],
    })
  })

  it("computes 0 preceding line breaks when after second char with 2 preceding line breaks", () => {
    const start = 2

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\n\nxx\n\n"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: undefined,
      changes: [],
    })
  })

  it("computes 1 preceding line break when after second char with 1 preceding line break", () => {
    const start = 2

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("o\nxx\n\n"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: { at: start - 1, insert: "\n", count: 1 },
      after: undefined,
      changes: [{ from: start - 1, insert: "\n" }],
    })
  })

  it("computes 2 preceding line breaks when after second char with 0 preceding line breaks", () => {
    const start = 2

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("ooxx\n\n"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: { at: start - 1, insert: "\n\n", count: 2 },
      after: undefined,
      changes: [{ from: start - 1, insert: "\n\n" }],
    })
  })

  it("computes 1 following line breaks when at last char", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\nxx"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: { at: start + spanLength, insert: "\n", count: 1 },
      changes: [{ from: start + spanLength, insert: "\n" }],
    })
  })

  it("computes 0 following line breaks when at second to last char with 1 following line break", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\nxx\n"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: undefined,
      changes: [],
    })
  })

  it("computes 2 following line breaks when at second to last char with 0 following line breaks", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\nxxo"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: { at: start + spanLength + 1, insert: "\n\n", count: 2 },
      changes: [{ from: start + spanLength + 1, insert: "\n\n" }],
    })
  })

  it("computes 0 following line breaks when before second to last char with 2 following line breaks", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\nxx\n\no"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: undefined,
      changes: [],
    })
  })

  it("computes 1 following line breaks when before second to last char with 1 following line break", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\nxx\no"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: { at: start + spanLength + 1, insert: "\n", count: 1 },
      changes: [{ from: start + spanLength + 1, insert: "\n" }],
    })
  })

  it("computes 2 following line breaks when before second to last char with 0 following line breaks", () => {
    const start = 1

    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("\nxxoo"),
        span: { from: start, to: start + spanLength },
        lineBreak: "\n",
      }),
    ).toStrictEqual({
      before: undefined,
      after: { at: start + spanLength + 1, insert: "\n\n", count: 2 },
      changes: [{ from: start + spanLength + 1, insert: "\n\n" }],
    })
  })

  it("computes preceding and following line breaks", () => {
    expect(
      TableInserter.computeInsertion({
        doc: Texts.ofString("oooo"),
        span: { from: 2, to: 2 },
        lineBreak: "L",
      }),
    ).toStrictEqual({
      before: { at: 1, insert: "LL", count: 2 },
      after: { at: 3, insert: "LL", count: 2 },
      changes: [
        { from: 1, insert: "LL" },
        { from: 3, insert: "LL" },
      ],
    })
  })
})
