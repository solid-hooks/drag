import { createSignal } from 'solid-js'
import { useDrag } from '../src/index'

export default function App() {
  const [el, setEl] = createSignal<HTMLElement>()
  const [handleEl, setHandleEl] = createSignal<HTMLElement>()

  const {
    position,
    resetPosition,
    enable,
    disable,
    isDragging,
    isDraggable,
  } = useDrag(el, {
    initialPosition: { x: 500, y: 80 },
    addStyle: true, // auto update el's left and top
    handleEl,
  })
  return (
    <>
      <div
        ref={setEl}
        style={{ position: 'fixed' }}
      >
        I am at {Math.round(position().x)}, {Math.round(position().y)}
        <div
          ref={setHandleEl}
          style={{ position: 'fixed' }}
        >
          drag me
        </div>
      </div>
      <div>is draggable: {'' + isDraggable()}</div>
      <div>is dragging: {'' + isDragging()}</div>
      <div>
        <button onClick={enable}>enable</button>
        <button onClick={disable}>disable</button>
        <button onClick={resetPosition}>reset position</button>
      </div>
    </>
  )
}
