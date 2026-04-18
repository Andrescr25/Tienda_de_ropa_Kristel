const { Router } = require('express');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/isAdmin.middleware');
const { list, create, update, remove } = require('./categories.controller');

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', list);

// ── Admin Only ────────────────────────────────────────────────────────────────
router.post('/', verifyToken, isAdmin, create);
router.put('/:id', verifyToken, isAdmin, update);
router.delete('/:id', verifyToken, isAdmin, remove);

module.exports = router;
