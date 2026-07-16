const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['base', 'sauce', 'cheese', 'vegetable'],
        message: 'Category must be one of: base, sauce, cheese, vegetable',
      },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    threshold: {
      type: Number,
      default: 20,
      min: [0, 'Threshold cannot be negative'],
    },
    unit: {
      type: String,
      default: 'units',
      trim: true,
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Virtual: check if stock is low
inventoryItemSchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.threshold;
});

// Ensure virtuals are included in JSON output
inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
