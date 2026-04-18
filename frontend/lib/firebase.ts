import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDq-n-cz3Fa4VmrxJ3gQ-YdlJHXGEhkSfQ',
  authDomain: 'tienda-gymshar.firebaseapp.com',
  projectId: 'tienda-gymshar',
  storageBucket: 'tienda-gymshar.firebasestorage.app',
  messagingSenderId: '968449752474',
  appId: '1:968449752474:web:8917456ac959eca1b60e23',
};

// Prevent re-initialization on hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth    = getAuth(app);
export const storage = getStorage(app);
export default app;
