import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ icon, label, focused, badge }: { icon: IoniconName; label: string; focused: boolean; badge?: number }) {
  return (
    <View className="items-center justify-center pt-1">
      <View>
        <Ionicons
          name={focused ? icon : (icon.replace('-outline', '') + '-outline') as IoniconName}
          size={24}
          color={focused ? '#FF6B98' : '#88797D'}
        />
        {badge != null && badge > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: -8,
            backgroundColor: '#FF6B98', borderRadius: 8,
            width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 10, marginTop: 2, fontWeight: '600', color: focused ? '#FF6B98' : '#88797D' }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const itemCount = useCartStore((s) => s.itemCount());
  const profile   = useAuthStore((s) => s.profile);
  const isAdmin   = profile?.role === 'ADMIN';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EBDDE0',
          borderTopWidth: 1,
          paddingBottom: 8,
          height: 64,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FF6B98',
        tabBarInactiveTintColor: '#88797D',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="home-outline" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="shirt-outline" label="Shop" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="cart-outline" label="Cart" focused={focused} badge={itemCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="cube-outline" label="Orders" focused={focused} />,
        }}
      />
      {/* Admin-only tab — hidden for CUSTOMER role */}
      <Tabs.Screen
        name="admin"
        options={{
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon icon="settings-outline" label="Admin" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
