// src/navigation/AppNavigator.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext, useAuthProvider } from '../hooks/useAuth';
import { ThemeContext, useThemeProvider } from '../hooks/useTheme';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { TermsScreen } from '../screens/auth/TermsScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Main screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { DiagnoseScreen } from '../screens/diagnosis/DiagnoseScreen';
import { DiagnosisResultScreen } from '../screens/diagnosis/DiagnosisResultScreen';
import { FindDoctorScreen } from '../screens/main/FindDoctorScreen';

import { COLORS, FONTS, SIZES } from '../constants/theme';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Auth Stack ────────────────────────────────────────────────────────────
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// ─── Bottom Tab Navigator ──────────────────────────────────────────────────
const TabNavigator = ({ colors }: { colors: any }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        paddingTop: 10,
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 12,
      },
      tabBarActiveTintColor: COLORS.teal,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: {
        fontFamily: FONTS.medium,
        fontSize: 11,
        marginTop: 2,
      },
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Inicio',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="HistoryTab"
      component={HistoryScreen}
      options={{
        tabBarLabel: 'Historial',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'time' : 'time-outline'} size={24} color={color} />
        ),
      }}
    />
    {/* Center diagnose button */}
    <Tab.Screen
      name="DiagnoseTab"
      component={DiagnoseScreen}
      options={{
        tabBarLabel: '',
        tabBarIcon: ({ focused }) => (
          <View style={styles.scanBtn}>
            <Ionicons name="scan" size={28} color="#fff" />
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Perfil',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="SettingsTab"
      component={SettingsScreen} // Reuse profile for settings
      options={{
        tabBarLabel: 'Config.',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// ─── Main App Stack (after auth) ───────────────────────────────────────────
const MainStack = ({ colors }: { colors: any }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs">
      {() => <TabNavigator colors={colors} />}
    </Stack.Screen>
    <Stack.Screen
      name="DiagnosisResult"
      component={DiagnosisResultScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen name="FindDoctor" component={FindDoctorScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);

// ─── Root Navigator ────────────────────────────────────────────────────────
const RootNavigator = () => {
  const auth = useAuthProvider();
  const theme = useThemeProvider();

  if (auth.loading) return null; // Splash handled by expo-splash-screen

  const needsTerms = auth.session && auth.user && !auth.profile?.terms_accepted;
  const needsOnboarding =
    auth.session && auth.user && auth.profile?.terms_accepted && !auth.profile?.onboarding_completed;
  const isAuthenticated =
    auth.session && auth.user && auth.profile?.terms_accepted && auth.profile?.onboarding_completed;

  return (
    <AuthContext.Provider value={auth}>
      <ThemeContext.Provider value={theme}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            {!auth.session ? (
              <Stack.Screen name="Auth" component={AuthStack} />
            ) : needsTerms ? (
              <Stack.Screen name="Terms" component={TermsScreen} />
            ) : needsOnboarding ? (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
              <Stack.Screen name="Main">
                {() => <MainStack colors={theme.colors} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  scanBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default RootNavigator;
