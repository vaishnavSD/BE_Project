import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { ValidationHelpers } from "../src/utils/validation";
import ValidationError from "./components/validation-error";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";

type EmployeeRole = 'agent' | 'factory' | 'call_agent';

export default function AddEmployee() {
  const navigation = useNavigation();
  const [selectedRole, setSelectedRole] = useState<EmployeeRole>('agent');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_No: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const apiClient = createRobustApiClient();

  const roleInfo = {
    agent: {
      title: 'Agent',
      icon: '👤',
      description: 'Collects scrap from customers',
      color: '#667eea'
    },
    factory: {
      title: 'Factory Staff',
      icon: '🏭',
      description: 'Approves/rejects collections',
      color: '#f39c12'
    },
    call_agent: {
      title: 'Call Agent',
      icon: '📞',
      description: 'Verifies customer requests via call',
      color: '#27ae60'
    }
  };

  const validateField = (field: string, value: string) => {
    let errors: string[] = [];
    
    switch (field) {
      case 'name':
        if (!value.trim()) errors.push('Name is required');
        else if (value.length < 3) errors.push('Name must be at least 3 characters');
        else if (value.length > 50) errors.push('Name must be no more than 50 characters');
        else if (!/^[a-zA-Z\s\-']+$/.test(value)) errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
        break;
        
      case 'email':
        if (!value.trim()) errors.push('Email is required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.push('Please enter a valid email address');
        else if (value.length > 100) errors.push('Email must be no more than 100 characters');
        break;
        
      case 'mobile_No':
        if (!value.trim()) errors.push('Mobile number is required');
        else if (!/^\d{10,15}$/.test(value)) errors.push('Mobile number must be 10-15 digits');
        break;
        
      case 'address':
        if (!value.trim()) errors.push('Address is required');
        else if (value.length < 5) errors.push('Address must be at least 5 characters');
        else if (value.length > 255) errors.push('Address must be no more than 255 characters');
        break;
        
      case 'password':
        if (!value) errors.push('Password is required');
        else if (value.length < 8) errors.push('Password must be at least 8 characters');
        else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(value)) errors.push('Password must contain at least one letter and one number');
        break;
        
      case 'confirmPassword':
        if (!value) errors.push('Please confirm your password');
        else if (value !== formData.password) errors.push('Passwords do not match');
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: errors
    }));
    
    return errors.length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (fieldErrors[field]?.length > 0) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
  };

  const handleInputBlur = (field: string) => {
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateForm = () => {
    const validation = ValidationHelpers.validateAgentSignup(formData);
    
    if (!validation.isValid) {
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
      
      setFieldErrors(errorsByField);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below and try again.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.USERS}/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_No: formData.mobile_No.trim(),
        address: formData.address.trim(),
        role: selectedRole,
        password: formData.password
      });
      
      Alert.alert(
        'Success!',
        `${roleInfo[selectedRole].title} "${formData.name}" has been registered successfully!`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              setFormData({
                name: '',
                email: '',
                mobile_No: '',
                address: '',
                password: '',
                confirmPassword: '',
              });
              setFieldErrors({});
            }
          },
          {
            text: 'Done',
            onPress: () => {
              navigation.navigate('AdminDashboard' as never);
            }
          }
        ]
      );
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      let errorMessage = 'Failed to register employee. Please try again.';
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (err.response?.status === 400) {
        if (err.response.data?.error?.includes('already exists')) {
          errorMessage = 'An employee with this mobile number already exists.';
          setFieldErrors(prev => ({
            ...prev,
            mobile_No: ['This mobile number is already registered']
          }));
        } else {
          errorMessage = err.response.data?.error || 'Invalid input data.';
        }
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(fieldErrors).some(errors => errors.length > 0);
  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && !hasErrors;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AdminDashboard' as never)}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Employee</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Register New Employee</Text>
          <Text style={styles.formSubtitle}>Select role and fill in the details</Text>

          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.sectionTitle}>Select Role *</Text>
            <View style={styles.roleButtons}>
              {(Object.keys(roleInfo) as EmployeeRole[]).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    selectedRole === role && [
                      styles.roleButtonActive,
                      { 
                        borderColor: roleInfo[role].color,
                        backgroundColor: `${roleInfo[role].color}10`
                      }
                    ],
                    selectedRole !== role && { borderColor: '#e9ecef' }
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <View style={[
                    styles.roleIconContainer,
                    selectedRole === role && { backgroundColor: roleInfo[role].color }
                  ]}>
                    <Text style={styles.roleIcon}>{roleInfo[role].icon}</Text>
                  </View>
                  <Text style={[
                    styles.roleTitle,
                    selectedRole === role && { color: roleInfo[role].color }
                  ]}>
                    {roleInfo[role].title}
                  </Text>
                  <Text style={[
                    styles.roleDescription,
                    selectedRole === role && { color: '#2c3e50', fontWeight: '500' }
                  ]}>
                    {roleInfo[role].description}
                  </Text>
                  {selectedRole === role && (
                    <View style={[styles.selectedBadge, { backgroundColor: roleInfo[role].color }]}>
                      <Text style={styles.selectedBadgeText}>✓ Selected</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, fieldErrors.name?.length > 0 && styles.inputError]}
              placeholder="Enter full name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              onBlur={() => handleInputBlur('name')}
              autoCapitalize="words"
            />
            <ValidationError errors={fieldErrors.name || []} />
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[styles.input, fieldErrors.email?.length > 0 && styles.inputError]}
              placeholder="Enter email address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              onBlur={() => handleInputBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <ValidationError errors={fieldErrors.email || []} />
          </View>

          {/* Mobile Number Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number *</Text>
            <TextInput
              style={[styles.input, fieldErrors.mobile_No?.length > 0 && styles.inputError]}
              placeholder="Enter 10-15 digit mobile number"
              value={formData.mobile_No}
              onChangeText={(value) => handleInputChange('mobile_No', value)}
              onBlur={() => handleInputBlur('mobile_No')}
              keyboardType="numeric"
              maxLength={15}
            />
            <ValidationError errors={fieldErrors.mobile_No || []} />
          </View>

          {/* Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.textArea, fieldErrors.address?.length > 0 && styles.inputError]}
              placeholder="Enter complete address"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              onBlur={() => handleInputBlur('address')}
              multiline
              numberOfLines={3}
            />
            <ValidationError errors={fieldErrors.address || []} />
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, fieldErrors.password?.length > 0 && styles.inputError]}
                placeholder="Enter password (min 8 chars, letters & numbers)"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                onBlur={() => handleInputBlur('password')}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            <ValidationError errors={fieldErrors.password || []} />
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, fieldErrors.confirmPassword?.length > 0 && styles.inputError]}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                onBlur={() => handleInputBlur('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            <ValidationError errors={fieldErrors.confirmPassword || []} />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: roleInfo[selectedRole].color },
              (!isFormValid || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                Register {roleInfo[selectedRole].title}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.requiredNote}>* Required fields</Text>
        </View>
      </View>
    </ScrollView>
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
    marginLeft: 15,
  },
  content: {
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 25,
  },
  roleSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#e9ecef',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    minHeight: 130,
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    transform: [{ scale: 1.02 }],
  },
  roleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 6,
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 5,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 18,
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 15,
  },
});
