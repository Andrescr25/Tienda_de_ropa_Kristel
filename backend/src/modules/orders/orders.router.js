const { Router } = require('express');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/isAdmin.middleware');
const { create, myOrders, allOrders, updateStatus } = require('./orders.controller');

const router = Router();

// POST /api/orders                   — customer: checkout
router.post('/', verifyToken, create);

// GET  /api/orders/my                — customer: my order history
router.get('/my', verifyToken, myOrders);

// GET  /api/orders?limit=20          — admin: all orders
router.get('/', verifyToken, isAdmin, allOrders);

// PATCH /api/orders/:id/status       — admin: update order status
router.patch('/:id/status', verifyToken, isAdmin, updateStatus);

module.exports = router;
