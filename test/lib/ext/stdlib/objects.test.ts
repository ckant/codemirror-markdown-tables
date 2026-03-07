import { describe, expect, it } from "vitest"

import * as Objects from "#ext/stdlib/objects"

describe("compact", () => {
  it("removes nil properties", () => {
    expect(
      // eslint-disable-next-line unicorn/no-null -- Testing null
      Objects.compact({ foo: 1, nullThing: null, bar: "2", undefinedThing: undefined }),
    ).toStrictEqual({ foo: 1, bar: "2" })
  })
})

describe("forEach", () => {
  it("calls function for each property", () => {
    const result: [string, number][] = []

    Objects.forEach({ foo: 1, bar: 2 }, (name, value) => {
      result.push([`${name}_1`, value + 1])
    })

    expect(result).toStrictEqual([
      ["foo_1", 2],
      ["bar_1", 3],
    ])
  })
})

describe("map", () => {
  it("maps function for each property", () => {
    expect(
      Objects.map({ foo: 1, bar: 2 }, (name, value) => [`${name}_1`, value + 1]),
    ).toStrictEqual([
      ["foo_1", 2],
      ["bar_1", 3],
    ])
  })
})

describe("pick", () => {
  it("picks the given properties", () => {
    const obj: {
      required1: number
      required2: number
      required3: number
      optionalMissing1?: number | undefined
      optionalMissing2?: number | undefined
      optionalPresent1?: number | undefined
      optionalPresent2?: number | undefined
    } = { required1: 1, required2: 2, required3: 3, optionalPresent1: 4, optionalPresent2: 5 }

    expect(
      Objects.pick(obj, ["required2", "optionalPresent2", "required3", "optionalMissing1"]),
    ).toStrictEqual({ required2: 2, required3: 3, optionalPresent2: 5 })
  })
})
