import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Fetches every play once on mount. Held in state for the whole session so the
// quiz works offline after the first successful load.
export function usePlays() {
  const [plays, setPlays] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('plays')
        .select('*')
        .order('play_number', { ascending: true })
        .order('name', { ascending: true })

      if (!active) return

      if (error) {
        setError(error)
        setPlays([])
      } else {
        setPlays(data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return { plays, loading, error }
}
