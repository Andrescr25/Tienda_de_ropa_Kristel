import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { signOut } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

const PROMO_SLIDES = [
  { id: '1', label: 'NEW ARRIVALS', sub: 'Spring Collection 2025', bg: '#00FF87', text: '#000' },
  { id: '2', label: 'UP TO 40% OFF', sub: 'Limited Time Deal',     bg: '#141414', text: '#00FF87' },
  { id: '3', label: 'FREE SHIPPING', sub: 'On orders over $75',    bg: '#1E1E1E', text: '#FFF' },
];

const CATEGORIES = [
  { name: 'Tops',        icon: 'shirt-outline' as const },
  { name: 'Shorts',      icon: 'body-outline' as const },
  { name: 'Leggings',    icon: 'walk-outline' as const },
  { name: 'Hoodies',     icon: 'layers-outline' as const },
  { name: 'Accessories', icon: 'glasses-outline' as const },
];

function PromoSlider() {
  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="mb-6">
      {PROMO_SLIDES.map((slide) => (
        <View
          key={slide.id}
          style={{ width: width - 32, backgroundColor: slide.bg }}
          className="rounded-2xl h-40 justify-end p-6 mr-4"
        >
          <Text style={{ color: slide.text }} className="text-2xl font-black tracking-widest">
            {slide.label}
          </Text>
          <Text style={{ color: slide.text, opacity: 0.7 }} className="text-sm mt-1">
            {slide.sub}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

function CategoryChip({ name, icon }: { name: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="bg-gs-card border border-gs-border rounded-2xl px-5 py-3 flex-row items-center mr-3"
      onPress={() => router.push({ pathname: '/(tabs)/catalog', params: { category: name } })}
      activeOpacity={0.75}
    >
      <Ionicons name={icon} size={18} color="#00FF87" style={{ marginRight: 8 }} />
      <Text className="text-gs-white font-semibold text-sm">{name}</Text>
    </TouchableOpacity>
  );
}

function ProductCard({ item }: { item: any }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      className="bg-gs-card border border-gs-border rounded-2xl overflow-hidden mr-4"
      style={{ width: 170 }}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.85}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 176, backgroundColor: '#1E1E1E' }} resizeMode="cover" />
      ) : (
        <View style={{ width: '100%', height: 176, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="shirt-outline" size={48} color="#3A3A3A" />
        </View>
      )}
      <View className="p-3">
        <Text className="text-gs-white font-semibold text-sm" numberOfLines={1}>{item.name}</Text>
        <Text className="text-gs-green font-bold mt-1">${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { profile } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get('/products?limit=6').then((r) => r.data.products),
  });

  const handleSignOut = () => signOut(auth);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, marginBottom: 8 }}>
          <View>
            <Text style={{ color: '#666', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Welcome back</Text>
            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '700' }}>
              {profile?.displayName?.split(' ')[0] ?? 'Athlete'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{ backgroundColor: '#1E1E1E', borderColor: '#2A2A2A', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Ionicons name="log-out-outline" size={16} color="#666" />
            <Text style={{ color: '#666', fontSize: 13 }}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Promo Slider */}
        <PromoSlider />

        {/* Categories */}
        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 17, marginBottom: 12 }}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {CATEGORIES.map((cat) => <CategoryChip key={cat.name} name={cat.name} icon={cat.icon} />)}
        </ScrollView>

        {/* Featured Products */}
        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 17, marginBottom: 12 }}>Featured</Text>
        {isLoading ? (
          <ActivityIndicator color="#00FF87" style={{ paddingVertical: 32 }} />
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard item={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="shirt-outline" size={48} color="#3A3A3A" />
                <Text style={{ color: '#666', marginTop: 12 }}>No products yet</Text>
              </View>
            }
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
