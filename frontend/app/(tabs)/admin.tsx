import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { auth, storage } from '@/lib/firebase';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminSection = 'dashboard' | 'products' | 'categories' | 'users';

interface Order {
  id: string; userId: string; total: number; status: string; createdAt: string;
  items: { name: string; size: string; quantity: number; subtotal: number }[];
}
interface Product {
  id: string; name: string; description: string; price: number;
  imageUrl: string; categoryId: string;
  sizes: { size: string; stock: number }[];
}
interface Category {
  id: string; name: string; description?: string; imageUrl?: string; createdAt?: string;
}
interface UserProfile {
  uid: string; email: string; displayName: string; role: 'ADMIN' | 'CUSTOMER'; createdAt: string;
}

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const DEFAULT_SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// ─── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg: '#FCFAFA', card: '#FFFFFF', surface: '#FFF0F3', border: '#EBDDE0',
  green: '#FF6B98', white: '#1A1114', muted: '#88797D', danger: '#E63946',
  yellow: '#E07A5F',
};

// ─── Small UI helpers ─────────────────────────────────────────────────────────
function SectionTab({ id, label, icon, active, onPress }: {
  id: AdminSection; label: string; icon: string; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1, alignItems: 'center', paddingVertical: 10,
        borderBottomWidth: 2,
        borderBottomColor: active ? C.green : 'transparent',
      }}
    >
      <Ionicons name={icon as any} size={20} color={active ? C.green : C.muted} />
      <Text style={{ fontSize: 10, marginTop: 3, color: active ? C.green : C.muted, fontWeight: '600' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={{
      flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: C.border, margin: 4,
    }}>
      <Ionicons name={icon as any} size={22} color={C.muted} />
      <Text style={{ color: C.muted, fontSize: 11, marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
      <Text style={{ color, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: '#FFD60A', CONFIRMED: '#00B4D8', SHIPPED: '#9B5DE5',
    DELIVERED: C.green, CANCELLED: C.danger,
  };
  const c = colors[status] ?? C.muted;
  return (
    <View style={{ backgroundColor: c + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: c, fontSize: 11, fontWeight: '700' }}>{status}</Text>
    </View>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardSection() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders?limit=50').then((r) => setOrders(r.data)),
      api.get('/products?limit=100').then((r) => setProducts(r.data.products)),
    ]).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch (e: any) { Alert.alert('Error', e.message); }
  };

  const revenue = orders.filter(o => o.status !== 'CANCELLED').reduce((a, o) => a + o.total, 0);
  const pending = orders.filter(o => o.status === 'PENDING').length;

  if (loading) return <ActivityIndicator color={C.green} style={{ marginTop: 48 }} />;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Stats */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', margin: -4, marginBottom: 12 }}>
        <StatCard label="Total Orders"  value={String(orders.length)}   icon="archive-outline"       color={C.green} />
        <StatCard label="Revenue"       value={`$${revenue.toFixed(2)}`} icon="cash-outline"          color={C.white} />
        <StatCard label="Pending"       value={String(pending)}          icon="time-outline"           color={C.yellow} />
        <StatCard label="Products"      value={String(products.length)}  icon="pricetag-outline"       color={C.white} />
      </View>

      {/* Recent Orders */}
      <Text style={{ color: C.white, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Recent Orders</Text>
      {orders.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Ionicons name="cube-outline" size={48} color={C.border} />
          <Text style={{ color: C.muted, marginTop: 12 }}>No orders yet</Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={{
            backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10,
            borderWidth: 1, borderColor: C.border,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: C.muted, fontFamily: 'monospace', fontSize: 12 }}>
                #{order.id.slice(-8).toUpperCase()}
              </Text>
              <Text style={{ color: C.muted, fontSize: 12 }}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {order.items?.map((item, i) => (
              <Text key={i} style={{ color: C.muted, fontSize: 12, marginBottom: 2 }}>
                {item.name} ({item.size}) ×{item.quantity}
              </Text>
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <Text style={{ color: C.green, fontWeight: '700', fontSize: 15 }}>${order.total?.toFixed(2)}</Text>
              <Badge status={order.status} />
            </View>
            {/* Status Picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {ORDER_STATUSES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => updateStatus(order.id, s)}
                  style={{
                    marginRight: 8, paddingHorizontal: 10, paddingVertical: 5,
                    borderRadius: 8, borderWidth: 1,
                    borderColor: order.status === s ? C.green : C.border,
                    backgroundColor: order.status === s ? C.green + '22' : C.surface,
                  }}
                >
                  <Text style={{ color: order.status === s ? C.green : C.muted, fontSize: 11, fontWeight: '600' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
function ProductsSection() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing]           = useState<Product | null>(null);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [uploadPct, setUploadPct]       = useState(0);

  const emptyForm = () => ({
    name: '', description: '', price: '', imageUrl: '', categoryId: '',
    sizes: DEFAULT_SIZES.map(s => ({ size: s, stock: '0' })),
  });
  const [form, setForm] = useState(emptyForm());

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/products?limit=100').then((r) => setProducts(r.data.products)),
      api.get('/categories').then((r) => setCategories(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setModalVisible(true); };
  const openEdit   = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      imageUrl: p.imageUrl, categoryId: p.categoryId,
      sizes: DEFAULT_SIZES.map(s => {
        const found = p.sizes?.find(x => x.size === s);
        return { size: s, stock: String(found?.stock ?? 0) };
      }),
    });
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    setUploadPct(0);
    try {
      const blob = await fetch(asset.uri).then(r => r.blob());
      const storageRef = ref(storage, `products/${Date.now()}`);
      const task = uploadBytesResumable(storageRef, blob);
      task.on('state_changed',
        (snap) => setUploadPct(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (e) => Alert.alert('Upload error', e.message),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setForm(f => ({ ...f, imageUrl: url }));
          setUploading(false);
        }
      );
    } catch (e: any) { Alert.alert('Error', e.message); setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    setSaving(true);
    try {
      const payload = {
        ...form, price: parseFloat(form.price) || 0,
        sizes: form.sizes.map(s => ({ size: s.size, stock: parseInt(s.stock) || 0 })),
      };
      if (editing) { await api.put(`/products/${editing.id}`, payload); }
      else          { await api.post('/products', payload); }
      setModalVisible(false);
      load();
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Deactivate', `Deactivate "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: async () => {
        try { await api.delete(`/products/${id}`); load(); }
        catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (loading) return <ActivityIndicator color={C.green} style={{ marginTop: 48 }} />;

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>
          {products.length} Products
        </Text>
        <TouchableOpacity
          onPress={openCreate}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 6 }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Add</Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
          <Ionicons name="shirt-outline" size={48} color={C.border} />
          <Text style={{ color: C.muted, marginTop: 12 }}>No products yet</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item: p }) => (
            <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {p.imageUrl ? (
                <Image source={{ uri: p.imageUrl }} style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: C.surface }} />
              ) : (
                <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="shirt-outline" size={24} color={C.border} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.white, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ color: C.muted, fontSize: 12 }}>{p.categoryId}</Text>
                <Text style={{ color: C.green, fontWeight: '700', marginTop: 4 }}>${p.price}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => openEdit(p)} style={{ backgroundColor: C.surface, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.border }}>
                  <Ionicons name="pencil-outline" size={16} color={C.muted} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(p.id, p.name)} style={{ backgroundColor: C.danger + '22', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.danger + '44' }}>
                  <Ionicons name="trash-outline" size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Product Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: C.bg }}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <Text style={{ color: C.white, fontSize: 18, fontWeight: '700' }}>{editing ? 'Edit Product' : 'New Product'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              {/* Image */}
              <TouchableOpacity onPress={pickImage} style={{
                height: 160, borderRadius: 14, borderWidth: 1, borderColor: C.border,
                borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
                backgroundColor: C.surface, overflow: 'hidden',
              }}>
                {form.imageUrl ? (
                  <Image source={{ uri: form.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={36} color={C.muted} />
                    <Text style={{ color: C.muted, marginTop: 8, fontSize: 13 }}>
                      {uploading ? `Uploading ${uploadPct}%…` : 'Tap to choose image'}
                    </Text>
                  </>
                )}
                {uploading && (
                  <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: C.border }}>
                    <View style={{ height: 3, width: `${uploadPct}%`, backgroundColor: C.green }} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Name */}
              <View>
                <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Name *</Text>
                <TextInput
                  style={{ backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, color: C.white, padding: 12 }}
                  placeholder="e.g. Apex Seamless Top" placeholderTextColor={C.muted}
                  value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))}
                />
              </View>

              {/* Description */}
              <View>
                <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Description</Text>
                <TextInput
                  style={{ backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, color: C.white, padding: 12, minHeight: 80, textAlignVertical: 'top' }}
                  placeholder="Product description…" placeholderTextColor={C.muted} multiline
                  value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))}
                />
              </View>

              {/* Price */}
              <View>
                <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Price (USD) *</Text>
                <TextInput
                  style={{ backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, color: C.white, padding: 12 }}
                  placeholder="45.00" placeholderTextColor={C.muted} keyboardType="decimal-pad"
                  value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))}
                />
              </View>

              {/* Category */}
              <View>
                <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setForm(f => ({ ...f, categoryId: cat.name }))}
                      style={{
                        marginRight: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                        borderWidth: 1,
                        borderColor: form.categoryId === cat.name ? C.green : C.border,
                        backgroundColor: form.categoryId === cat.name ? C.green + '22' : C.surface,
                      }}
                    >
                      <Text style={{ color: form.categoryId === cat.name ? C.green : C.muted, fontWeight: '600', fontSize: 13 }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Sizes */}
              <View>
                <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Stock by Size</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {form.sizes.map((s) => (
                    <View key={s.size} style={{ alignItems: 'center', gap: 4, width: 54 }}>
                      <Text style={{ color: C.muted, fontWeight: '700', fontSize: 12 }}>{s.size}</Text>
                      <TextInput
                        style={{ backgroundColor: C.surface, borderRadius: 8, borderWidth: 1, borderColor: C.border, color: C.white, padding: 8, textAlign: 'center', width: '100%' }}
                        keyboardType="number-pad" value={s.stock}
                        onChangeText={v => setForm(f => ({ ...f, sizes: f.sizes.map(x => x.size === s.size ? { ...x, stock: v } : x) }))}
                      />
                    </View>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving || uploading}
                style={{ backgroundColor: C.green, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, opacity: (saving || uploading) ? 0.6 : 1 }}
              >
                {saving ? <ActivityIndicator color="#FFFFFF" /> : (
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                    {editing ? 'Save Changes' : 'Create Product'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
function CategoriesSection() {
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing]           = useState<Category | null>(null);
  const [saving, setSaving]             = useState(false);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '' });

  const load = useCallback(() => {
    setLoading(true);
    api.get('/categories').then(r => setCategories(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', imageUrl: '' }); setModalVisible(true); };
  const openEdit   = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? '', imageUrl: c.imageUrl ?? '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Name is required');
    setSaving(true);
    try {
      if (editing) { await api.put(`/categories/${editing.id}`, form); }
      else          { await api.post('/categories', form); }
      setModalVisible(false);
      load();
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete', `Delete category "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await api.delete(`/categories/${id}`); load(); }
        catch (e: any) { Alert.alert('Error', e.message); }
      }},
    ]);
  };

  if (loading) return <ActivityIndicator color={C.green} style={{ marginTop: 48 }} />;

  return (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: C.white, fontWeight: '700', fontSize: 16 }}>{categories.length} Categories</Text>
        <TouchableOpacity
          onPress={openCreate}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.green, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 6 }}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Add</Text>
        </TouchableOpacity>
      </View>

      {categories.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
          <Ionicons name="pricetag-outline" size={48} color={C.border} />
          <Text style={{ color: C.muted, marginTop: 12 }}>No categories yet</Text>
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(c) => c.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item: cat }) => (
            <View style={{ backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
              {cat.imageUrl ? (
                <Image source={{ uri: cat.imageUrl }} style={{ width: '100%', height: 80 }} resizeMode="cover" />
              ) : (
                <View style={{ width: '100%', height: 60, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="pricetag-outline" size={28} color={C.border} />
                </View>
              )}
              <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.white, fontWeight: '700', fontSize: 14 }}>{cat.name}</Text>
                  {cat.description && <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>{cat.description}</Text>}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => openEdit(cat)} style={{ backgroundColor: C.surface, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.border }}>
                    <Ionicons name="pencil-outline" size={16} color={C.muted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(cat.id, cat.name)} style={{ backgroundColor: C.danger + '22', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: C.danger + '44' }}>
                    <Ionicons name="trash-outline" size={16} color={C.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Category Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.white, fontSize: 18, fontWeight: '700' }}>{editing ? 'Edit Category' : 'New Category'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={C.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
            <View>
              <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Name *</Text>
              <TextInput
                style={{ backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, color: C.white, padding: 12 }}
                placeholder="e.g. Hoodies" placeholderTextColor={C.muted}
                value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))}
              />
            </View>
            <View>
              <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Description</Text>
              <TextInput
                style={{ backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, color: C.white, padding: 12, minHeight: 80, textAlignVertical: 'top' }}
                placeholder="Brief description…" placeholderTextColor={C.muted} multiline
                value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))}
              />
            </View>
            <View>
              <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Image URL (optional)</Text>
              <TextInput
                style={{ backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, color: C.white, padding: 12 }}
                placeholder="https://…" placeholderTextColor={C.muted} keyboardType="url" autoCapitalize="none"
                value={form.imageUrl} onChangeText={v => setForm(f => ({ ...f, imageUrl: v }))}
              />
              {form.imageUrl ? (
                <Image source={{ uri: form.imageUrl }} style={{ width: '100%', height: 100, borderRadius: 10, marginTop: 10 }} resizeMode="cover" />
              ) : null}
            </View>
            <TouchableOpacity
              onPress={handleSave} disabled={saving}
              style={{ backgroundColor: C.green, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? <ActivityIndicator color="#FFFFFF" /> : (
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                  {editing ? 'Save Changes' : 'Create Category'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// ─── USERS ────────────────────────────────────────────────────────────────────
function UsersSection() {
  const [users, setUsers]         = useState<UserProfile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [updating, setUpdating]   = useState<string | null>(null);
  const currentUid                = useAuthStore(s => s.user?.uid);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (uid: string, newRole: string) => {
    setUpdating(uid);
    try {
      await api.patch(`/users/${uid}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole as UserProfile['role'] } : u));
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setUpdating(null); }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount    = users.filter(u => u.role === 'ADMIN').length;
  const customerCount = users.filter(u => u.role === 'CUSTOMER').length;

  if (loading) return <ActivityIndicator color={C.green} style={{ marginTop: 48 }} />;

  return (
    <>
      {/* Mini stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <StatCard label="Total" value={String(users.length)}   icon="people-outline"      color={C.white} />
        <StatCard label="Admins" value={String(adminCount)}     icon="shield-checkmark-outline" color={C.green} />
        <StatCard label="Clients" value={String(customerCount)}  icon="person-outline"       color="#00B4D8" />
      </View>

      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, gap: 10 }}>
        <Ionicons name="search-outline" size={18} color={C.muted} />
        <TextInput
          style={{ flex: 1, color: C.white, fontSize: 14 }}
          placeholder="Search by name or email…" placeholderTextColor={C.muted}
          value={search} onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 48 }}>
          <Ionicons name="people-outline" size={48} color={C.border} />
          <Text style={{ color: C.muted, marginTop: 12 }}>{search ? 'No results' : 'No users yet'}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={u => u.uid}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item: u }) => {
            const isAdmin = u.role === 'ADMIN';
            const isMe    = u.uid === currentUid;
            return (
              <View style={{ backgroundColor: C.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: isAdmin ? C.green + '44' : C.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 42, height: 42, borderRadius: 21,
                    backgroundColor: isAdmin ? C.green + '22' : C.surface,
                    borderWidth: 1, borderColor: isAdmin ? C.green + '66' : C.border,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ color: isAdmin ? C.green : C.white, fontWeight: '800', fontSize: 16 }}>
                      {(u.displayName || u.email)?.charAt(0)?.toUpperCase() ?? '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: C.white, fontWeight: '600', fontSize: 14 }}>{u.displayName || '—'}</Text>
                      {isMe && <View style={{ backgroundColor: C.green + '22', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}><Text style={{ color: C.green, fontSize: 10, fontWeight: '700' }}>YOU</Text></View>}
                    </View>
                    <Text style={{ color: C.muted, fontSize: 12 }}>{u.email}</Text>
                  </View>
                  <Badge status={u.role} />
                </View>

                {/* Role toggle — can't demote yourself */}
                {!isMe && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border }}>
                    {(['CUSTOMER', 'ADMIN'] as const).map(r => (
                      <TouchableOpacity
                        key={r}
                        disabled={updating === u.uid || u.role === r}
                        onPress={() => handleRoleChange(u.uid, r)}
                        style={{
                          flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center',
                          borderWidth: 1,
                          borderColor: u.role === r ? C.green : C.border,
                          backgroundColor: u.role === r ? C.green + '22' : C.surface,
                          opacity: updating === u.uid ? 0.5 : 1,
                        }}
                      >
                        {updating === u.uid ? (
                          <ActivityIndicator size="small" color={C.green} />
                        ) : (
                          <Text style={{ color: u.role === r ? C.green : C.muted, fontWeight: '700', fontSize: 12 }}>{r}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </>
  );
}

// ─── MAIN ADMIN SCREEN ────────────────────────────────────────────────────────
export default function AdminScreen() {
  const [section, setSection] = useState<AdminSection>('dashboard');
  const profile = useAuthStore(s => s.profile);

  const SECTIONS: { id: AdminSection; label: string; icon: string }[] = [
    { id: 'dashboard',  label: 'Dashboard',  icon: 'bar-chart-outline'  },
    { id: 'products',   label: 'Products',   icon: 'shirt-outline'       },
    { id: 'categories', label: 'Categories', icon: 'pricetag-outline'    },
    { id: 'users',      label: 'Users',      icon: 'people-outline'      },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: C.border,
      }}>
        <View>
          <Text style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>Admin Panel</Text>
          <Text style={{ color: C.white, fontSize: 18, fontWeight: '800' }}>
            {profile?.displayName?.split(' ')[0] ?? 'Admin'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => signOut(auth)}
          style={{ backgroundColor: C.surface, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.border }}
        >
          <Ionicons name="log-out-outline" size={20} color={C.muted} />
        </TouchableOpacity>
      </View>

      {/* Section Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.card }}>
        {SECTIONS.map(s => (
          <SectionTab key={s.id} id={s.id} label={s.label} icon={s.icon} active={section === s.id} onPress={() => setSection(s.id)} />
        ))}
      </View>

      {/* Section Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        key={section} // remount on section change to reset scroll
      >
        {section === 'dashboard'  && <DashboardSection  />}
        {section === 'products'   && <ProductsSection   />}
        {section === 'categories' && <CategoriesSection />}
        {section === 'users'      && <UsersSection      />}
      </ScrollView>
    </SafeAreaView>
  );
}
