import { useEffect, useState } from 'react';
import {
  UsersIcon,
  ShieldCheckIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import api from '../lib/api';

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
  photoURL?: string;
}

const ROLES = ['ADMIN', 'CUSTOMER'] as const;

const roleStyle: Record<string, { badge: string; icon: any }> = {
  ADMIN:    { badge: 'badge-delivered',  icon: ShieldCheckIcon },
  CUSTOMER: { badge: 'badge-confirmed',  icon: UserIcon },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  useEffect(() => {
    api.get('/users')
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (uid: string, role: string) => {
    setUpdatingUid(uid);
    try {
      await api.patch(`/users/${uid}/role`, { role });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, role: role as User['role'] } : u));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingUid(null);
    }
  };

  const filtered = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount    = users.filter((u) => u.role === 'ADMIN').length;
  const customerCount = users.filter((u) => u.role === 'CUSTOMER').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Users</h2>
          <p>Manage user accounts and roles</p>
        </div>
      </div>

      {/* Mini Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Users',  value: users.length,   Icon: UsersIcon,       color: 'var(--white)'  },
          { label: 'Admins',       value: adminCount,      Icon: ShieldCheckIcon, color: 'var(--green)'  },
          { label: 'Customers',    value: customerCount,   Icon: UserIcon,        color: 'var(--blue)'   },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon style={{ width: 26, height: 26, color: 'var(--muted)', marginBottom: 10 }} />
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
          <MagnifyingGlassIcon style={{ width: 18, height: 18, color: 'var(--muted)', flexShrink: 0 }} />
          <input
            className="input"
            style={{ background: 'transparent', border: 'none', padding: 0, flex: 1 }}
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <UsersIcon style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'var(--subtle)' }} />
              <p>{search ? 'No users match your search' : 'No users yet'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Change Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const { badge, icon: RoleIcon } = roleStyle[u.role] ?? roleStyle.CUSTOMER;
                  return (
                    <tr key={u.uid}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: u.role === 'ADMIN' ? 'var(--green-glow)' : 'var(--elevated)',
                            border: `1px solid ${u.role === 'ADMIN' ? 'rgba(0,255,135,0.3)' : 'var(--border)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700,
                            color: u.role === 'ADMIN' ? 'var(--green)' : 'var(--white)',
                            flexShrink: 0,
                          }}>
                            {u.displayName?.charAt(0)?.toUpperCase() ?? u.email?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--white)' }}>
                              {u.displayName || '—'}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace' }}>
                              {u.uid.slice(0, 12)}…
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</td>
                      <td>
                        <span className={`badge ${badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <RoleIcon style={{ width: 12, height: 12 }} />
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={u.role}
                          disabled={updatingUid === u.uid}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
