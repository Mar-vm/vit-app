// src/screens/diagnosis/DiagnosisResultScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const SEVERITY_CONFIG = {
  baja: {
    color: COLORS.mint,
    bg: '#E6F9F4',
    label: 'Severidad Baja',
    icon: 'checkmark-circle',
    message: 'La condición detectada parece ser leve. Sigue las recomendaciones y monitorea cualquier cambio.',
    gradient: [COLORS.mint, COLORS.forest] as [string, string],
  },
  media: {
    color: COLORS.teal,
    bg: '#E5F4F8',
    label: 'Severidad Media',
    icon: 'alert-circle',
    message: 'Se recomienda consultar con un dermatólogo en los próximos días para una evaluación profesional.',
    gradient: [COLORS.teal, COLORS.ocean] as [string, string],
  },
  alta: {
    color: '#F59E0B',
    bg: '#FEF3C7',
    label: 'Severidad Alta',
    icon: 'warning',
    message: 'Te recomendamos visitar a un dermatólogo pronto. No dejes pasar más de una semana.',
    gradient: ['#F59E0B', '#D97706'] as [string, string],
  },
  urgente: {
    color: COLORS.urgent,
    bg: '#FEE2E2',
    label: '⚠️ Atención urgente',
    icon: 'medical',
    message: 'Esta condición requiere atención médica inmediata. Por favor busca un dermatólogo o ve a urgencias HOY.',
    gradient: [COLORS.urgent, '#991B1B'] as [string, string],
  },
};

export const DiagnosisResultScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { diagnosis, isNew } = route.params;

  const severity = diagnosis.severity || 'baja';
  const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.baja;
  const confidence = Math.round((diagnosis.confidence_score || 0) * 100);

  const findDermatologist = () => {
    navigation.navigate('FindDoctor', { urgent: diagnosis.see_doctor_urgently });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <LinearGradient colors={config.gradient} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resultado del análisis</Text>

          {/* Severity badge */}
          <View style={styles.sevBadge}>
            <Ionicons name={config.icon as any} size={28} color="#fff" />
            <Text style={styles.sevLabel}>{config.label}</Text>
          </View>

          <Text style={styles.conditionTitle}>{diagnosis.condition_detected}</Text>

          {/* Confidence */}
          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>Confianza del análisis</Text>
            <View style={styles.confidenceBar}>
              <View style={[styles.confidenceFill, { width: `${confidence}%` }]} />
            </View>
            <Text style={styles.confidenceNum}>{confidence}%</Text>
          </View>
        </LinearGradient>

        {/* Image */}
        {diagnosis.image_url && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: diagnosis.image_url }}
              style={styles.diagImage}
              resizeMode="cover"
            />
            {diagnosis.body_location && (
              <View style={[styles.locationTag, { backgroundColor: colors.surface }]}>
                <Ionicons name="body-outline" size={14} color={COLORS.teal} />
                <Text style={[styles.locationTagText, { color: colors.text }]}>
                  {diagnosis.body_location}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Alert box for urgent */}
        {diagnosis.see_doctor_urgently && (
          <View style={styles.urgentBox}>
            <LinearGradient colors={[COLORS.urgent, '#B91C1C']} style={styles.urgentInner}>
              <Ionicons name="medical" size={24} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.urgentTitle}>Atención médica inmediata</Text>
                <Text style={styles.urgentText}>
                  Basado en el análisis, te recomendamos buscar atención dermatológica HOY.
                </Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Severity message */}
        <View style={[styles.messageBox, { backgroundColor: config.bg }]}>
          <Text style={[styles.messageText, { color: config.color }]}>{config.message}</Text>
        </View>

        {/* Recommendations */}
        {diagnosis.recommendations?.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-circle-outline" size={22} color={COLORS.teal} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recomendaciones</Text>
            </View>
            {diagnosis.recommendations.map((rec: string, i: number) => (
              <View key={i} style={styles.recItem}>
                <View style={[styles.recBullet, { backgroundColor: `${COLORS.teal}20` }]}>
                  <Text style={[styles.recNum, { color: COLORS.teal }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.recText, { color: colors.textSecondary }]}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional notes */}
        {diagnosis.additional_notes && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={22} color={COLORS.teal} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notas adicionales</Text>
            </View>
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
              {diagnosis.additional_notes}
            </Text>
          </View>
        )}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { borderColor: colors.border }]}>
          <Ionicons name="shield-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.disclaimerText, { color: colors.textMuted }]}>
            Este es un diagnóstico preliminar generado por IA. No sustituye la consulta con un médico dermatólogo certificado.
          </Text>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          title="🗺️ Buscar dermatólogos cerca"
          onPress={findDermatologist}
          size="lg"
          style={[
            { marginBottom: SIZES.sm },
            diagnosis.see_doctor_urgently && { backgroundColor: COLORS.urgent },
          ]}
        />
        <Button
          title="Nuevo análisis"
          onPress={() => navigation.navigate('DiagnoseTab')}
          variant="outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: SIZES.xl },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  headerTitle: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: 'rgba(255,255,255,0.7)', marginBottom: SIZES.sm },
  sevBadge: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SIZES.sm },
  sevLabel: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle, color: '#fff' },
  conditionTitle: { fontFamily: FONTS.extraBold, fontSize: SIZES.heading, color: '#fff', letterSpacing: -0.5, marginBottom: SIZES.lg },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confidenceLabel: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: 'rgba(255,255,255,0.7)', width: 120 },
  confidenceBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3 },
  confidenceFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  confidenceNum: { fontFamily: FONTS.bold, fontSize: SIZES.small, color: '#fff', width: 36, textAlign: 'right' },
  imageContainer: { marginHorizontal: SIZES.lg, marginTop: -24, borderRadius: SIZES.radiusLg, overflow: 'hidden' },
  diagImage: { width: '100%', height: 220 },
  locationTag: {
    position: 'absolute', bottom: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull,
  },
  locationTagText: { fontFamily: FONTS.medium, fontSize: SIZES.small },
  urgentBox: { paddingHorizontal: SIZES.lg, marginTop: SIZES.md },
  urgentInner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: SIZES.md, borderRadius: SIZES.radiusMd,
  },
  urgentTitle: { fontFamily: FONTS.bold, fontSize: SIZES.body, color: '#fff' },
  urgentText: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  messageBox: { marginHorizontal: SIZES.lg, marginTop: SIZES.md, padding: SIZES.md, borderRadius: SIZES.radiusMd },
  messageText: { fontFamily: FONTS.medium, fontSize: SIZES.body, lineHeight: 24 },
  section: {
    marginHorizontal: SIZES.lg, marginTop: SIZES.md,
    padding: SIZES.md, borderRadius: SIZES.radiusLg,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SIZES.md },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  recBullet: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  recNum: { fontFamily: FONTS.bold, fontSize: SIZES.small },
  recText: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1, lineHeight: 22 },
  notesText: { fontFamily: FONTS.regular, fontSize: SIZES.body, lineHeight: 24 },
  disclaimer: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    marginHorizontal: SIZES.lg, marginTop: SIZES.md,
    padding: SIZES.md, borderRadius: SIZES.radiusMd, borderWidth: 1,
  },
  disclaimerText: { fontFamily: FONTS.regular, fontSize: SIZES.small, flex: 1, lineHeight: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SIZES.lg, paddingBottom: 36,
    shadowColor: COLORS.navy, shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 8,
  },
});
