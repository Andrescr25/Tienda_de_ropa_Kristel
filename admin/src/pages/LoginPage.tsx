import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function LoginPage({ error }: { error?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setLocalError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <h1>TIENDA</h1>
          <span>STORE</span>
          <div className="admin-badge">ADMIN PANEL</div>
        </div>

        {displayError && (
          <div className="error-box">
            <span>⚠️</span> {displayError}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="admin@tienda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'SIGN IN AS ADMIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
