// src/screens/main/SettingsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

interface SettingRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, label, subtitle, onPress, rightElement, color,
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${color || COLORS.teal}15` }]}>
        <Ionicons name={icon as any} size={20} color={color || COLORS.teal} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {subtitle && (
          <Text style={[styles.rowSub, { color: colors.textMuted }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const { signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es irreversible. Se eliminarán todos tus datos y diagnósticos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => Alert.alert('Contacta soporte', 'Escríbenos a soporte@vitalia.app para eliminar tu cuenta.'),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configuración</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          Preferencias y ajustes de la app
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Apariencia */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Apariencia</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="moon-outline"
            label="Modo oscuro"
            subtitle={isDark ? 'Activado' : 'Desactivado'}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: `${COLORS.mint}60` }}
                thumbColor={isDark ? COLORS.mint : colors.gray}
              />
            }
          />
          <SettingRow
            icon="text-outline"
            label="Tamaño de texto"
            subtitle="Normal"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
        </View>

        {/* Notificaciones */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Notificaciones</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="notifications-outline"
            label="Notificaciones push"
            subtitle="Recibe recordatorios de salud"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
          <SettingRow
            icon="mail-outline"
            label="Correo de resumen"
            subtitle="Desactivado"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
        </View>

        {/* Privacidad */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Privacidad y datos</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="shield-checkmark-outline"
            label="Política de privacidad"
            onPress={() => Linking.openURL('https://vitalia.app/privacidad')}
          />
          <SettingRow
            icon="document-text-outline"
            label="Términos y condiciones"
            onPress={() => Linking.openURL('https://vitalia.app/terminos')}
          />
          <SettingRow
            icon="cloud-download-outline"
            label="Exportar mis datos"
            subtitle="Descarga un resumen de tu historial"
            onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto.')}
          />
          <SettingRow
            icon="trash-outline"
            label="Eliminar mi cuenta"
            subtitle="Borra todos tus datos permanentemente"
            onPress={handleDeleteAccount}
            color={COLORS.error}
          />
        </View>

        {/* Soporte */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Soporte</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="help-circle-outline"
            label="Centro de ayuda"
            onPress={() => Linking.openURL('https://vitalia.app/ayuda')}
          />
          <SettingRow
            icon="chatbubble-outline"
            label="Contactar soporte"
            onPress={() => Linking.openURL('mailto:soporte@vitalia.app')}
          />
          <SettingRow
            icon="star-outline"
            label="Calificar la app"
            onPress={() => Alert.alert('¡Gracias!', 'Tu opinión nos ayuda a mejorar.')}
          />
          <SettingRow
            icon="information-circle-outline"
            label="Acerca de VitalIA"
            subtitle="v1.0.0 — Hecho con ❤️ para tu salud"
          />
        </View>

        {/* Cerrar sesión */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity
            style={[styles.signOutBtn, { borderColor: `${COLORS.urgent}30`, backgroundColor: `${COLORS.urgent}08` }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={COLORS.urgent} />
            <Text style={[styles.signOutText, { color: COLORS.urgent }]}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  sectionLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: SIZES.md,
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontFamily: FONTS.medium, fontSize: SIZES.body },
  rowSub: { fontFamily: FONTS.regular, fontSize: SIZES.caption, marginTop: 2 },
  signOutContainer: { paddingHorizontal: SIZES.lg, marginTop: SIZES.lg },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
  },
  signOutText: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
});
