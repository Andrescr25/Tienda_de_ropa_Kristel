import { View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import queryClient from '@/lib/queryClient';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const checkoutMutation = useMutation({
    mutationFn: () =>
      api.post('/orders', {
        items: items.map(({ productId, size, quantity }) => ({ productId, size, quantity })),
      }),
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] });
      Alert.alert('Order Confirmed!', 'Your order has been placed successfully.');
    },
    onError: (err: Error) => {
      Alert.alert('Checkout Failed', err.message);
    },
  });

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    if (!user) {
      Alert.alert('Login Required', 'You need to log in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    Alert.alert('Confirm Order', `Total: $${total().toFixed(2)}\nProceed to checkout?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Place Order', onPress: () => checkoutMutation.mutate() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAFA' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#1A1114', fontSize: 24, fontWeight: '900', letterSpacing: 3 }}>CART</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="trash-outline" size={16} color="#FF4D6A" />
            <Text style={{ color: '#FF4D6A', fontSize: 13 }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => `${item.productId}-${item.size}`}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 160 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 96 }}>
            <Ionicons name="cart-outline" size={64} color="#D1C0C4" />
            <Text style={{ color: '#88797D', fontSize: 15, marginTop: 16 }}>Your cart is empty</Text>
            <Text style={{ color: '#D1C0C4', fontSize: 13, marginTop: 4 }}>Add some products to get started</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#FFFFFF', borderColor: '#EBDDE0', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row' }}>
            <View style={{ width: 80, height: 80, backgroundColor: '#FFF0F3', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={{ width: 80, height: 80, borderRadius: 12 }} resizeMode="cover" />
              ) : (
                <Ionicons name="shirt-outline" size={36} color="#D1C0C4" />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={{ color: '#1A1114', fontWeight: '600' }} numberOfLines={1}>{item.name}</Text>
              <Text style={{ color: '#88797D', fontSize: 12, marginTop: 2 }}>Size: {item.size}</Text>
              <Text style={{ color: '#FF6B98', fontWeight: '700', marginTop: 4 }}>${item.unitPrice}</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity
                  style={{ width: 32, height: 32, backgroundColor: '#FFF0F3', borderRadius: 8, borderWidth: 1, borderColor: '#EBDDE0', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() =>
                    item.quantity > 1
                      ? updateQuantity(item.productId, item.size, item.quantity - 1)
                      : removeItem(item.productId, item.size)
                  }
                >
                  <Ionicons name="remove" size={16} color="#1A1114" />
                </TouchableOpacity>
                <Text style={{ color: '#1A1114', fontWeight: '700', marginHorizontal: 16 }}>{item.quantity}</Text>
                <TouchableOpacity
                  style={{ width: 32, height: 32, backgroundColor: '#FFF0F3', borderRadius: 8, borderWidth: 1, borderColor: '#EBDDE0', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                >
                  <Ionicons name="add" size={16} color="#1A1114" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={{ padding: 4 }} onPress={() => removeItem(item.productId, item.size)}>
              <Ionicons name="close" size={20} color="#88797D" />
            </TouchableOpacity>
          </View>
        )}
      />

      {items.length > 0 && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 16, backgroundColor: '#FCFAFA', borderTopWidth: 1, borderTopColor: '#EBDDE0' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ color: '#88797D' }}>{itemCount()} item{itemCount() !== 1 ? 's' : ''}</Text>
            <Text style={{ color: '#1A1114', fontWeight: '900', fontSize: 22 }}>${total().toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: '#FF6B98', borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
            onPress={handleCheckout}
            disabled={checkoutMutation.isPending}
            activeOpacity={0.85}
          >
            {checkoutMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 15, letterSpacing: 2 }}>CHECKOUT</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
