// src/screens/auth/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { supabase } from '../../services/supabase';
import {
  COLORS,
  FONTS,
  SIZES,
  MEDICAL_HISTORY_OPTIONS,
  FITZPATRICK_TYPES,
} from '../../constants/theme';

const TOTAL_STEPS = 4;

export const OnboardingScreen = () => {
  const { user, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 - Basic info
  const [alias, setAlias] = useState('');
  const [age, setAge] = useState('');

  // Step 2 - Fitzpatrick
  const [fitzpatrick, setFitzpatrick] = useState('');

  // Step 3 - Medical history
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);

  // Step 4 - Daily habits
  const [sunHours, setSunHours] = useState('2');
  const [usesSunscreen, setUsesSunscreen] = useState(false);
  const [worksWithChemicals, setWorksWithChemicals] = useState(false);
  const [worksOutdoors, setWorksOutdoors] = useState(false);
  const [worksWithSoil, setWorksWithSoil] = useState(false);
  const [usesHarshSoaps, setUsesHarshSoaps] = useState(false);
  const [smoker, setSmoker] = useState(false);

  const toggleMedical = (id: string) => {
    if (id === 'ninguno') {
      setMedicalHistory(['ninguno']);
      return;
    }
    setMedicalHistory((prev) => {
      const without = prev.filter((x) => x !== 'ninguno');
      if (without.includes(id)) return without.filter((x) => x !== id);
      return [...without, id];
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (!alias.trim()) { Alert.alert('Campo requerido', 'Por favor ingresa un alias'); return; }
      if (alias.trim().length < 2) { Alert.alert('Alias muy corto', 'Usa al menos 2 caracteres'); return; }
      const ageNum = parseInt(age);
      if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        Alert.alert('Edad inválida', 'Por favor ingresa una edad válida (1-120)'); return;
      }
    }
    if (step === 2 && !fitzpatrick) {
      Alert.alert('Selección requerida', 'Por favor selecciona tu tipo de piel'); return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleFinish = async () => {
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert(
      {
        user_id: user!.id,
        alias: alias.trim(),
        age: parseInt(age),
        fitzpatrick_type: fitzpatrick,
        medical_history: medicalHistory.length ? medicalHistory : ['ninguno'],
        sun_exposure_hours: parseInt(sunHours) || 2,
        uses_sunscreen: usesSunscreen,
        works_with_chemicals: worksWithChemicals,
        works_outdoors: worksOutdoors,
        works_with_soil: worksWithSoil,
        uses_harsh_soaps: usesHarshSoaps,
        smoker,
        onboarding_completed: true,
      },
      { onConflict: 'user_id' }
    );
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'No se pudo guardar tu perfil. Inténtalo de nuevo.');
    } else {
      await refreshProfile();
    }
  };

  const SwitchRow = ({ label, value, onToggle, icon }: any) => (
    <View style={[styles.switchRow, { borderColor: colors.border }]}>
      <Ionicons name={icon} size={20} color={COLORS.teal} />
      <Text style={[styles.switchLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: `${COLORS.mint}60` }}
        thumbColor={value ? COLORS.mint : colors.gray}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress */}
      <LinearGradient colors={[COLORS.navy, COLORS.ocean]} style={styles.progressHeader}>
        <Text style={styles.stepLabel}>Paso {step} de {TOTAL_STEPS}</Text>
        <View style={styles.progressBar}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  flex: 1,
                  backgroundColor: i < step ? COLORS.mint : 'rgba(255,255,255,0.25)',
                  height: i < step ? 6 : 4,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepTitle}>
          {['Datos básicos', 'Tipo de piel', 'Historial médico', 'Hábitos diarios'][step - 1]}
        </Text>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Step 1: Basic info ── */}
        {step === 1 && (
          <View>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Para proteger tu privacidad, nunca pedimos tu nombre real. Un alias es suficiente.
            </Text>
            <Input
              label="Alias (apodo)"
              placeholder="Ej: JuanD, Karlita22"
              value={alias}
              onChangeText={setAlias}
              leftIcon="person-outline"
              maxLength={30}
            />
            <Input
              label="Edad"
              placeholder="Ej: 28"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              leftIcon="calendar-outline"
              maxLength={3}
            />
          </View>
        )}

        {/* ── Step 2: Fitzpatrick ── */}
        {step === 2 && (
          <View>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Selecciona el tipo de piel que mejor te describe. Esto nos ayuda a personalizar el análisis.
            </Text>
            {FITZPATRICK_TYPES.map((f) => (
              <TouchableOpacity
                key={f.type}
                style={[
                  styles.fitzRow,
                  {
                    borderColor: fitzpatrick === f.type ? COLORS.teal : colors.border,
                    backgroundColor: fitzpatrick === f.type ? `${COLORS.teal}10` : colors.surface,
                  },
                ]}
                onPress={() => setFitzpatrick(f.type)}
                activeOpacity={0.8}
              >
                <View style={[styles.skinSwatch, { backgroundColor: f.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fitzType, { color: colors.text }]}>Tipo {f.type}</Text>
                  <Text style={[styles.fitzDesc, { color: colors.textSecondary }]}>{f.description}</Text>
                </View>
                {fitzpatrick === f.type && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.teal} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Step 3: Medical history ── */}
        {step === 3 && (
          <View>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Selecciona todas las condiciones que apliquen. Esta información es confidencial.
            </Text>
            <View style={styles.checkGrid}>
              {MEDICAL_HISTORY_OPTIONS.map((opt) => {
                const selected = medicalHistory.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.checkOption,
                      {
                        borderColor: selected ? COLORS.teal : colors.border,
                        backgroundColor: selected ? `${COLORS.teal}12` : colors.surface,
                      },
                    ]}
                    onPress={() => toggleMedical(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkBox,
                        {
                          borderColor: selected ? COLORS.mint : colors.border,
                          backgroundColor: selected ? COLORS.mint : 'transparent',
                        },
                      ]}
                    >
                      {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
                    </View>
                    <Text style={[styles.checkLabel, { color: colors.text }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Step 4: Daily habits ── */}
        {step === 4 && (
          <View>
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Tus hábitos diarios influyen directamente en la salud de tu piel.
            </Text>

            <Input
              label="Horas de exposición al sol por día"
              placeholder="Ej: 3"
              value={sunHours}
              onChangeText={setSunHours}
              keyboardType="numeric"
              leftIcon="sunny-outline"
              maxLength={2}
            />

            <Text style={[styles.habitsTitle, { color: colors.text }]}>¿Cuáles de estas aplican?</Text>

            <SwitchRow label="Usa protector solar regularmente" value={usesSunscreen} onToggle={setUsesSunscreen} icon="shield-outline" />
            <SwitchRow label="Expuesto a químicos o solventes" value={worksWithChemicals} onToggle={setWorksWithChemicals} icon="flask-outline" />
            <SwitchRow label="Trabaja al aire libre" value={worksOutdoors} onToggle={setWorksOutdoors} icon="partly-sunny-outline" />
            <SwitchRow label="Trabaja con tierra o polvo" value={worksWithSoil} onToggle={setWorksWithSoil} icon="leaf-outline" />
            <SwitchRow label="Usa jabones o detergentes fuertes" value={usesHarshSoaps} onToggle={setUsesHarshSoaps} icon="water-outline" />
            <SwitchRow label="Es fumador/a" value={smoker} onToggle={setSmoker} icon="warning-outline" />
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        {step < TOTAL_STEPS ? (
          <Button title="Siguiente" onPress={nextStep} size="lg" />
        ) : (
          <Button title="¡Listo! Ir al inicio" onPress={handleFinish} loading={loading} size="lg" />
        )}
        {step > 1 && (
          <Button
            title="Atrás"
            onPress={() => setStep((s) => s - 1)}
            variant="ghost"
            style={{ marginTop: SIZES.sm, alignSelf: 'center' }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressHeader: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: SIZES.xl,
  },
  stepLabel: { fontFamily: FONTS.medium, fontSize: SIZES.small, color: COLORS.sky, marginBottom: 10 },
  progressBar: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  progressDot: { borderRadius: SIZES.radiusFull },
  stepTitle: { fontFamily: FONTS.bold, fontSize: SIZES.title, color: COLORS.white, letterSpacing: -0.3 },
  scroll: { padding: SIZES.lg, paddingBottom: 20 },
  hint: { fontFamily: FONTS.regular, fontSize: SIZES.small, lineHeight: 20, marginBottom: SIZES.md },
  fitzRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  skinSwatch: { width: 40, height: 40, borderRadius: 20 },
  fitzType: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
  fitzDesc: { fontFamily: FONTS.regular, fontSize: SIZES.small, marginTop: 2 },
  checkGrid: { gap: 8 },
  checkOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1 },
  habitsTitle: { fontFamily: FONTS.semiBold, fontSize: SIZES.body, marginBottom: SIZES.sm, marginTop: SIZES.sm },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  switchLabel: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1 },
  footer: {
    padding: SIZES.xl,
    paddingBottom: 36,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
});
