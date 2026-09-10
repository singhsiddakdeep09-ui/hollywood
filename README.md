# Attention & Box Office - scroll film

Vite + React + GSAP ScrollTrigger + Recharts.
Scroll-scrubbed lens-video hero → pinned horizontal filmstrip of live charts.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # -> dist/  (deploy to Cloudflare Pages / Vercel / Netlify)

## Your lens video
Replace the placeholder at:
    public/media/lens.mp4        (and lens-poster.jpg)

CRITICAL - re-encode your video with a keyframe on every frame so scroll
scrubbing is smooth (a normal MP4 keyframes every ~2s and will stutter):

    ffmpeg -i your_lens.mp4 -g 1 -keyint_min 1 -c:v libx264 -crf 23 \
           -preset slow -pix_fmt yuv420p -an public/media/lens.mp4

Keep it 3–5s, 1080p max, no audio. Then grab a poster frame:

    ffmpeg -i public/media/lens.mp4 -vframes 1 public/media/lens-poster.jpg

## Real data
Placeholder numbers live in `src/data/panels.js` (from the exploratory
pass, NOT the final regression). Swap them once M1/M2/M3 is run - the
panel structure stays identical. Scatter uses synthetic points; replace
`chart.points` with real {x: log_views, y: log_revenue, sequel} rows.

## Scroll tuning
- Hero scrub distance: `end: "+=250%"` in `components/VideoHero.jsx`
- Horizontal speed: driven by panel count × 100vw automatically
- Reduced-motion: track stacks vertically, video doesn't scrub (built in)
