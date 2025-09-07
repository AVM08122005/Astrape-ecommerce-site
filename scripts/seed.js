// scripts/seed.js
require('dotenv').config({ path: '.env.local' }); // <-- add this line

const dbConnect = require('../lib/mongoose.js');
const Item = require('../models/Item.js');

async function main() {
  await dbConnect();
  console.log('Connected to DB, seeding items...');

  const items = [
    { title: 'Blue T-Shirt', description: 'Comfortable cotton tee', price: 19.99, category: 'clothing', imageUrl: '/images/tshirt-blue.jpg' },
    { title: 'Wireless Mouse', description: 'Ergonomic mouse', price: 29.99, category: 'electronics', imageUrl: '/images/mouse.jpg' },
    { title: 'Water Bottle', description: '1L stainless steel', price: 12.5, category: 'accessories', imageUrl: '/images/bottle.jpg' }
  ];

  for (const it of items) {
    const existing = await Item.findOne({ title: it.title }).lean();
    if (!existing) {
      await Item.create(it);
      console.log('Inserted:', it.title);
    } else {
      console.log('Skipped (exists):', it.title);
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});