# StepUp BD: Premium, but Affordable.

A 3D sneaker store for Bangladesh, built by [Fin Projukti](https://finprojukti.tech).

- **Hero**: a real-time 3D **Air Jordan 1 High OG "Bred"**. It floats, follows the mouse,
  can be dragged and turns as you scroll. The colour switcher (Bred, White/Red, All Black)
  cross-fades the leather, and a "Shop this pair" link sits under it.
- **Shop**: 37 products with real photos. Live search, category tabs, filters (brand,
  price, size, colour), sorting, and a quick view with a photo gallery. The Bred's quick
  view adds the 3D viewer.
- **Cart and wishlist**: kept in the browser, with delivery zones and the `STEPUP10` coupon.
- **Checkout (demo)**: shipping, payment (bKash, Nagad, card, Cash on Delivery), review,
  success with confetti, plus order tracking.

> **Demo store.** No real orders are fulfilled and no real payments are taken. The card
> form accepts only the test card `4242 4242 4242 4242`, and the wallet screens accept only
> the demo PIN `12345`. Card numbers and PINs never leave the browser; the API only ever
> receives the payment *method*.

## Structure (MVC)

```
stepup bd/
├── backend/                Express 5 + Mongoose API (Model–View–Controller, the API side)
│   ├── server.js           app setup, routes, error handling
│   ├── config/db.js        MongoDB connection (in-memory DB when MONGODB_URI is empty in dev)
│   ├── models/             Product, Order, Coupon, Subscriber          ← Model
│   ├── controllers/        product, order, coupon, newsletter, meta    ← Controller
│   ├── routes/             URL → controller mapping
│   ├── middleware/         order validation, rate limiting, errors
│   ├── services/           pricingService (fees, coupons, ETA), seedService
│   ├── data/               seed catalog, districts, coupons, catalog options
│   └── scripts/            seed.js, exportDemoCatalog.js
├── frontend/               Vite + React 19 + TypeScript store           ← View
│   ├── src/sections/       one home-page section per file (Hero, Shop, Reviews, …)
│   ├── src/components/     layout, product, shop, cart, checkout, ui
│   ├── src/pages/          Home, Track order, 404
│   ├── src/store/          zustand stores: cart, wishlist, ui (client-side models)
│   ├── src/services/       API calls (axios), with fallback to the bundled demo data
│   ├── src/hooks/          catalog controller hook, focus trap, reveal, media queries
│   ├── src/three/          AJ1 Bred model loader, hero scene, mini viewer, procedural fallback
│   ├── public/products/    product photos (WebP + 480px thumbnails)
│   ├── public/models/      the 3D model and its colourway textures
│   └── tools/model-lab/    dev-only tool that made the Bred model (docs/3d-model.md)
│   ├── src/content/        all copy (copy.ts) + demoCatalog.json (generated)
│   └── src/styles/         tokens + plain CSS per area
├── docs/3d-model.md        3D model source, licence, edits, and how to regenerate it
├── netlify.toml            frontend deploy + /api proxy to Render
├── render.yaml             API deploy (Render blueprint)
└── PROGRESS.md             build log and status
```

## Run it locally

Requires Node 22 or newer.

```bash
# 1. API (http://localhost:5000)
cd backend
npm install
npm run dev          # no .env needed: uses an in-memory MongoDB and seeds 37 products

# 2. Store (http://localhost:5190), in a second terminal
cd frontend
npm install
npm run dev          # /api is proxied to localhost:5000
```

To keep data between restarts, copy `backend/.env.example` to `backend/.env` and set
`MONGODB_URI` (e.g. a free MongoDB Atlas cluster). The products seed themselves into an
empty database at start-up.

Checks: `npm run typecheck`, `npm run lint` and `npm run build` in `frontend/`.

**Motion.** If Windows "Animation effects" is off, browsers report reduced motion and
the site turns animations off. Use the **Motion** switch in the footer to turn them back on.
The choice is remembered.

## Deploy

1. **API → Render.** Create a Blueprint from `render.yaml` (or a Web Service with root
   `backend`, build `npm install`, start `npm start`). Set `MONGODB_URI` to your Atlas
   connection string. Health check: `/api/health`.
2. **Store → Netlify.** Connect the repo; `netlify.toml` already sets base `frontend`,
   build `npm run build` and publish `dist`. Replace the Render URL in the `/api/*`
   redirect with your API's URL.

Netlify proxies `/api/*` to Render, so the browser talks to one origin (no CORS setup).
If the API is asleep (free tier) or not deployed yet, the store falls back to the bundled
demo catalog and a browser-only demo checkout, so it is never empty. A small "built-in
demo catalog" note shows when that happens.

## Products and photos

The catalog lives in **`backend/data/products.js`** (37 products, from the client's photos).
Each product looks like this:

```js
{
  slug: 'nike-dunk-low-cacao-wow',          // unique, lowercase-with-dashes
  name: 'Nike Dunk Low "Cacao Wow"',
  brand: 'Nike',                            // one of BRANDS in data/catalogOptions.js
  category: 'Sneakers',                     // Sneakers | Running | Lifestyle | Basketball
  price: 4300, originalPrice: 5600,         // BDT; the discount badge is calculated
  rating: 4.8, reviewCount: 228,
  sizes: [39, 40, 41, 42, 43, 44, 45],      // EU sizes in stock
  colors: ['Brown', 'White'],               // for the colour filter (COLORS)
  images: img('nike-dunk-low-cacao-wow'),   // photos; the first is the main one
  palette: palette('#F1ECE4', '#7B4A32', …), // card glow + drawn fallback if a photo fails
  silhouette: 'low',                        // shape of that fallback drawing
  description: '…', popularity: 94, isNewArrival: false, trending: true,
}
```

**Adding or changing a product:**
1. Save the photo as `frontend/public/products/<slug>.webp` (about 900 px on the long side)
   plus a `<slug>-480.webp` thumbnail. Any image tool works; for example with Pillow:
   `img.thumbnail((900, 1200)); img.save('x.webp', quality=82)` and again at 480 px.
   Portrait (4:5) or square photos fit the cards best. Several photos make a gallery:
   `images: img('slug', 'slug-2')`.
2. Edit the list (new brands, colours or sizes go in `data/catalogOptions.js` first).
3. `cd backend && npm run seed` replaces the catalog in the database. Orders are kept.
4. `npm run export:demo` refreshes `frontend/src/content/demoCatalog.json`, the offline
   copy the store uses if the API is down. Commit it with the photos.

Photos can also be full URLs (e.g. a CDN). Thumbnails are then not derived, and the URL is
used as it is.

> The current photos were supplied by the client. Before launch, make sure the shop owns
> them or has permission to use them.

**Copy, contacts, socials, WhatsApp number**: `frontend/src/content/copy.ts` (lines marked
`TODO(client)`). The WhatsApp number can also be set with `VITE_WHATSAPP_NUMBER`.

## The 3D shoe (Air Jordan 1 High OG "Bred")

The hero uses a real model: **"Air Jordan 1" by makoto (Sketchfab), CC BY 4.0**. It was
reduced to one shoe, recoloured from black/white to Bred, and compressed from 8 MB to
0.96 MB. The licence requires credit, which is in the footer; keep it. The colour switcher
swaps the model's leather texture (`frontend/public/models/aj1-*.webp`).

- Settings: `frontend/src/three/config.ts` (model URL, leather finish, fade time).
- Colourways: `frontend/src/three/colorways.ts`.
- Full story, the panel-by-panel colour map, and how to add a colourway or swap the model:
  **[docs/3d-model.md](docs/3d-model.md)**.

If the model can't load, the procedural shoe (`src/three/shoeGeometry.ts`) is shown
instead. Without WebGL, a drawn shoe is shown.

## API

| Method | Route | What it does |
|---|---|---|
| GET | `/api/products?q=&brand=&category=&minPrice=&maxPrice=&size=&color=&sort=&trending=&limit=` | list + brand counts |
| GET | `/api/products/:slug` | one product |
| GET | `/api/meta` | brands, sizes, colours, price range, 64 districts, delivery fees |
| POST | `/api/coupons/validate` | `{ code, subtotal }` → discount |
| POST | `/api/orders` | place a demo order (prices recalculated on the server) |
| GET | `/api/orders/:orderNumber?phone=` | look an order up (phone must match) |
| POST | `/api/newsletter` | `{ email }` |
| GET | `/api/health` | status + database connection |

Demo orders are deleted automatically after 30 days (TTL index).
