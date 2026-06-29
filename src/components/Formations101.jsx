import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { familyClasses } from '../lib/formations'
import Collapsible from './Collapsible'

const PRIMER =
  'The first number in a play (like 10 or 11) tells you the personnel — ' +
  'first digit = running backs, second digit = tight ends. So "10" means ' +
  '1 back, 0 tight ends, which leaves 4 receivers.'

// "Formations 101" primer shown above the play list. The whole block is
// collapsible (starts closed) so it doesn't push the play list down.
export default function Formations101() {
  const [formations, setFormations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data, error } = await supabase
        .from('formations')
        .select('*')
        .order('sort_order', { ascending: true })
      if (!active) return
      if (error) console.error('Failed to load formations:', error)
      setFormations(data ?? [])
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  // Nothing to show if the table is empty or failed to load.
  if (!loading && formations.length === 0) return null

  return (
    <div className="mb-6">
      <Collapsible
        className="border-slate-800 bg-surface/50"
        header={
          <span className="flex items-center gap-2 text-sm font-bold">
            <span aria-hidden>📚</span>
            Formations 101
          </span>
        }
      >
        <p className="mb-4 text-sm leading-relaxed text-slate-300">{PRIMER}</p>

        {loading ? (
          <p className="text-sm text-slate-400">Loading formations…</p>
        ) : (
          <div className="flex flex-col gap-2">
            {formations.map((f) => (
              <Collapsible
                key={f.name}
                className={familyClasses(f.color_family)}
                header={
                  <span className="flex flex-col">
                    <span className="font-bold">{f.name}</span>
                    {f.personnel && (
                      <span className="text-xs font-normal opacity-80">
                        {f.personnel}
                      </span>
                    )}
                  </span>
                }
              >
                {f.simple_desc && (
                  <p className="text-sm leading-relaxed text-slate-200">
                    {f.simple_desc}
                  </p>
                )}
                {f.why_it_matters && (
                  <div className="mt-3">
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold">
                      Why it matters
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-200">
                      {f.why_it_matters}
                    </p>
                  </div>
                )}
              </Collapsible>
            ))}
          </div>
        )}
      </Collapsible>
    </div>
  )
}
