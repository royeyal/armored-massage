# armored-massage

Custom CSS and JavaScript for the **Armored Massage** Webflow site.

Source lives in `src/`, Vite builds it into a content-hashed bundle in `dist/`,
and a Cloudflare Worker serves it at two URLs that never change:

```
https://armored-massage-scripts.roy-eyal.workers.dev/main.css
https://armored-massage-scripts.roy-eyal.workers.dev/main.js
```

Webflow references those two URLs once and never again. Deploying swaps the
file behind them.

---

## Quick start

```bash
npm install
npm run dev
```

`npm run dev` opens `src/index.html`, a standalone playground with a fake
navbar, headings and reveal groups so animations can be worked on without
touching the live site. It is never built into `dist/`.

---

## Scripts

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Vite dev server on :3000 with the playground      |
| `npm run build`   | Build to `dist/` with hashed filenames + manifest |
| `npm run preview` | Serve the built bundle locally                    |
| `npm run lint`    | ESLint over JS, Stylelint over CSS                |
| `npm run format`  | Prettier over everything                          |
| `npm run deploy`  | Build, then `wrangler deploy`                     |

---

## Structure

```
.
├── src/
│   ├── main.js                   Entry — registers plugins, init()s modules
│   ├── main.css                  CSS entry — @imports the files below
│   ├── base.css                  Fluid root size, selection, focus ring
│   ├── index.html                Dev playground (not deployed)
│   ├── js/
│   │   ├── navbar.js             .is-sticky on .w-nav past 100px
│   │   ├── split-text-headings.js  SplitText reveal for h1 (words) / h2 (lines)
│   │   ├── content-reveal-scroll.js  [data-reveal-group] staggered reveals
│   │   └── card-spotlight.js   Cursor-following glow on .cards-grid cards
│   └── styles/
│       ├── utilities.css         Client-First helpers (hide, spacing, truncate)
│       ├── navbar.css            Sticky state + nav link underline
│       ├── gradient-border.css  Animated conic-gradient border (.button, .pricing_plan)
│       ├── card.css              .card__with-border gradient hairline
│       ├── card-spotlight.css    Radial glow driven by --cursor-x/y
│       └── split-text.css        Clipping boxes for .line / .word
├── worker/index.js               Maps /main.js + /main.css to hashed assets
├── docs/webflow-custom-code.md   Exactly what to paste into Webflow
├── vite.config.js
└── wrangler.toml
```

Each module in `src/js/` exports one `init*` function and is called from
`src/main.js`. To add a feature: new file, export an init, import and call it.

---

## How cache busting works

Vite writes `assets/main.<hash>.js` and records the name in
`dist/.vite/manifest.json`. `worker/index.js` imports that manifest at build
time and serves the current hash at the stable path.

The stable URLs are `Cache-Control: public, no-cache` — the browser keeps a
copy but revalidates every load, which is a 304 and a few hundred bytes while
nothing has changed. The hashed files underneath are `immutable` for a year,
since a change to the bytes always changes the name.

Net effect: Webflow's custom-code fields are edited once, and every deploy
reaches visitors on their next page load.

---

## GSAP

GSAP, ScrollTrigger and SplitText come from Webflow's GSAP integration as
globals, and are declared `external` in `vite.config.js` so they are not
bundled. Bundling would put a second GSAP on the page and a second
ScrollTrigger that does not share the first one's scroll state.

---

## Deploy

One-time setup:

```bash
cp .env.example .env    # then add a Cloudflare API token
```

Then, for every change:

```bash
npm run deploy
```

`wrangler.toml` has commented instructions for moving from the `workers.dev`
URL to a custom domain such as `assets.armoredmassage.com`.
