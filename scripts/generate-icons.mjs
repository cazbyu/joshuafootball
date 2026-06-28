// Rasterizes public/favicon.svg into the PWA PNG icons referenced by the manifest.
// Run with: npm run generate-icons
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pub = join(__dirname, '..', 'public')
const svg = readFileSync(join(pub, 'favicon.svg'))

// A maskable icon needs ~10% safe padding all around (icon centered, bg fills).
const maskableSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1a1a2e"/>
  <g transform="translate(64 64) scale(0.75)">${svg
    .toString()
    .replace(/^<\?xml.*?\?>/, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')}</g>
</svg>`)

const targets = [
  { input: svg, size: 192, out: 'icon-192.png' },
  { input: svg, size: 512, out: 'icon-512.png' },
  { input: svg, size: 180, out: 'apple-touch-icon.png' },
  { input: maskableSvg, size: 512, out: 'icon-maskable.png' },
]

for (const t of targets) {
  await sharp(t.input, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(join(pub, t.out))
  console.log('wrote', t.out)
}
