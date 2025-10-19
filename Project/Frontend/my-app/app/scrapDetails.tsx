import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, TextInput } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";
import AddDataForm from "./components/add-data-form";
import DataTable from "./components/data-table";
import AdminProtected from "./components/admin-protected";

type ScrapEntry = {
  id?: number;
  category: string;
  type: string;
  price: number | string;
};

export default function ScrapDetails() {
  const navigation = useNavigation();
  const [data, setData] = useState<ScrapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{id: number, type: string, currentPrice: number} | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const apiClient = createRobustApiClient();

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setError(null);
      console.log('Fetching scrap details from API...');
      const response = await apiClient.get(`${API_ENDPOINTS.SCRAP_DETAILS}/get`);
      console.log('Scrap details API response:', response.data);
      
      const scrapData = Array.isArray(response.data) ? response.data : [];
      console.log('Raw scrap data structure:', scrapData.slice(0, 2)); // Log first 2 items to see structure
      console.log('Data IDs and types:', scrapData.map(item => ({ id: item.id, type: item.type })));
      setData(scrapData);
      console.log('Scrap details loaded successfully:', scrapData.length);
    } catch (err: any) {
      console.error("Error fetching scrap details:", err);
      
      let errorMessage = 'Failed to fetch scrap details.';
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Scrap details endpoint not found. Please check the API configuration.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add entry via backend
  const handleAddEntry = async (category: string, type: string, price: number) => {
    try {
      console.log('Adding scrap detail:', { category, type, price });
      const response = await apiClient.post(`${API_ENDPOINTS.SCRAP_DETAILS}/add`, { 
        category, 
        type, 
        price: Number(price) 
      });
      
      console.log('Add response:', response.data);
      
      // If successful, refetch data to ensure consistency
      if (response.status === 200) {
        Alert.alert("Success", "Scrap detail added successfully!");
        await fetchData();
      }
    } catch (err: any) {
      console.error("Error adding entry:", err);
      
      let errorMessage = 'Failed to add entry. Please try again.';
      if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  // Delete entry via backend
  const handleDeleteEntry = async (id: number, type: string) => {
    console.log('Delete requested for ID:', id, 'Type:', type);
    
    // Find the item to get more details for the confirmation
    const itemToDelete = data.find(item => (item.id === id) || (item.type === type));
    const displayName = itemToDelete ? `${itemToDelete.category} - ${itemToDelete.type}` : type;
    
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${displayName}"?\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Deleting scrap detail:', type, 'ID:', id);
              
              // Show loading state (you could add a loading indicator here)
              const response = await apiClient.delete(`${API_ENDPOINTS.SCRAP_DETAILS}/delete/${encodeURIComponent(type)}`);
              console.log('Delete response:', response.data);
              
              // Success feedback
              Alert.alert(
                "Success", 
                `"${displayName}" has been deleted successfully!`
              );
              
              // Refetch data to ensure UI is updated
              await fetchData();
            } catch (err: any) {
              console.error("Error deleting entry:", err);
              
              let errorMessage = 'Failed to delete entry. Please try again.';
              
              if (err.response?.status === 404) {
                errorMessage = 'Entry not found. It may have already been deleted.';
              } else if (err.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
              } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
              } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
              }
              
              Alert.alert("Delete Failed", errorMessage);
            }
          },
        },
      ]
    );
  };

  // Open edit modal
  const handleEditPrice = (id: number, type: string, currentPrice: number) => {
    setEditingItem({ id, type, currentPrice });
    setEditPrice(currentPrice.toString());
    setShowEditModal(true);
  };

  // Save edited price
  const handleSaveEditedPrice = async () => {
    if (!editingItem) return;

    const trimmedValue = editPrice.trim();
    if (!trimmedValue) {
      Alert.alert("Invalid Input", "Please enter a price value");
      return;
    }

    const newPrice = parseFloat(trimmedValue);
    if (isNaN(newPrice) || newPrice < 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number");
      return;
    }

    if (newPrice > 10000) {
      Alert.alert("Invalid Input", "Price cannot exceed ₹10,000 per kg");
      return;
    }

    const roundedPrice = Math.round(newPrice * 100) / 100;
    
    try {
      console.log('Updating price for:', editingItem.type, 'ID:', editingItem.id, 'New price:', roundedPrice);
      
      const response = await apiClient.put(`${API_ENDPOINTS.SCRAP_DETAILS}/update/${encodeURIComponent(editingItem.type)}`, { 
        price: Number(roundedPrice.toFixed(2))
      });
      
      console.log('Update response:', response.data);
      
      const updatedPrice = response.data.updatedPrice || roundedPrice;
      Alert.alert(
        "Success", 
        `Price updated successfully!\n${editingItem.type}: ₹${updatedPrice.toFixed(2)}`
      );
      
      // Close modal and refresh data
      setShowEditModal(false);
      setEditingItem(null);
      setEditPrice("");
      await fetchData();
    } catch (err: any) {
      console.error("Error updating price:", err);
      
      let errorMessage = 'Failed to update price. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'Invalid price value';
      } else if (err.response?.status === 404) {
        errorMessage = 'Scrap type not found. Please refresh and try again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditPrice("");
  };



  return (
    <AdminProtected>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              try {
                navigation.navigate('AdminDashboard' as never);
              } catch (error) {
                navigation.navigate('AdminDashboard' as never);
              }
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Scrap Details Management</Text>
        <Text style={styles.subtitle}>
          Manage scrap categories, types, and pricing information
        </Text>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <AddDataForm onAdd={handleAddEntry} />

          <Text style={styles.subtitle}>Current Data ({data.length} entries)</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading scrap details...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No scrap details found</Text>
              <Text style={styles.emptySubtext}>Add your first scrap category above</Text>
            </View>
          ) : (
            <DataTable
              data={data}
              onDelete={(id: number, type: string) => handleDeleteEntry(id, type)}
              onEdit={(id: number, type: string, currentPrice: number) => handleEditPrice(id, type, currentPrice)}
            />
          )}
        </ScrollView>

        {/* Edit Price Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCancelEdit}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Price</Text>
              
              {editingItem && (
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCategory}>{editingItem.type}</Text>
                  <Text style={styles.currentPrice}>Current: ₹{editingItem.currentPrice.toFixed(2)}</Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Price (₹)</Text>
                <TextInput
                  style={styles.priceInput}
                  value={editPrice}
                  onChangeText={setEditPrice}
                  keyboardType="numeric"
                  placeholder="0.00"
                  autoFocus
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleSaveEditedPrice}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </AdminProtected>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 14,
    color: '#6c757d',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  priceInput: {
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});