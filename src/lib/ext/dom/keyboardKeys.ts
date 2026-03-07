export function isFunctionKey(key: string): boolean {
  return /^F\d+$/.test(key)
}
