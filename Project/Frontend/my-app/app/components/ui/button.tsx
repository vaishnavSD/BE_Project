import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'default' && styles.button_default,
        variant === 'destructive' && styles.button_destructive,
        variant === 'outline' && styles.button_outline,
        variant === 'secondary' && styles.button_secondary,
        variant === 'ghost' && styles.button_ghost,
        size === 'sm' && styles.button_sm,
        size === 'lg' && styles.button_lg,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text,
        variant === 'default' && styles.text_default,
        variant === 'destructive' && styles.text_destructive,
        variant === 'outline' && styles.text_outline,
        variant === 'secondary' && styles.text_secondary,
        variant === 'ghost' && styles.text_ghost,
        size === 'sm' && styles.text_sm,
        size === 'lg' && styles.text_lg,
        disabled && styles.textDisabled,
      ]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  button_default: {
    backgroundColor: '#1e9d47',
  },
  button_destructive: {
    backgroundColor: '#dc2626',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  button_secondary: {
    backgroundColor: '#f3f4f6',
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  button_lg: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  text_default: {
    color: 'white',
  },
  text_destructive: {
    color: 'white',
  },
  text_outline: {
    color: '#374151',
  },
  text_secondary: {
    color: '#374151',
  },
  text_ghost: {
    color: '#374151',
  },
  text_sm: {
    fontSize: 12,
  },
  text_lg: {
    fontSize: 16,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

export default Button;
