import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import api from './lib/api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';
import Layout, { type Page } from './components/Layout';

interface Profile { uid: string; email: string; displayName: string; role: string; }

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [page, setPage] = useState<Page>('dashboard');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { data } = await api.post('/users/sync');
          if (data.role !== 'ADMIN') {
            setAuthError('⛔ Access denied: this account does not have admin privileges.');
            await signOut(auth);
            setUser(null);
            setProfile(null);
          } else {
            setUser(firebaseUser);
            setProfile(data);
            setAuthError('');
          }
        } catch {
          setAuthError('Failed to verify admin access. Is the backend running?');
          setUser(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginPage error={authError} />;
  }

  return (
    <Layout page={page} onNavigate={setPage} profile={profile}>
      {page === 'dashboard'  && <DashboardPage  />}
      {page === 'products'   && <ProductsPage   />}
      {page === 'categories' && <CategoriesPage />}
      {page === 'users'      && <UsersPage      />}
    </Layout>
  );
}
