// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Types ────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  user_id: string;
  alias: string;
  age: number | null;
  fitzpatrick_type: string | null;
  medical_history: string[];
  sun_exposure_hours: number;
  uses_sunscreen: boolean;
  works_with_chemicals: boolean;
  works_outdoors: boolean;
  works_with_soil: boolean;
  uses_harsh_soaps: boolean;
  smoker: boolean;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Diagnosis {
  id: string;
  user_id: string;
  image_url: string;
  condition_detected: string;
  confidence_score: number;
  severity: 'baja' | 'media' | 'alta' | 'urgente';
  recommendations: string[];
  see_doctor_urgently: boolean;
  body_location: string | null;
  additional_notes: string | null;
  created_at: string;
}
