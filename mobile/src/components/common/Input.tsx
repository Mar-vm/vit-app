// src/components/common/Input.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  style,
  ...props
}) => {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? COLORS.error : focused ? COLORS.teal : colors.border;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: colors.surface,
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={focused ? COLORS.teal : colors.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: FONTS.regular,
              paddingLeft: leftIcon ? 0 : 4,
            },
            style as any,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SIZES.md },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.small,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    minHeight: 52,
  },
  leftIcon: { marginRight: 10 },
  rightIcon: { marginLeft: 10, padding: 2 },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    paddingVertical: 14,
  },
  error: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption,
    marginTop: 4,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption,
    marginTop: 4,
  },
});
