import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';

const CATEGORIES = [
  { id: '', name: 'All' },
  { id: 'tops', name: 'Tops' },
  { id: 'shorts', name: 'Shorts' },
  { id: 'leggings', name: 'Leggings' },
  { id: 'hoodies', name: 'Hoodies' },
  { id: 'accessories', name: 'Accessories' },
];

function ProductCard({ item }: { item: any }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={{ flex: 1, backgroundColor: '#FFFFFF', borderColor: '#EBDDE0', borderWidth: 1, borderRadius: 16, overflow: 'hidden', margin: 6 }}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.85}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: 192, backgroundColor: '#FFF0F3' }} resizeMode="cover" />
      ) : (
        <View style={{ width: '100%', height: 192, backgroundColor: '#FFF0F3', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="shirt-outline" size={52} color="#D1C0C4" />
        </View>
      )}
      <View style={{ padding: 12 }}>
        <Text style={{ color: '#1A1114', fontWeight: '600', fontSize: 13 }} numberOfLines={1}>{item.name}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: '#FF6B98', fontWeight: '700' }}>${item.price}</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {item.sizes?.slice(0, 3).map((s: any) => (
              <Text key={s.size} style={{ color: '#88797D', fontSize: 10 }}>{s.size}</Text>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CatalogScreen() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products', selectedCategory],
    queryFn: ({ pageParam }) =>
      api.get('/products', {
        params: { limit: 10, startAfter: pageParam, ...(selectedCategory ? { categoryId: selectedCategory } : {}) },
      }).then((r) => r.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const allProducts = data?.pages.flatMap((p) => p.products) ?? [];
  const filtered = search
    ? allProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : allProducts;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAFA' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: '#1A1114', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>SHOP</Text>

        {/* Search */}
        <View style={{ backgroundColor: '#FFFFFF', borderColor: '#EBDDE0', borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, marginBottom: 16 }}>
          <Ionicons name="search-outline" size={18} color="#88797D" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, color: '#1A1114', paddingVertical: 12 }}
            placeholder="Search products..."
            placeholderTextColor="#88797D"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category filters */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 99, marginRight: 8, borderWidth: 1,
                backgroundColor: selectedCategory === item.id ? '#FF6B98' : '#FFFFFF',
                borderColor: selectedCategory === item.id ? '#FF6B98' : '#EBDDE0',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: selectedCategory === item.id ? '#FFFFFF' : '#1A1114' }}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          style={{ marginBottom: 8 }}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#FF6B98" style={{ flex: 1 }} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          renderItem={({ item }) => <ProductCard item={item} />}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color="#FF6B98" style={{ paddingVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
              <Ionicons name="shirt-outline" size={56} color="#D1C0C4" />
              <Text style={{ color: '#88797D', fontSize: 15, marginTop: 12 }}>No products found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
