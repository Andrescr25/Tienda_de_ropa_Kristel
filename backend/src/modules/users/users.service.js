const { db } = require('../../config/firebase');

const COLLECTION = 'users';

/**
 * Creates a user doc if it doesn't exist. Returns the user data.
 * Called on first login to sync Firebase Auth user with Firestore.
 */
const syncUser = async ({ uid, email, displayName, photoURL }) => {
  const userRef = db.collection(COLLECTION).doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const newUser = {
      uid,
      email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      role: 'CUSTOMER', // Default role
      createdAt: new Date().toISOString(),
    };
    await userRef.set(newUser);
    return newUser;
  }

  return userSnap.data();
};

const getUserById = async (uid) => {
  const snap = await db.collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return snap.data();
};

const listUsers = async () => {
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').limit(200).get();
  return snap.docs.map((d) => d.data());
};

const updateUserRole = async (uid, role) => {
  const ref = db.collection(COLLECTION).doc(uid);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('User not found');
  await ref.update({ role });
  return { ...snap.data(), role };
};

module.exports = { syncUser, getUserById, listUsers, updateUserRole };
