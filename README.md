# MERES — website

Image-led, motion-led five-page site for MERES (residential remodeling and custom homes, Seattle’s Eastside),
built from the MERES Bolt prompt and the supplied asset bundle.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · React Router 6 · GSAP 3.13+ (ScrollTrigger, SplitText, Flip,
CustomEase via `@gsap/react` `useGSAP`) · Lenis · `ogl` (Liquid Light only).

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # production build → dist/ (BrowserRouter; host must rewrite all routes to index.html)
npm run build:preview  # portable static build (HashRouter, relative paths) for hosts without rewrites
```

## Before launch (required)
- **Form delivery:** set `VITE_FORM_ENDPOINT` (see `.env.example`) to an endpoint that forwards to `info@meres.co`,
  then test it end to end. Without it the form runs in Demo mode and never claims success.
- **Privacy notice:** `/privacy` is a placeholder (`src/pages/Privacy.tsx`).
- **Wordmark:** the header lockup uses DM Sans text until the official wordmark SVG arrives (`src/components/Logo.tsx`).
- **Palette:** derived from the supplied colour sheets + identity board; confirm in design review (`src/styles/globals.css`).
- **SPA rewrites:** for `npm run build`, configure the host to serve `index.html` for `/services`, `/approach`, `/about`,
  `/contact`, `/privacy` (e.g. Netlify `_redirects`: `/* /index.html 200`).

## Where things live
| | |
|---|---|
| `src/content/copy.ts` | All copy, verbatim from the brief’s appendix |
| `src/data/images.ts` | Image manifest + the 18 named crops |
| `src/motion/` | Tokens/eases, primitives (line reveal, stack section, parallax, scrub text, focus pull, mask reveal, line drawing), page transition (“Plaster Wipe”), entrance signal |
| `src/webgl/` | Liquid Light (ogl shader) + `LiquidStage` wrapper with crossfade fallback |
| `src/components/` | Header, Menu (“Through the Doorway”), Footer, Preloader, Cursor, ImageFrame, VisualizationLabel, MaterialPanel, DraftingLines (5 drawings), PlanRoom, Measure, PanelWipeFrame, InquiryForm |
| `src/pages/` | Home, Services, Approach, About, Contact, Privacy, NotFound |

## Rules baked in
- Every photograph/crop/WebGL surface renders the “Concept visualization” label; bathrooms, additions and custom homes use
  generated Material Panels and Drafting Lines only — no photos.
- `prefers-reduced-motion`: no Lenis, pins, parallax, WebGL, blur or preloader; reveals become 200ms fades.
- Below 1024px: no pins, tilt, cursor or magnetic effects; WebGL off below 768px (crossfades instead).
- Hidden frames that contain SVG-filter materials also get `opacity: 0` — Chromium still paints filter primitives
  such as `feTurbulence` under `visibility: hidden`.
