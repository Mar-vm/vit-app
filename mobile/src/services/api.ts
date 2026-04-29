// src/services/api.ts
import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://vitalia-3.onrender.com';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface DiagnosisRequest {
  imageUri: string;
  bodyLocation: string;
  profile: {
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
  };
}

export interface DiagnosisResponse {
  diagnosis_id: string;
  condition_detected: string;
  confidence_score: number;
  severity: 'baja' | 'media' | 'alta' | 'urgente';
  recommendations: string[];
  see_doctor_urgently: boolean;
  additional_notes: string;
  image_url: string;
}

// ─── Mapeo de severidad desde tu modelo ────────────────────────────────────
const mapRiskLevel = (risk: string): 'baja' | 'media' | 'alta' | 'urgente' => {
  const r = risk.toLowerCase();
  if (r.includes('bajo') || r.includes('benigno')) return 'baja';
  if (r.includes('medio') || r.includes('pre-maligno') || r.includes('pre-')) return 'media';
  if (r.includes('alto') || r.includes('maligno')) return 'alta';
  if (r.includes('urgente') || r.includes('crítico')) return 'urgente';
  return 'media';
};

// ─── Generar recomendaciones basadas en resultado y perfil ─────────────────
const buildRecommendations = (
  disease: string,
  severity: string,
  profile: DiagnosisRequest['profile']
): string[] => {
  const recs: string[] = [];
  const sev = mapRiskLevel(severity);

  if (sev === 'urgente' || sev === 'alta') {
    recs.push('🚨 Consulta con un dermatólogo certificado lo antes posible');
  } else if (sev === 'media') {
    recs.push('👨‍⚕️ Agenda una cita con un dermatólogo en los próximos días');
  }

  if (!profile.uses_sunscreen) {
    recs.push('☀️ Usa protector solar SPF 30+ todos los días, incluso en días nublados');
  }
  if (profile.sun_exposure_hours > 4) {
    recs.push('🌤️ Reduce tu exposición directa al sol, especialmente entre 10am y 4pm');
  }
  if (profile.works_with_chemicals) {
    recs.push('🧤 Usa guantes y protección al manejar químicos o solventes');
  }
  if (profile.uses_harsh_soaps) {
    recs.push('🧴 Cambia a jabones neutros sin fragancia ni colorantes');
  }
  if (profile.smoker) {
    recs.push('🚭 El tabaquismo deteriora la salud de la piel — considera reducirlo');
  }
  if (profile.works_with_soil) {
    recs.push('🌿 Lava bien las zonas expuestas a tierra o polvo después del trabajo');
  }

  recs.push('💧 Mantente hidratado/a — bebe al menos 8 vasos de agua al día');
  recs.push('🔍 Toma fotos periódicas para monitorear cambios en la lesión');

  return recs.slice(0, 7);
};

// ─── API Service ───────────────────────────────────────────────────────────
export const apiService = {
  // Enviar imagen al modelo de IA en Render
  diagnose: async (data: DiagnosisRequest): Promise<DiagnosisResponse> => {
    // Tu modelo espera FormData con campo "file"
    const formData = new FormData();
    formData.append('file', {
      uri: data.imageUri,
      type: 'image/jpeg',
      name: 'skin_photo.jpg',
    } as any);

    const response = await axios.post(
      `${API_BASE_URL}/predict`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );

    const result = response.data;
    // result = { prediction, disease_name, confidence, risk_level, top3, disclaimer }

    const severity = mapRiskLevel(result.risk_level || 'medio');
    const isUrgent = severity === 'urgente' || severity === 'alta';
    const recommendations = buildRecommendations(
      result.disease_name,
      result.risk_level,
      data.profile
    );

    // Notas adicionales con top 3 diagnósticos
    const top3Text = (result.top3 || [])
      .map((t: any, i: number) => `${i + 1}. ${t.disease} (${t.probability.toFixed(1)}%)`)
      .join('\n');

    return {
      diagnosis_id: 'diag-' + Date.now(),
      condition_detected: result.disease_name || result.prediction || 'No identificado',
      confidence_score: (result.confidence || 0) / 100, // modelo da 0-100, app espera 0-1
      severity,
      recommendations,
      see_doctor_urgently: isUrgent,
      additional_notes: top3Text
        ? `Otros posibles diagnósticos:\n${top3Text}\n\n${result.disclaimer || ''}`
        : result.disclaimer || '',
      image_url: data.imageUri,
    };
  },

  // Health check
  ping: async (): Promise<boolean> => {
    try {
      await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  },
};

// ─── Supabase DB operations ────────────────────────────────────────────────
export const profileService = {
  upsert: async (userId: string, profileData: Partial<any>) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, ...profileData }, { onConflict: 'user_id' })
      .select()
      .single();
    return { data, error };
  },

  get: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },
};

export const diagnosisService = {
  getHistory: async (userId: string, limit = 20) => {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  // Guardar diagnóstico en Supabase después de recibirlo del modelo
  saveDiagnosis: async (userId: string, diagnosis: DiagnosisResponse, bodyLocation: string) => {
    const { data, error } = await supabase
      .from('diagnoses')
      .insert({
        user_id: userId,
        image_url: diagnosis.image_url || '',
        condition_detected: diagnosis.condition_detected,
        confidence_score: diagnosis.confidence_score,
        severity: diagnosis.severity,
        recommendations: diagnosis.recommendations,
        see_doctor_urgently: diagnosis.see_doctor_urgently,
        body_location: bodyLocation,
        additional_notes: diagnosis.additional_notes,
      })
      .select()
      .single();
    return { data, error };
  },
};