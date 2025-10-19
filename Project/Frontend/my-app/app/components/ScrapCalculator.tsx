import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ScrapCalculator() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧮 Scrap Calculator</Text>
      <Text style={styles.subtitle}>Feature under development</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    margin: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});