import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Two-slot split: a resizable, collapsible left panel and a flexible right slot.
 * Collapsing the left panel slides it fully out of the way and swaps the resize
 * grip for a restore tab, so the map or report can take the whole width.
 */
export default function ResizablePanel({
  left,
  right,
  minLeft = 276,
  maxLeft = 420,
  defaultLeft = 276,
  collapsed = false,
  onToggleCollapsed,
  leftLabel = 'Filters',
}) {
  const [width, setWidth] = useState(defaultLeft)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  const clamp = useCallback((px) => Math.min(maxLeft, Math.max(minLeft, px)), [minLeft, maxLeft])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      if (!containerRef.current) return
      setWidth(clamp(e.clientX - containerRef.current.getBoundingClientRect().left))
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
    if (e.key === 'ArrowLeft') setWidth((w) => clamp(w - 16))
    else if (e.key === 'ArrowRight') setWidth((w) => clamp(w + 16))
    else return
    e.preventDefault()
  }

  return (
    <div ref={containerRef} className="relative flex h-full w-full min-h-0">
      {!collapsed && (
        <>
          <div style={{ width: `${width}px` }} className="flex h-full min-h-0 shrink-0 flex-col">
            {left}
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${leftLabel.toLowerCase()} panel`}
            tabIndex={0}
            onMouseDown={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onKeyDown={onKeyDown}
            className="group absolute top-0 z-10 h-full w-2 -translate-x-1/2 cursor-col-resize focus-visible:outline-none"
            style={{ left: `${width}px` }}
          >
            <span
              className={`absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 transition-colors duration-150 ${
                dragging ? 'bg-accent' : 'bg-line group-hover:bg-ink-3 group-focus-visible:bg-accent'
              }`}
            />
          </div>

          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={`Collapse ${leftLabel.toLowerCase()} panel`}
            title={`Collapse ${leftLabel.toLowerCase()}`}
            className="absolute top-1/2 left-0 z-20 flex h-9 w-4 -translate-y-1/2 items-center justify-center border border-r-0 border-line bg-panel text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
            style={{ left: `${width}px` }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
              <path d="M7.5 2L4 6l3.5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </>
      )}

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={`Show ${leftLabel.toLowerCase()} panel`}
          title={`Show ${leftLabel.toLowerCase()}`}
          className="absolute top-1/2 left-0 z-20 flex h-11 w-5 -translate-y-1/2 items-center justify-center border border-r-0 border-line bg-panel text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
            <path d="M4.5 2L8 6l-3.5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div className="flex h-full min-h-0 flex-1 overflow-hidden">{right}</div>
    </div>
  )
}