import { useEffect, useState } from 'react';
import {
  TagIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../lib/api';

interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
}

const emptyForm = () => ({ name: '', description: '', imageUrl: '' });

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const load = () =>
    api.get('/categories').then((r) => {
      setCategories(r.data);
      setLoading(false);
    });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null); setForm(emptyForm()); setSaveOk(false); setShowModal(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? '', imageUrl: c.imageUrl ?? '' });
    setSaveOk(false);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setSaveOk(true);
      setTimeout(() => {
        setShowModal(false);
        load();
      }, 600);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will lose their category.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Organize your product catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusIcon style={{ width: 16, height: 16 }} />
          Add Category
        </button>
      </div>

      {/* Category Cards Grid */}
      {loading ? (
        <div style={{ padding: 64, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <TagIcon style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'var(--subtle)' }} />
          <p>No categories yet — add your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {categories.map((cat) => (
            <div key={cat.id} className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Image or placeholder */}
              <div style={{
                height: 120, borderRadius: 10, marginBottom: 16,
                background: cat.imageUrl ? `url(${cat.imageUrl}) center/cover no-repeat` : 'var(--elevated)',
                display: cat.imageUrl ? undefined : 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {!cat.imageUrl && <TagIcon style={{ width: 40, height: 40, color: 'var(--subtle)' }} />}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{cat.name}</h3>
                {cat.description && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{cat.description}</p>
                )}
                {cat.createdAt && (
                  <p style={{ fontSize: 11, color: 'var(--subtle)', marginTop: 6 }}>
                    Created {new Date(cat.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(cat)}>
                  <PencilSquareIcon style={{ width: 14, height: 14 }} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id, cat.name)}>
                  <TrashIcon style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Category' : 'New Category'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Name</label>
                <input className="input" placeholder="e.g. Hoodies" required
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="input" placeholder="Brief description of this category..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Image URL <span style={{ color: 'var(--subtle)', fontWeight: 400 }}>(optional)</span></label>
                <input className="input" placeholder="https://..." type="url"
                  value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" style={{ marginTop: 10, width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saveOk
                    ? <><CheckCircleIcon style={{ width: 16, height: 16 }} /> Saved!</>
                    : saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Category'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
