import { useCallback, useEffect, useRef, useState } from 'react'

export default function ResizableRight({ left, right, minRight = 280, maxRight = 420, defaultRight = 310 }) {
  const [width, setWidth] = useState(defaultRight)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  const clamp = useCallback(
    (px) => Math.min(maxRight, Math.max(minRight, px)),
    [minRight, maxRight],
  )

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      if (!containerRef.current) return
      setWidth(clamp(containerRef.current.getBoundingClientRect().right - e.clientX))
    }
    const onUp = () => setDragging(false)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging, clamp])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setWidth((w) => clamp(w + 16))
    else if (e.key === 'ArrowRight') setWidth((w) => clamp(w - 16))
    else return
    e.preventDefault()
  }

  return (
    <div ref={containerRef} className="relative flex h-full w-full min-h-0">
      <div className="flex h-full min-h-0 flex-1">{left}</div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel"
        tabIndex={0}
        onMouseDown={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onKeyDown={onKeyDown}
        className="group absolute top-0 z-10 h-full w-2 -translate-x-1/2 cursor-col-resize focus-visible:outline-none"
        style={{ right: `${width}px` }}
      >
        <span
          className={`absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 transition-colors duration-150 ${
            dragging ? 'bg-accent' : 'bg-line group-hover:bg-ink-3 group-focus-visible:bg-accent'
          }`}
        />
      </div>

      <div style={{ width: `${width}px` }} className="flex h-full min-h-0 flex-col border-l border-line">
        {right}
      </div>
    </div>
  )
}