const { db } = require('../config/firebase');

/**
 * Checks if the authenticated user has role: "ADMIN" in Firestore.
 * Must be used after verifyToken middleware.
 */
const isAdmin = async (req, res, next) => {
  try {
    const userSnap = await db.collection('users').doc(req.user.uid).get();

    if (!userSnap.exists || userSnap.data()?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { isAdmin };
