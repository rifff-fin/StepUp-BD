# StepUp BD: feature checklist

**How to use:** put an `x` in the box of each feature you want, like `- [x]`, and save the
file. Then tell me "check the checklist" and I will build the ticked ones. Leave a box empty
to skip that feature.

What Bangladeshi stores and developers offer, from the research (October 2026):

- **Payment:** Cash on Delivery is still around 95% of online payments in Bangladesh.
  Stores that take wallets offer bKash, then Nagad and Rocket, plus cards through
  SSLCommerz.
- **Courier:** local store builders (Bitcommerz, Sellsull, Klytosell) all advertise direct
  links to the Steadfast, Pathao, RedX and Paperfly couriers.
- **Price:** custom builds from BD developers list SSLCommerz, courier links, automatic
  courier booking, coupons and stock across several warehouses (one Laravel package is
  ৳180,000).

Sources: [BD sneaker / shoe shopping overview](https://unb.com.bd/category/sports/top-online-shops-to-find-sports-equipment-in-bangladesh/65932),
[Bitcommerz](https://bitcommerz.com/llms.txt),
[BDStall custom e-commerce package](https://www.bdstall.com/details/complete-e-commerce-website-with-ai-integration-173531/),
[Shopify BD courier app](https://apps.shopify.com/wd-easy-courier-bd).

---

## Already in the site (no action needed)

- [x] Live 3D hero shoe with colourways and a short scroll animation (for the look only, not for sale)
- [x] 37 products with real photos, search, brand / size / colour / price filters, sorting
- [x] Quick view, size picker, cart, wishlist (saved in the browser)
- [x] Coupons (STEPUP10), delivery fee inside / outside Dhaka by district
- [x] Demo checkout: bKash, Nagad, Rocket, card, Cash on Delivery
- [x] Order tracking by order ID + phone
- [x] Admin panel: dashboard, products (Cloudinary photo upload), orders and status, coupons, subscribers (CSV export)
- [x] MongoDB Atlas database, newsletter sign-up, WhatsApp button
- [x] Works on phones, reduced-motion support, works offline with a built-in demo catalog

## Payments (real money)

- [ ] **bKash merchant (Payment Gateway / Checkout API)**: real bKash payments (needs a bKash merchant account)
- [ ] **Nagad merchant API**: real Nagad payments (needs a Nagad merchant account)
- [ ] **SSLCommerz**: cards, internet banking, and Rocket, bKash and Nagad in one gateway
- [ ] **Partial advance for Cash on Delivery**: e.g. pay the delivery fee by bKash first, which cuts fake orders
- [ ] **Invoice PDF**: emailed / downloadable invoice for each order

## Delivery and couriers

- [ ] **Steadfast courier**: book a parcel from the admin panel in one click
- [ ] **Pathao courier**: booking and live parcel status
- [ ] **RedX / Paperfly**: same, if the client uses them
- [ ] **Courier tracking on the "Track order" page**: shows the courier's live status
- [ ] **Delivery charge by area**: Dhaka city / suburbs / outside Dhaka, set from the admin

## Customers and orders

- [ ] **SMS on order** (order ID, confirmation, "out for delivery") through a BD SMS gateway
- [ ] **Customer accounts with phone OTP login**: order history, saved addresses
- [ ] **Order confirmation call list**: the admin marks Cash on Delivery orders confirmed after calling
- [ ] **Fake-order protection**: block repeat cancellers by phone, limit orders per phone per day
- [ ] **Return / exchange requests**: the customer asks online, the admin approves
- [ ] **Real customer reviews with photos** (replace the sample reviews)
- [ ] **"Notify me when back in stock"** by SMS or email

## Catalog and stock

- [ ] **Stock count per size**: sold-out sizes hide automatically, low-stock alerts in the admin
- [ ] **A page for each product** (its own URL, better for Google and for sharing on Facebook)
- [ ] **Size guide**: a chart of EU / UK / US / cm sizes on each product
- [ ] **Pre-orders / upcoming drops** with a countdown
- [ ] **Flash sale timer** on selected products
- [ ] **Product videos** (Cloudinary video) in the gallery
- [ ] **Bulk import / export of products** (CSV / Excel)

## Marketing

- [ ] **Facebook Pixel + Conversions API**: track ads, sales and abandoned carts
- [ ] **Facebook / Instagram product catalog feed** for shop tabs and dynamic ads
- [ ] **Google Analytics 4 + Google Merchant Center feed**
- [ ] **Messenger chat button** (as well as WhatsApp)
- [ ] **Abandoned cart reminders** (SMS / email)
- [ ] **Referral codes and loyalty points**
- [ ] **Newsletter sending** from the admin panel (not just collecting emails)
- [ ] **Homepage banners editable from the admin** (offers, Eid sale, etc.)
- [ ] **Blog / lookbook** for SEO

## Store experience

- [ ] **Bangla / English language switch**
- [ ] **Recently viewed** and **you may also like** on every product
- [ ] **Install as an app (PWA)** with an icon on the phone home screen
- [ ] **Dark mode**
- [ ] **Compare two pairs side by side**

## Admin and business

- [ ] **Several admin users with roles** (owner, order manager, content editor)
- [ ] **Sales reports**: by day, brand and product, with export to Excel
- [ ] **Expense and profit tracking** (buying cost per pair)
- [ ] **In-shop sales (POS)** sharing the same stock as the website
- [ ] **Activity log**: who changed which order or product

## Launch

- [ ] **Custom domain + SSL** (e.g. stepupbd.com) and business email
- [ ] **Hosting set-up** (Netlify + Render, or a VPS) with daily database backups
- [ ] **Privacy policy, terms, refund policy pages** (needed by payment gateways)
- [ ] **Remove the demo labels** once real payments are live
