// src/screens/auth/TermsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const TERMS_SECTIONS = [
  {
    icon: 'information-circle-outline',
    title: 'Somos un apoyo, no un médico',
    content:
      'VitalIA utiliza inteligencia artificial para ofrecerte un análisis preliminar de condiciones en tu piel. Este diagnóstico tiene fines informativos y NO sustituye la consulta, diagnóstico ni tratamiento de un médico dermatólogo certificado.',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Tu privacidad es sagrada',
    content:
      'Tus fotografías y datos personales se almacenan de forma cifrada y privada. Nunca compartimos tu información con terceros sin tu consentimiento explícito. Puedes eliminar tu cuenta y datos en cualquier momento.',
  },
  {
    icon: 'camera-outline',
    title: 'Uso de imágenes',
    content:
      'Las fotografías que tomes se utilizan exclusivamente para el análisis de IA. Son almacenadas de manera segura asociadas a tu cuenta y pueden ser eliminadas cuando lo desees.',
  },
  {
    icon: 'alert-circle-outline',
    title: 'Situaciones de urgencia',
    content:
      'Si nuestro análisis detecta una condición potencialmente grave, te recomendaremos buscar atención médica de manera inmediata. En caso de emergencia, llama a los servicios de emergencia de tu localidad.',
  },
  {
    icon: 'people-outline',
    title: 'Propósito social',
    content:
      'VitalIA nació para acercar la salud dermatológica a comunidades con acceso limitado a especialistas. Nuestro compromiso es ser un primer paso accesible, preciso y digno para todos.',
  },
];

export const TermsScreen = () => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { colors } = useTheme();

  const handleAccept = async () => {
    if (!accepted) {
      Alert.alert('Requiere aceptación', 'Por favor lee y acepta los términos para continuar.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: user!.id,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'No se pudo guardar tu aceptación. Inténtalo de nuevo.');
    } else {
      await refreshProfile();
      // Navigator will detect terms_accepted and redirect to onboarding
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.logoRow}>
          <Text style={[styles.logo, { color: COLORS.navy }]}>
            Vital<Text style={{ color: COLORS.mint }}>IA</Text>
          </Text>
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Antes de comenzar
        </Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Lee con atención cómo funciona VitalIA
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {TERMS_SECTIONS.map((section, i) => (
          <View
            key={i}
            style={[styles.section, { backgroundColor: colors.surface }]}
          >
            <View style={styles.sectionIcon}>
              <Ionicons name={section.icon as any} size={22} color={COLORS.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
              <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
                {section.content}
              </Text>
            </View>
          </View>
        ))}

        {/* Disclaimer box */}
        <View style={[styles.disclaimer, { borderColor: COLORS.warning, backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="medkit-outline" size={20} color={COLORS.warning} />
          <Text style={styles.disclaimerText}>
            <Text style={{ fontFamily: FONTS.bold }}>Importante: </Text>
            VitalIA NO es un dispositivo médico certificado. Los resultados son orientativos y deben
            ser evaluados por un profesional de la salud.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: accepted ? COLORS.mint : colors.border,
                backgroundColor: accepted ? COLORS.mint : 'transparent',
              },
            ]}
          >
            {accepted && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={[styles.checkText, { color: colors.textSecondary }]}>
            He leído y acepto los términos de uso de VitalIA
          </Text>
        </TouchableOpacity>

        <Button
          title="Continuar"
          onPress={handleAccept}
          loading={loading}
          disabled={!accepted}
          size="lg"
          style={{ marginTop: SIZES.md }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: SIZES.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  logoRow: { marginBottom: SIZES.sm },
  logo: { fontFamily: FONTS.extraBold, fontSize: 26, letterSpacing: -0.5 },
  headerTitle: { fontFamily: FONTS.bold, fontSize: SIZES.title, letterSpacing: -0.3 },
  headerSub: { fontFamily: FONTS.regular, fontSize: SIZES.body, marginTop: 4 },
  scroll: { padding: SIZES.lg, paddingBottom: 0 },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.teal}15`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.body, marginBottom: 4 },
  sectionContent: { fontFamily: FONTS.regular, fontSize: SIZES.small, lineHeight: 20 },
  disclaimer: {
    flexDirection: 'row',
    gap: 12,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderLeftWidth: 4,
    marginTop: SIZES.sm,
    marginBottom: SIZES.lg,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: SIZES.small,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    padding: SIZES.xl,
    paddingBottom: 36,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkText: { fontFamily: FONTS.regular, fontSize: SIZES.small, flex: 1, lineHeight: 20 },
});
