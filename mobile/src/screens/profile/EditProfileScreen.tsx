// src/screens/profile/EditProfileScreen.tsx
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { profileService } from '../../services/api';
import {
  COLORS,
  FONTS,
  SIZES,
  FITZPATRICK_TYPES,
  MEDICAL_HISTORY_OPTIONS,
} from '../../constants/theme';

export const EditProfileScreen = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const [alias, setAlias] = useState(profile?.alias || '');
  const [age, setAge] = useState(String(profile?.age || ''));
  const [fitzpatrick, setFitzpatrick] = useState(profile?.fitzpatrick_type || '');
  const [medicalHistory, setMedicalHistory] = useState<string[]>(profile?.medical_history || []);
  const [sunHours, setSunHours] = useState(String(profile?.sun_exposure_hours ?? 2));
  const [usesSunscreen, setUsesSunscreen] = useState(profile?.uses_sunscreen || false);
  const [worksWithChemicals, setWorksWithChemicals] = useState(profile?.works_with_chemicals || false);
  const [worksOutdoors, setWorksOutdoors] = useState(profile?.works_outdoors || false);
  const [worksWithSoil, setWorksWithSoil] = useState(profile?.works_with_soil || false);
  const [usesHarshSoaps, setUsesHarshSoaps] = useState(profile?.uses_harsh_soaps || false);
  const [smoker, setSmoker] = useState(profile?.smoker || false);
  const [loading, setLoading] = useState(false);

  const toggleMedical = (id: string) => {
    if (id === 'ninguno') { setMedicalHistory(['ninguno']); return; }
    setMedicalHistory(prev => {
      const without = prev.filter(x => x !== 'ninguno');
      return without.includes(id) ? without.filter(x => x !== id) : [...without, id];
    });
  };

  const handleSave = async () => {
    if (!alias.trim()) { Alert.alert('Requerido', 'El alias no puede estar vacío'); return; }
    setLoading(true);
    const { error } = await profileService.upsert(user!.id, {
      alias: alias.trim(),
      age: parseInt(age) || null,
      fitzpatrick_type: fitzpatrick || null,
      medical_history: medicalHistory,
      sun_exposure_hours: parseInt(sunHours) || 2,
      uses_sunscreen: usesSunscreen,
      works_with_chemicals: worksWithChemicals,
      works_outdoors: worksOutdoors,
      works_with_soil: worksWithSoil,
      uses_harsh_soaps: usesHarshSoaps,
      smoker,
    });
    setLoading(false);
    if (error) { Alert.alert('Error', 'No se pudo guardar. Inténtalo de nuevo.'); return; }
    await refreshProfile();
    Alert.alert('¡Listo!', 'Tu perfil ha sido actualizado', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  const SwitchRow = ({ label, value, onToggle, icon }: any) => (
    <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={COLORS.teal} />
      <Text style={[styles.switchLabel, { color: colors.text }]}>{label}</Text>
      <Switch value={value} onValueChange={onToggle}
        trackColor={{ false: colors.border, true: `${COLORS.mint}60` }}
        thumbColor={value ? COLORS.mint : colors.gray} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Editar perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Datos básicos</Text>
        <Input label="Alias" value={alias} onChangeText={setAlias} leftIcon="person-outline" maxLength={30} />
        <Input label="Edad" value={age} onChangeText={setAge} keyboardType="numeric" leftIcon="calendar-outline" maxLength={3} />

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tipo de piel (Fitzpatrick)</Text>
        {FITZPATRICK_TYPES.map(f => (
          <TouchableOpacity key={f.type}
            style={[styles.fitzRow, { borderColor: fitzpatrick === f.type ? COLORS.teal : colors.border, backgroundColor: fitzpatrick === f.type ? `${COLORS.teal}10` : colors.surface }]}
            onPress={() => setFitzpatrick(f.type)} activeOpacity={0.8}>
            <View style={[styles.swatch, { backgroundColor: f.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fitzType, { color: colors.text }]}>Tipo {f.type}</Text>
              <Text style={[styles.fitzDesc, { color: colors.textSecondary }]}>{f.description}</Text>
            </View>
            {fitzpatrick === f.type && <Ionicons name="checkmark-circle" size={22} color={COLORS.teal} />}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Historial médico</Text>
        <View style={{ gap: 8 }}>
          {MEDICAL_HISTORY_OPTIONS.map(opt => {
            const selected = medicalHistory.includes(opt.id);
            return (
              <TouchableOpacity key={opt.id}
                style={[styles.checkOpt, { borderColor: selected ? COLORS.teal : colors.border, backgroundColor: selected ? `${COLORS.teal}10` : colors.surface }]}
                onPress={() => toggleMedical(opt.id)}>
                <View style={[styles.checkBox, { borderColor: selected ? COLORS.mint : colors.border, backgroundColor: selected ? COLORS.mint : 'transparent' }]}>
                  {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <Text style={[styles.checkLabel, { color: colors.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Hábitos diarios</Text>
        <Input label="Horas de exposición solar por día" value={sunHours} onChangeText={setSunHours} keyboardType="numeric" leftIcon="sunny-outline" maxLength={2} />
        <SwitchRow label="Usa protector solar" value={usesSunscreen} onToggle={setUsesSunscreen} icon="shield-outline" />
        <SwitchRow label="Expuesto a químicos" value={worksWithChemicals} onToggle={setWorksWithChemicals} icon="flask-outline" />
        <SwitchRow label="Trabaja al aire libre" value={worksOutdoors} onToggle={setWorksOutdoors} icon="partly-sunny-outline" />
        <SwitchRow label="Trabaja con tierra/polvo" value={worksWithSoil} onToggle={setWorksWithSoil} icon="leaf-outline" />
        <SwitchRow label="Usa jabones/detergentes fuertes" value={usesHarshSoaps} onToggle={setUsesHarshSoaps} icon="water-outline" />
        <SwitchRow label="Fumador/a" value={smoker} onToggle={setSmoker} icon="warning-outline" />

        <Button title="Guardar cambios" onPress={handleSave} loading={loading} size="lg" style={{ marginTop: SIZES.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: SIZES.lg,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle },
  scroll: { padding: SIZES.lg, paddingBottom: 60 },
  sectionLabel: { fontFamily: FONTS.semiBold, fontSize: SIZES.small, marginBottom: SIZES.sm, marginTop: SIZES.lg, textTransform: 'uppercase', letterSpacing: 0.5 },
  fitzRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: SIZES.md, borderRadius: SIZES.radiusMd, borderWidth: 1.5, marginBottom: 8 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  fitzType: { fontFamily: FONTS.semiBold, fontSize: SIZES.body },
  fitzDesc: { fontFamily: FONTS.regular, fontSize: SIZES.small, marginTop: 2 },
  checkOpt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: SIZES.radiusMd, borderWidth: 1.5 },
  checkBox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkLabel: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  switchLabel: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1 },
});
