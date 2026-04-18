import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, clearAuth } = useAuthStore();
  const displayUser = profile || user;

  const handleSignOut = async () => {
    await signOut(auth);
    clearAuth();
    router.replace('/(tabs)');
  };

  if (!displayUser) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FCFAFA', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#88797D' }}>You are not logged in.</Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          style={{ marginTop: 24, backgroundColor: '#FF6B98', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initial = displayUser.displayName ? displayUser.displayName.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FCFAFA' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' }}>
        {/* Header Close */}
        <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="close" size={28} color="#1A1114" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF0F3', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' }}>
          {displayUser.photoURL ? (
            <Image source={{ uri: displayUser.photoURL }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ fontSize: 40, fontWeight: '800', color: '#FF6B98' }}>{initial}</Text>
          )}
        </View>

        {/* Info */}
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1A1114', marginBottom: 4 }}>
          {displayUser.displayName || 'Athletic User'}
        </Text>
        <Text style={{ fontSize: 15, color: '#88797D', marginBottom: 24 }}>
          {displayUser.email}
        </Text>

        <View style={{ backgroundColor: '#FFFFFF', width: '100%', borderRadius: 16, padding: 20, marginBottom: 32, borderColor: '#EBDDE0', borderWidth: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#FFF0F3', paddingBottom: 16, marginBottom: 16 }}>
            <Text style={{ color: '#88797D', fontSize: 15 }}>Role</Text>
            <Text style={{ color: '#1A1114', fontSize: 15, fontWeight: '700' }}>{profile?.role || 'CUSTOMER'}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#88797D', fontSize: 15 }}>Customer ID</Text>
            <Text style={{ color: '#1A1114', fontSize: 12, fontWeight: '600', maxWidth: 150 }} numberOfLines={1}>{displayUser.uid}</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F3', width: '100%', paddingVertical: 16, borderRadius: 16, gap: 8 }}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B98" />
          <Text style={{ color: '#FF6B98', fontSize: 16, fontWeight: '700' }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
