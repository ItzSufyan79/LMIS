import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Mirror of ResizablePanel for the trailing sidebar: resizable, and collapsible
 * to nothing so the map gets the full width when the panel is not in use.
 */
export default function ResizableTrailing({
  children,
  minWidth = 240,
  maxWidth = 420,
  defaultWidth = 288,
  collapsed = false,
  onToggleCollapsed,
  label = 'Panel',
}) {
  const [width, setWidth] = useState(defaultWidth)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef(null)

  const clamp = useCallback((px) => Math.min(maxWidth, Math.max(minWidth, px)), [minWidth, maxWidth])

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
    <div ref={containerRef} className="relative flex h-full min-h-0 shrink-0">
      {!collapsed && (
        <>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${label.toLowerCase()} panel`}
            tabIndex={0}
            onMouseDown={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onKeyDown={onKeyDown}
            className="group absolute top-0 left-0 z-20 h-full w-2 -translate-x-1/2 cursor-col-resize focus-visible:outline-none"
            style={{ left: 0 }}
          >
            <span
              className={`absolute top-1/2 left-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 transition-colors duration-150 ${
                dragging ? 'bg-accent' : 'bg-line group-hover:bg-ink-3 group-focus-visible:bg-accent'
              }`}
            />
          </div>

          <div style={{ width: `${width}px` }} className="flex h-full min-h-0 flex-col border-l border-line">
            {children}
          </div>

          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={`Collapse ${label.toLowerCase()} panel`}
            title={`Collapse ${label.toLowerCase()}`}
            className="absolute top-1/2 right-0 z-20 flex h-9 w-4 -translate-y-1/2 items-center justify-center border border-l-0 border-line bg-panel text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
              <path d="M4.5 2L8 6l-3.5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </>
      )}

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={`Show ${label.toLowerCase()} panel`}
          title={`Show ${label.toLowerCase()}`}
          className="absolute top-1/2 right-0 z-20 flex h-11 w-5 -translate-y-1/2 items-center justify-center border border-l-0 border-line bg-panel text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden>
            <path d="M7.5 2L4 6l3.5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}