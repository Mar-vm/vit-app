// src/screens/main/FindDoctorScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export const FindDoctorScreen = () => {
  const [postalCode, setPostalCode] = useState('');
  const [searched, setSearched] = useState(false);
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isUrgent = route.params?.urgent || false;

  const openMaps = () => {
    if (!postalCode || postalCode.length < 4) {
      Alert.alert('Código postal requerido', 'Ingresa un código postal válido para buscar cerca de ti');
      return;
    }

    const query = `dermatologo cerca ${postalCode} Mexico`;
    const encodedQuery = encodeURIComponent(query);

    const url = Platform.select({
      ios: `maps://?q=${encodedQuery}`,
      android: `geo:0,0?q=${encodedQuery}`,
    });

    const webUrl = `https://www.google.com/maps/search/${encodedQuery}`;

    Linking.canOpenURL(url!).then((supported) => {
      if (supported) {
        Linking.openURL(url!);
      } else {
        Linking.openURL(webUrl);
      }
    }).catch(() => Linking.openURL(webUrl));

    setSearched(true);
  };

  const openGoogleMaps = () => {
    const query = postalCode
      ? `dermatologo ${postalCode} Mexico`
      : 'dermatologo cerca de mi';
    Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(query)}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={isUrgent ? [COLORS.urgent, '#B91C1C'] : [COLORS.navy, COLORS.ocean]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {isUrgent ? (
          <View style={styles.urgentAlert}>
            <Ionicons name="medical" size={32} color="#fff" />
            <Text style={styles.urgentTitle}>Busca atención hoy</Text>
            <Text style={styles.urgentSub}>
              Tu diagnóstico sugiere atención médica urgente. Encuentra un dermatólogo lo antes posible.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={styles.headerTitle}>Buscar dermatólogos</Text>
            <Text style={styles.headerSub}>
              Encuentra especialistas cerca de ti
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search card */}
        <View style={[styles.searchCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={22} color={COLORS.teal} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>¿Dónde estás?</Text>
          </View>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
            Ingresa tu código postal para encontrar dermatólogos cercanos
          </Text>

          <Input
            placeholder="Ej: 64000"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            maxLength={7}
            leftIcon="navigate-circle-outline"
          />

          <Button
            title="Buscar en el mapa"
            onPress={openMaps}
            size="lg"
            icon={<Ionicons name="map-outline" size={18} color="#fff" />}
          />
        </View>

        {/* Options */}
        <View style={styles.options}>
          <Text style={[styles.optionsTitle, { color: colors.text }]}>También puedes:</Text>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: colors.surface }]}
            onPress={openGoogleMaps}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#4285F420' }]}>
              <Ionicons name="globe-outline" size={24} color="#4285F4" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Google Maps</Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                Buscar dermatólogos en Google Maps
              </Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: colors.surface }]}
            onPress={() => Linking.openURL('tel:800-000-0000')}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: `${COLORS.mint}20` }]}>
              <Ionicons name="call-outline" size={24} color={COLORS.mint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>IMSS / ISSSTE</Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                Solicitar cita con dermatólogo en tu clínica
              </Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: colors.surface }]}
            onPress={() => Linking.openURL('https://www.mexicodermato.org')}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIcon, { backgroundColor: `${COLORS.teal}20` }]}>
              <Ionicons name="medkit-outline" size={24} color={COLORS.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Directorio médico</Text>
              <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                Sociedad Mexicana de Dermatología
              </Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View style={[styles.tip, { backgroundColor: `${COLORS.teal}10`, borderColor: `${COLORS.teal}30` }]}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.teal} />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.teal }}>Tip: </Text>
            Al contactar al dermatólogo, menciona que tienes un análisis previo de VitalIA para facilitar tu consulta.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { paddingTop: 56, paddingBottom: 32, paddingHorizontal: SIZES.xl },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: SIZES.md,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: SIZES.heading, color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontFamily: FONTS.regular, fontSize: SIZES.body, color: COLORS.sky, marginTop: 4 },
  urgentAlert: { alignItems: 'flex-start', gap: 8 },
  urgentTitle: { fontFamily: FONTS.bold, fontSize: SIZES.heading, color: '#fff', letterSpacing: -0.5 },
  urgentSub: { fontFamily: FONTS.regular, fontSize: SIZES.body, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  scroll: { padding: SIZES.lg, paddingBottom: 100 },
  searchCard: {
    padding: SIZES.lg, borderRadius: SIZES.radiusXl, marginTop: -20,
    shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle },
  cardSub: { fontFamily: FONTS.regular, fontSize: SIZES.small, lineHeight: 20 },
  options: { marginTop: SIZES.xl, gap: 10 },
  optionsTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle, marginBottom: SIZES.sm },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: SIZES.md, borderRadius: SIZES.radiusLg,
    shadowColor: COLORS.navy, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  optionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
  optionSub: { fontFamily: FONTS.regular, fontSize: SIZES.small, marginTop: 2 },
  tip: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    marginTop: SIZES.xl, padding: SIZES.md, borderRadius: SIZES.radiusMd, borderWidth: 1,
  },
  tipText: { fontFamily: FONTS.regular, fontSize: SIZES.small, flex: 1, lineHeight: 20 },
});
