import React, { useState, useEffect } from "react";
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  TextInput,
  Alert,
  RefreshControl
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, isFactory } from "../src/utils/auth";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";

interface ScrapItem {
  category: string;
  type: string;
  weight: number;
  price: number;
  subtotal: number;
}

interface Collection {
  id: string;
  agentname: string;
  agent_MobileNo: string;
  customername: string;
  customer_MobileNo: string;
  customerEmail: string;
  address: string;
  totalamount: number;
  paymentstatus: string;
  dateNtime: string;
  approval_status: string;
  scrapItems: ScrapItem[];
}

export default function FactoryReview() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionNotes, setCollectionNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isFactory()) {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
    loadPendingCollections();
  }, []);

  const loadPendingCollections = async () => {
    try {
      const apiClient = createRobustApiClient();
      const response = await apiClient.get(API_ENDPOINTS.FACTORY_PENDING_COLLECTIONS);
      setCollections(response.data.data || []);
    } catch (error) {
      console.error('Error loading pending collections:', error);
      Alert.alert('Error', 'Failed to load pending collections');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPendingCollections();
    setRefreshing(false);
  };

  const openCollectionModal = (collection: Collection) => {
    setSelectedCollection(collection);
    setCollectionNotes('');
    setShowCollectionModal(true);
  };

  const handleCollectionSubmit = async () => {
    if (!selectedCollection || !user) return;

    setLoading(true);
    try {
      const apiClient = createRobustApiClient();
      const endpoint = `${API_ENDPOINTS.FACTORY_APPROVE_COLLECTION}/${selectedCollection.id}/collect`;
      const payload = {
        factoryEmployeeId: user.id,
        notes: collectionNotes || 'Collected by factory'
      };

      await apiClient.post(endpoint, payload);
      
      Alert.alert(
        'Success', 
        'Collection marked as collected successfully',
        [{ text: 'OK', onPress: () => {
          setShowCollectionModal(false);
          loadPendingCollections();
        }}]
      );
    } catch (error: any) {
      console.error('Error marking collection as collected:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark collection as collected');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Mark Collections</Text>
        <View style={styles.headerRight}>
          <Text style={styles.pendingCount}>{collections.length} Pending</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {collections.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All Collections Processed!</Text>
            <Text style={styles.emptyText}>No collections pending pickup</Text>
          </View>
        ) : (
          <View style={styles.collectionsList}>
            {collections.map((collection) => (
              <View key={collection.id} style={styles.collectionCard}>
                <View style={styles.collectionHeader}>
                  <Text style={styles.collectionId}>#{collection.id}</Text>
                  <Text style={styles.collectionDate}>{formatDate(collection.dateNtime)}</Text>
                </View>

                <View style={styles.collectionInfo}>
                  <Text style={styles.infoLabel}>Agent: <Text style={styles.infoValue}>{collection.agentname}</Text></Text>
                  <Text style={styles.infoLabel}>Customer: <Text style={styles.infoValue}>{collection.customername}</Text></Text>
                  <Text style={styles.infoLabel}>Phone: <Text style={styles.infoValue}>{collection.customer_MobileNo}</Text></Text>
                  <Text style={styles.infoLabel}>Address: <Text style={styles.infoValue}>{collection.address}</Text></Text>
                </View>

                <View style={styles.scrapItems}>
                  <Text style={styles.scrapItemsTitle}>Scrap Items:</Text>
                  {collection.scrapItems.map((item, index) => (
                    <View key={index} style={styles.scrapItem}>
                      <Text style={styles.scrapItemText}>
                        {item.category} - {item.type}: {item.weight}kg @ ₹{item.price}/kg = ₹{item.subtotal}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.totalAmount}>
                  <Text style={styles.totalAmountText}>Total: ₹{collection.totalamount}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.collectButton]}
                    onPress={() => openCollectionModal(collection)}
                  >
                    <Text style={styles.collectButtonText}>📦 Mark as Collected</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Collection Modal */}
      <Modal
        visible={showCollectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                📦 Mark as Collected
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCollectionModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Collection ID: #{selectedCollection?.id}
              </Text>
              <Text style={styles.modalText}>
                Total Amount: ₹{selectedCollection?.totalamount}
              </Text>

              <Text style={styles.notesLabel}>
                Collection Notes (Optional):
              </Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any notes about the collection..."
                value={collectionNotes}
                onChangeText={setCollectionNotes}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  styles.collectSubmitButton,
                  loading && styles.submitButtonDisabled
                ]}
                onPress={handleCollectionSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Processing...' : 'Mark as Collected'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: '#e67e22',
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
  pendingCount: {
    fontSize: 14,
    color: '#f39c12',
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
  collectionDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  collectionInfo: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  infoValue: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  scrapItems: {
    marginBottom: 15,
  },
  scrapItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  scrapItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  scrapItemText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  totalAmount: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  totalAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  actionButtons: {
    marginTop: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  collectButton: {
    backgroundColor: '#3498db',
  },
  collectButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#7f8c8d',
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 10,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 15,
    marginBottom: 10,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 20,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  collectSubmitButton: {
    backgroundColor: '#3498db',
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});