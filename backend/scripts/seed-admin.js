/**
 * seed-admin.js
 * Creates or promotes a user to ADMIN role.
 *
 * Usage:
 *   node scripts/seed-admin.js <email> <password> [displayName]
 *
 * Examples:
 *   node scripts/seed-admin.js admin@tienda.com MyPass123 "Jose Admin"
 *   node scripts/seed-admin.js existing@user.com             # promotes existing user
 */

require('dotenv').config();
const { admin, db, auth } = require('../src/config/firebase');

async function seedAdmin() {
  const [, , email, password, displayName = 'Admin'] = process.argv;

  if (!email) {
    console.error('Usage: node scripts/seed-admin.js <email> [password] [displayName]');
    process.exit(1);
  }

  let uid;

  // 1. Try to get existing user or create new one
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`✅ Found existing user: ${uid}`);
  } catch {
    if (!password) {
      console.error('❌ User not found. Provide a password to create a new one.');
      process.exit(1);
    }
    const newUser = await auth.createUser({ email, password, displayName });
    uid = newUser.uid;
    console.log(`✅ Created new Firebase Auth user: ${uid}`);
  }

  // 2. Create/update Firestore document with ADMIN role
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
    uid,
    email,
    displayName,
    photoURL: '',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  }, { merge: true });

  console.log(`🚀 User ${email} is now ADMIN!`);
  console.log(`   UID: ${uid}`);
  console.log(`\n👉 Login at http://localhost:3001`);

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
