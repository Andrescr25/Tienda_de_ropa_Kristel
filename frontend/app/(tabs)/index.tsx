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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

const PROMO_SLIDES = [
  { id: '1', label: 'NEW ARRIVALS', sub: 'Spring Collection 2025', bg: '#FF6B98', text: '#FFFFFF' },
  { id: '2', label: 'UP TO 40% OFF', sub: 'Limited Time Deal',     bg: '#FFFFFF', text: '#FF6B98' },
  { id: '3', label: 'FREE SHIPPING', sub: 'On orders over $75',    bg: '#FFF0F3', text: '#1A1114' },
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
      <Ionicons name={icon} size={18} color="#FF6B98" style={{ marginRight: 8 }} />
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
        <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 176, backgroundColor: '#FFF0F3' }} resizeMode="cover" />
      ) : (
        <View style={{ width: '100%', height: 176, backgroundColor: '#FFF0F3', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="shirt-outline" size={48} color="#D1C0C4" />
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


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAFA' }}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, marginBottom: 8 }}>
          <View>
            <Text style={{ color: '#88797D', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Welcome to Bella Fitnes</Text>
            <Text style={{ color: '#1A1114', fontSize: 20, fontWeight: '700' }}>
              {profile?.displayName?.split(' ')[0] ?? 'Beautiful'}
            </Text>
          </View>

          {profile ? (
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0F3', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profile.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#FF6B98' }}>
                  {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?'}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7} style={{ backgroundColor: '#FF6B98', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Promo Slider */}
        <PromoSlider />

        {/* Categories */}
        <Text style={{ color: '#1A1114', fontWeight: '700', fontSize: 17, marginBottom: 12 }}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {CATEGORIES.map((cat) => <CategoryChip key={cat.name} name={cat.name} icon={cat.icon} />)}
        </ScrollView>

        {/* Featured Products */}
        <Text style={{ color: '#1A1114', fontWeight: '700', fontSize: 17, marginBottom: 12 }}>Featured</Text>
        {isLoading ? (
          <ActivityIndicator color="#FF6B98" style={{ paddingVertical: 32 }} />
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard item={item} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                <Ionicons name="shirt-outline" size={48} color="#D1C0C4" />
                <Text style={{ color: '#88797D', marginTop: 12 }}>No products yet</Text>
              </View>
            }
          />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
