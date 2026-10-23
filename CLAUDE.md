# StepUp BD — project brief for Claude Code

Client store built by **Fin Projukti** (finprojukti.tech). Original brief: `prompt.txt`.
**Status and log: `PROGRESS.md`. Update it at the end of every piece of work.**

## What it is

A premium 3D sneaker store for Bangladesh in an iOS-like style (`styles/tokens.css`): soft
Apple greys, white rounded cards, capsule buttons and frosted glass (`.glass`,
`--glass-*`) for the floating navbar, hero panels and pills. One typeface, Archivo
(heavy, slightly condensed headings). University Red (`#C8102E`) only for the logo
accent, sale prices and badges; buttons and selections are ink. Logo: `LogoMark` (rising
steps) + wordmark in `components/layout/Logo.tsx`; the favicon matches. Avoid template/AI
tells: glows, gradient text, eyebrow-plus-giant-headline sections, cursor effects, loader
screens. A "Built by Fin Projukti" badge (`FinCredit`) sits bottom-left. Prices are in BDT (৳3,000–৳5,500).
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
3. **Brand assets.** The hero's 3D shoe is the client-required Air Jordan 1 High OG "Bred",
   built from "Air Jordan 1" by makoto (CC BY 4.0). **The footer credit must stay**
   (`footer.modelCredit`); see `docs/3d-model.md`. Product photos are the client's. The
   procedural fallback shoe uses a generic S-wave, not a brand mark. **The 3D shoe is for
   the look only, never a product for sale**: no price, cart or quick view is tied to it.
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
8. **Hero scroll story.** `sections/HeroStory.tsx` holds a sticky 3D stage under the hero
   panel and three short story steps (60svh each = `STEP_SCREENS` in
   `three/HeroScene.tsx`, which maps scroll to the `DESKTOP` / `PHONE` poses). Keep it
   short: the owner wants shoppers in the shop quickly. The hero opens on White / Red
   (`DEFAULT_HERO_COLORWAY`); copy stays colour-neutral. The stage shows nothing until the
   shoe is visible in its colourway (`onShown` then `onReady`): never flash a stand-in or
   the file's own colours on reload.
9. `.in` (scroll reveal) is added to the DOM directly: put `data-reveal` only on elements
   whose `className` React never changes.
10. **Photos.** `images[]` holds local paths under `public/products/` (each `<x>.webp` has
   an `<x>-480.webp` thumbnail) or Cloudinary URLs uploaded from the admin (resized by URL);
   `lib/images.ts` handles both. Media boxes reserve their aspect ratio (no layout shift).
11. **Commits** (owner's rule): several focused commits written as the owner, with no
    co-author trailer; push after each.
12. **Secrets.** `backend/.env` (git-ignored) holds the Atlas URI, Cloudinary keys, the
    admin login and `JWT_SECRET`. Never commit them or put them in the frontend; the
    browser uploads to Cloudinary with a one-time signature from `/api/admin/uploads/sign`.
13. **Admin panel** (`frontend/src/admin`, lazy chunk at `/admin`; API `/api/admin/*`
    behind `adminAuth`, JWT 12 h). Input is whitelisted in `services/productInput.js`.
14. **Payments**: bKash, Nagad, Rocket (demo wallet screens via `isWallet`), card (test
    card), Cash on Delivery. Add a method in `Order.PAYMENT_METHODS` and
    `lib/checkout.ts` together.

## QA

After changes: typecheck, lint and build, then check the page at 1440 × 900 and 390 × 844
(a headless browser works). Test the flow (search → quick view → cart → STEPUP10 →
checkout → success → track) with the API on, and again with it off.
