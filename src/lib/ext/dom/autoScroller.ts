import { def, nil } from "#ext/stdlib/existence"
import * as Numbers from "#ext/stdlib/numbers"

export interface AutoScrollerProps {
  readonly offset?: number
  readonly maxScroll: number
  readonly boundaryElement: { readonly x: HTMLElement; readonly y: HTMLElement }
  readonly scrollElement: { readonly x: HTMLElement; readonly y: HTMLElement }
}

export class AutoScroller {
  private readonly offset: number
  private readonly maxScroll: number
  private readonly boundaryElement: { readonly x: HTMLElement; readonly y: HTMLElement }
  private readonly scrollElement: { readonly x: HTMLElement; readonly y: HTMLElement }
  private readonly scroll: () => void

  private handle: number | undefined

  private xAmount: number
  private yAmount: number

  updatePosition(x: number, y: number): void {
    const xBoundary = this.boundaryElement.x.getBoundingClientRect()
    if (x < xBoundary.left + this.offset) {
      this.xAmount = -Numbers.clamp(this.offset + (xBoundary.left - x), {
        max: this.maxScroll,
      })
    } else if (x > xBoundary.right - this.offset) {
      this.xAmount = Numbers.clamp(this.offset - (xBoundary.right - x), {
        max: this.maxScroll,
      })
    } else {
      this.xAmount = 0
    }

    const yBoundary = this.boundaryElement.y.getBoundingClientRect()
    if (y < yBoundary.top + this.offset) {
      this.yAmount = -Numbers.clamp(this.offset + (yBoundary.top - y), {
        max: this.maxScroll,
      })
    } else if (y > yBoundary.bottom - this.offset) {
      this.yAmount = Numbers.clamp(this.offset - (yBoundary.bottom - y), {
        max: this.maxScroll,
      })
    } else {
      this.yAmount = 0
    }

    if (nil(this.handle) && (this.xAmount !== 0 || this.yAmount !== 0)) this.scroll()
  }

  destroy(): void {
    if (def(this.handle)) cancelAnimationFrame(this.handle)
  }

  private scrollInternal(): void {
    if (this.xAmount === 0 && this.yAmount === 0) {
      this.scroll()
      return
    }

    this.scrollElement.x.scrollBy({ left: this.xAmount })
    this.scrollElement.y.scrollBy({ top: this.yAmount })
    this.scroll()
  }

  static of(props: AutoScrollerProps): AutoScroller {
    return new AutoScroller(props)
  }

  private constructor({ offset, maxScroll, boundaryElement, scrollElement }: AutoScrollerProps) {
    const scrollInternal = this.scrollInternal.bind(this)
    this.scroll = () => {
      this.handle = requestAnimationFrame(scrollInternal)
    }
    this.xAmount = 0
    this.yAmount = 0
    this.offset = offset ?? 0
    this.maxScroll = maxScroll
    this.boundaryElement = boundaryElement
    this.scrollElement = scrollElement
  }
}
