// src/screens/main/HistoryScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { diagnosisService } from '../../services/api';
import { Diagnosis } from '../../services/supabase';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const SEVERITY_CONFIG = {
  baja: { color: COLORS.mint, label: 'Baja', icon: 'checkmark-circle-outline' },
  media: { color: COLORS.teal, label: 'Media', icon: 'alert-circle-outline' },
  alta: { color: '#F59E0B', label: 'Alta', icon: 'warning-outline' },
  urgente: { color: COLORS.urgent, label: 'Urgente', icon: 'medical-outline' },
};

export const HistoryScreen = () => {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { profile } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const fetchHistory = async () => {
    if (!profile?.user_id) return;
    const { data } = await diagnosisService.getHistory(profile.user_id, 50);
    if (data) setDiagnoses(data);
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, [profile]));

  const onRefresh = () => { setRefreshing(true); fetchHistory(); };

  const renderItem = ({ item }: { item: Diagnosis }) => {
    const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.baja;
    const date = new Date(item.created_at);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('DiagnosisResult', { diagnosis: item })}
        activeOpacity={0.8}
      >
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.thumb} resizeMode="cover" />
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.condition, { color: colors.text }]} numberOfLines={2}>
            {item.condition_detected}
          </Text>
          {item.body_location && (
            <View style={styles.locationRow}>
              <Ionicons name="body-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.locationText, { color: colors.textMuted }]}>{item.body_location}</Text>
            </View>
          )}
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.rightCol}>
          <View style={[styles.sevBadge, { backgroundColor: `${sev.color}20` }]}>
            <Ionicons name={sev.icon as any} size={12} color={sev.color} />
            <Text style={[styles.sevText, { color: sev.color }]}>{sev.label}</Text>
          </View>
          <Text style={[styles.confidence, { color: colors.textMuted }]}>
            {Math.round((item.confidence_score || 0) * 100)}%
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mi historial</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          {diagnoses.length} análisis realizados
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Cargando historial...</Text>
        </View>
      ) : diagnoses.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="scan-outline" size={64} color={COLORS.teal} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin análisis aún</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Realiza tu primer análisis de piel y los resultados aparecerán aquí.
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: COLORS.teal }]}
            onPress={() => navigation.navigate('DiagnoseTab')}
          >
            <Text style={styles.emptyBtnText}>Hacer mi primer análisis</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={diagnoses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: SIZES.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.teal}
              colors={[COLORS.teal]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: SIZES.xl,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: SIZES.heading, letterSpacing: -0.5 },
  headerSub: { fontFamily: FONTS.regular, fontSize: SIZES.body, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  loadingText: { fontFamily: FONTS.regular, fontSize: SIZES.body },
  emptyTitle: { fontFamily: FONTS.bold, fontSize: SIZES.title, marginTop: SIZES.lg, textAlign: 'center' },
  emptySub: { fontFamily: FONTS.regular, fontSize: SIZES.body, textAlign: 'center', marginTop: SIZES.sm, lineHeight: 24 },
  emptyBtn: {
    marginTop: SIZES.xl, paddingHorizontal: 28, paddingVertical: 14, borderRadius: SIZES.radiusLg,
  },
  emptyBtnText: { fontFamily: FONTS.bold, fontSize: SIZES.body, color: '#fff' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: SIZES.radiusLg,
    padding: 12,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumb: { width: 64, height: 64, borderRadius: SIZES.radiusMd },
  condition: { fontFamily: FONTS.semiBold, fontSize: SIZES.body, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { fontFamily: FONTS.regular, fontSize: SIZES.caption },
  date: { fontFamily: FONTS.regular, fontSize: SIZES.caption },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  sevBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: SIZES.radiusFull,
  },
  sevText: { fontFamily: FONTS.bold, fontSize: SIZES.caption },
  confidence: { fontFamily: FONTS.medium, fontSize: SIZES.caption },
});
