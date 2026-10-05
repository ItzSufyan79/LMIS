import { useEffect, useState } from 'react'
import { useMotionValue, useMotionValueEvent, animate } from 'motion/react'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Counts up on mount. Non-numeric values (e.g. "3.1–4.2K", "24d") render as-is.
 *
 * Deliberately not gated on IntersectionObserver: if the observer never fires the
 * number would sit at 0, which is a worse failure than losing the animation.
 */
export default function CountUp({ value, duration = 0.85, delay = 0.06, format = (v) => Math.round(v).toLocaleString('en-IN') }) {
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(0)
  const numeric = typeof value === 'number'

  useMotionValueEvent(mv, 'change', (v) => setDisplay(v))

  useEffect(() => {
    if (!numeric) return
    if (prefersReduced()) {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration, delay, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, mv, numeric, duration, delay])

  if (!numeric) return <>{value}</>

  return <span className="tabular-nums">{format(display)}</span>
}