import { useEffect, useRef, useState } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import api from '../lib/api';

interface SizeEntry { size: string; stock: number; }
interface Product {
  id: string; name: string; description: string; price: number;
  imageUrl: string; categoryId: string; sizes: SizeEntry[]; isActive: boolean;
}

const DEFAULT_SIZES: SizeEntry[] = [
  { size: 'XS', stock: 0 }, { size: 'S', stock: 0 }, { size: 'M', stock: 0 },
  { size: 'L', stock: 0 },  { size: 'XL', stock: 0 },{ size: 'XXL', stock: 0 },
];
const empty = (): Omit<Product, 'id' | 'isActive'> => ({
  name: '', description: '', price: 0, imageUrl: '', categoryId: '',
  sizes: DEFAULT_SIZES.map(s => ({ ...s })),
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');

  const loadProducts = () =>
    api.get('/products?limit=100').then((r) => {
      setProducts(r.data.products);
      setLoading(false);
    });

  useEffect(() => {
    api.get('/categories').then((r) =>
      setCategories(r.data.map((c: any) => c.name))
    );
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditing(null); setForm(empty()); setPreview('');
    setUploadProgress(0); setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: p.price,
      imageUrl: p.imageUrl, categoryId: p.categoryId,
      sizes: DEFAULT_SIZES.map(ds => {
        const found = p.sizes?.find(s => s.size === ds.size);
        return found ? { ...found } : { ...ds };
      }),
    });
    setPreview(p.imageUrl || '');
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleImageUpload = (file: File) => {
    if (!file) return;
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    const storageRef = ref(storage, `products/${Date.now()}-${file.name}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on('state_changed',
      (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
      (err) => { alert('Upload error: ' + err.message); setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        setForm((f) => ({ ...f, imageUrl: url }));
        setUploading(false);
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err: any) { alert(err.message); }
  };

  const setSize = (size: string, stock: number) =>
    setForm((f) => ({ ...f, sizes: f.sizes.map(s => s.size === size ? { ...s, stock } : s) }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage your catalog, stock, and pricing</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusIcon style={{ width: 16, height: 16 }} />
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <ShoppingBagIcon style={{ width: 48, height: 48, margin: '0 auto 16px', color: 'var(--subtle)' }} />
              <p>No products yet — add your first one!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Category</th>
                  <th>Price</th><th>Sizes & Stock</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="product-thumb" alt={p.name} />
                      ) : (
                        <div style={{
                          width: 44, height: 44, background: 'var(--elevated)',
                          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <ShoppingBagIcon style={{ width: 22, height: 22, color: 'var(--muted)' }} />
                        </div>
                      )}
                    </td>
                    <td className="product-name">{p.name}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{p.categoryId}</td>
                    <td style={{ fontWeight: 700, color: 'var(--green)' }}>${p.price}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {p.sizes?.map((s) => (
                          <span key={s.size} style={{
                            fontSize: 11, padding: '3px 8px', borderRadius: 6,
                            background: s.stock > 0 ? 'var(--green-glow)' : 'var(--elevated)',
                            color: s.stock > 0 ? 'var(--green)' : 'var(--muted)',
                            fontWeight: 600,
                          }}>
                            {s.size}: {s.stock}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                          <PencilSquareIcon style={{ width: 14, height: 14 }} /> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>
                          <TrashIcon style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <XMarkIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input className="input" placeholder="e.g. Apex Seamless Top" required
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="select" value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="input" placeholder="Product description..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Price (USD)</label>
                <input className="input" type="number" step="0.01" min="0" placeholder="45.00" required
                  value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Product Image</label>
                <div className={`upload-zone ${uploading ? 'active' : ''}`}>
                  <input ref={fileRef} type="file" accept="image/*"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                  {preview ? (
                    <img src={preview} className="upload-preview" alt="Preview" />
                  ) : (
                    <>
                      <PhotoIcon style={{ width: 36, height: 36, margin: '0 auto', color: 'var(--muted)' }} />
                      <p>Click or drag an image here</p>
                    </>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="progress-bar-wrap">
                      <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                  {uploadProgress === 100 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--green)', justifyContent: 'center' }}>
                      <CheckCircleIcon style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 13 }}>Uploaded successfully</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sizes */}
              <div className="form-group">
                <label>Stock by Size</label>
                <div className="sizes-grid">
                  {form.sizes.map((s) => (
                    <div key={s.size} className="size-input-group">
                      <div className="size-label">{s.size}</div>
                      <input className="input" type="number" min="0"
                        value={s.stock} onChange={(e) => setSize(s.size, parseInt(e.target.value) || 0)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
