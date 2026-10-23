const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v2: cloudinary } = require('cloudinary');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Subscriber = require('../models/Subscriber');
const { ORDER_STATUSES } = require('../models/Order');
const { readProductInput, paletteFor } = require('../services/productInput');

const TOKEN_TTL = '12h';

// Constant-time string compare (hashes first so lengths never leak)
const same = (a, b) =>
  crypto.timingSafeEqual(
    crypto.createHash('sha256').update(String(a)).digest(),
    crypto.createHash('sha256').update(String(b)).digest(),
  );

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Admin login: email + password from the server's environment, returns a JWT
// @route   POST /api/admin/login
// @access  Public (rate limited)
const login = (req, res) => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
    return res.status(503).json({ message: 'The admin login is not set up on the server' });
  }
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || '');
  const ok = same(email, ADMIN_EMAIL.toLowerCase()) & same(password, ADMIN_PASSWORD);
  if (!ok) return res.status(401).json({ message: 'Wrong email or password' });

  const token = jwt.sign({ sub: email, role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_TTL });
  res.json({ token, email });
};

// @desc    The logged-in admin
// @route   GET /api/admin/me
// @access  Admin
const me = (req, res) => res.json({ email: req.admin.email });

// @desc    Dashboard numbers: products, orders by status, revenue, subscribers, last 14 days
// @route   GET /api/admin/stats
// @access  Admin
const stats = async (req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const [products, activeProducts, subscribers, byStatus, revenue, daily, recent] =
    await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ active: true }),
      Subscriber.countDocuments(),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+06:00' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$pricing.total' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6),
    ]);

  res.json({
    products,
    activeProducts,
    subscribers,
    orders: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    revenue: revenue[0]?.total || 0,
    paidOrders: revenue[0]?.count || 0,
    daily,
    recent,
  });
};

/* ---------------- Products ---------------- */

// @desc    All products, including hidden ones (search by name/brand)
// @route   GET /api/admin/products?q=
// @access  Admin
const listProducts = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60) : '';
  const filter = q
    ? { $or: [{ name: new RegExp(escapeRegex(q), 'i') }, { brand: new RegExp(escapeRegex(q), 'i') }] }
    : {};
  res.json(await Product.find(filter).sort({ createdAt: -1 }));
};

// @desc    Create a product
// @route   POST /api/admin/products
// @access  Admin
const createProduct = async (req, res) => {
  const { data, errors } = readProductInput(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please check the product', errors });
  }
  if (await Product.exists({ slug: data.slug })) {
    return res.status(409).json({
      message: 'A product with this URL name exists',
      errors: { slug: 'Already used' },
    });
  }
  res.status(201).json(await Product.create(data));
};

// @desc    Update a product (any subset of fields)
// @route   PUT /api/admin/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  const { data, errors } = readProductInput(req.body, { partial: true });
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please check the product', errors });
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (data.slug && data.slug !== product.slug && (await Product.exists({ slug: data.slug }))) {
    return res.status(409).json({
      message: 'A product with this URL name exists',
      errors: { slug: 'Already used' },
    });
  }
  if (data.colors && !data.palette) data.palette = paletteFor(data.colors);
  product.set(data);
  await product.save();
  res.json(product);
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ deleted: product.id });
};

/* ---------------- Orders ---------------- */

// @desc    Orders, newest first (filter by status, search by order number / phone / name)
// @route   GET /api/admin/orders?status=&q=
// @access  Admin
const listOrders = async (req, res) => {
  const filter = {};
  if (ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status;
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 40) : '';
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ orderNumber: re }, { 'shipping.phone': re }, { 'shipping.name': re }];
  }
  res.json(await Order.find(filter).sort({ createdAt: -1 }).limit(200));
};

// @desc    Change an order's status
// @route   PATCH /api/admin/orders/:id
// @access  Admin
const updateOrder = async (req, res) => {
  const status = String(req.body?.status || '');
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Choose a valid status' });
  }
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

/* ---------------- Coupons ---------------- */

const readCoupon = (body = {}) => {
  const errors = {};
  const code = String(body.code || '')
    .trim()
    .toUpperCase();
  const percent = Number(body.percent);
  if (!/^[A-Z0-9]{3,20}$/.test(code)) errors.code = '3 to 20 letters or digits';
  if (!Number.isInteger(percent) || percent < 1 || percent > 90) errors.percent = '1 to 90';
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) errors.expiresAt = 'Invalid date';
  return {
    errors,
    data: {
      code,
      percent,
      description: String(body.description || '')
        .trim()
        .slice(0, 120),
      active: body.active !== false,
      expiresAt,
    },
  };
};

// @desc    Coupons
// @route   GET /api/admin/coupons
// @access  Admin
const listCoupons = async (req, res) => res.json(await Coupon.find().sort({ createdAt: -1 }));

// @desc    Create a coupon
// @route   POST /api/admin/coupons
// @access  Admin
const createCoupon = async (req, res) => {
  const { data, errors } = readCoupon(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Check the coupon', errors });
  if (await Coupon.exists({ code: data.code })) {
    return res.status(409).json({ message: 'That code exists', errors: { code: 'Already used' } });
  }
  res.status(201).json(await Coupon.create(data));
};

// @desc    Update a coupon
// @route   PUT /api/admin/coupons/:id
// @access  Admin
const updateCoupon = async (req, res) => {
  const { data, errors } = readCoupon(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: 'Check the coupon', errors });
  const clash = await Coupon.findOne({ code: data.code, _id: { $ne: req.params.id } });
  if (clash) return res.status(409).json({ message: 'That code exists', errors: { code: 'Already used' } });
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json(coupon);
};

// @desc    Delete a coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Admin
const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
  res.json({ deleted: coupon.id });
};

/* ---------------- Subscribers ---------------- */

// @desc    Newsletter subscribers
// @route   GET /api/admin/subscribers
// @access  Admin
const listSubscribers = async (req, res) =>
  res.json(await Subscriber.find().sort({ createdAt: -1 }).limit(1000));

// @desc    Remove a subscriber
// @route   DELETE /api/admin/subscribers/:id
// @access  Admin
const deleteSubscriber = async (req, res) => {
  const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
  if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });
  res.json({ deleted: subscriber.id });
};

/* ---------------- Uploads ---------------- */

// @desc    A signature for one direct browser upload to Cloudinary (the API secret never
//          leaves the server; the browser sends the file straight to Cloudinary)
// @route   POST /api/admin/uploads/sign
// @access  Admin
const signUpload = (req, res) => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(503).json({ message: 'Image uploads are not set up on the server' });
  }
  const timestamp = Math.round(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_FOLDER || 'stepupbd/products';
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, CLOUDINARY_API_SECRET);
  res.json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  });
};

module.exports = {
  login,
  me,
  stats,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrder,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listSubscribers,
  deleteSubscriber,
  signUpload,
};
