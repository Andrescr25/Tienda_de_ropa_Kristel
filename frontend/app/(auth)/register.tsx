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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password)
      return Alert.alert('Error', 'Please fill in all fields');
    if (password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(user, { displayName: name.trim() });
    } catch (e: any) {
      Alert.alert('Registration failed', e.message);
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
        {/* Brand */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-black text-gs-white tracking-widest">TIENDA</Text>
          <Text className="text-gs-green text-sm tracking-[6px] mt-1 uppercase">Store</Text>
        </View>

        {/* Card */}
        <View className="bg-gs-card rounded-2xl p-6 border border-gs-border">
          <Text className="text-gs-white text-2xl font-bold mb-6">Create Account</Text>

          <View className="mb-4">
            <Text className="text-gs-muted text-xs uppercase tracking-widest mb-2">Full Name</Text>
            <TextInput
              className="bg-gs-surface text-gs-white rounded-xl px-4 py-3.5 border border-gs-border"
              placeholder="Your name"
              placeholderTextColor="#666"
              autoCapitalize="words"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <View className="mb-6">
            <Text className="text-gs-muted text-xs uppercase tracking-widest mb-2">Password</Text>
            <TextInput
              className="bg-gs-surface text-gs-white rounded-xl px-4 py-3.5 border border-gs-border"
              placeholder="Min. 6 characters"
              placeholderTextColor="#666"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="bg-gs-green rounded-xl py-4 items-center"
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-gs-black font-bold text-base tracking-wider">CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gs-muted">Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="text-gs-green font-semibold">Sign In</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
