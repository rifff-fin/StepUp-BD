# StepUp BD — project brief for Claude Code

Client store built by **Fin Projukti** (finprojukti.tech). Original brief: `prompt.txt`.
**Status and log: `PROGRESS.md`. Update it at the end of every piece of work.**

## What it is

A dark, premium 3D sneaker store for Bangladesh: black, white and one red (`#E10600`);
Bebas Neue for display text and Inter for body text. Prices are in BDT (৳3,000–৳5,500).
It is a **demo store**: payments are simulated and orders are never fulfilled.

## Stack and layout

- `backend/`: Node ≥22, Express 5, Mongoose, CommonJS, MVC (`models/ controllers/ routes/
  middleware/ services/ data/ scripts/`), following the studio's MERN repos. Controllers
  carry the `@desc / @route / @access` header.
- `frontend/`: Vite 8, React ~19.3, TypeScript ~6.0, three + @react-three/fiber + drei,
  zustand, Lenis, axios, react-router 8. Conventions follow fin-projukti-web-portal: copy
  in `src/content/copy.ts`, one section per file in `src/sections/`, 3D in `src/three/`,
  Prettier (single quotes, width 100) and ESLint with the React Compiler hook rules.

## Commands

- API: `cd backend && npm run dev` (port 5000; an in-memory MongoDB when `MONGODB_URI`
  is unset), `npm run seed`, `npm run export:demo`
- Store: `cd frontend && npm run dev` (port 5190, proxies `/api`), `npm run typecheck`,
  `npm run lint`, `npm run build`

## Rules (do not break)

1. **The server owns money.** Order totals, coupons and delivery fees are recalculated in
   `backend/services/pricingService.js`. `frontend/src/lib/pricing.ts` mirrors it for the
   preview only. Change both together.
2. **Payment details never leave the browser.** Card numbers and wallet PINs live only in
   component state (`PaymentStep`, `WalletMock`). `createOrder` sends the method name
   only, and `validateOrder` builds the order from whitelisted fields. Only the test card
   `4242…` and the demo PIN `12345` pass.
3. **No brand logos.** The shoe stripe is a generic S-wave; brand names appear as text only.
4. **Never empty.** If the API cannot be reached, `services/fallback.ts` switches to
   `content/demoCatalog.json` (generated from `backend/data` by `npm run export:demo`;
   product ids are stable hashes of the slug, so both sides agree). Re-export after
   editing the catalog.
5. **Sample content is labelled.** Reviews are sample content, and the UI says so.
   Unconfirmed business facts carry `TODO(client)` in `copy.ts`.
6. **3D performance.** The 3D code is a lazy chunk, `dpr` is capped at 2, the hero pauses
   off-screen (`frameloop`), and an SVG fallback stays in place without WebGL. The
   materials are made once and colours are eased, never re-created.
7. **Motion.** `html[data-reduced]` (set before first paint) drives CSS and JS; the
   footer Motion switch overrides the OS setting. The dev PC reports reduced motion.
8. `.in` (scroll reveal) is added to the DOM directly: put `data-reveal` only on elements
   whose `className` React never changes.

## QA

After changes: typecheck, lint and build, then check the page at 1440 × 900 and 390 × 844
(a headless browser works). Test the flow (search → quick view → cart → STEPUP10 →
checkout → success → track) with the API on, and again with it off.
