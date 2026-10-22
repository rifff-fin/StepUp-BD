const Product = require('../models/Product');
const { BRANDS } = require('../data/catalogOptions');

const SORTS = {
  popular: { popularity: -1, rating: -1 },
  'price-asc': { price: 1, popularity: -1 },
  'price-desc': { price: -1, popularity: -1 },
  new: { createdAt: -1 },
  rating: { rating: -1, reviewCount: -1 },
};

// "a,b , c" -> ['a', 'b', 'c']
const listParam = (value) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const numberParam = (value) => {
  const n = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(n) ? n : null;
};

/**
 * Builds the Mongo filter from the query string. `omit` leaves one facet out, so the brand
 * counts can be computed "as if no brand were picked" (the usual faceted-search behaviour).
 */
const buildFilter = (query, omit) => {
  const filter = { active: true };

  const brands = listParam(query.brand);
  if (brands.length && omit !== 'brand') filter.brand = { $in: brands };

  if (query.category && query.category !== 'All') filter.category = query.category;

  const minPrice = numberParam(query.minPrice);
  const maxPrice = numberParam(query.maxPrice);
  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  const sizes = listParam(query.size).map(Number).filter(Number.isFinite);
  if (sizes.length) filter.sizes = { $in: sizes };

  const colors = listParam(query.color);
  if (colors.length) filter.colors = { $in: colors };

  if (query.trending === 'true') filter.trending = true;
  if (query.isNew === 'true') filter.isNewArrival = true;

  const q = typeof query.q === 'string' ? query.q.trim().slice(0, 60) : '';
  if (q) {
    // Every word must match the name, brand or category ("jordan red" finds AJ1 Bred)
    filter.$and = q.split(/\s+/).map((word) => {
      const re = new RegExp(escapeRegex(word), 'i');
      return { $or: [{ name: re }, { brand: re }, { category: re }] };
    });
  }

  return filter;
};

// @desc    List products with search, filters, sorting and brand facet counts
// @route   GET /api/products?q=&brand=Nike,Jordan&category=&minPrice=&maxPrice=&size=42&color=Red&sort=popular&trending=true&limit=
// @access  Public
const getProducts = async (req, res) => {
  try {
    const sort = SORTS[req.query.sort] || SORTS.popular;
    const limit = Math.min(Math.max(numberParam(req.query.limit) || 100, 1), 100);
    const filter = buildFilter(req.query);

    const [products, brandCounts] = await Promise.all([
      Product.find(filter).sort(sort).limit(limit),
      Product.aggregate([
        { $match: buildFilter(req.query, 'brand') },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
      ]),
    ]);

    const brands = Object.fromEntries(BRANDS.map((brand) => [brand, 0]));
    brandCounts.forEach(({ _id, count }) => {
      brands[_id] = count;
    });

    res.json({ products, total: products.length, facets: { brands } });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get one product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProducts, getProductBySlug };
