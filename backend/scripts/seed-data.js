/**
 * seed-data.js — Creates test categories and products in Firestore.
 * Usage: node scripts/seed-data.js
 */
require('dotenv').config();
const { db } = require('../src/config/firebase');

const CATEGORIES = [
  {
    name: 'Tops',
    description: 'Training tops, seamless sets and t-shirts built for performance.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
  },
  {
    name: 'Shorts',
    description: 'Functional shorts built for freedom of movement and all-day comfort.',
    imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=80',
  },
  {
    name: 'Leggings',
    description: 'High-performance leggings for training, yoga and an active lifestyle.',
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
  },
];

const PRODUCTS = [
  {
    name: 'Apex Seamless Top',
    description: 'The Apex Seamless Top is engineered to move with every rep. Its ultra-soft, four-way stretch fabric provides a second-skin feel while moisture-wicking technology keeps you dry and focused.',
    price: 45.00,
    categoryId: 'Tops',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    sizes: [
      { size: 'XS', stock: 15 },
      { size: 'S',  stock: 20 },
      { size: 'M',  stock: 18 },
      { size: 'L',  stock: 12 },
      { size: 'XL', stock: 8  },
      { size: 'XXL',stock: 5  },
    ],
  },
  {
    name: 'Critical Training T-Shirt',
    description: 'A staple training tee with a relaxed fit and ultra-breathable fabric. Perfect for gym sessions or casual wear.',
    price: 30.00,
    categoryId: 'Tops',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    sizes: [
      { size: 'XS', stock: 10 },
      { size: 'S',  stock: 25 },
      { size: 'M',  stock: 30 },
      { size: 'L',  stock: 22 },
      { size: 'XL', stock: 15 },
      { size: 'XXL',stock: 8  },
    ],
  },
  {
    name: 'Speed 5" Shorts',
    description: 'Lightweight and fast-drying, the Speed Shorts are designed for high-intensity training. The 5" inseam provides a versatile length for any workout.',
    price: 35.00,
    categoryId: 'Shorts',
    imageUrl: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80',
    sizes: [
      { size: 'XS', stock: 8  },
      { size: 'S',  stock: 18 },
      { size: 'M',  stock: 24 },
      { size: 'L',  stock: 20 },
      { size: 'XL', stock: 10 },
      { size: 'XXL',stock: 3  },
    ],
  },
  {
    name: 'Arrival 7" Shorts',
    description: 'The Arrival Shorts combine performance and style with a longer cut that\'s perfect for training and casual wear alike.',
    price: 38.00,
    categoryId: 'Shorts',
    imageUrl: 'https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=600&q=80',
    sizes: [
      { size: 'XS', stock: 5  },
      { size: 'S',  stock: 14 },
      { size: 'M',  stock: 22 },
      { size: 'L',  stock: 18 },
      { size: 'XL', stock: 12 },
      { size: 'XXL',stock: 6  },
    ],
  },
  {
    name: 'Vital Seamless Leggings',
    description: 'The Vital Seamless Leggings deliver a sculpting fit with seamless construction for zero-chafe comfort. The moisture-wicking fabric moves with you through every stretch.',
    price: 55.00,
    categoryId: 'Leggings',
    imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
    sizes: [
      { size: 'XS', stock: 12 },
      { size: 'S',  stock: 20 },
      { size: 'M',  stock: 18 },
      { size: 'L',  stock: 14 },
      { size: 'XL', stock: 7  },
      { size: 'XXL',stock: 2  },
    ],
  },
  {
    name: 'Energy Seamless Leggings',
    description: 'High-waisted leggings with a flattering fit and subtle texture. The Energy Seamless range is built for yoga, pilates and light cardio.',
    price: 50.00,
    categoryId: 'Leggings',
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80',
    sizes: [
      { size: 'XS', stock: 8  },
      { size: 'S',  stock: 15 },
      { size: 'M',  stock: 20 },
      { size: 'L',  stock: 16 },
      { size: 'XL', stock: 9  },
      { size: 'XXL',stock: 4  },
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Create categories
  const categoryIds = {};
  for (const cat of CATEGORIES) {
    const ref = db.collection('categories').doc();
    const data = { id: ref.id, ...cat, createdAt: new Date().toISOString() };
    await ref.set(data);
    categoryIds[cat.name] = ref.id;
    console.log(`  ✅ Category: ${cat.name} (${ref.id})`);
  }

  console.log('');

  // 2. Create products
  for (const prod of PRODUCTS) {
    const ref = db.collection('products').doc();
    const data = {
      id: ref.id,
      ...prod,
      categoryId: prod.categoryId, // keep name as categoryId for display
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    await ref.set(data);
    console.log(`  ✅ Product: ${prod.name} — $${prod.price} [${prod.categoryId}]`);
  }

  console.log('\n🎉 Seed complete! Check your admin panel at http://localhost:3001');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
