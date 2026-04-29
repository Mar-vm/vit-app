// src/screens/auth/LoginScreen.tsx
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
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Error al iniciar sesión', 'Correo o contraseña incorrectos. Inténtalo de nuevo.');
    }
    // Navigation is handled by the AuthNavigator based on session state
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
        {/* Header gradient */}
        <LinearGradient
          colors={[COLORS.navy, COLORS.ocean]}
          style={styles.header}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              {/* V shape */}
              <View style={styles.vLeft} />
              <View style={styles.vRight} />
            </View>
            <Text style={styles.logoText}>
              Vital<Text style={{ color: COLORS.mint }}>IA</Text>
            </Text>
          </View>

          <Text style={styles.tagline}>Tu salud de piel, siempre accesible</Text>
        </LinearGradient>

        {/* Form card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Bienvenido de vuelta</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Inicia sesión para continuar
          </Text>

          <View style={{ marginTop: SIZES.lg }}>
            <Input
              label="Correo electrónico"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              leftIcon="lock-closed-outline"
            />
          </View>

          <Button
            title="Iniciar sesión"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={{ marginTop: SIZES.sm }}
          />

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted }]}>o</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>
              ¿No tienes cuenta?{' '}
              <Text style={{ color: COLORS.teal, fontFamily: FONTS.bold }}>
                Regístrate gratis
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
          VitalIA es un apoyo informativo. No sustituye la consulta médica profesional.
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
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SIZES.md,
  },
  logoIcon: {
    width: 44,
    height: 44,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vLeft: {
    position: 'absolute',
    width: 4,
    height: 28,
    backgroundColor: COLORS.mint,
    borderRadius: 2,
    transform: [{ rotate: '20deg' }, { translateX: -8 }, { translateY: 4 }],
  },
  vRight: {
    position: 'absolute',
    width: 4,
    height: 28,
    backgroundColor: COLORS.sky,
    borderRadius: 2,
    transform: [{ rotate: '-20deg' }, { translateX: 8 }, { translateY: 4 }],
  },
  logoText: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.body,
    color: COLORS.sky,
    textAlign: 'center',
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
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.title,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
    gap: SIZES.sm,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontFamily: FONTS.regular, fontSize: SIZES.small },
  registerText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
    textAlign: 'center',
  },
  disclaimer: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption,
    textAlign: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.xl,
    lineHeight: 18,
  },
});
