# StepUp BD: Premium, but Affordable.

A 3D sneaker store for Bangladesh, built by [Fin Projukti](https://finprojukti.tech).

- **Hero**: a real-time 3D sneaker built from code. It floats, follows the mouse, can be
  dragged and turns as you scroll, with a colour switcher (Red/Black, White/Red, All Black).
- **Shop**: 29 products, live search, category tabs, filters (brand, price, size, colour),
  sorting, and quick view with a mini 3D viewer.
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
│   ├── src/three/          the procedural 3D shoe, hero scene, mini viewer, .glb option
│   ├── src/content/        all copy (copy.ts) + demoCatalog.json (generated)
│   └── src/styles/         tokens + plain CSS per area
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
npm run dev          # no .env needed: uses an in-memory MongoDB and seeds 29 products

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

## Replace the placeholder products

The catalog lives in **`backend/data/products.js`**. Each product looks like this:

```js
{
  slug: 'nike-dunk-low-panda',          // unique, lowercase-with-dashes
  name: 'Nike Dunk Low "Panda"',
  brand: 'Nike',                        // one of BRANDS in data/catalogOptions.js
  category: 'Sneakers',                 // Sneakers | Running | Lifestyle | Basketball
  silhouette: 'low',                    // drawn image shape: low | high | runner
  price: 4200, originalPrice: 5500,     // BDT; the discount badge is calculated
  rating: 4.9, reviewCount: 320,
  sizes: [39, 40, 41, 42, 43, 44, 45],  // EU sizes in stock
  colors: ['Black', 'White'],           // for the colour filter (COLORS)
  palette: palette('#F4F4F4', '#111111', ...),  // colours of the drawn image + 3D shoe
  description: '…', popularity: 100, isNewArrival: false, trending: true,
}
```

1. Edit the list (add brands, colours or sizes in `data/catalogOptions.js` first).
2. `cd backend && npm run seed` replaces the catalog in the database. Orders are kept.
3. `npm run export:demo` refreshes `frontend/src/content/demoCatalog.json`, the offline
   fallback copy. Commit it.

**Real photos.** Product images are drawn SVGs (`frontend/src/components/product/ShoeArt.tsx`).
To use photos, add an `image` field to the Product model and seed data, put the files in
`frontend/public/products/` (or a CDN), and render `<img src={product.image} alt={product.name}>`
in `ProductCard.tsx`, `QuickView.tsx` and `OrderSummary.tsx` where `<ShoeArt>` is used now.

**Copy, contacts, socials, WhatsApp number**: `frontend/src/content/copy.ts` (lines marked
`TODO(client)`). The WhatsApp number can also be set with `VITE_WHATSAPP_NUMBER`.

## Use a real .glb shoe model

The 3D shoe is built from code (`frontend/src/three/shoeGeometry.ts`). To show a real model
instead, in the hero and in every quick view:

1. Put the file at `frontend/public/models/shoe.glb` (keep it small: under 2–3 MB,
   Draco or meshopt compression helps).
2. In **`frontend/src/three/config.ts`**:
   ```ts
   export const SHOE_MODEL_URL = '/models/shoe.glb';
   export const GLB_MATERIALS = { Upper: 'upper', Sole: 'midsole', Laces: 'laces' };
   export const GLB_ROTATION_Y = 0; // e.g. -Math.PI / 2 if the toe doesn't point right
   ```
   `GLB_MATERIALS` maps the model's material names to palette parts, so the colour switcher
   and each product's colours still apply. Unmapped materials keep their own look.
3. Reload. The model is scaled to the same size as the procedural shoe and stood on the
   floor automatically, so the camera, lighting, float, drag and scroll effects all keep
   working.

This path has been tested with a model exported from the procedural shoe (rotated toe
along -z, named materials, then recoloured White/Red).

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
