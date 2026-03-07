/**
 * Resolves a promise after the given {@link millis} pass.
 */
export async function delay({ millis }: { millis: number }): Promise<void> {
  return await new Promise((it) => setTimeout(it, millis))
}
