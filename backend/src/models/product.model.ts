import mongoose, { Schema, Document } from 'mongoose';
import { Product, ProductStatus, Currency } from '../types/product.types';

export interface ProductDocument extends Omit<Product, '_id'>, Document {}

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  alt: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { _id: false });

const ProductPriceSchema = new Schema({
  currency: { type: String, enum: Object.values(Currency), required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const ProductVariantSchema = new Schema({
  name: { type: String, required: true },
  attributes: { type: Map, of: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: [ProductPriceSchema],
  stock: { type: Number, required: true, default: 0, min: 0 },
  images: [ProductImageSchema]
});

const ProductSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    index: 'text'
  },
  description: { 
    type: String, 
    required: true,
    index: 'text'
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    index: true
  },
  category: { 
    type: String, 
    required: true,
    index: true
  },
  subcategory: { 
    type: String,
    index: true
  },
  supplier: { 
    type: String,
    index: true
  },
  prices: {
    type: [ProductPriceSchema],
    required: true,
    validate: {
      validator: function(prices: any[]) {
        return prices && prices.length > 0;
      },
      message: 'At least one price must be specified'
    }
  },
  images: {
    type: [ProductImageSchema],
    default: []
  },
  variants: [ProductVariantSchema],
  stock: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0
  },
  status: { 
    type: String, 
    enum: Object.values(ProductStatus),
    default: ProductStatus.ACTIVE,
    index: true
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: String
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for search and filtering
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, subcategory: 1, status: 1 });
ProductSchema.index({ 'prices.amount': 1, status: 1 });
ProductSchema.index({ createdAt: -1 });

// Pre-save hook to generate slug
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export const ProductModel = mongoose.model<ProductDocument>('Product', ProductSchema);
