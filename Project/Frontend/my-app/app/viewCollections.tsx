import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";
import AdminProtected from "./components/admin-protected";

interface ScrapItem {
  category: string;
  type: string;
  weight: number | null;
  price: number | null;
  subtotal: number | null;
}

interface Collection {
  id: string;
  agentname: string;
  agent_MobileNo: string;
  customername: string;
  customer_MobileNo: string;
  customerEmail: string;
  address: string;
  totalamount: number | null;
  paymentstatus: string;
  dateNtime: string;
  scrapItems: ScrapItem[];
}

export default function ViewCollections() {
  const navigation = useNavigation();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = createRobustApiClient();

  const fetchCollections = async () => {
    try {
      setError(null);
      console.log('Fetching collections from API...');
      const response = await apiClient.get(`${API_ENDPOINTS.COLLECTION}/get`);
      console.log('API Response:', response.data);
      
      const collectionsData = response.data.data || [];
      
      // Ensure scrapItems is always an array
      const sanitizedCollections = collectionsData.map((collection: any) => ({
        ...collection,
        scrapItems: collection.scrapItems || [],
        totalamount: collection.totalamount || 0
      }));
      
      setCollections(sanitizedCollections);
      console.log('Collections loaded successfully:', sanitizedCollections.length);
    } catch (error: any) {
      console.error('Error fetching collections:', error);
      
      let errorMessage = 'Failed to load collections.';
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Collections endpoint not found. Please check the API configuration.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCollections();
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'unpaid': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${Number(amount).toFixed(2)}`;
  };

  const getTotalWeight = (scrapItems: ScrapItem[]) => {
    if (!scrapItems || scrapItems.length === 0) {
      return 0;
    }
    return scrapItems.reduce((total, item) => {
      const weight = item?.weight || 0;
      return total + Number(weight);
    }, 0);
  };

  return (
    <AdminProtected>
      <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => {
            try {
              navigation.navigate('AdminDashboard' as never);
            } catch (error) {
              navigation.navigate('AdminDashboard' as never);
            }
          }}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading collections...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.errorActions}>
              <TouchableOpacity style={styles.retryButton} onPress={fetchCollections}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
              {error.includes('backend') && (
                <TouchableOpacity 
                  style={[styles.retryButton, styles.helpButton]} 
                  onPress={() => {
                    console.log('Backend connection help:');
                    console.log('1. Open terminal in Project/Backend');
                    console.log('2. Run: node index.js');
                    console.log('3. Ensure server starts on port 5000');
                  }}
                >
                  <Text style={styles.retryButtonText}>Help</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No collections found</Text>
            <Text style={styles.emptySubtext}>Collections will appear here when agents complete pickups</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{collections.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatCurrency(collections.reduce((sum, col) => {
                    const amount = col.totalamount || 0;
                    return sum + Number(amount);
                  }, 0))}
                </Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {collections.filter(c => c.paymentstatus.toLowerCase() === 'paid').length}
                </Text>
                <Text style={styles.statLabel}>Paid</Text>
              </View>
            </View>

            {collections.map((collection) => (
              <View key={collection.id} style={styles.collectionCard}>
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionInfo}>
                    <Text style={styles.collectionId}>{collection.id}</Text>
                    <Text style={styles.collectionDate}>{formatDateTime(collection.dateNtime)}</Text>
                  </View>
                  <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(collection.paymentstatus) }]}>
                    <Text style={styles.paymentText}>{collection.paymentstatus}</Text>
                  </View>
                </View>

                <View style={styles.collectionDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>👤 Customer Details</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>{collection.customername}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mobile:</Text>
                      <Text style={styles.detailValue}>{collection.customer_MobileNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>{collection.customerEmail}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Address:</Text>
                      <Text style={styles.detailValue}>{collection.address}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>🚚 Agent Details</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>{collection.agentname}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mobile:</Text>
                      <Text style={styles.detailValue}>{collection.agent_MobileNo}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>📦 Scrap Items ({collection.scrapItems?.length || 0})</Text>
                    {collection.scrapItems && collection.scrapItems.length > 0 ? (
                      collection.scrapItems.map((item, index) => (
                        <View key={index} style={styles.scrapItem}>
                          <View style={styles.scrapItemHeader}>
                            <Text style={styles.scrapItemName}>{item.category || 'Unknown'} - {item.type || 'Unknown'}</Text>
                            <Text style={styles.scrapItemPrice}>{formatCurrency(item.subtotal)}</Text>
                          </View>
                          <Text style={styles.scrapItemDetails}>
                            {item.weight || 0}kg × {formatCurrency(item.price)}/kg
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyItemsText}>No scrap items recorded</Text>
                    )}
                    <View style={styles.totalSection}>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Weight:</Text>
                        <Text style={styles.totalValue}>{getTotalWeight(collection.scrapItems)}kg</Text>
                      </View>
                      <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount:</Text>
                        <Text style={styles.totalAmount}>{formatCurrency(collection.totalamount)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
    </AdminProtected>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  backButtonContainer: {
    padding: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  backButton: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    textAlign: 'center',
    marginLeft: -60,
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 18,
  },
  content: {
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  collectionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  collectionDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  collectionDetails: {
    gap: 20,
  },
  detailSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    paddingBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '600',
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    color: '#2c3e50',
    flex: 1,
  },
  scrapItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scrapItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scrapItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  scrapItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  scrapItemDetails: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  totalSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  emptyItemsText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  helpButton: {
    backgroundColor: '#f39c12',
  },
});