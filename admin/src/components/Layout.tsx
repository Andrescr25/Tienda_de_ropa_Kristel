import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  TagIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export type Page = 'dashboard' | 'products' | 'users' | 'categories';

interface Props {
  page: Page;
  onNavigate: (p: Page) => void;
  profile: { displayName: string; email: string };
  children: React.ReactNode;
}

const NAV: { id: Page; Icon: React.ElementType; label: string }[] = [
  { id: 'dashboard',  Icon: ChartBarIcon,    label: 'Dashboard'   },
  { id: 'products',   Icon: ShoppingBagIcon, label: 'Products'    },
  { id: 'categories', Icon: TagIcon,         label: 'Categories'  },
  { id: 'users',      Icon: UsersIcon,       label: 'Users'       },
];

export default function Layout({ page, onNavigate, profile, children }: Props) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>TIENDA</h1>
          <span>Admin Panel</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ id, Icon, label }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <Icon style={{ width: 20, height: 20 }} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {profile.displayName?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div className="sidebar-user-info">
              <p>{profile.displayName || 'Admin'}</p>
              <span>ADMIN</span>
            </div>
            <button
              className="signout-btn"
              onClick={() => signOut(auth)}
              title="Sign out"
            >
              <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
