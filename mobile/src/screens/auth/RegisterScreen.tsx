// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo inválido';
    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    if (password !== confirmPassword) newErrors.confirm = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const { error } = await signUp(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      if (error.message?.includes('already registered')) {
        Alert.alert('Correo en uso', 'Este correo ya tiene una cuenta. Inicia sesión en su lugar.');
      } else {
        Alert.alert('Error', error.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.');
      }
    }
    // Session state change will trigger navigation via AuthNavigator
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={[COLORS.navy, COLORS.ocean]} style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear cuenta</Text>
          <Text style={styles.headerSubtitle}>
            Únete a VitalIA y cuida tu piel
          </Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Benefits chips */}
          <View style={styles.benefits}>
            {['Diagnóstico gratuito', 'Privacidad total', 'Sin tarjeta'].map((b) => (
              <View key={b} style={[styles.chip, { backgroundColor: colors.card }]}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.mint} />
                <Text style={[styles.chipText, { color: colors.textSecondary }]}>{b}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: SIZES.md }}>
            <Input
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: '' })); }}
              isPassword
              leftIcon="lock-closed-outline"
              error={errors.password}
              hint="Usa letras, números y símbolos"
            />

            <Input
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirm: '' })); }}
              isPassword
              leftIcon="shield-checkmark-outline"
              error={errors.confirm}
            />
          </View>

          <Button
            title="Crear mi cuenta"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={{ marginTop: SIZES.sm }}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: SIZES.lg }}
          >
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              ¿Ya tienes cuenta?{' '}
              <Text style={{ color: COLORS.teal, fontFamily: FONTS.bold }}>Iniciar sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.privacy, { color: colors.textMuted }]}>
          Al crear tu cuenta aceptas nuestros Términos de Servicio y Política de Privacidad.
          Tu información nunca será compartida con terceros sin tu consentimiento.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 60,
    paddingBottom: 50,
    paddingHorizontal: SIZES.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.heading,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
    color: COLORS.sky,
    marginTop: 6,
  },
  card: {
    marginHorizontal: SIZES.lg,
    marginTop: -24,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  benefits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusFull,
  },
  chipText: { fontFamily: FONTS.medium, fontSize: SIZES.caption },
  loginText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
    textAlign: 'center',
  },
  privacy: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption,
    textAlign: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.xl,
    lineHeight: 18,
  },
});
