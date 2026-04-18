import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';

const STATUS_COLOR: Record<string, string> = {
  PENDING:   '#FFB800',
  CONFIRMED: '#4D9EFF',
  SHIPPED:   '#A78BFA',
  DELIVERED: '#3EC98C', // Soft green for success
  CANCELLED: '#FF4D6A',
};

const STATUS_ICON: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  PENDING:   'time-outline',
  CONFIRMED: 'checkmark-circle-outline',
  SHIPPED:   'airplane-outline',
  DELIVERED: 'bag-check-outline',
  CANCELLED: 'close-circle-outline',
};

export default function OrdersScreen() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn: () => api.get('/orders/my').then((r) => r.data),
    enabled: !!user,
  });

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAFA', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="cube-outline" size={64} color="#D1C0C4" />
        <Text style={{ color: '#88797D', fontSize: 16, marginTop: 16, marginBottom: 24 }}>Log in to view your orders</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#FF6B98', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 }}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '900', letterSpacing: 1 }}>LOG IN</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAFA', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#FF6B98" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAFA' }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: '#1A1114', fontSize: 24, fontWeight: '900', letterSpacing: 3 }}>MY ORDERS</Text>
      </View>

      <FlatList
        data={orders ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Ionicons name="cube-outline" size={64} color="#D1C0C4" />
            <Text style={{ color: '#88797D', fontSize: 15, marginTop: 16 }}>No orders yet</Text>
            <Text style={{ color: '#D1C0C4', fontSize: 13, marginTop: 4 }}>Your order history will appear here</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ backgroundColor: '#FFFFFF', borderColor: '#EBDDE0', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <View>
                <Text style={{ color: '#88797D', fontSize: 11 }}>Order #{item.id.slice(-6).toUpperCase()}</Text>
                <Text style={{ color: '#1A1114', fontWeight: '700', marginTop: 2 }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons
                  name={STATUS_ICON[item.status] ?? 'ellipse-outline'}
                  size={16}
                  color={STATUS_COLOR[item.status] ?? '#666'}
                />
                <Text style={{ fontWeight: '700', fontSize: 13, color: STATUS_COLOR[item.status] ?? '#666' }}>
                  {item.status}
                </Text>
              </View>
            </View>

            {item.items?.map((line: any, idx: number) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ width: 40, height: 40, backgroundColor: '#FFF0F3', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="shirt-outline" size={20} color="#D1C0C4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1A1114', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>{line.name}</Text>
                  <Text style={{ color: '#88797D', fontSize: 11 }}>Size {line.size} × {line.quantity}</Text>
                </View>
                <Text style={{ color: '#1A1114', fontSize: 13, fontWeight: '600' }}>${line.subtotal?.toFixed(2)}</Text>
              </View>
            ))}

            <View style={{ borderTopWidth: 1, borderTopColor: '#EBDDE0', marginTop: 12, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#88797D', fontSize: 13 }}>Total</Text>
              <Text style={{ color: '#FF6B98', fontWeight: '700', fontSize: 15 }}>${item.total?.toFixed(2)}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
