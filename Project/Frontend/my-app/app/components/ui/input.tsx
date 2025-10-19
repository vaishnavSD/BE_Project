import React from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  style?: ViewStyle;
  error?: boolean;
}

const Input: React.FC<InputProps> = ({ style, error = false, ...props }) => {
  return (
    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
        style
      ]}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#374151',
    minHeight: 44,
  },
  inputError: {
    borderColor: '#EF4444',
  },
});

export default Input;
