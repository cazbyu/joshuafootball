# Joshua Football 🏈

A playbook quiz PWA for learning the team pass game. React + Vite + Tailwind,
reads 41 plays from Supabase (`p0015_football_playbook` schema), deploys to Netlify.

## Local dev

```bash
npm install
npm run generate-icons   # one-time: builds PWA PNG icons from public/favicon.svg
npm run dev
```

Env vars live in `.env.local` (gitignored). See `.env.example`.

## ⚠️ One-time Supabase setup

The plays live in the `p0015_football_playbook` schema, which must be exposed to
the API. In the Supabase dashboard:

**Project → Settings → API → Exposed schemas → add `p0015_football_playbook` → Save.**

RLS policies are already in place: public `SELECT` on `plays`, public
`SELECT`/`INSERT` on `quiz_scores`. Until the schema is exposed, the app shows a
"schema invalid" error on the home screen.

## Quiz modes

| Mode | Prompt | Answer |
|---|---|---|
| Name → What it does | play name | description |
| Routes → Name | WR routes | play name |
| Formations | play name | formation |
| WR routes | play name | WR routes |
| LB keys | play name | LB key |

## Deploy (Netlify)

1. Push to `github.com/cazbyu/joshuafootball`.
2. Netlify → Add new site → Import from GitHub → `cazbyu/joshuafootball`.
3. Set env vars in the Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command `npm run build`, publish dir `dist` (already in `netlify.toml`).
