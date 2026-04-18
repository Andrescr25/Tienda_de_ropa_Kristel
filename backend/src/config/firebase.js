const admin = require('firebase-admin');

// Uses env vars — populate from your Service Account JSON
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
