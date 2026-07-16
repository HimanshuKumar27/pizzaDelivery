const InventoryItem = require('../models/InventoryItem');

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items (grouped by category for users)
 */
const getAllItems = async (req, res) => {
  try {
    const items = await InventoryItem.find({ isAvailable: true }).sort({
      category: 1,
      name: 1,
    });

    // Group by category
    const grouped = {
      base: items.filter((i) => i.category === 'base'),
      sauce: items.filter((i) => i.category === 'sauce'),
      cheese: items.filter((i) => i.category === 'cheese'),
      vegetable: items.filter((i) => i.category === 'vegetable'),
    };

    res.status(200).json({
      success: true,
      items,
      grouped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/inventory/admin/all
 * @desc    Get all inventory items for admin (including unavailable, with stock info)
 */
const getAdminItems = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ category: 1, name: 1 });

    const stats = {
      total: items.length,
      lowStock: items.filter((i) => i.quantity <= i.threshold).length,
      outOfStock: items.filter((i) => i.quantity === 0).length,
    };

    res.status(200).json({
      success: true,
      items,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/inventory/category/:category
 * @desc    Get items by category
 */
const getItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const validCategories = ['base', 'sauce', 'cheese', 'vegetable'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    const items = await InventoryItem.find({
      category,
      isAvailable: true,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      category,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update inventory item (admin — manual stock update)
 */
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await InventoryItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/inventory
 * @desc    Add new inventory item (admin)
 */
const addItem = async (req, res) => {
  try {
    const { name, category, description, quantity, threshold, unit, pricePerUnit } =
      req.body;

    const item = await InventoryItem.create({
      name,
      category,
      description,
      quantity,
      threshold: threshold || parseInt(process.env.INVENTORY_THRESHOLD) || 20,
      unit: unit || 'units',
      pricePerUnit,
    });

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add item',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete inventory item (admin)
 */
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await InventoryItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message,
    });
  }
};

module.exports = {
  getAllItems,
  getAdminItems,
  getItemsByCategory,
  updateItem,
  addItem,
  deleteItem,
};
