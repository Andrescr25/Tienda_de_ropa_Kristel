const service = require('./orders.service');

// POST /api/orders  — customer creates an order
const create = async (req, res, next) => {
  try {
    const order = await service.createOrder(req.user.uid, req.body);
    res.status(201).json(order);
  } catch (err) { next(err); }
};

// GET /api/orders/my  — customer's order history
const myOrders = async (req, res, next) => {
  try {
    const orders = await service.getOrdersByUser(req.user.uid);
    res.json(orders);
  } catch (err) { next(err); }
};

// GET /api/orders  — admin: all orders
const allOrders = async (req, res, next) => {
  try {
    const orders = await service.getAllOrders({
      limit: req.query.limit,
    });
    res.json(orders);
  } catch (err) { next(err); }
};

// PATCH /api/orders/:id/status  — admin: update order status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!VALID.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID.join(', ')}` });
    }
    const order = await service.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
};

module.exports = { create, myOrders, allOrders, updateStatus };
