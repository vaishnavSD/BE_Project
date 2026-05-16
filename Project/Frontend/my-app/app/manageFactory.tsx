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
import { getCurrentUser, isAdmin } from "../src/utils/auth";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";
import { ValidationHelpers } from "../src/utils/validation";

interface FactoryEmployee {
  id: number;
  name: string;
  email: string;
  mobile_No: string;
  address: string;
  role: string;
}

export default function ManageFactory() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [factoryEmployees, setFactoryEmployees] = useState<FactoryEmployee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_No: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isAdmin()) {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
    loadFactoryEmployees();
  }, []);

  const loadFactoryEmployees = async () => {
    try {
      setError(null);
      console.log('Fetching factory employees from API...');
      const apiClient = createRobustApiClient();
      const response = await apiClient.get(API_ENDPOINTS.USERS);
      console.log('Users API response:', response.data);
      
      // Filter only factory employees
      const usersArray = response.data.users || response.data || [];
      const factoryStaff = Array.isArray(usersArray) 
        ? usersArray.filter((emp: any) => emp.role === 'factory') 
        : [];
      
      setFactoryEmployees(factoryStaff);
      console.log('Factory employees loaded successfully:', factoryStaff.length);
    } catch (err: any) {
      console.error('Error loading factory employees:', err);
      
      let errorMessage = 'Failed to load factory employees.';
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Users endpoint not found. Please check the API configuration.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFactoryEmployees();
  };

  const validateForm = () => {
    const validation = ValidationHelpers.validateAgentSignup(formData);
    
    if (!validation.isValid) {
      // Group errors by field
      const errorsByField: Record<string, string[]> = {};
      validation.errors.forEach(error => {
        const field = error.toLowerCase().includes('name') ? 'name' :
                     error.toLowerCase().includes('email') ? 'email' :
                     error.toLowerCase().includes('mobile') ? 'mobile_No' :
                     error.toLowerCase().includes('address') ? 'address' :
                     error.toLowerCase().includes('password') ? 'password' : 'general';
        
        if (!errorsByField[field]) errorsByField[field] = [];
        errorsByField[field].push(error);
      });
      
      setFormErrors(errorsByField);
      
      // Show first error in alert
      Alert.alert('Validation Error', validation.errors[0]);
      return false;
    }
    
    setFormErrors({});
    return true;
  };

  const handleAddEmployee = async () => {
    if (!validateForm()) return;

    setFormLoading(true);
    try {
      const apiClient = createRobustApiClient();
      console.log('📤 Registering factory employee:', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_No: formData.mobile_No.trim(),
        address: formData.address.trim(),
        role: 'factory',
        password: '[HIDDEN]'
      });
      
      const response = await apiClient.post(`${API_ENDPOINTS.USERS}/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_No: formData.mobile_No.trim(),
        address: formData.address.trim(),
        role: 'factory',
        password: formData.password
      });

      console.log('📥 Registration response:', response.data);

      Alert.alert(
        'Success!',
        `Factory employee "${formData.name}" has been registered successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowAddModal(false);
              setFormData({ name: '', email: '', mobile_No: '', address: '', password: '', confirmPassword: '' });
              setFormErrors({});
              loadFactoryEmployees();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      
      let errorMessage = 'Failed to add factory employee. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.error || 'Invalid data provided.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message && error.message !== 'Unable to connect to server') {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = (employee: FactoryEmployee) => {
    Alert.alert(
      'Delete Factory Employee',
      `Are you sure you want to delete ${employee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEmployee(employee.id)
        }
      ]
    );
  };

  const deleteEmployee = async (employeeId: number) => {
    try {
      const apiClient = createRobustApiClient();
      await apiClient.delete(`${API_ENDPOINTS.USERS}/${employeeId}`);
      Alert.alert('Success', 'Factory employee deleted successfully');
      await loadFactoryEmployees();
    } catch (error) {
      console.error('Error deleting factory employee:', error);
      Alert.alert('Error', 'Failed to delete factory employee');
    }
  };

  const filteredEmployees = factoryEmployees.filter(employee => {
    if (searchQuery === '') return true;
    
    return employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           String(employee.mobile_No || '').includes(searchQuery);
  });

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Factory Staff</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Action Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.addAgentBtn} 
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addAgentIcon}>🏭</Text>
            <Text style={styles.addAgentText}>Add Factory Employee</Text>
          </TouchableOpacity>
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            maxLength={100}
          />
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading factory employees...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadFactoryEmployees}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredEmployees.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "No employees match your search" : "No factory employees found"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? "Try adjusting your search criteria" 
                : "Add your first factory employee to get started"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{filteredEmployees.length}</Text>
                <Text style={styles.statLabel}>
                  {searchQuery ? "Filtered" : "Total"} Employees
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{factoryEmployees.length}</Text>
                <Text style={styles.statLabel}>Total Staff</Text>
              </View>
            </View>

            {filteredEmployees.map((employee) => (
              <View key={employee.id} style={styles.agentCard}>
                <View style={styles.agentHeader}>
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{employee.name}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>Factory</Text>
                    </View>
                  </View>
                  <Text style={styles.agentId}>ID: #{employee.id}</Text>
                </View>

                <View style={styles.agentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📧 Email:</Text>
                    <Text style={styles.detailValue}>{employee.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📱 Mobile:</Text>
                    <Text style={styles.detailValue}>{employee.mobile_No}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Address:</Text>
                    <Text style={styles.detailValue}>{employee.address}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteEmployee(employee)}
                  >
                    <Text style={styles.actionBtnText}>🗑 Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Add Employee Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Factory Employee</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
                {formErrors.name && <Text style={styles.errorText}>{Array.isArray(formErrors.name) ? formErrors.name[0] : formErrors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, formErrors.email && styles.inputError]}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {formErrors.email && <Text style={styles.errorText}>{Array.isArray(formErrors.email) ? formErrors.email[0] : formErrors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={[styles.input, formErrors.mobile_No && styles.inputError]}
                  placeholder="Enter 10-15 digit mobile number"
                  value={formData.mobile_No}
                  onChangeText={(text) => setFormData({ ...formData, mobile_No: text })}
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                {formErrors.mobile_No && <Text style={styles.errorText}>{Array.isArray(formErrors.mobile_No) ? formErrors.mobile_No[0] : formErrors.mobile_No}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea, formErrors.address && styles.inputError]}
                  placeholder="Enter address"
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  multiline
                  numberOfLines={3}
                />
                {formErrors.address && <Text style={styles.errorText}>{Array.isArray(formErrors.address) ? formErrors.address[0] : formErrors.address}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[styles.input, formErrors.password && styles.inputError]}
                  placeholder="Enter password (min 8 characters)"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />
                {formErrors.password && <Text style={styles.errorText}>{formErrors.password[0]}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, formErrors.password && styles.inputError]}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />
                {formErrors.password && formErrors.password.length > 1 && (
                  <Text style={styles.errorText}>{formErrors.password[1]}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, formLoading && styles.submitButtonDisabled]}
                onPress={handleAddEmployee}
                disabled={formLoading}
              >
                <Text style={styles.submitButtonText}>
                  {formLoading ? 'Adding...' : 'Add Factory Employee'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonContainer: {
    padding: 8,
  },
  backButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
  },
  content: {
    padding: 16,
  },
  actionSection: {
    marginBottom: 16,
  },
  addAgentBtn: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addAgentIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  addAgentText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  searchSection: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  agentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  agentId: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '600',
  },
  agentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
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
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#7f8c8d',
    fontWeight: '300',
  },
  modalForm: {
    padding: 20,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#dfe6e9',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});