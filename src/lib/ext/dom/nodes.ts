import { nil } from "#ext/stdlib/existence"
import * as Objects from "#ext/stdlib/objects"

export function win(target: { ownerDocument: Document } | EventTarget): typeof window {
  if (!("ownerDocument" in target)) return window
  return target.ownerDocument?.defaultView ?? window
}

export function doc(target: { ownerDocument: Document } | EventTarget): Document {
  return "ownerDocument" in target ? target.ownerDocument : document
}

export function isNode(target: EventTarget): target is Node {
  return target instanceof Node || target instanceof win(target).Node
}

export function isBreak(target: EventTarget): target is HTMLBRElement {
  return target instanceof HTMLBRElement || target instanceof win(target).HTMLBRElement
}

export function isElement(target: EventTarget): target is Element {
  return target instanceof Element || target instanceof win(target).Element
}

export function isHtmlElement(target: EventTarget): target is HTMLElement {
  return target instanceof HTMLElement || target instanceof win(target).HTMLElement
}

export function htmlElement(target: EventTarget | null): HTMLElement {
  if (nil(target) || !isHtmlElement(target)) throw new Error(`Target is not an HTMLElement`)
  return target
}

export function toString(target: EventTarget): string {
  if (!isNode(target)) return ""
  return isElement(target) ? (target.outerHTML ?? "") : (target.textContent ?? "")
}

export function contains(node: Node, target: EventTarget): boolean {
  if (!isNode(target)) return false
  return node.contains(target)
}

export function closestElement(target: EventTarget): Element | undefined {
  if (!isNode(target)) return undefined
  return isElement(target) ? target : (target.parentElement ?? undefined)
}

export function queryWithData(
  target: EventTarget,
  data: Record<string, string>,
): HTMLElement | undefined {
  return closestElement(target)?.querySelector(dataSelector(data)) ?? undefined
}

export function closestWithData(
  target: EventTarget,
  data: Record<string, string>,
): HTMLElement | undefined {
  return closestElement(target)?.closest(dataSelector(data)) ?? undefined
}

export function hasData(target: EventTarget, data: Record<string, string>): boolean {
  return isElement(target) && target.matches(dataSelector(data))
}

export function textBetween({
  ancestor,
  descendent,
  getText,
}: {
  ancestor: Node
  descendent: Node
  getText?: (node: Node) => string
}): string | undefined {
  const precedingText = []
  for (
    let currentAncestor = descendent;
    currentAncestor !== ancestor;
    currentAncestor = currentAncestor.parentNode!
  ) {
    const precedingSiblingText = []
    for (
      let precedingSibling = currentAncestor.parentNode!.firstChild!;
      precedingSibling !== currentAncestor;
      precedingSibling = precedingSibling.nextSibling!
    ) {
      precedingSiblingText.push(getText?.(precedingSibling) ?? precedingSibling.textContent ?? "")
    }
    precedingText.unshift(precedingSiblingText.join(""))
  }

  return precedingText.join("")
}

export function dataSelector(data: Record<string, string>): string {
  return Objects.map(data, (key, value) => `[data-${key}="${value}"]`).join("")
}
