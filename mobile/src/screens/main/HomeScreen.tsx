// src/screens/main/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { diagnosisService } from '../../services/api';
import { Diagnosis } from '../../services/supabase';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

const SEVERITY_CONFIG = {
  baja: { color: COLORS.mint, label: 'Baja', icon: 'checkmark-circle-outline' },
  media: { color: COLORS.teal, label: 'Media', icon: 'alert-circle-outline' },
  alta: { color: COLORS.warning, label: 'Alta', icon: 'warning-outline' },
  urgente: { color: COLORS.urgent, label: 'Urgente', icon: 'medical-outline' },
};

export const HomeScreen = () => {
  const { profile } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [recentDiagnoses, setRecentDiagnoses] = useState<Diagnosis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (profile?.user_id) {
      diagnosisService.getHistory(profile.user_id, 3).then(({ data }) => {
        if (data) setRecentDiagnoses(data);
        setLoadingHistory(false);
      });
    }
  }, [profile]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <LinearGradient colors={[COLORS.navy, COLORS.ocean]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.alias}>{profile?.alias || 'Bienvenido'}</Text>
          </View>
          <View style={styles.logoMini}>
            <Text style={styles.logoText}>Vital<Text style={{ color: COLORS.mint }}>IA</Text></Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={styles.statNum}>{recentDiagnoses.length}</Text>
            <Text style={styles.statLabel}>Análisis{'\n'}realizados</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={styles.statNum}>
              {recentDiagnoses.filter(d => d.severity === 'baja' || d.severity === 'media').length}
            </Text>
            <Text style={styles.statLabel}>Resultados{'\n'}favorables</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Text style={styles.statNum}>
              {profile?.fitzpatrick_type || '—'}
            </Text>
            <Text style={styles.statLabel}>Tipo{'\n'}de piel</Text>
          </View>
        </View>
      </LinearGradient>

      {/* CTA - Diagnose */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('DiagnoseTab')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.teal, COLORS.mint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cta}
          >
            <View style={styles.ctaIcon}>
              <Ionicons name="camera" size={36} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctaTitle}>Realizar análisis</Text>
              <Text style={styles.ctaSub}>
                Toma una foto y obtén un diagnóstico preliminar en segundos
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Tips section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Consejos para ti</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SIZES.lg }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: SIZES.lg, gap: 12 }}>
            {TIPS.map((tip, i) => (
              <View key={i} style={[styles.tipCard, { backgroundColor: colors.surface }]}>
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Recent diagnoses */}
      {recentDiagnoses.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Análisis recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={{ color: COLORS.teal, fontFamily: FONTS.semiBold, fontSize: SIZES.small }}>
                Ver todos
              </Text>
            </TouchableOpacity>
          </View>

          {recentDiagnoses.map((d) => {
            const sev = SEVERITY_CONFIG[d.severity] || SEVERITY_CONFIG.baja;
            return (
              <TouchableOpacity
                key={d.id}
                style={[styles.diagCard, { backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('DiagnosisResult', { diagnosis: d })}
                activeOpacity={0.8}
              >
                <View style={[styles.sevDot, { backgroundColor: `${sev.color}20` }]}>
                  <Ionicons name={sev.icon as any} size={20} color={sev.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.conditionText, { color: colors.text }]}>
                    {d.condition_detected}
                  </Text>
                  <Text style={[styles.dateText, { color: colors.textMuted }]}>
                    {new Date(d.created_at).toLocaleDateString('es-MX', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={[styles.sevBadge, { backgroundColor: `${sev.color}20` }]}>
                  <Text style={[styles.sevText, { color: sev.color }]}>{sev.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Find dermatologist banner */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => navigation.navigate('FindDoctor')}
          activeOpacity={0.85}
        >
          <View style={[styles.doctorBanner, { borderColor: `${COLORS.ocean}30`, backgroundColor: `${COLORS.ocean}10` }]}>
            <Ionicons name="location-outline" size={28} color={COLORS.ocean} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.doctorTitle, { color: COLORS.ocean }]}>
                Buscar dermatólogos cerca
              </Text>
              <Text style={[styles.doctorSub, { color: colors.textSecondary }]}>
                Encuentra especialistas en tu zona
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.ocean} />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const TIPS = [
  {
    emoji: '☀️',
    title: 'Protección solar',
    text: 'Usa SPF 30+ diario, incluso en días nublados.',
  },
  {
    emoji: '💧',
    title: 'Hidratación',
    text: 'Bebe al menos 8 vasos de agua al día para mantener tu piel sana.',
  },
  {
    emoji: '🧴',
    title: 'Jabón neutro',
    text: 'Prefiere jabones sin fragancia ni colorantes para evitar irritación.',
  },
  {
    emoji: '🌿',
    title: 'Alimentación',
    text: 'Frutas y verduras ricas en antioxidantes protegen tu piel desde adentro.',
  },
];

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: SIZES.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.lg,
  },
  greeting: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: COLORS.sky },
  alias: { fontFamily: FONTS.bold, fontSize: SIZES.title, color: COLORS.white, letterSpacing: -0.3 },
  logoMini: {},
  logoText: { fontFamily: FONTS.extraBold, fontSize: 22, color: COLORS.white },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  statNum: { fontFamily: FONTS.bold, fontSize: SIZES.title, color: COLORS.white },
  statLabel: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.sky, textAlign: 'center', marginTop: 2 },
  ctaContainer: { paddingHorizontal: SIZES.lg, marginTop: -20 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle, color: '#fff' },
  ctaSub: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: 'rgba(255,255,255,0.8)', marginTop: 4, lineHeight: 18 },
  section: { paddingHorizontal: SIZES.lg, marginTop: SIZES.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle, letterSpacing: -0.2, marginBottom: SIZES.md },
  tipCard: {
    width: 160,
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  tipEmoji: { fontSize: 28, marginBottom: 8 },
  tipTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.small, marginBottom: 4 },
  tipText: { fontFamily: FONTS.regular, fontSize: SIZES.caption, lineHeight: 17 },
  diagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: 10,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sevDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionText: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
  dateText: { fontFamily: FONTS.regular, fontSize: SIZES.caption, marginTop: 2 },
  sevBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  sevText: { fontFamily: FONTS.bold, fontSize: SIZES.caption },
  doctorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
  },
  doctorTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
  doctorSub: { fontFamily: FONTS.regular, fontSize: SIZES.small, marginTop: 2 },
});
