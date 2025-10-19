import { ScrollView, View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function AboutScreen() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
      <Text style={styles.title}>ℹ️ About Screen</Text>
      <Link href="/">
        <Button title="Go Back Home" />
      </Link>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
