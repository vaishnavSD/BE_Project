import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { ValidationHelpers } from "../src/utils/validation";
import ValidationError from "./components/validation-error";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";

export default function AgentSignup() {
  const navigation = useNavigation();
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
    
    // Clear errors when user starts typing
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
      console.log('Registering agent:', formData);
      
      console.log('API endpoint:', `${API_ENDPOINTS.USERS}/register`);
      console.log('Request data:', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_No: formData.mobile_No.trim(),
        address: formData.address.trim(),
        role: 'agent',
        password: '[HIDDEN]'
      });
      
      const response = await apiClient.post(`${API_ENDPOINTS.USERS}/register`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile_No: formData.mobile_No.trim(),
        address: formData.address.trim(),
        role: 'agent',
        password: formData.password
      });
      
      console.log('Registration response:', response.data);
      
      Alert.alert(
        'Success!',
        `Agent "${formData.name}" has been registered successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                name: '',
                email: '',
                mobile_No: '',
                address: '',
                password: '',
                confirmPassword: '',
              });
              setFieldErrors({});
              // Navigate back to manage agents
              navigation.navigate('ManageAgents' as never);
            }
          }
        ]
      );
      
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        code: err.code
      });
      
      let errorMessage = 'Failed to register agent. Please try again.';
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      } else if (err.response?.status === 400) {
        if (err.response.data?.error?.includes('already exists')) {
          errorMessage = 'An agent with this mobile number already exists.';
          setFieldErrors(prev => ({
            ...prev,
            mobile_No: ['This mobile number is already registered']
          }));
        } else if (err.response.data?.error?.includes('required')) {
          errorMessage = 'All fields are required. Please fill in all information.';
        } else {
          errorMessage = err.response.data?.error || 'Invalid input data.';
        }
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Please check your connection and try again.';
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
          onPress={() => {
            navigation.navigate('ManageAgents' as never);
          }}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Agent Registration</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Register New Agent</Text>
          <Text style={styles.formSubtitle}>Fill in the details to create a new agent account</Text>

          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, fieldErrors.name?.length > 0 && styles.inputError]}
              placeholder="Enter agent's full name"
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
            style={[styles.submitButton, (!isFormValid || loading) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Register Agent</Text>
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
    marginBottom: 30,
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
    backgroundColor: '#667eea',
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