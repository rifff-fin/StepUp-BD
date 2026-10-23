const { BRANDS, CATEGORIES, SILHOUETTES, COLORS, SIZES } = require('../data/catalogOptions');

const HEX = /^#[0-9A-Fa-f]{6}$/;
const PALETTE_KEYS = ['upper', 'overlay', 'stripe', 'midsole', 'outsole', 'laces', 'tab', 'collar'];

// "Air Jordan 1 "Bred"" -> "air-jordan-1-bred"
const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/**
 * A palette for the drawn placeholder (shown only if a photo fails): from the first colour
 * the admin picked, with a white midsole.
 */
const paletteFor = (colors) => {
  const main = COLORS.find((c) => c.name === colors[0])?.hex || '#111111';
  const second = COLORS.find((c) => c.name === colors[1])?.hex || main;
  return {
    upper: main,
    overlay: second,
    stripe: second,
    midsole: '#F4F4F4',
    outsole: main,
    laces: main,
    tab: second,
    collar: main,
  };
};

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : undefined);
const number = (value) => (value === '' || value === null ? NaN : Number(value));
const bool = (value) => (typeof value === 'boolean' ? value : undefined);

/**
 * Whitelists and checks a product from the admin form. `partial` (PUT/PATCH) only checks
 * the fields that are present. Returns { data, errors }.
 */
const readProductInput = (body = {}, { partial = false } = {}) => {
  const data = {};
  const errors = {};
  const has = (key) => body[key] !== undefined;

  if (!partial || has('name')) {
    const name = text(body.name, 120);
    if (!name || name.length < 3) errors.name = 'Enter a product name';
    else data.name = name;
  }
  if (has('slug') || (!partial && data.name)) {
    const slug = slugify(body.slug || data.name);
    if (!slug) errors.slug = 'Enter a URL name';
    else data.slug = slug;
  }
  if (!partial || has('brand')) {
    if (!BRANDS.includes(body.brand)) errors.brand = 'Choose a brand';
    else data.brand = body.brand;
  }
  if (!partial || has('category')) {
    if (!CATEGORIES.includes(body.category)) errors.category = 'Choose a category';
    else data.category = body.category;
  }
  if (has('silhouette')) {
    if (!SILHOUETTES.includes(body.silhouette)) errors.silhouette = 'Choose a shape';
    else data.silhouette = body.silhouette;
  }
  if (!partial || has('price')) {
    const price = number(body.price);
    if (!Number.isFinite(price) || price < 0 || price > 1000000) errors.price = 'Enter a price';
    else data.price = Math.round(price);
  }
  if (!partial || has('originalPrice')) {
    const original = has('originalPrice') ? number(body.originalPrice) : data.price;
    if (!Number.isFinite(original) || original < 0) errors.originalPrice = 'Enter the old price';
    else data.originalPrice = Math.round(original);
  }
  if (
    data.price !== undefined &&
    data.originalPrice !== undefined &&
    data.originalPrice < data.price
  ) {
    errors.originalPrice = 'The old price must be at least the selling price';
  }
  if (!partial || has('sizes')) {
    const sizes = Array.isArray(body.sizes) ? [...new Set(body.sizes.map(Number))] : [];
    if (!sizes.length || sizes.some((s) => !SIZES.includes(s))) {
      errors.sizes = 'Pick at least one size';
    } else data.sizes = sizes.sort((a, b) => a - b);
  }
  if (!partial || has('colors')) {
    const names = COLORS.map((c) => c.name);
    const colors = Array.isArray(body.colors) ? body.colors.filter((c) => names.includes(c)) : [];
    data.colors = colors;
  }
  if (has('images') || !partial) {
    const images = Array.isArray(body.images)
      ? body.images
          .map((src) => text(src, 300))
          .filter((src) => src && (src.startsWith('/') || /^https:\/\//.test(src)))
          .slice(0, 8)
      : [];
    data.images = images;
  }
  if (has('description')) data.description = text(body.description, 600) || '';
  if (has('popularity')) {
    const popularity = number(body.popularity);
    if (Number.isFinite(popularity)) data.popularity = Math.max(0, Math.round(popularity));
  }
  for (const flag of ['isNewArrival', 'trending', 'active']) {
    if (bool(body[flag]) !== undefined) data[flag] = body[flag];
  }
  if (body.palette && typeof body.palette === 'object') {
    const palette = {};
    for (const key of PALETTE_KEYS) {
      if (HEX.test(body.palette[key])) palette[key] = body.palette[key];
    }
    if (Object.keys(palette).length === PALETTE_KEYS.length) data.palette = palette;
  }
  if (!partial && !data.palette && data.colors) data.palette = paletteFor(data.colors);

  return { data, errors };
};

module.exports = { readProductInput, slugify, paletteFor };
