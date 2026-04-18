import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!selectedSize) return Alert.alert('Select a size', 'Please choose your size first');
    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl ?? '',
      size: selectedSize,
      quantity: 1,
      unitPrice: product.price,
    });
    Alert.alert('Added!', `${product.name} (${selectedSize}) added to cart`, [
      { text: 'Keep Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#00FF87" size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="shirt-outline" size={64} color="#3A3A3A" />
        <Text style={{ color: '#666', marginTop: 12 }}>Product not found</Text>
      </View>
    );
  }

  const availableSizes = product.sizes?.filter((s: any) => s.stock > 0) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute', top: 56, left: 16, zIndex: 10,
          backgroundColor: '#141414', borderColor: '#2A2A2A', borderWidth: 1,
          borderRadius: 99, width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Ionicons name="arrow-back" size={20} color="#FFF" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: '100%', height: 380, backgroundColor: '#1E1E1E' }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ width: '100%', height: 380, backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="shirt-outline" size={100} color="#3A3A3A" />
          </View>
        )}

        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 128 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '900', flex: 1, marginRight: 16 }}>{product.name}</Text>
            <Text style={{ color: '#00FF87', fontSize: 24, fontWeight: '900' }}>${product.price}</Text>
          </View>

          {product.description ? (
            <Text style={{ color: '#888', fontSize: 14, lineHeight: 22, marginBottom: 24 }}>{product.description}</Text>
          ) : null}

          {/* Size selector */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Ionicons name="resize-outline" size={14} color="#888" />
            <Text style={{ color: '#FFF', fontWeight: '700', letterSpacing: 2, fontSize: 11, textTransform: 'uppercase' }}>
              Select Size{selectedSize ? ` — ${selectedSize}` : ''}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {product.sizes?.map((sizeObj: any) => {
              const isAvailable = sizeObj.stock > 0;
              const isSelected = selectedSize === sizeObj.size;
              return (
                <TouchableOpacity
                  key={sizeObj.size}
                  disabled={!isAvailable}
                  onPress={() => setSelectedSize(sizeObj.size)}
                  style={{
                    width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
                    backgroundColor: isSelected ? '#00FF87' : isAvailable ? '#141414' : '#0A0A0A',
                    borderColor: isSelected ? '#00FF87' : '#2A2A2A',
                    opacity: isAvailable ? 1 : 0.3,
                  }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 13, color: isSelected ? '#000' : '#FFF' }}>
                    {sizeObj.size}
                  </Text>
                  {isAvailable && (
                    <Text style={{ fontSize: 9, marginTop: 2, color: isSelected ? '#000' : '#666' }}>
                      {sizeObj.stock}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Low stock warning */}
          {selectedSize && (() => {
            const s = product.sizes?.find((x: any) => x.size === selectedSize);
            return s?.stock <= 3 ? (
              <View style={{ backgroundColor: '#141414', borderColor: '#854D0E', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="warning-outline" size={16} color="#FFB800" />
                <Text style={{ color: '#FFB800', fontSize: 13 }}>Only {s.stock} left in this size!</Text>
              </View>
            ) : null;
          })()}
        </View>
      </ScrollView>

      {/* Floating Add to Cart */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16, backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: '#2A2A2A' }}>
        <TouchableOpacity
          style={{
            borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
            flexDirection: 'row', gap: 10,
            backgroundColor: selectedSize ? '#00FF87' : '#1E1E1E',
          }}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Ionicons
            name={selectedSize ? 'bag-add-outline' : 'resize-outline'}
            size={20}
            color={selectedSize ? '#000' : '#666'}
          />
          <Text style={{ fontWeight: '900', fontSize: 15, letterSpacing: 2, color: selectedSize ? '#000' : '#666' }}>
            {selectedSize ? 'ADD TO CART' : 'SELECT A SIZE'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
