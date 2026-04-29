// src/screens/diagnosis/DiagnoseScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { apiService, diagnosisService } from '../../services/api';
import { Button } from '../../components/common/Button';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const BODY_LOCATIONS = [
  'Cara', 'Cuello', 'Hombros', 'Pecho / Torso',
  'Espalda', 'Brazos', 'Manos', 'Piernas', 'Pies', 'Otro',
];

export const DiagnoseScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        setCapturedImage(photo.uri);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo tomar la foto. Inténtalo de nuevo.');
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setSelectedLocation('');
  };

  const startAnalysis = () => {
    if (!selectedLocation) {
      setShowLocationModal(true);
      return;
    }
    sendForAnalysis();
  };

  const sendForAnalysis = async () => {
    if (!capturedImage || !user || !profile) return;
    setAnalyzing(true);
    try {
      // Enviar imagen directamente al modelo en Render
      const result = await apiService.diagnose({
        imageUri: capturedImage,
        bodyLocation: selectedLocation,
        profile: {
          age: profile.age,
          fitzpatrick_type: profile.fitzpatrick_type,
          medical_history: profile.medical_history,
          sun_exposure_hours: profile.sun_exposure_hours,
          uses_sunscreen: profile.uses_sunscreen,
          works_with_chemicals: profile.works_with_chemicals,
          works_outdoors: profile.works_outdoors,
          works_with_soil: profile.works_with_soil,
          uses_harsh_soaps: profile.uses_harsh_soaps,
          smoker: profile.smoker,
        },
      });

      // Guardar en Supabase para el historial
      try {
        await diagnosisService.saveDiagnosis(user.id, result, selectedLocation);
      } catch (dbErr) {
        console.log('No se pudo guardar en historial:', dbErr);
        // No bloquear el flujo si falla el guardado
      }

      setAnalyzing(false);
      navigation.navigate('DiagnosisResult', {
        diagnosis: {
          ...result,
          image_url: capturedImage,
          body_location: selectedLocation,
        },
        isNew: true,
      });
    } catch (err: any) {
      setAnalyzing(false);
      console.log('=== ERROR DIAGNÓSTICO ===');
      console.log('Message:', err?.message);
      console.log('Status:', err?.response?.status);
      console.log('Data:', JSON.stringify(err?.response?.data));
      console.log('Config URL:', err?.config?.url);
      Alert.alert(
        'Error en el análisis',
        'No se pudo conectar con el servidor de IA. Verifica tu conexión e inténtalo de nuevo.\n\nSi el problema persiste, el servidor puede estar iniciando (tarda ~1 min).',
        [{ text: 'OK' }]
      );
    }
  };
  if (!permission) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  if (!permission.granted) {
    return (
      <View style={[styles.permContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="camera-outline" size={80} color={COLORS.teal} />
        <Text style={[styles.permTitle, { color: colors.text }]}>
          Necesitamos tu cámara
        </Text>
        <Text style={[styles.permSub, { color: colors.textSecondary }]}>
          Para analizar tu piel necesitamos acceso a la cámara. Tu privacidad está protegida.
        </Text>
        <Button title="Permitir acceso" onPress={requestPermission} style={{ marginTop: SIZES.xl }} />
        <Button
          title="Seleccionar desde galería"
          onPress={pickFromGallery}
          variant="outline"
          style={{ marginTop: SIZES.sm }}
        />
      </View>
    );
  }

  // ── Analyzing overlay ──────────────────────────────────────────────
  if (analyzing) {
    return (
      <View style={[styles.analyzingContainer, { backgroundColor: COLORS.navy }]}>
        <LinearGradient colors={[COLORS.navy, COLORS.ocean]} style={StyleSheet.absoluteFill} />
        <View style={styles.analyzingContent}>
          <View style={styles.analyzingRing}>
            <ActivityIndicator size="large" color={COLORS.mint} />
          </View>
          <Text style={styles.analyzingTitle}>Analizando tu piel</Text>
          <Text style={styles.analyzingText}>
            Nuestra IA está procesando la imagen.{'\n'}Esto puede tomar unos segundos...
          </Text>
          <View style={styles.analyzingSteps}>
            {['Procesando imagen', 'Detectando características', 'Generando diagnóstico'].map((s, i) => (
              <View key={i} style={styles.analyzeStep}>
                <Ionicons name="ellipse" size={8} color={COLORS.mint} />
                <Text style={styles.analyzeStepText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ── Preview captured image ─────────────────────────────────────────
  if (capturedImage) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={retake} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.previewTitle, { color: colors.text }]}>Vista previa</Text>
          <View style={{ width: 40 }} />
        </View>

        <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="cover" />

        <View style={[styles.previewFooter, { backgroundColor: colors.surface }]}>
          {selectedLocation ? (
            <TouchableOpacity
              style={[styles.locationChip, { borderColor: COLORS.teal, backgroundColor: `${COLORS.teal}10` }]}
              onPress={() => setShowLocationModal(true)}
            >
              <Ionicons name="body-outline" size={16} color={COLORS.teal} />
              <Text style={[styles.locationChipText, { color: COLORS.teal }]}>{selectedLocation}</Text>
              <Ionicons name="pencil-outline" size={14} color={COLORS.teal} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.locationSelect, { borderColor: colors.border, backgroundColor: colors.card }]}
              onPress={() => setShowLocationModal(true)}
            >
              <Ionicons name="body-outline" size={20} color={COLORS.teal} />
              <Text style={[styles.locationSelectText, { color: colors.textSecondary }]}>
                ¿En qué parte del cuerpo está?
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: SIZES.md }}>
            <Button title="Retomar" onPress={retake} variant="outline" style={{ flex: 1 }} />
            <Button
              title="Analizar"
              onPress={startAnalysis}
              style={{ flex: 2 }}
              icon={<Ionicons name="scan-outline" size={18} color="#fff" />}
            />
          </View>
        </View>

        {/* Location modal */}
        <Modal visible={showLocationModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Zona afectada</Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                Selecciona dónde se encuentra la lesión
              </Text>
              <View style={styles.locationGrid}>
                {BODY_LOCATIONS.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    style={[
                      styles.locOption,
                      {
                        borderColor: selectedLocation === loc ? COLORS.teal : colors.border,
                        backgroundColor: selectedLocation === loc ? `${COLORS.teal}12` : colors.card,
                      },
                    ]}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocationModal(false);
                    }}
                  >
                    <Text style={[styles.locText, { color: colors.text }]}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Button
                title="Cancelar"
                variant="ghost"
                onPress={() => setShowLocationModal(false)}
                style={{ marginTop: SIZES.md, alignSelf: 'center' }}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── Camera view ────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
        {/* Overlay */}
        <View style={styles.cameraOverlay}>
          {/* Top bar */}
          <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.cameraTop}>
            <Text style={styles.cameraTitle}>Captura la zona afectada</Text>
            <Text style={styles.cameraSub}>
              Asegúrate de tener buena iluminación y que la lesión sea visible
            </Text>
          </LinearGradient>

          {/* Focus frame */}
          <View style={styles.focusFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          {/* Controls */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.cameraBottom}>
            <TouchableOpacity onPress={pickFromGallery} style={styles.camBtn}>
              <Ionicons name="images-outline" size={28} color="#fff" />
              <Text style={styles.camBtnLabel}>Galería</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={takePicture} style={styles.shutterBtn} activeOpacity={0.8}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
              style={styles.camBtn}
            >
              <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
              <Text style={styles.camBtnLabel}>Voltear</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  permContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
  },
  permTitle: { fontFamily: FONTS.bold, fontSize: SIZES.title, marginTop: SIZES.lg, textAlign: 'center' },
  permSub: { fontFamily: FONTS.regular, fontSize: SIZES.body, textAlign: 'center', marginTop: SIZES.sm, lineHeight: 24 },
  analyzingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  analyzingContent: { alignItems: 'center', padding: SIZES.xl },
  analyzingRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: `${COLORS.mint}40`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xl,
  },
  analyzingTitle: { fontFamily: FONTS.bold, fontSize: SIZES.title, color: '#fff', marginBottom: SIZES.sm },
  analyzingText: { fontFamily: FONTS.regular, fontSize: SIZES.body, color: COLORS.sky, textAlign: 'center', lineHeight: 24 },
  analyzingSteps: { marginTop: SIZES.xl, gap: 12 },
  analyzeStep: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analyzeStepText: { fontFamily: FONTS.medium, fontSize: SIZES.small, color: 'rgba(255,255,255,0.7)' },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: SIZES.md,
    paddingHorizontal: SIZES.lg,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  previewTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle },
  previewImage: { flex: 1, width: '100%' },
  previewFooter: {
    padding: SIZES.lg,
    paddingBottom: 36,
  },
  locationChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: SIZES.radiusFull,
    borderWidth: 1.5, alignSelf: 'flex-start',
  },
  locationChipText: { fontFamily: FONTS.semiBold, fontSize: SIZES.small },
  locationSelect: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: SIZES.md, borderRadius: SIZES.radiusMd, borderWidth: 1.5,
  },
  locationSelectText: { fontFamily: FONTS.regular, fontSize: SIZES.body, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.xl, paddingBottom: 40 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: SIZES.title },
  modalSub: { fontFamily: FONTS.regular, fontSize: SIZES.body, marginTop: 4, marginBottom: SIZES.lg },
  locationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  locOption: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: SIZES.radiusFull, borderWidth: 1.5,
  },
  locText: { fontFamily: FONTS.medium, fontSize: SIZES.small },
  cameraOverlay: { flex: 1 },
  cameraTop: { paddingTop: 56, paddingBottom: 40, paddingHorizontal: SIZES.xl },
  cameraTitle: { fontFamily: FONTS.bold, fontSize: SIZES.subtitle, color: '#fff' },
  cameraSub: { fontFamily: FONTS.regular, fontSize: SIZES.small, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  focusFrame: {
    position: 'absolute',
    width: 240, height: 240,
    alignSelf: 'center',
    top: '50%',
    marginTop: -120,
  },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: COLORS.mint, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },
  cameraBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: 40, paddingBottom: 56,
  },
  camBtn: { alignItems: 'center', gap: 4 },
  camBtnLabel: { fontFamily: FONTS.regular, fontSize: SIZES.caption, color: 'rgba(255,255,255,0.7)' },
  shutterBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
});