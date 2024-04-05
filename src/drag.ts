import { type EventListenerOptions, makeEventListener } from '@solid-primitives/event-listener'
import type { Accessor } from 'solid-js'
import { DEV, createMemo, createRenderEffect, createSignal, onMount } from 'solid-js'

type Position = {
  x: number
  y: number
}

export type DraggableElement = HTMLElement | SVGElement | undefined | null

/**
 * options for {@link useDrag}
 */
export type DragOptions = {
  /**
   * element to trigger drag event
   * @default el
   */
  handleEl?: Accessor<DraggableElement>
  /**
   * initial posistion
   * @default { x: 0, y: 0}
   */
  initialPosition?: Position
  /**
   * callback on dragging start
   *
   * return `false` to prevent dragging.
   */
  onStart?: (position: Position, event: PointerEvent) => void | false
  /**
   * callback on dragging
   */
  onMove?: (position: Position, event: PointerEvent) => void
  /**
   * callback on dragging end
   */
  onEnd?: (position: Position, event: PointerEvent) => void
  /**
   * addEventListener options
   */
  listenerOptions?: EventListenerOptions
  /**
   * ignore when multiple pointer event
   */
  ignoreMultiPointer?: boolean
  /**
   * only trigger on mouse left click when use mouse
   * @default true
   */
  leftClick?: boolean
  /**
   * axis that element can be dragged
   *
   * @default 'both'
   */
  axis?: 'x' | 'y' | 'both'
  /**
   * auto update element top and left
   */
  addStyle?: boolean
  /**
   * bind events onMount
   */
  bindOnMount?: boolean
}

type DragResult = {
  /**
   * left and top
   */
  position: Accessor<Position>
  /**
   * whether is dragging
   */
  isDragging: Accessor<boolean>
  /**
   * whether is draggable
   */
  isDraggable: Accessor<boolean>
  /**
   * disable drag
   */
  disable: VoidFunction
  /**
   * enable drag
   */
  enable: VoidFunction
  /**
   * reset posistion to initial posistion
   */
  resetPosition: VoidFunction
}

/**
 * make element draggable, recommend to add `touch-action: none` on element
 *
 * please use `createSignal` to bind element reference
 * @param el target element
 * @param options drag options
 * @example
 * ```tsx
 * import { useDrag } from '@solid-hooks/drag'
 *
 * const [el, setEl] = createSignal<HTMLElement>()
 * const [handleEl, setHandleEl] = createSignal<HTMLElement>()
 *
 * const {
 *   position,
 *   resetPosition,
 *   enable,
 *   disable,
 *   isDragging,
 *   isDraggable,
 * } = useDrag(el, {
 *   initialPosition: { x: 200, y: 80 },
 *   addStyle: true, // auto update el's left and top
 *   handleEl,
 * })
 * return (
 *   <div
 *     ref={setEl}
 *     style={{ position: 'fixed' }}
 *   >
 *     I am at {Math.round(position().x)}, {Math.round(position().y)}
 *     <div
 *       ref={setHandler}
 *       style={{ position: 'fixed' }}
 *     >
 *       drag me
 *     </div>
 *   </div>
 * )
 * ```
 */
export function useDrag(
  el: Accessor<DraggableElement>,
  options: DragOptions = {},
): DragResult {
  const {
    listenerOptions,
    onEnd,
    onMove,
    onStart,
    ignoreMultiPointer,
    leftClick = true,
    initialPosition = { x: 0, y: 0 },
    handleEl = el,
    axis = 'both',
    addStyle,
    bindOnMount = true,
  } = options

  let cleanup: VoidFunction | undefined
  const canMoveX = axis !== 'y'
  const canMoveY = axis !== 'x'
  const [position, setPosition] = createSignal<Position>({ ...initialPosition })
  const [startPosition, setStartPosition] = createSignal<Position>()
  const [track, trigger] = createSignal(undefined, { equals: false })

  function bindEvents() {
    const handle = handleEl()
    if (!handle) {
      DEV && console.error(
        'handle element does not exist, please use `const [el, setEl] = createSignal<HTMLElement>()` instead of `let el: HTMLDivElement | undefined`',
      )
      return
    }
    const cleanupStart = makeEventListener(
      handle,
      'pointerdown',
      (event) => {
        if ((ignoreMultiPointer && event.isPrimary)
          || startPosition()
          || (leftClick && event.button !== 0)) {
          return
        }
        const _el = el()!
        const rect = _el.getBoundingClientRect()
        const pos: Position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
        if (onStart?.(pos, event) === false) {
          return
        }
        _el.setPointerCapture(event.pointerId)
        setStartPosition(pos)
      },
      listenerOptions,
    )
    const cleanupMove = makeEventListener(
      window,
      'pointermove',
      (event) => {
        if (!startPosition()) {
          return
        }
        let { x, y } = position()

        if (canMoveX) {
          x = event.clientX - startPosition()!.x
        }
        if (canMoveY) {
          y = event.clientY - startPosition()!.y
        }

        const newPos = setPosition({ x, y })
        onMove?.(newPos, event)
      },
      listenerOptions,
    )
    const cleanupEnd = makeEventListener(
      window,
      'pointerup',
      (event) => {
        if (!startPosition()) {
          return
        }
        el()!.releasePointerCapture(event.pointerId)
        setStartPosition()
        onEnd?.(position(), event)
      },
      listenerOptions,
    )
    cleanup = () => {
      cleanupStart()
      cleanupMove()
      cleanupEnd()
    }
    trigger()
  }

  bindOnMount && onMount(() => {
    bindEvents()
  })
  addStyle && createRenderEffect(() => {
    const { x, y } = position()
    const _el = el()
    if (_el) {
      _el.style.left = x + 'px'
      _el.style.top = y + 'px'
    }
  })

  return {
    position,
    isDragging: createMemo(() => !!startPosition()),
    isDraggable: createMemo(() => {
      track()
      return !!cleanup
    }),
    enable: bindEvents,
    disable: () => {
      cleanup?.()
      cleanup = undefined
      trigger()
    },
    resetPosition: () => setPosition({ ...initialPosition }),
  }
}

export function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
