const { Router } = require('express');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/isAdmin.middleware');
const { sync, getMe, list, updateRole } = require('./users.controller');

const router = Router();

// POST /api/users/sync — called after login to register user in Firestore
router.post('/sync', verifyToken, sync);

// GET /api/users/me — get current user profile
router.get('/me', verifyToken, getMe);

// ── Admin Only ────────────────────────────────────────────────────────────────
router.get('/', verifyToken, isAdmin, list);
router.patch('/:uid/role', verifyToken, isAdmin, updateRole);

module.exports = router;

