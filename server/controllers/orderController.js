const Order = require('../models/Order');
const InventoryItem = require('../models/InventoryItem');

/**
 * @route   POST /api/orders
 * @desc    Create a new order (after payment verification)
 */
const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      deliveryAddress,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one pizza',
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required',
      });
    }

    // Validate and decrement stock for each pizza item
    for (const pizza of items) {
      const allItemIds = [
        pizza.base,
        pizza.sauce,
        pizza.cheese,
        ...pizza.vegetables,
      ];

      // Check stock availability for each ingredient
      for (const itemId of allItemIds) {
        const item = await InventoryItem.findById(itemId);
        if (!item) {
          return res.status(400).json({
            success: false,
            message: `Inventory item not found: ${itemId}`,
          });
        }
        if (item.quantity < 1) {
          return res.status(400).json({
            success: false,
            message: `${item.name} is out of stock`,
          });
        }
      }

      // Atomically decrement stock for each ingredient
      for (const itemId of allItemIds) {
        const result = await InventoryItem.findOneAndUpdate(
          { _id: itemId, quantity: { $gte: 1 } },
          { $inc: { quantity: -1 } },
          { new: true }
        );

        if (!result) {
          // Race condition: item went out of stock between check and decrement
          // Roll back previous decrements for this pizza
          const idx = allItemIds.indexOf(itemId);
          for (let i = 0; i < idx; i++) {
            await InventoryItem.findByIdAndUpdate(allItemIds[i], {
              $inc: { quantity: 1 },
            });
          }
          return res.status(400).json({
            success: false,
            message: 'An item went out of stock. Please try again.',
          });
        }
      }
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      razorpayOrderId,
      razorpayPaymentId,
      paymentStatus: 'paid',
      status: 'Order Received',
      statusHistory: [
        {
          status: 'Order Received',
          changedAt: new Date(),
        },
      ],
    });

    // Populate the order before returning
    const populatedOrder = await Order.findById(order._id)
      .populate('items.base', 'name category pricePerUnit')
      .populate('items.sauce', 'name category pricePerUnit')
      .populate('items.cheese', 'name category pricePerUnit')
      .populate('items.vegetables', 'name category pricePerUnit')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get all orders for the logged-in user
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.base', 'name category pricePerUnit')
      .populate('items.sauce', 'name category pricePerUnit')
      .populate('items.cheese', 'name category pricePerUnit')
      .populate('items.vegetables', 'name category pricePerUnit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID (user can only see their own)
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.base', 'name category pricePerUnit')
      .populate('items.sauce', 'name category pricePerUnit')
      .populate('items.cheese', 'name category pricePerUnit')
      .populate('items.vegetables', 'name category pricePerUnit')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Ensure user can only see their own orders (unless admin)
    if (
      !req.admin &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (admin only)
 */
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('items.base', 'name category pricePerUnit')
      .populate('items.sauce', 'name category pricePerUnit')
      .populate('items.cheese', 'name category pricePerUnit')
      .populate('items.vegetables', 'name category pricePerUnit')
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'Order Received',
      'In Kitchen',
      'Sent to Delivery',
      'Delivered',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.admin._id,
      changedByModel: 'Admin',
    });

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('items.base', 'name category pricePerUnit')
      .populate('items.sauce', 'name category pricePerUnit')
      .populate('items.cheese', 'name category pricePerUnit')
      .populate('items.vegetables', 'name category pricePerUnit')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
