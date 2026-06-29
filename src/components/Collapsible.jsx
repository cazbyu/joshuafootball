import { useState } from 'react'

// Reusable expand/collapse panel. Smooth height animation via the
// grid-template-rows 0fr→1fr trick (no JS height measuring needed).
// `header` is the fully-styled left-side content (icon + label); `className`
// styles the outer container (e.g. family color border/bg).
export default function Collapsible({
  header,
  defaultOpen = false,
  className = 'border-slate-700 bg-surface',
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

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
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">{children}</div>
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
