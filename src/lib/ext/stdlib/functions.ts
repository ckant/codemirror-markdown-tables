import * as Time from "#ext/stdlib/time"

/**
 * Returns a function that calls {@link fns} sequentially.
 */
export function each(...fns: (() => unknown)[]): () => void {
  return () => fns.forEach((fn) => fn())
}

/**
 * Returns a function that returns true only after {@link delayMillis} passes.
 */
export function falseUntil({ delayMillis }: { delayMillis: number }): () => boolean {
  let done = false
  void Time.delay({ millis: delayMillis }).then(() => (done = true))
  return () => done
}
