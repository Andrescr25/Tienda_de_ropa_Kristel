import { create } from 'zustand';
import { User } from 'firebase/auth';
import api from '@/lib/api';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  syncProfile: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  syncProfile: async () => {
    if (!get().user) return;
    try {
      const { data } = await api.post('/users/sync');
      set({ profile: data });
    } catch (err) {
      console.error('Failed to sync user profile:', err);
    }
  },

  clearAuth: () => set({ user: null, profile: null, isLoading: false }),
}));
