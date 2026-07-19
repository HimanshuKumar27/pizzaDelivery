const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  base: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  sauce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  cheese: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true,
  },
  vegetables: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
  ],
  pizzaName: {
    type: String,
    default: 'Custom Pizza',
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'],
      default: 'Order Received',
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Delivery address is required'],
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'statusHistory.changedByModel',
        },
        changedByModel: {
          type: String,
          enum: ['Admin', 'User'],
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance and sorting
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
