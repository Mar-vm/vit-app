// src/components/common/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: SIZES.radiusMd },
    md: { paddingVertical: 15, paddingHorizontal: 28, borderRadius: SIZES.radiusLg },
    lg: { paddingVertical: 18, paddingHorizontal: 36, borderRadius: SIZES.radiusLg },
  }[size];

  const textSizes = { sm: 13, md: 15, lg: 17 }[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.wrapper, style, (disabled || loading) && styles.disabled]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[COLORS.teal, COLORS.mint]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, { fontSize: textSizes }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.outline,
          sizeStyles,
          { borderColor: COLORS.teal },
          style,
          (disabled || loading) && styles.disabled,
        ]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.teal} size="small" />
        ) : (
          <>
            {icon}
            <Text style={[styles.outlineText, { fontSize: textSizes }, textStyle]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'danger') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.danger,
          sizeStyles,
          style,
          (disabled || loading) && styles.disabled,
        ]}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.primaryText, { fontSize: textSizes }, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, style]}
        activeOpacity={0.7}
      >
        {icon}
        <Text style={[{ color: COLORS.teal, fontFamily: FONTS.semiBold, fontSize: textSizes }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  // secondary
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.secondary,
        sizeStyles,
        { backgroundColor: colors.card },
        style,
        (disabled || loading) && styles.disabled,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.navy} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.secondaryText, { fontSize: textSizes, color: colors.text }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: { borderRadius: SIZES.radiusLg, overflow: 'hidden' },
  gradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { color: '#fff', fontFamily: FONTS.bold, letterSpacing: 0.3 },
  outline: {
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineText: { color: COLORS.teal, fontFamily: FONTS.semiBold },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: SIZES.radiusLg,
  },
  secondaryText: { fontFamily: FONTS.semiBold },
  danger: {
    backgroundColor: COLORS.urgent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabled: { opacity: 0.5 },
});
