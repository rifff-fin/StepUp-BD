const mongoose = require('mongoose');
const { BRANDS, CATEGORIES, SILHOUETTES, COLORS, SIZES } = require('../data/catalogOptions');

const hexColor = { type: String, match: /^#[0-9A-Fa-f]{6}$/ };

// Colours for the drawn product image and the 3D quick-view shoe
const paletteSchema = new mongoose.Schema(
  {
    upper: { ...hexColor, required: true },
    overlay: { ...hexColor, required: true },
    stripe: { ...hexColor, required: true },
    midsole: { ...hexColor, required: true },
    outsole: { ...hexColor, required: true },
    laces: { ...hexColor, required: true },
    tab: { ...hexColor, required: true },
    collar: { ...hexColor, required: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    brand: { type: String, required: true, enum: BRANDS },
    category: { type: String, required: true, enum: CATEGORIES },
    silhouette: { type: String, enum: SILHOUETTES, default: 'low' },
    price: { type: Number, required: true, min: 0 },
    originalPrice: {
      type: Number,
      required: true,
      validate: {
        validator(value) {
          return value >= this.price;
        },
        message: 'originalPrice must be greater than or equal to price',
      },
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    sizes: {
      type: [{ type: Number, enum: SIZES }],
      validate: { validator: (sizes) => sizes.length > 0, message: 'At least one size' },
    },
    colors: [{ type: String, enum: COLORS.map((c) => c.name) }],
    palette: { type: paletteSchema, required: true },
    // Photo paths (frontend public folder or a full CDN URL); the first is the main photo
    images: {
      type: [{ type: String, trim: true, maxlength: 300 }],
      default: [],
    },
    model3d: { type: Boolean, default: false }, // the product the 3D model shows
    description: { type: String, trim: true, maxlength: 600 },
    popularity: { type: Number, default: 0 }, // higher = more popular (sales / views)
    isNewArrival: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    active: { type: Boolean, default: true }, // hidden from the store when false
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true },
  },
);

// Whole-number discount shown on the badge, e.g. 23 -> "-23%"
productSchema.virtual('discountPercent').get(function () {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round((1 - this.price / this.originalPrice) * 100);
});

productSchema.index({ brand: 1, category: 1, price: 1 });
productSchema.index({ trending: 1, popularity: -1 });

module.exports = mongoose.model('Product', productSchema);
