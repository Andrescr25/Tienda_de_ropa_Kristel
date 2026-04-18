const { syncUser, getUserById, listUsers, updateUserRole } = require('./users.service');

/**
 * POST /api/users/sync
 * Called after login. Syncs Firebase Auth data to Firestore.
 */
const sync = async (req, res, next) => {
  try {
    const { uid, email, name, picture } = req.user;
    const user = await syncUser({ uid, email, displayName: name, photoURL: picture });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/me
 * Returns the current authenticated user's Firestore document.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.uid);
    if (!user) return res.status(404).json({ error: 'User not found. Please sync first.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;
    if (!['ADMIN', 'CUSTOMER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be ADMIN or CUSTOMER.' });
    }
    const updated = await updateUserRole(uid, role);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { sync, getMe, list, updateRole };
