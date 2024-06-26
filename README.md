<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=@solid-hooks/drag&background=tiles&project=%20" alt="@solid-hooks/drag">
</p>

# @solid-hooks/drag

drag hooks for solid.js

## Install

```shell
npm i @solid-hooks/drag
```
```shell
yarn add @solid-hooks/drag
```
```shell
pnpm add @solid-hooks/drag
```

## Usage

### `useDrag`

make element draggable

```tsx
import { createSignal } from 'solid-js'
import { useDrag } from '@solid-hooks/drag'

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
```

## License

MIT
