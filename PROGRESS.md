# StepUp BD: Build Progress

**Client work by Fin Projukti** (finprojukti.tech)
**Updated:** 22 Oct 2026 (night) · **Stage:** Phase 3 done: hero scroll story, the "Sail &
Ink" palette, trending autoplay. Phase 2: real AJ1 Bred 3D model, the client's photos. On GitHub: `rifff-fin/StepUp-BD` (`main`). Next: deploy
(needs the client's MongoDB Atlas, Render and Netlify accounts) and client content.

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
2. **Hero + scroll story** (`sections/HeroStory.tsx`, `three/HeroScene.tsx`): one sticky
   3D stage under five screens of copy.
   - Hero: huge "STEPUP BD", the AJ1 "Bred" in front of it, tagline, Shop Now / Shop the
     Bred, colourways, stats. When the loader lifts, the title and panels rise in and the
     shoe spins up into place.
   - Motion: slow spin, float, mouse tilt and drag with inertia in the hero; scrolling on,
     the shoe glides to the side (above the copy on phones) and turns to each detail:
     01 the icon (side profile), 02 the toe box, 03 Wings logo and collar, 04 "Shop the
     Bred" with price and CTAs. Poses are eased, so it feels scrubbed.
   - Colourways: Bred, White/Red and All Black (texture cross-fade).
   - Reduced motion: no spin or intro, plus a "Turn on motion" pill. The SVG fallback
     shows without WebGL.
3. **Brand marquee**: an ink band with model names and small red diamonds.
4. **Why StepUp BD**: authentic, Cash on Delivery, 7-day return, fast Dhaka delivery.
5. **Trending carousel**: 10 popular pairs, with arrows and progress. Autoplay: one card
   every 3.5 s, looping, only while on screen; it holds on hover, focus or touch and has a
   pause button (WCAG 2.2.2). Off with reduced motion.
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

## Phase 2 (22 Oct 2026): real 3D Bred, real photos, UI polish

- **3D hero = Air Jordan 1 High OG "Bred"** (client requirement).
  - Source: "Air Jordan 1" by makoto, Sketchfab, CC BY 4.0. The credit is in the footer,
    the README and `docs/3d-model.md`.
  - Reduced to one shoe and recoloured panel by panel from Panda to Bred: red toe box, heel,
    ankle wing and outsole; black mudguard, quarter, swoosh, collar and tongue; white
    midsole.
  - Compressed 8.1 MB → 0.96 MB (WebP textures, meshopt geometry, no CDN decoder).
  - Leather finish (matte, softer reflections) fixes the plastic look the client noticed.
  - The colour switcher cross-fades between three painted textures: Bred, White/Red, All
    Black.
  - Falls back to the procedural shoe if the model fails, and to a drawn shoe without WebGL.
- **Catalog rebuilt from the client's 37 photos**: 36 products plus the Bred flagship
  (studio renders of the model). The two Samba OG photos became one product with a gallery.
  - Photos are WebP (about 900 px) plus 480 px thumbnails, with EXIF stripped: 2.8 MB in
    total, lazy-loaded.
  - New colours: Beige, Yellow, Pink, Purple. Brands are now Nike, Jordan, Air Force,
    Adidas, New Balance; Puma and Asics return when their photos arrive.
- **UI polish** using the ui-ux-pro-max skill. Its generic design system (gold, glass,
  Cormorant) did not fit the client's red/black brand, so its UX rules were applied
  instead:
  - Nothing smaller than 12 px.
  - Photos reserve their space, use `srcset`, and are lazy.
  - Shipping fields are checked on blur, with an error summary on submit that is focused
    and links to each field.
  - The CTA repeats: "Shop this pair" in the hero, and a new "The icon" Bred spotlight
    section (phase 3 folded both into the scroll story's "Shop the Bred").
  - The WhatsApp button appears after the hero, so it no longer covers the stats.
  - Cards show a size range ("EU 39–45"); the category is hidden on phone cards.
  - The quick view has a gallery; its 3D viewer is shown only for the Bred.
- **Git**: the repo was initialised and pushed in focused commits under the owner's name,
  with no co-author lines.

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
- [x] Real product photos (client's 37) and the real AJ1 "Bred" 3D model.
- [ ] Confirm the photos may be used commercially (the client supplied them; some carry
      other shops' watermarks or packaging, e.g. #5 and #10).
- [ ] Puma and Asics products, once photos exist.
- [ ] Optional: real payment gateways (bKash/Nagad merchant APIs, SSLCommerz) and an
      admin page for orders. Both are out of scope for the demo.
- [x] Git: `rifff-fin/StepUp-BD`, focused commits under the owner's name.

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
- 22 Oct 2026: Git initialised and pushed in 5 commits (setup, backend, frontend setup,
  store UI, 3D).
- 22 Oct 2026: Phase 2.
  - Client feedback: use real photos, use the AJ1 High OG "Bred" for the 3D hero, and the
    texture looked plastic.
  - Found a CC BY AJ1 model (makoto). Built a model lab (`frontend/tools/model-lab`) to
    split the pair and map texture islands to panels, then repainted it to Bred (checked
    against a reference photo of the Bred colour blocking).
  - Exported and compressed the model; added White/Red and All Black textures with a shader
    cross-fade.
  - Catalog rebuilt from the 37 photos. UI fixes per ui-ux-pro-max.
  - QA: 0 console errors. The full checkout flow passes (an order of 2 Bred came to ৳10,000
    after STEPUP10, stored on the API). No broken images; the 3D model is on the Bred only.
  - Note: `prompt.txt` was deleted from the working copy by the owner and is not part of
    these commits.
- 22 Oct 2026: Phase 3. Owner feedback: the hero animation wasn't working, there was no
  scroll motion, and the colours looked "cringy".
  - The hero animation was there, but the dev PC reports reduced motion (Windows
    "Animation effects" off), so the site switched it off. The hero now offers "Turn on
    motion" right there, besides the footer switch.
  - Scroll story: the hero and the old Bred spotlight became one sticky 3D stage whose
    shoe turns to each detail as you scroll (modelled on the pinned, scrubbed scroll of
    LANGLOK). Intro spin when the loader lifts.
  - Palette research: LANGLOK (light mist + ink + one accent), Sneakersnstuff and Footshop
    teardowns on ecomm.design (neutral grounds, product photos carry the colour), luxury
    colour guidance (Hook Agency: restraint, warm neutrals, one accent) and ui-ux-pro-max
    (ecommerce luxury: off-white + near-black + one accent). Result: "Sail & Ink", from the
    shoe itself: sail paper, warm ink and University Red. Neon glows, the red newsletter
    gradient, red rim lights and coloured card glows were removed or toned down.
  - Navbar turns dark over ink sections (`data-nav-dark`). Trending autoplay with pause.
  - QA at 1440 × 900 and 390 × 844, with motion on and reduced: 0 console errors; full
    checkout flow passes.
