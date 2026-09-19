# AGENTS.md

## Project Overview

Custom JavaScript and CSS for the **Armored Massage** Webflow site. Source in
`src/`, built by Vite into a content-hashed bundle in `dist/`, served through a
Cloudflare Worker (`worker/index.js`) that exposes stable `/main.js` and
`/main.css` URLs. Webflow references those URLs permanently; a deploy changes
what they return. GSAP, ScrollTrigger and SplitText are globals from Webflow's
CDN integration and are **not** bundled.

## Stack

- Browser (ES2015 target) + Cloudflare Workers (compatibility date 2026-02-15)
- Vite ^8, single entry, manifest enabled, Terser minification
- PostCSS: `postcss-nesting`, `autoprefixer`, `cssnano`
- Wrangler ^4 via the Workers Assets binding (`[assets]`)
- ESLint, Stylelint, Prettier
- ESM throughout (`"type": "module"`)

## Conventions

- One feature per file in `src/js/`, exporting a single `init*` function.
  Register it in `src/main.js` — nothing self-initializes on import.
- Per-feature CSS in `src/styles/`, `@import`ed from `src/main.css`. Keep the
  Client-First utility layer in `utilities.css`; site-specific rules go in
  their own file.
- Webflow markup is the contract. Target Webflow's own classes (`.w-nav`,
  `.heading-style-h1`) or `data-` attributes set in the Designer — never
  generated Webflow IDs, which change on publish.
- Never bundle GSAP. It is `external` in `vite.config.js`; a second GSAP means
  a second ScrollTrigger that does not share scroll state with Webflow's.
- Analytics, ad and pixel scripts (gtag, LinkedIn Insight, any future pixel)
  are added by hand in the Webflow dashboard and never bundled into `main.js`.
  `docs/webflow-custom-code.md` records what is pasted there so the two do not
  drift — it is a record, not the source of truth. Webflow wins if they differ.

## Gotchas

- `worker/index.js` imports `dist/.vite/manifest.json` at build time, so
  `wrangler deploy` must be preceded by `npm run build`. `npm run deploy` does
  both; running wrangler alone against a stale `dist/` ships the old hash.
- `run_worker_first = true` in `wrangler.toml` is required. Without it, a
  request matching a literal file in `dist/` bypasses the Worker and the
  stable-URL rewrite never runs.
- `src/index.html` is the dev playground. `vite.config.js` names `main.js` as
  the only input, which is what keeps the playground out of `dist/`.
- `main.js` waits on `document.fonts.ready`. SplitText measures line boxes, and
  splitting before the webfont swaps in produces lines broken at the fallback
  font's metrics.
