const { db } = require('../../config/firebase');
const { z } = require('zod');

const COLLECTION = 'categories';

const categorySchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url().optional().default(''),
});

const getCategories = async () => {
  const snap = await db.collection(COLLECTION).orderBy('name').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const createCategory = async (data) => {
  const validated = categorySchema.parse(data);
  const ref = db.collection(COLLECTION).doc();
  const category = { ...validated, createdAt: new Date().toISOString() };
  await ref.set(category);
  return { id: ref.id, ...category };
};

const updateCategory = async (id, data) => {
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const updates = { ...data, updatedAt: new Date().toISOString() };
  await ref.update(updates);
  return { id, ...snap.data(), ...updates };
};

const deleteCategory = async (id) => {
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return false;
  await ref.delete();
  return true;
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
