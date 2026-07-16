const cron = require('node-cron');
const InventoryItem = require('../models/InventoryItem');
const { sendLowStockAlert } = require('../utils/emailService');

/**
 * Inventory check cron job
 * Runs every 30 minutes — checks all inventory items against their thresholds.
 * Sends email alert to admin if any items are below threshold.
 */
const startInventoryCheckJob = () => {
  // Run every 30 minutes: '*/30 * * * *'
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 [Cron] Running inventory threshold check...');

    try {
      // Find all items where quantity is at or below threshold
      const lowStockItems = await InventoryItem.find({
        $expr: { $lte: ['$quantity', '$threshold'] },
        isAvailable: true,
      });

      if (lowStockItems.length > 0) {
        console.log(
          `⚠️  [Cron] ${lowStockItems.length} item(s) below threshold:`
        );
        lowStockItems.forEach((item) => {
          console.log(
            `   - ${item.name} (${item.category}): ${item.quantity}/${item.threshold} ${item.unit}`
          );
        });

        // Send email alert to admin
        await sendLowStockAlert(lowStockItems);
      } else {
        console.log('✅ [Cron] All inventory items above threshold.');
      }
    } catch (error) {
      console.error('❌ [Cron] Inventory check error:', error.message);
    }
  });

  console.log('⏰ Inventory check cron job scheduled (every 30 minutes)');
};

module.exports = { startInventoryCheckJob };
