const { db } = require('../../config/firebase');
const { z } = require('zod');

const COLLECTION = 'products';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number().positive(),
  imageUrl: z.string().url().optional().default(''),
  categoryId: z.string().min(1),
  sizes: z.array(
    z.object({
      size: z.string().min(1),   // e.g. "XS", "S", "M", "L", "XL"
      stock: z.number().int().min(0),
    })
  ).min(1),
  isActive: z.boolean().optional().default(true),
});

/**
 * Paginated product list. Supports filtering by categoryId.
 * Uses cursor-based pagination via `startAfter` (last document ID).
 */
const getProducts = async ({ limit = 10, startAfter, categoryId } = {}) => {
  let query = db.collection(COLLECTION)
    .where('isActive', '==', true)
    .orderBy('name')
    .limit(Number(limit));

  if (categoryId) {
    query = query.where('categoryId', '==', categoryId);
  }

  if (startAfter) {
    const cursorDoc = await db.collection(COLLECTION).doc(startAfter).get();
    if (cursorDoc.exists) query = query.startAfter(cursorDoc);
  }

  const snap = await query.get();
  const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const nextCursor = snap.docs[snap.docs.length - 1]?.id ?? null;

  return { products, nextCursor, count: products.length };
};

const getProductById = async (id) => {
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
};

const createProduct = async (data) => {
  const validated = productSchema.parse(data);
  const ref = db.collection(COLLECTION).doc();
  const product = { ...validated, createdAt: new Date().toISOString() };
  await ref.set(product);
  return { id: ref.id, ...product };
};

const updateProduct = async (id, data) => {
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const updates = { ...data, updatedAt: new Date().toISOString() };
  await ref.update(updates);
  return { id, ...snap.data(), ...updates };
};

/**
 * Soft delete — sets isActive: false instead of removing the document.
 */
const deleteProduct = async (id) => {
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.update({ isActive: false, updatedAt: new Date().toISOString() });
  return true;
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
