import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, isFactory } from "../src/utils/auth";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";

export default function FactoryApproved() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [collectedCollections, setCollectedCollections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isFactory()) {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
    loadCollectedCollections();
  }, []);

  const loadCollectedCollections = async () => {
    try {
      const apiClient = createRobustApiClient();
      const response = await apiClient.get(API_ENDPOINTS.FACTORY_COLLECTED_COLLECTIONS);
      setCollectedCollections(response.data.data || []);
    } catch (error) {
      console.error('Error loading collected collections:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCollectedCollections();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collected Items</Text>
        <View style={styles.headerRight}>
          <Text style={styles.collectedCount}>{collectedCollections.length} Collected</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {collectedCollections.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Collected Items</Text>
            <Text style={styles.emptyText}>Collected items will appear here</Text>
          </View>
        ) : (
          <View style={styles.collectionsList}>
            {collectedCollections.map((collection: any) => (
              <View key={collection.id} style={styles.collectionCard}>
                <View style={styles.collectionHeader}>
                  <Text style={styles.collectionId}>#{collection.id}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>📦 Collected</Text>
                  </View>
                </View>
                <Text style={styles.collectionInfo}>Agent: {collection.agentname}</Text>
                <Text style={styles.collectionInfo}>Customer: {collection.customername}</Text>
                <Text style={styles.collectionInfo}>Amount: ₹{collection.totalamount}</Text>
                <Text style={styles.collectionDate}>{formatDate(collection.dateNtime)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  collectedCount: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  collectionsList: {
    gap: 15,
  },
  collectionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  collectionId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
  },
  collectionInfo: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  collectionDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 10,
  },
});