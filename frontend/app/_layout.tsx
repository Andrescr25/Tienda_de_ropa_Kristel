import '../global.css';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
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

// Inject Ionicons explicitly via <style> for statically exported Expo Web
// since Expo Router hydration might miss `@expo/vector-icons` CSS.
const IconStyleWeb = () => {
  if (Platform.OS !== 'web') return null;
  return (
    <style type="text/css">
      {`@font-face {
        font-family: 'Ionicons';
        src: url('/fonts/Ionicons.ttf') format('truetype');
      }`}
    </style>
  );
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <IconStyleWeb />
      <StatusBar style="dark" />
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
