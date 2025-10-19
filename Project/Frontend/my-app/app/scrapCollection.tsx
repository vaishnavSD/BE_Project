import { useState, useEffect } from "react";
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Modal 
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUserAsync } from "../src/utils/auth";
import { createRobustApiClient } from "./config/api";

interface User {
  id: number;
  name: string;
  email: string;
  mobile_No: string;
  address: string;
  role: 'admin' | 'agent';
}

interface ScrapItem {
  id: string;
  category: string;
  type: string;
  weight: string;
  rate: string;
  total: number;
}

interface ScrapData {
  category: string;
  type: string;
  price: number;
}

export default function ScrapCollection() {
  const [user, setUser] = useState<User | null>(null);
  const [scrapData, setScrapData] = useState<ScrapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [address, setAddress] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([
    { id: '1', category: '', type: '', weight: '', rate: '', total: 0 }
  ]);

  // Modal states for dropdowns
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showScrapCategoryModal, setShowScrapCategoryModal] = useState(false);
  const [showScrapTypeModal, setShowScrapTypeModal] = useState(false);
  const [activeScrapItemId, setActiveScrapItemId] = useState<string>('');

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    try {
      // Get current user
      const currentUser = await getCurrentUserAsync();
      console.log("Current user loaded:", currentUser);
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.warn("No user found, redirecting to login");
        Alert.alert("Error", "Please login first", [
          { text: "OK", onPress: () => navigation.navigate('Login' as never) }
        ]);
        return;
      }

      // Fetch scrap data for dropdowns
      await fetchScrapData();

      // Set current date and time
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDateTime(localDateTime);

    } catch (error) {
      console.error("Error initializing form:", error);
      Alert.alert("Error", "Failed to initialize form");
    } finally {
      setLoading(false);
    }
  };

  const fetchScrapData = async () => {
    try {
      const robustClient = createRobustApiClient();
      const response = await robustClient.get('/scrapDetails/get');
      console.log("Scrap data loaded:", response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        setScrapData(response.data);
      } else {
        console.warn("No scrap data available");
        Alert.alert("Warning", "No scrap types available. Please contact admin to add scrap data.");
      }
    } catch (error) {
      console.error("Error fetching scrap data:", error);
      Alert.alert("Error", "Failed to fetch scrap data. Some features may not work properly.");
    }
  };

  const addScrapItem = () => {
    const newItem: ScrapItem = {
      id: Date.now().toString(),
      category: '',
      type: '',
      weight: '',
      rate: '',
      total: 0
    };
    setScrapItems([...scrapItems, newItem]);
  };

  const removeScrapItem = (id: string) => {
    if (scrapItems.length > 1) {
      setScrapItems(scrapItems.filter(item => item.id !== id));
    }
  };

  const updateScrapItem = (id: string, field: keyof ScrapItem, value: string) => {
    setScrapItems(scrapItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Clear type and rate when category changes
        if (field === 'category' && value !== item.category) {
          updatedItem.type = '';
          updatedItem.rate = '';
          updatedItem.total = 0;
        }
        
        // Auto-calculate rate and total when type is selected
        if (field === 'type' && value) {
          const selectedScrap = scrapData.find(scrap => scrap.type === value && scrap.category === updatedItem.category);
          if (selectedScrap) {
            updatedItem.rate = selectedScrap.price.toString();
            // Recalculate total if weight exists
            if (updatedItem.weight) {
              const weight = parseFloat(updatedItem.weight) || 0;
              const rate = selectedScrap.price || 0;
              updatedItem.total = weight * rate;
            }
          }
        }
        
        // Calculate total when weight or rate changes
        if (field === 'weight' || field === 'rate') {
          const weight = parseFloat(field === 'weight' ? value : updatedItem.weight) || 0;
          const rate = parseFloat(field === 'rate' ? value : updatedItem.rate) || 0;
          updatedItem.total = weight * rate;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateGrandTotal = () => {
    return scrapItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getUniqueCategories = () => {
    const categories = scrapData.map(item => item.category);
    return [...new Set(categories)].filter(category => category && category.trim() !== '');
  };

  const getTypesByCategory = (category: string) => {
    return scrapData.filter(item => item.category === category);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string) => {
    const mobileRegex = /^[6-9]\d{9}$/; // Indian mobile number format
    return mobileRegex.test(mobile);
  };

  const validateForm = () => {
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return false;
    }
    if (!customerName.trim()) {
      Alert.alert("Error", "Customer name is required");
      return false;
    }
    if (!customerEmail.trim()) {
      Alert.alert("Error", "Customer email is required");
      return false;
    }
    if (!validateEmail(customerEmail.trim())) {
      Alert.alert("Error", "Please enter a valid email address (e.g., user@example.com)");
      return false;
    }
    if (!customerMobile.trim()) {
      Alert.alert("Error", "Customer mobile number is required");
      return false;
    }
    if (!validateMobile(customerMobile.trim())) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9");
      return false;
    }
    if (!address.trim()) {
      Alert.alert("Error", "Address is required");
      return false;
    }
    if (scrapItems.length === 0) {
      Alert.alert("Error", "At least one scrap item is required");
      return false;
    }
    if (scrapItems.some(item => !item.category || !item.type || !item.weight)) {
      Alert.alert("Error", "Please fill all scrap item details (category, type, and weight)");
      return false;
    }
    if (scrapItems.some(item => parseFloat(item.weight) <= 0)) {
      Alert.alert("Error", "Weight must be greater than 0");
      return false;
    }
    if (calculateGrandTotal() <= 0) {
      Alert.alert("Error", "Total amount must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;

    setSubmitting(true);
    try {
      const robustClient = createRobustApiClient();
      
      // Prepare and validate collection data
      const collectionData = {
        agentname: user.name || '',
        agent_MobileNo: user.mobile_No || '',
        customername: customerName.trim(),
        customer_MobileNo: customerMobile.trim(),
        customerEmail: customerEmail.trim(),
        address: address.trim(),
        totalamount: calculateGrandTotal(),
        paymentstatus: paymentStatus,
        dateTime: dateTime,
        scrapItems: scrapItems
          .filter(item => item.type && item.weight && parseFloat(item.weight) > 0)
          .map(item => ({
            category: item.category || '',
            type: item.type || '',
            weight: parseFloat(item.weight) || 0,
            price: parseFloat(item.rate) || 0,
            subtotal: item.total || 0
          }))
      };

      console.log("Submitting collection data:", JSON.stringify(collectionData, null, 2));

      const response = await robustClient.post('/collection/add', collectionData);
      
      console.log("Collection submitted successfully:", response.data);
      
      Alert.alert(
        "Success", 
        "Scrap collection recorded successfully!",
        [{ text: "OK", onPress: () => navigation.navigate('UserDashboard' as never) }]
      );
      
    } catch (error: any) {
      console.error("Error submitting collection:", error);
      
      let errorMessage = "Failed to submit collection. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "Unable to connect to server") {
        errorMessage = "Unable to connect to server. Please check your internet connection.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('UserDashboard' as never)}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scrap Collection Form</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Agent Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Information</Text>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Agent Name</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={user?.name || ''}
                editable={false}
                placeholder="Agent name"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Agent Mobile</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={user?.mobile_No || ''}
                editable={false}
                placeholder="Agent mobile"
              />
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Customer Name</Text>
              <TextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter customer name"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Mobile No</Text>
              <TextInput
                style={[
                  styles.input,
                  customerMobile && !validateMobile(customerMobile) && styles.inputError,
                  customerMobile && validateMobile(customerMobile) && styles.inputValid
                ]}
                value={customerMobile}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numericText = text.replace(/[^0-9]/g, '');
                  setCustomerMobile(numericText);
                }}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                maxLength={10}
              />
              {customerMobile && !validateMobile(customerMobile) && (
                <Text style={styles.errorText}>
                  {customerMobile.length !== 10 
                    ? `Enter ${10 - customerMobile.length} more digits` 
                    : 'Must start with 6, 7, 8, or 9'
                  }
                </Text>
              )}
              {customerMobile && validateMobile(customerMobile) && (
                <Text style={styles.successText}>✓ Valid mobile number</Text>
              )}
            </View>
          </View>
          
          <Text style={styles.label}>Customer Email</Text>
          <TextInput
            style={[
              styles.input,
              customerEmail && !validateEmail(customerEmail) && styles.inputError,
              customerEmail && validateEmail(customerEmail) && styles.inputValid
            ]}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="customer@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {customerEmail && !validateEmail(customerEmail) && (
            <Text style={styles.errorText}>Please enter a valid email address</Text>
          )}
          {customerEmail && validateEmail(customerEmail) && (
            <Text style={styles.successText}>✓ Valid email address</Text>
          )}
          
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter customer address"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date & Payment */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Date & Time</Text>
              <TextInput
                style={styles.input}
                value={dateTime}
                onChangeText={setDateTime}
                placeholder="YYYY-MM-DD HH:MM"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Payment Status</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowPaymentModal(true)}
              >
                <Text style={styles.dropdownButtonText}>
                  {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Scrap Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scrap Items</Text>
            <TouchableOpacity onPress={addScrapItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>
          </View>

          {scrapItems.map((item, index) => (
            <View key={item.id} style={styles.scrapItem}>
              <View style={styles.scrapItemHeader}>
                <Text style={styles.itemNumber}>Item {index + 1}</Text>
                {scrapItems.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeScrapItem(item.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Category</Text>
                  <TouchableOpacity 
                    style={styles.dropdownButton}
                    onPress={() => {
                      setActiveScrapItemId(item.id);
                      setShowScrapCategoryModal(true);
                    }}
                  >
                    <Text style={[styles.dropdownButtonText, !item.category && styles.placeholderText]}>
                      {item.category || "Select category"}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Type</Text>
                  <TouchableOpacity 
                    style={[styles.dropdownButton, !item.category && styles.dropdownButtonDisabled]}
                    onPress={() => {
                      if (item.category) {
                        setActiveScrapItemId(item.id);
                        setShowScrapTypeModal(true);
                      }
                    }}
                    disabled={!item.category}
                  >
                    <Text style={[styles.dropdownButtonText, !item.type && styles.placeholderText]}>
                      {item.type || "Select type"}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.thirdWidth}>
                  <Text style={styles.label}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={item.weight}
                    onChangeText={(value) => updateScrapItem(item.id, 'weight', value)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <Text style={styles.label}>Rate (₹/kg)</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={item.rate}
                    editable={false}
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <Text style={styles.label}>Total (₹)</Text>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={item.total.toFixed(2)}
                    editable={false}
                    placeholder="0.00"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Grand Total */}
        <View style={styles.totalSection}>
          <Text style={styles.grandTotalLabel}>Grand Total:</Text>
          <Text style={styles.grandTotalValue}>₹ {calculateGrandTotal().toFixed(2)}</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "Submitting..." : "Submit Form"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Status Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowPaymentModal(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Select Payment Status</Text>
            {['pending', 'paid', 'partial'].map((status) => (
              <TouchableOpacity
                key={status}
                style={styles.dropdownOption}
                onPress={() => {
                  setPaymentStatus(status);
                  setShowPaymentModal(false);
                }}
              >
                <Text style={styles.dropdownOptionText}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Scrap Category Modal */}
      <Modal
        visible={showScrapCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScrapCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowScrapCategoryModal(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Select Category</Text>
            <ScrollView style={styles.modalScrollView}>
              {getUniqueCategories().map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.dropdownOption}
                  onPress={() => {
                    updateScrapItem(activeScrapItemId, 'category', category);
                    setShowScrapCategoryModal(false);
                  }}
                >
                  <Text style={styles.dropdownOptionText}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <Text style={styles.dropdownOptionSubtext}>
                    {getTypesByCategory(category).length} types available
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Scrap Type Modal */}
      <Modal
        visible={showScrapTypeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowScrapTypeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowScrapTypeModal(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownModalTitle}>Select Scrap Type</Text>
            <ScrollView style={styles.modalScrollView}>
              {(() => {
                const activeItem = scrapItems.find(item => item.id === activeScrapItemId);
                const availableTypes = activeItem ? getTypesByCategory(activeItem.category) : [];
                
                return availableTypes.map((scrap) => (
                  <TouchableOpacity
                    key={`${scrap.category}-${scrap.type}`}
                    style={styles.dropdownOption}
                    onPress={() => {
                      updateScrapItem(activeScrapItemId, 'type', scrap.type);
                      setShowScrapTypeModal(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>
                      {scrap.type} (₹{scrap.price}/kg)
                    </Text>
                  </TouchableOpacity>
                ));
              })()}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
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
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    color: '#1e9d47',
    fontSize: 16,
    marginRight: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  disabledInput: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  placeholderText: {
    color: '#6c757d',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6c757d',
  },
  dropdownButtonDisabled: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    opacity: 0.6,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  inputValid: {
    borderColor: '#28a745',
    borderWidth: 2,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: '#28a745',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  dropdownOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  dropdownOptionSubtext: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#1e9d47',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  scrapItem: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  scrapItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    fontSize: 18,
  },
  totalSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e9d47',
  },
  submitButton: {
    backgroundColor: '#2c3e50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});