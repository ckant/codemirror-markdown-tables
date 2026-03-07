/**
 * Modification of `watch` with `$inspect.trace` added for tracing.
 *
 * [Source](https://github.com/svecosystem/runed/blob/main/packages/runed/src/lib/utilities/watch/watch.svelte.ts)
 * [License: MIT](https://github.com/svecosystem/runed/blob/main/LICENSE)
 */
import type { Getter, WatchOptions } from "runed"
import { untrack } from "svelte"

function runEffect(flush: "post" | "pre", effect: () => void | VoidFunction): void {
  switch (flush) {
    case "post": {
      $effect(effect)
      break
    }
    case "pre": {
      $effect.pre(effect)
      break
    }
  }
}

function runWatcher<T>(
  sources: Getter<T> | Getter<T>[],
  flush: "post" | "pre",
  effect: (
    values: T | T[],
    previousValues: T | undefined | (T | undefined)[],
  ) => void | VoidFunction,
  options: WatchOptions = {},
): void {
  const { lazy = false } = options

  // Run the effect immediately if `lazy` is `false`.
  let active = !lazy

  // On the first run, if the dependencies are an array, pass an empty array
  // to the previous value instead of `undefined` to allow destructuring.
  //
  // watch(() => [a, b], ([a, b], [prevA, prevB]) => { ... });
  let previousValues: T | undefined | (T | undefined)[] = Array.isArray(sources) ? [] : undefined

  runEffect(flush, () => {
    // eslint-disable-next-line svelte/no-inspect -- This file contains debugging utilities
    $inspect.trace(active ? "active" : "lazy first run")
    const values = Array.isArray(sources) ? sources.map((source) => source()) : sources()

    if (!active) {
      active = true
      previousValues = values
      return
    }

    const cleanup = untrack(() => effect(values, previousValues))
    previousValues = values
    return cleanup
  })
}

function runWatcherOnce<T>(
  sources: Getter<T> | Getter<T>[],
  flush: "post" | "pre",
  effect: (values: T | T[], previousValues: T | T[]) => void | VoidFunction,
): void {
  const cleanupRoot = $effect.root(() => {
    let stop = false
    runWatcher(
      sources,
      flush,
      (values, previousValues) => {
        if (stop) {
          cleanupRoot()
          return
        }

        // Since `lazy` is `true`, `previousValues` is always defined.
        const cleanup = effect(values, previousValues as T | T[])
        stop = true
        return cleanup
      },
      // Running the effect immediately just once makes no sense at all.
      // That's just `onMount` with extra steps.
      { lazy: true },
    )
  })

  $effect(() => {
    return cleanupRoot
  })
}

export function watchInspect<T extends unknown[]>(
  sources: { [K in keyof T]: Getter<T[K]> },
  effect: (values: T, previousValues: { [K in keyof T]: T[K] | undefined }) => void | VoidFunction,
  options?: WatchOptions,
): void

export function watchInspect<T>(
  source: Getter<T>,
  effect: (value: T, previousValue: T | undefined) => void | VoidFunction,
  options?: WatchOptions,
): void

export function watchInspect<T>(
  sources: Getter<T> | Getter<T>[],
  effect: (
    values: T | T[],
    previousValues: T | undefined | (T | undefined)[],
  ) => void | VoidFunction,
  options?: WatchOptions,
): void {
  runWatcher(sources, "post", effect, options)
}

function watchPre<T extends unknown[]>(
  sources: { [K in keyof T]: Getter<T[K]> },
  effect: (values: T, previousValues: { [K in keyof T]: T[K] | undefined }) => void | VoidFunction,
  options?: WatchOptions,
): void

function watchPre<T>(
  source: Getter<T>,
  effect: (value: T, previousValue: T | undefined) => void | VoidFunction,
  options?: WatchOptions,
): void

function watchPre<T>(
  sources: Getter<T> | Getter<T>[],
  effect: (
    values: T | T[],
    previousValues: T | undefined | (T | undefined)[],
  ) => void | VoidFunction,
  options?: WatchOptions,
): void {
  runWatcher(sources, "pre", effect, options)
}

watchInspect.pre = watchPre

export function watchOnceInspect<T extends unknown[]>(
  sources: { [K in keyof T]: Getter<T[K]> },
  effect: (values: T, previousValues: T) => void | VoidFunction,
): void

export function watchOnceInspect<T>(
  source: Getter<T>,
  effect: (value: T, previousValue: T) => void | VoidFunction,
): void

export function watchOnceInspect<T>(
  source: Getter<T> | Getter<T>[],
  effect: (value: T | T[], previousValue: T | T[]) => void | VoidFunction,
): void {
  runWatcherOnce(source, "post", effect)
}

function watchOncePre<T extends unknown[]>(
  sources: { [K in keyof T]: Getter<T[K]> },
  effect: (values: T, previousValues: T) => void | VoidFunction,
): void

function watchOncePre<T>(
  source: Getter<T>,
  effect: (value: T, previousValue: T) => void | VoidFunction,
): void

function watchOncePre<T>(
  source: Getter<T> | Getter<T>[],
  effect: (value: T | T[], previousValue: T | T[]) => void | VoidFunction,
): void {
  runWatcherOnce(source, "pre", effect)
}

watchOnceInspect.pre = watchOncePre
