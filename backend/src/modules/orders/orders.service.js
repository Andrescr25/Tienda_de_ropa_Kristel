const { db } = require('../../config/firebase');
const { z } = require('zod');

const ORDERS_COL = 'orders';
const PRODUCTS_COL = 'products';

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      size: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  shippingAddress: z.string().optional().default(''),
});

/**
 * Creates an order inside a Firestore transaction.
 * Validates stock availability and atomically decrements stock for each item.
 */
const createOrder = async (userId, rawData) => {
  const validated = orderSchema.parse(rawData);

  return await db.runTransaction(async (transaction) => {
    // 1. Fetch all product documents within the transaction
    const productRefs = validated.items.map(item =>
      db.collection(PRODUCTS_COL).doc(item.productId)
    );
    const productSnaps = await Promise.all(
      productRefs.map(ref => transaction.get(ref))
    );

    let total = 0;
    const orderItems = [];

    // 2. Validate stock and build order items
    for (let i = 0; i < validated.items.length; i++) {
      const { productId, size, quantity } = validated.items[i];
      const snap = productSnaps[i];

      if (!snap.exists) {
        const err = new Error(`Product ${productId} not found`);
        err.statusCode = 404;
        throw err;
      }

      const product = snap.data();
      const sizeEntry = product.sizes?.find(s => s.size === size);

      if (!sizeEntry) {
        const err = new Error(`Size "${size}" is not available for "${product.name}"`);
        err.statusCode = 400;
        throw err;
      }

      if (sizeEntry.stock < quantity) {
        const err = new Error(
          `Insufficient stock for "${product.name}" size ${size}. Available: ${sizeEntry.stock}`
        );
        err.statusCode = 400;
        throw err;
      }

      total += product.price * quantity;
      orderItems.push({
        productId,
        name: product.name,
        imageUrl: product.imageUrl || '',
        size,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      });

      // 3. Atomically decrement stock
      const updatedSizes = product.sizes.map(s =>
        s.size === size ? { ...s, stock: s.stock - quantity } : s
      );
      transaction.update(productRefs[i], { sizes: updatedSizes });
    }

    // 4. Create the order document
    const orderRef = db.collection(ORDERS_COL).doc();
    const order = {
      userId,
      items: orderItems,
      total: parseFloat(total.toFixed(2)),
      status: 'PENDING',   // PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED
      shippingAddress: validated.shippingAddress,
      createdAt: new Date().toISOString(),
    };

    transaction.set(orderRef, order);
    return { id: orderRef.id, ...order };
  });
};

/** GET orders for the authenticated user (most recent first) */
const getOrdersByUser = async (userId) => {
  const snap = await db.collection(ORDERS_COL)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/** GET all orders — Admin only */
const getAllOrders = async ({ limit = 20 } = {}) => {
  const snap = await db.collection(ORDERS_COL)
    .orderBy('createdAt', 'desc')
    .limit(Number(limit))
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/** Update order status — Admin only */
const updateOrderStatus = async (id, status) => {
  const ref = db.collection(ORDERS_COL).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.update({ status, updatedAt: new Date().toISOString() });
  return { id, ...snap.data(), status };
};

module.exports = { createOrder, getOrdersByUser, getAllOrders, updateOrderStatus };
