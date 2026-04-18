const { auth } = require('../config/firebase');

/**
 * Verifies the Firebase ID Token from the Authorization header.
 * Attaches the decoded token to req.user.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken; // { uid, email, name, picture, ... }
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = { verifyToken };
