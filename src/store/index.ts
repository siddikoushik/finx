import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { CalculationRecord, CalculatorType } from '../utils';

// Auth Store
interface AuthState {
  session: any;
  loading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  loading: true,
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, loading: false });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  signUp: async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { emailRedirectTo: undefined }
    });
    if (error) throw error;
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
}));

// Settings Store
interface SettingsState {
  darkModeOverride: 'light' | 'dark' | 'system';
  locale: string | undefined;
  currency: string;
  setDarkMode: (mode: 'light' | 'dark' | 'system') => Promise<void>;
  setLocale: (locale?: string) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  load: () => Promise<void>;
}

const SETTINGS_KEY = 'finx_settings_v1';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  darkModeOverride: 'system',
  locale: undefined,
  currency: 'INR',
  setDarkMode: async (mode) => {
    const next = { ...get(), darkModeOverride: mode };
    set({ darkModeOverride: mode });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ darkModeOverride: mode, locale: next.locale, currency: next.currency }));
  },
  setLocale: async (locale) => {
    const next = { ...get(), locale };
    set({ locale });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ darkModeOverride: next.darkModeOverride, locale, currency: next.currency }));
  },
  setCurrency: async (currency) => {
    const next = { ...get(), currency };
    set({ currency });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ darkModeOverride: next.darkModeOverride, locale: next.locale, currency }));
  },
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const settings = JSON.parse(raw);
        set({ darkModeOverride: settings.darkModeOverride || 'system', locale: settings.locale, currency: settings.currency || 'INR' });
      }
    } catch (error) {
      console.error('Settings load error:', error);
    }
  },
}));

// History Store
interface HistoryState {
  items: CalculationRecord[];
  loading: boolean;
  filters: { type?: CalculatorType; from?: string; to?: string };
  setFilters: (f: Partial<HistoryState['filters']>) => void;
  loadCache: () => Promise<void>;
  sync: (userId: string) => Promise<void>;
}

const HISTORY_KEY = 'finx_history_cache_v1';

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  loading: false,
  filters: {},
  setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
  loadCache: async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) set({ items: JSON.parse(raw) });
    } catch {}
  },
  sync: async (userId: string) => {
    set({ loading: true });
    const { data } = await supabase
      .from('calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    const items = data || [];
    set({ items, loading: false });
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  },
}));
