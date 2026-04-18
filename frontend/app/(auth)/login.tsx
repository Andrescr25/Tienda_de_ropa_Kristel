import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID =
  '968449752474-8ionntrpf2b91tft6nmnv2n2uo9g7h1a.apps.googleusercontent.com';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fill in all fields');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } else {
        const result = await promptAsync();
        if (result && result.type === 'success') {
          const { id_token, access_token } = result.params;
          const credential = GoogleAuthProvider.credential(id_token, access_token);
          await signInWithCredential(auth, credential);
        }
      }
    } catch (e: any) {
      Alert.alert('Google login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gs-bg"
    >
      <View className="flex-1 justify-center px-6">
        {/* Logo / Brand */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-black text-gs-white tracking-widest">Bella Fitnes</Text>
          <Text className="text-gs-green text-sm tracking-[6px] mt-1 uppercase">Store</Text>
        </View>

        {/* Card */}
        <View className="bg-gs-card rounded-2xl p-6 border border-gs-border">
          <Text className="text-gs-white text-2xl font-bold mb-6">Sign In</Text>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-gs-muted text-xs uppercase tracking-widest mb-2">Email</Text>
            <TextInput
              className="bg-gs-surface text-gs-white rounded-xl px-4 py-3.5 border border-gs-border"
              placeholder="your@email.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-gs-muted text-xs uppercase tracking-widest mb-2">Password</Text>
            <TextInput
              className="bg-gs-surface text-gs-white rounded-xl px-4 py-3.5 border border-gs-border"
              placeholder="••••••••"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Login button */}
          <TouchableOpacity
            className="bg-gs-green rounded-xl py-4 items-center mb-4"
            onPress={handleEmailLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-gs-black font-bold text-base tracking-wider">SIGN IN</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-gs-border" />
            <Text className="text-gs-muted mx-3 text-sm">or</Text>
            <View className="flex-1 h-px bg-gs-border" />
          </View>

          {/* Google button */}
          <TouchableOpacity
            className="bg-gs-surface rounded-xl py-4 items-center border border-gs-border"
            onPress={handleGoogleLogin}
            disabled={!request || loading}
            activeOpacity={0.85}
          >
            <Text className="text-gs-white font-semibold tracking-wide">Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gs-muted">Don't have an account? </Text>
          <Link href="/(auth)/register">
            <Text className="text-gs-green font-semibold">Register</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
