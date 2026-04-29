// src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS, SIZES, FITZPATRICK_TYPES } from '../../constants/theme';

export const ProfileScreen = () => {
  const { profile, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await signOut();
          },
        },
      ]
    );
  };

  const fitz = FITZPATRICK_TYPES.find(f => f.type === profile?.fitzpatrick_type);

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon as any} size={18} color={COLORS.teal} />
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <LinearGradient colors={[COLORS.navy, COLORS.ocean]} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.alias?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.alias}>{profile?.alias || 'Usuario'}</Text>
        <Text style={styles.memberSince}>
          Miembro desde {new Date(profile?.created_at || Date.now()).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
        </Text>
      </LinearGradient>

      {/* Skin type card */}
      {fitz && (
        <View style={[styles.skinCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.skinSwatch, { backgroundColor: fitz.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.skinCardTitle, { color: colors.text }]}>Tipo Fitzpatrick {fitz.type}</Text>
            <Text style={[styles.skinCardDesc, { color: colors.textSecondary }]}>{fitz.description}</Text>
          </View>
        </View>
      )}

      {/* Personal info */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Información personal</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Text style={[styles.editBtn, { color: COLORS.teal }]}>Editar</Text>
          </TouchableOpacity>
        </View>

        <InfoRow icon="person-outline" label="Alias" value={profile?.alias || '—'} />
        <InfoRow icon="calendar-outline" label="Edad" value={profile?.age ? `${profile.age} años` : '—'} />
        <InfoRow
          icon="sunny-outline"
          label="Exposición solar"
          value={`${profile?.sun_exposure_hours || 0} horas/día`}
        />
        <InfoRow
          icon="shield-outline"
          label="Protector solar"
          value={profile?.uses_sunscreen ? 'Sí usa' : 'No usa'}
        />
        <InfoRow
          icon="warning-outline"
          label="Fumador"
          value={profile?.smoker ? 'Sí' : 'No'}
        />
      </View>

      {/* Medical history */}
      {profile?.medical_history && profile.medical_history.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Historial médico</Text>
          <View style={styles.tagContainer}>
            {profile.medical_history.map((item) => (
              <View key={item} style={[styles.tag, { backgroundColor: `${COLORS.teal}15`, borderColor: `${COLORS.teal}30` }]}>
                <Text style={[styles.tagText, { color: COLORS.teal }]}>
                  {item.replace(/_/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 36,
    alignItems: 'center',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: 32, color: '#fff' },
  alias: { fontFamily: FONTS.bold, fontSize: SIZES.title, color: '#fff', letterSpacing: -0.3 },
  memberSince: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: COLORS.sky, marginTop: 4 },
  skinCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: SIZES.lg, marginTop: SIZES.lg,
    padding: SIZES.md, borderRadius: SIZES.radiusLg,
    shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  skinSwatch: { width: 48, height: 48, borderRadius: 24 },
  skinCardTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
  skinCardDesc: { fontFamily: FONTS.regular, fontSize: SIZES.small, marginTop: 2 },
  section: {
    marginHorizontal: SIZES.lg, marginTop: SIZES.md,
    borderRadius: SIZES.radiusLg, padding: SIZES.md,
    shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle },
  editBtn: { fontFamily: FONTS.semiBold, fontSize: SIZES.small },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1,
  },
  infoLabel: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1 },
  infoValue: { fontFamily: FONTS.semiBold, fontSize: SIZES.body, maxWidth: 160, textAlign: 'right' },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: SIZES.sm },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull, borderWidth: 1,
  },
  tagText: { fontFamily: FONTS.medium, fontSize: SIZES.small },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1,
  },
  settingLabel: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: SIZES.lg, marginTop: SIZES.lg,
    padding: SIZES.md, borderRadius: SIZES.radiusLg, borderWidth: 1.5,
  },
  signOutText: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
  version: { fontFamily: FONTS.regular, fontSize: SIZES.caption, textAlign: 'center', marginTop: SIZES.md },
});
