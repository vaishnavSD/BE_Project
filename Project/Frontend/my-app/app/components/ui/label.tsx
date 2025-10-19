import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface LabelProps {
  children: React.ReactNode;
  style?: TextStyle;
  disabled?: boolean;
}

const Label: React.FC<LabelProps> = ({ children, style, disabled = false }) => {
  return (
    <Text style={[styles.label, disabled && styles.disabled, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Label;
