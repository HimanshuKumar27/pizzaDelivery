/**
 * Seed Script — Creates default admin account and initial inventory
 * Run once: node scripts/seedAdmin.js
 *
 * Default Admin Credentials:
 *   Email: admin@pizzadelivery.com
 *   Password: admin123456
 *   Username: admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const InventoryItem = require('../models/InventoryItem');
const connectDB = require('../config/db');

const defaultInventory = [
  // Pizza Bases (5 options)
  { name: 'Thin Crust', category: 'base', description: 'Light and crispy thin crust', quantity: 100, pricePerUnit: 99, unit: 'units' },
  { name: 'Thick Crust', category: 'base', description: 'Classic thick and fluffy crust', quantity: 100, pricePerUnit: 119, unit: 'units' },
  { name: 'Cheese Burst', category: 'base', description: 'Stuffed with gooey cheese inside', quantity: 100, pricePerUnit: 149, unit: 'units' },
  { name: 'Whole Wheat', category: 'base', description: 'Healthy whole wheat base', quantity: 100, pricePerUnit: 109, unit: 'units' },
  { name: 'Gluten Free', category: 'base', description: 'Gluten-free cauliflower crust', quantity: 100, pricePerUnit: 139, unit: 'units' },

  // Sauces (5 options)
  { name: 'Classic Marinara', category: 'sauce', description: 'Traditional tomato-based sauce', quantity: 100, pricePerUnit: 29, unit: 'units' },
  { name: 'Pesto Basil', category: 'sauce', description: 'Fresh basil and pine nut pesto', quantity: 100, pricePerUnit: 49, unit: 'units' },
  { name: 'BBQ Sauce', category: 'sauce', description: 'Smoky barbecue sauce', quantity: 100, pricePerUnit: 39, unit: 'units' },
  { name: 'White Garlic', category: 'sauce', description: 'Creamy garlic alfredo sauce', quantity: 100, pricePerUnit: 45, unit: 'units' },
  { name: 'Spicy Sriracha', category: 'sauce', description: 'Hot and spicy sriracha blend', quantity: 100, pricePerUnit: 35, unit: 'units' },

  // Cheeses (3 options)
  { name: 'Mozzarella', category: 'cheese', description: 'Classic stretchy mozzarella', quantity: 100, pricePerUnit: 59, unit: 'units' },
  { name: 'Cheddar', category: 'cheese', description: 'Sharp and flavorful cheddar', quantity: 100, pricePerUnit: 69, unit: 'units' },
  { name: 'Parmesan', category: 'cheese', description: 'Rich aged Italian parmesan', quantity: 100, pricePerUnit: 79, unit: 'units' },

  // Vegetables (6 options)
  { name: 'Bell Peppers', category: 'vegetable', description: 'Colorful sliced bell peppers', quantity: 100, pricePerUnit: 19, unit: 'units' },
  { name: 'Mushrooms', category: 'vegetable', description: 'Fresh sliced mushrooms', quantity: 100, pricePerUnit: 25, unit: 'units' },
  { name: 'Red Onions', category: 'vegetable', description: 'Thinly sliced red onions', quantity: 100, pricePerUnit: 15, unit: 'units' },
  { name: 'Black Olives', category: 'vegetable', description: 'Sliced Mediterranean olives', quantity: 100, pricePerUnit: 29, unit: 'units' },
  { name: 'Fresh Tomatoes', category: 'vegetable', description: 'Juicy diced tomatoes', quantity: 100, pricePerUnit: 15, unit: 'units' },
  { name: 'Jalapeños', category: 'vegetable', description: 'Spicy sliced jalapeño peppers', quantity: 100, pricePerUnit: 20, unit: 'units' },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // --- Seed Admin ---
    const existingAdmin = await Admin.findOne({ email: 'admin@pizzadelivery.com' });
    if (existingAdmin) {
      console.log('👤 Admin account already exists — skipping');
    } else {
      await Admin.create({
        username: 'admin',
        email: 'admin@pizzadelivery.com',
        password: 'admin123456',
      });
      console.log('👤 Admin account created:');
      console.log('   Email: admin@pizzadelivery.com');
      console.log('   Password: admin123456');
      console.log('   ⚠️  Change the password after first login!\n');
    }

    // --- Seed Inventory ---
    const existingItems = await InventoryItem.countDocuments();
    if (existingItems > 0) {
      console.log(`📦 Inventory already has ${existingItems} items — skipping`);
    } else {
      await InventoryItem.insertMany(
        defaultInventory.map((item) => ({
          ...item,
          threshold: parseInt(process.env.INVENTORY_THRESHOLD) || 20,
        }))
      );
      console.log(`📦 ${defaultInventory.length} inventory items created:`);
      console.log('   5 Pizza Bases');
      console.log('   5 Sauces');
      console.log('   3 Cheeses');
      console.log('   6 Vegetables');
    }

    console.log('\n✅ Seed complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
