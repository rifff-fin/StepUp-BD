# StepUp BD: Build Progress

**Client work by Fin Projukti** (finprojukti.tech)
**Updated:** 22 Oct 2026 · **Stage:** Built and tested locally. Next: deploy (needs the
client's MongoDB Atlas, Render and Netlify accounts) and client content.

> Update this file at the end of every piece of work: what changed, what's next, what's
> blocked, plus a dated log line. Original brief: `prompt.txt`. How to run and deploy:
> `README.md`. Rules for future work: `CLAUDE.md`.

## Architecture

| Part | Modelled on | Stack |
|---|---|---|
| `backend/`, the MVC API | thesisflow-mern, KAAJ_KAAM, Ekotro | Node ≥22, Express 5, Mongoose, CommonJS |
| `frontend/`, the store (View) | fin-projukti-web-portal | Vite 8, React 19.3, TS 6, three + R3F + drei, zustand, Lenis, axios, react-router 8 |
| Deploy | KAAJ_KAAM | Netlify (store) proxies `/api/*` to Render (API) |

**MVC**
- **Models**: Mongoose `Product`, `Order`, `Coupon`, `Subscriber`, plus zustand stores
  for cart and wishlist on the client.
- **Views**: React sections and components.
- **Controllers**: Express controllers via routes, plus the `useProducts` hook on the client.

## What's in the store (top to bottom)

0. **Intro loader**: "STEPUP BD" letters rise and a red bar fills, then it lifts.
   Skipped with reduced motion.
1. **Navbar**: logo, section links, search (jumps to the shop search), wishlist and cart
   with bouncing badges, hamburger menu on phones.
2. **Hero**: huge "STEPUP BD" with the live 3D sneaker in front of it.
   - The shoe is procedural: outsole, red foxing line, midsole with heel lift and toe
     spring, upper with a real foot opening, toe cap, heel counter, mudguard, eyestays, a
     generic S-wave stripe, padded collar, criss-cross laces with eyelets, tongue with a
     tag, heel pull tab.
   - Motion: auto-rotate, float, mouse tilt, drag with inertia, and scroll-linked
     rotation and zoom.
   - Colourways: Red/Black, White/Red and All Black, with eased colour changes.
   - Also: tagline, Shop Now button, stats, and an SVG fallback without WebGL.
3. **Brand marquee**: red tilted band with brand names as text.
4. **Why StepUp BD**: authentic, Cash on Delivery, 7-day return, fast Dhaka delivery.
5. **Trending carousel**: 10 popular pairs, with arrows and progress.
6. **Shop**:
   - Live search, debounced and served by the API.
   - Tabs: All, Sneakers, Running, Lifestyle, Basketball.
   - Sort: popular, newest, price low to high, price high to low.
   - Filters: brand with counts, dual-thumb price slider (৳3,000–৳5,500), EU sizes,
     colours. A sidebar on desktop, a slide-in panel on phones.
   - Cards lift, glow and tilt, with a discount badge, rating, sizes and Quick View.
7. **Quick view**:
   - Big image, plus a mini 3D viewer in the product's colours (drag, expand).
   - Size picker (arrow keys work), quantity, Add to Cart (shows an error with no size),
     wishlist.
   - 3 sample reviews per product.
8. **Reviews slider**: 6 sample reviews, autoplay, labelled "Sample reviews: illustrative
   content".
9. **FAQ accordion**, then **Newsletter** (saved by the API).
10. **Footer**: links, contact details, socials, demo-store note, Motion switch, "Website
    by Fin Projukti". WhatsApp button.

**Drawers**
- **Cart**: quantities, remove, delivery zone (৳100 inside Dhaka, ৳150 outside), coupon
  `STEPUP10` (−10%), totals, "You might like" picks.
- **Wishlist**: "Choose size" reopens the quick view; empty states show picks.

**Checkout (demo)**: 4-step progress bar, with the DEMO MODE banner on every step.
1. Shipping: name, BD mobile, address, the 64 districts by division. The delivery fee
   follows the district.
2. Payment:
   - bKash / Nagad: mock screen that needs the demo PIN 12345.
   - Card: test card 4242 only.
   - COD.
3. Review.
4. Processing (2 s), then success: confetti, order ID SUBD-#####, summary, delivery
   window. "Continue shopping" empties the cart.

**Track order** (`/track`): order ID plus phone, pre-filled with your last order, with a
delivery timeline. **404** page shows trending picks.

**Never empty**: if the API can't be reached, the store uses the bundled demo catalog
(same product IDs) and places demo orders in the browser.

## Verified (22 Oct 2026, headless Chromium)

- `npm run typecheck`, `npm run lint` and `npm run build` are clean. The main bundle is
  145 KB gzipped; the 3D chunk is 266 KB gzipped and lazy-loaded.
- API curl tests:
  - Filters, search, facets, coupon, 400 validation and 404 lookups all work.
  - An order ignores a fake client price and drops an injected `cardNumber`.
- Browser flow with the API on: search, filter, tab, sort, quick view, size error, add ×2,
  cart, STEPUP10, outside-Dhaka fee, shipping validation, real card rejected, wrong PIN
  rejected, bKash with 12345, success and reset. 0 console errors.
- Browser flow with the API off: catalog from the bundle in 2.8 s, search, COD order to
  Chattogram (৳150), tracking finds it.
- Reduced motion, Motion switch, focus trap, Escape and focus return, size arrow keys,
  no unlabelled buttons, no horizontal scroll at 390 px.
- `.glb` swap: a GLB exported from the procedural shoe loads, scales and takes palette
  colours. The config is back to the procedural shoe afterwards.

## Next / blocked

- [ ] **Deploy** (needs the client's accounts):
  1. MongoDB Atlas URI goes into Render (`render.yaml`).
  2. Put the Render URL into the `netlify.toml` `/api/*` redirect.
  3. Put the Netlify URL into `CLIENT_ORIGIN`.
- [ ] **Client content** (`TODO(client)` in `frontend/src/content/copy.ts`):
  - Phone, email, address, hours, social links, WhatsApp number.
  - Hero stats (10K+, 4.9★).
  - The authenticity/refund wording.
- [ ] Real product data and photos (README, "Replace the placeholder products").
- [ ] Optional: a real `.glb` shoe (README, "Use a real .glb shoe model").
- [ ] Optional: real payment gateways (bKash/Nagad merchant APIs, SSLCommerz) and an
      admin page for orders. Both are out of scope for the demo.
- [ ] Optional: `git init` and push, as with the other studio repos.

## Log

- 22 Oct 2026: Started as a single `index.html` (the CSS was written). The brief then
  changed to an MVC app modelled on the studio repos, and the CSS was reused.
- 22 Oct 2026: Backend done and tested. Replaced nodemon with `node --watch` (clears 3
  dev-only audit findings).
- 22 Oct 2026: Frontend built: sections, quick view, drawers, checkout, tracking, 3D hero
  and mini viewer.
- 22 Oct 2026: Per the client's request that nothing be empty:
  - Bundled demo catalog with offline fallback; seed IDs made stable.
  - Per-product sample reviews; contact details and hours in the footer.
  - "You might like" in drawers; trending picks on the 404 page; track-order prefill.
- 22 Oct 2026: QA fixes:
  - Tagline specificity; shoe proportions (taller upper, slimmer sole).
  - Desktop hero fits above the fold; swatch wrapping on phones.
  - Quick-view layout and mini-viewer camera fit.
  - Toasts moved off the drawer button.
  - Footer word was blocking the Motion switch (now `pointer-events: none`).
  - Coupon placeholder casing.
