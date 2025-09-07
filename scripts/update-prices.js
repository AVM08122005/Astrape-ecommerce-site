// scripts/update-prices.js
import dotenv from 'dotenv';
import dbConnect from '../lib/mongoose.js';
import Item from '../models/Item.js';

dotenv.config({ path: '.env.local' });

async function updatePrices() {
  try {
    await dbConnect();
    console.log('Connected to DB, updating prices...');

    // Define realistic pricing for products
    const priceUpdates = [
      { title: 'Blue T-Shirt', newPrice: 1299 },
      { title: 'Wireless Mouse', newPrice: 2499 },
      { title: 'Water Bottle', newPrice: 899 },
      { title: 'Bluetooth Headphones', newPrice: 8499 },
      { title: 'Wireless Earbuds', newPrice: 5999 },
      { title: 'Running Shoes', newPrice: 6999 },
      { title: 'Sport Sneakers', newPrice: 4999 }
    ];

    for (const update of priceUpdates) {
      const result = await Item.updateOne(
        { title: update.title }, 
        { $set: { price: update.newPrice } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Updated ${update.title} price to ₹${update.newPrice}`);
      } else if (result.matchedCount > 0) {
        console.log(`${update.title} already has the correct price`);
      } else {
        console.log(`${update.title} not found in database`);
      }
    }

    console.log('Price update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Price update error:', err);
    process.exit(1);
  }
}

updatePrices();
