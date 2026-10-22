// Store-wide catalog options. The single source for the enums the models validate against
// and for the filter lists the frontend reads from GET /api/meta.

const BRANDS = ['Nike', 'Jordan', 'Air Force', 'Adidas', 'Puma', 'New Balance', 'Asics'];

const CATEGORIES = ['Sneakers', 'Running', 'Lifestyle', 'Basketball'];

// Side-view silhouette used by the frontend's drawn product images
const SILHOUETTES = ['low', 'high', 'runner'];

const COLORS = [
  { name: 'Red', hex: '#E10600' },
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#F4F4F4' },
  { name: 'Blue', hex: '#1F4FD1' },
  { name: 'Grey', hex: '#9AA0A6' },
  { name: 'Green', hex: '#1E7A46' },
  { name: 'Brown', hex: '#9A6436' },
];

// EU sizes stocked
const SIZES = [39, 40, 41, 42, 43, 44, 45];

// Selling prices are kept inside this band (BDT)
const PRICE_RANGE = { min: 3000, max: 5500 };

const CURRENCY = { code: 'BDT', symbol: '৳' };

module.exports = { BRANDS, CATEGORIES, SILHOUETTES, COLORS, SIZES, PRICE_RANGE, CURRENCY };
