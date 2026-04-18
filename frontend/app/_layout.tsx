import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import queryClient from '@/lib/queryClient';
import { useAuthStore } from '@/store/authStore';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, setUser, syncProfile } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await syncProfile();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    
    // Si ya está logueado pero intenta ir a (auth), lo mandamos a la tienda principal
    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // Ya no bloqueamos el acceso general si no hay usuario (Guest mode)
  }, [user, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="(tabs)">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="product/[id]"
            options={{ presentation: 'card', headerShown: false }}
          />
        </Stack>
      </AuthGuard>
    </QueryClientProvider>
  );
}
