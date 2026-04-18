const { Router } = require('express');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/isAdmin.middleware');
const { list, getById, create, update, remove } = require('./products.controller');

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/', list);
router.get('/:id', getById);

// ── Admin Only ───────────────────────────────────────────────────────────────
router.post('/', verifyToken, isAdmin, create);
router.put('/:id', verifyToken, isAdmin, update);
router.delete('/:id', verifyToken, isAdmin, remove);

module.exports = router;
