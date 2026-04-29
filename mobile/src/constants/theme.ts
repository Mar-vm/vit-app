// src/constants/theme.ts
export const COLORS = {
  // Paleta VitalIA
  navy: '#0a2840',
  teal: '#1a8ab2',
  ocean: '#0f759a',
  sky: '#a1cde6',
  mint: '#219fa5',
  forest: '#0a606d',

  // Neutros
  white: '#FFFFFF',
  offWhite: '#F4F9FB',
  lightGray: '#E8F4F8',
  gray: '#8BA5B5',
  darkGray: '#3D5A6A',
  black: '#0A1520',

  // Semánticos
  success: '#219fa5',
  warning: '#F59E0B',
  error: '#EF4444',
  urgent: '#DC2626',

  // Dark mode
  darkBg: '#071420',
  darkSurface: '#0D2030',
  darkCard: '#122840',
  darkBorder: '#1a3a50',
};

export const FONTS = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extraBold: 'Montserrat_800ExtraBold',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Typography
  caption: 11,
  small: 13,
  body: 15,
  subtitle: 17,
  title: 22,
  heading: 28,
  display: 36,

  // Radius
  radiusSm: 8,
  radiusMd: 16,
  radiusLg: 24,
  radiusXl: 32,
  radiusFull: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#0a2840',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#0a2840',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: '#0a2840',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const MEDICAL_HISTORY_OPTIONS = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'hipertension', label: 'Hipertensión' },
  { id: 'alergias_piel', label: 'Alergias en piel' },
  { id: 'psoriasis', label: 'Psoriasis' },
  { id: 'eczema', label: 'Eczema / Dermatitis' },
  { id: 'acne_cronico', label: 'Acné crónico' },
  { id: 'vitiligo', label: 'Vitiligo' },
  { id: 'rosácea', label: 'Rosácea' },
  { id: 'lupus', label: 'Lupus' },
  { id: 'cancer_piel', label: 'Cáncer de piel (antecedente)' },
  { id: 'inmunodeficiencia', label: 'Inmunodeficiencia' },
  { id: 'ninguno', label: 'Ninguno' },
];

export const FITZPATRICK_TYPES = [
  {
    type: 'I',
    description: 'Muy clara, siempre se quema, nunca se broncea',
    color: '#FDEBD0',
  },
  {
    type: 'II',
    description: 'Clara, usualmente se quema, bronceado mínimo',
    color: '#F5CBA7',
  },
  {
    type: 'III',
    description: 'Media, a veces se quema, bronceado uniforme',
    color: '#E59866',
  },
  {
    type: 'IV',
    description: 'Oliva, raramente se quema, siempre se broncea',
    color: '#CA8A5B',
  },
  {
    type: 'V',
    description: 'Café oscuro, muy raramente se quema',
    color: '#A0522D',
  },
  {
    type: 'VI',
    description: 'Muy oscura / negra, nunca se quema',
    color: '#5C3317',
  },
];
