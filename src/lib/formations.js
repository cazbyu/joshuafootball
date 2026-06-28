// Formation families and their color coding, used consistently across screens.
// GOLD family = blue, RED family = red/orange, TITE family = green.

export const FORMATIONS = [
  'GOLD',
  'GOLD LEFT',
  'RED',
  'RED LEFT',
  'TITE',
  'TITE LEFT',
]

export function formationFamily(formation) {
  if (!formation) return 'OTHER'
  const first = formation.trim().toUpperCase().split(' ')[0]
  if (first === 'GOLD') return 'GOLD'
  if (first === 'RED') return 'RED'
  if (first === 'TITE') return 'TITE'
  return 'OTHER'
}

// Tailwind classes per family for badges / chips.
const FAMILY_CLASSES = {
  GOLD: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  RED: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  TITE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  OTHER: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
}

export function familyClasses(formation) {
  return FAMILY_CLASSES[formationFamily(formation)]
}
