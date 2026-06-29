import { useLayoutEffect, useRef, useState } from 'react'

// Reusable expand/collapse panel with a smooth height animation.
// Animates max-height between 0 and the measured content height (two definite
// values) so it transitions cleanly in BOTH directions. The content is static
// while mounted, so we measure once (and on resize) without a feedback loop.
// `header` is the fully-styled left-side content (icon + label); `className`
// styles the outer container (e.g. family color border/bg).
export default function Collapsible({
  header,
  defaultOpen = false,
  className = 'border-slate-700 bg-surface',
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)
  // Skip the transition on the very first commit so an open-by-default panel
  // doesn't animate from 0 on mount.
  const [animate, setAnimate] = useState(false)

  useLayoutEffect(() => {
    const el = contentRef.current
    if (el) setContentHeight(el.offsetHeight)
    // Re-measure on window resize (e.g. text reflow) without observing the
    // element itself, which could feed back into the max-height we control.
    function onResize() {
      if (contentRef.current) setContentHeight(contentRef.current.offsetHeight)
    }
    window.addEventListener('resize', onResize)
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(id)
    }
  }, [])

  return (
    <div className={['overflow-hidden rounded-xl border', className].join(' ')}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 p-4 text-left"
      >
        <span className="flex-1">{header}</span>
        <Chevron open={open} />
      </button>
      <div
        className={[
          'overflow-hidden',
          animate ? 'transition-[max-height] duration-300 ease-out' : '',
        ].join(' ')}
        style={{ maxHeight: open ? contentHeight : 0 }}
      >
        <div ref={contentRef} className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}

function Chevron({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={[
        'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300',
        open ? 'rotate-180' : '',
      ].join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
