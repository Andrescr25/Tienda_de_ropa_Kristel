import { useEffect, useState } from 'react';
import {
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import api from '../lib/api';

interface Order {
  id: string;
  userId: string;
  items: { name: string; size: string; quantity: number; subtotal: number }[];
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const badgeClass: Record<string, string> = {
  PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed',
  SHIPPED: 'badge-shipped', DELIVERED: 'badge-delivered', CANCELLED: 'badge-cancelled',
};

const STATS = [
  { key: 'orders',   label: 'Total Orders',   Icon: ArchiveBoxIcon,      color: 'var(--green)'  },
  { key: 'revenue',  label: 'Total Revenue',   Icon: CurrencyDollarIcon,  color: 'var(--white)'  },
  { key: 'pending',  label: 'Pending Orders',  Icon: ClockIcon,           color: 'var(--yellow)' },
  { key: 'products', label: 'Products',        Icon: TagIcon,             color: 'var(--white)'  },
];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=50').then((r) => setOrders(r.data)),
      api.get('/products?limit=100').then((r) => setProducts(r.data.products)),
    ]).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const revenue = orders.filter(o => o.status !== 'CANCELLED').reduce((a, o) => a + o.total, 0);
  const pending = orders.filter(o => o.status === 'PENDING').length;

  const statValues: Record<string, string> = {
    orders:   String(orders.length),
    revenue:  `$${revenue.toFixed(2)}`,
    pending:  String(pending),
    products: String(products.length),
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ position: 'relative', minHeight: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your store performance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map(({ key, label, Icon, color }) => (
          <div key={key} className="stat-card">
            <Icon style={{ width: 28, height: 28, color: 'var(--muted)', marginBottom: 12 }} />
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{statValues[key]}</div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Orders</h3>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{orders.length} total</span>
        </div>
        <div className="table-wrap">
          {orders.length === 0 ? (
            <div className="empty-state">
              <InboxIcon style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'var(--subtle)' }} />
              <p>No orders yet</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th><th>Date</th><th>Items</th>
                  <th>Total</th><th>Status</th><th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--muted)', fontSize: 12 }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      {order.items?.map((item, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {item.name} ({item.size}) ×{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--green)' }}>
                      ${order.total?.toFixed(2)}
                    </td>
                    <td>
                      <span className={`badge ${badgeClass[order.status] ?? ''}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
