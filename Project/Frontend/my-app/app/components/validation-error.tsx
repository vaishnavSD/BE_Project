import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ValidationErrorProps {
  errors: string[];
  style?: any;
}

export default function ValidationError({ errors, style }: ValidationErrorProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {errors.map((error, index) => (
        <Text key={index} style={styles.errorText}>
          • {error}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 10,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 2,
  },
});