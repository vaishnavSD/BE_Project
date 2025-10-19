import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ValidationHelpers } from "../../src/utils/validation";
import ValidationError from "./validation-error";

interface AddDataFormProps {
  onAdd: (category: string, type: string, price: number) => void;
}

export default function AddDataForm({ onAdd }: AddDataFormProps) {
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const validateField = (field: string, value: string) => {
    let errors: string[] = [];
    
    switch (field) {
      case 'category':
        if (!value.trim()) errors.push('Category is required');
        else if (value.length < 3) errors.push('Category must be at least 3 characters');
        else if (value.length > 50) errors.push('Category must be no more than 50 characters');
        else if (/[<>\"'%;()&+]/.test(value)) errors.push('Category contains invalid characters');
        break;
        
      case 'type':
        if (!value.trim()) errors.push('Type is required');
        else if (value.length < 3) errors.push('Type must be at least 3 characters');
        else if (value.length > 50) errors.push('Type must be no more than 50 characters');
        else if (/[<>\"'%;()&+]/.test(value)) errors.push('Type contains invalid characters');
        break;
        
      case 'price':
        if (!value.trim()) errors.push('Price is required');
        else if (!/^\d+(\.\d{1,2})?$/.test(value)) errors.push('Price must be a valid number (up to 2 decimal places)');
        else if (parseFloat(value) <= 0) errors.push('Price must be greater than 0');
        else if (parseFloat(value) > 999999.99) errors.push('Price cannot exceed ₹999,999.99');
        break;
    }
    
    setFieldErrors(prev => ({
      ...prev,
      [field]: errors
    }));
    
    return errors.length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    // Update the field value
    switch (field) {
      case 'category':
        setCategory(value);
        break;
      case 'type':
        setType(value);
        break;
      case 'price':
        // Only allow numbers and decimal point
        const cleanValue = value.replace(/[^0-9.]/g, '');
        // Prevent multiple decimal points
        const parts = cleanValue.split('.');
        const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleanValue;
        setPrice(formattedValue);
        break;
    }
    
    // Clear errors when user starts typing
    if (fieldErrors[field]?.length > 0) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
  };

  const handleInputBlur = (field: string, value: string) => {
    validateField(field, value);
  };

  const validateForm = () => {
    const validation = ValidationHelpers.validateScrapDetails({
      category: category.trim(),
      type: type.trim(),
      price: price.trim()
    });
    
    if (!validation.isValid) {
      // Group errors by field
      const errorsByField: Record<string, string[]> = {};
      validation.errors.forEach(error => {
        const field = error.toLowerCase().includes('category') ? 'category' :
                     error.toLowerCase().includes('type') ? 'type' :
                     error.toLowerCase().includes('price') ? 'price' : 'general';
        
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
      const priceValue = parseFloat(price);
      await onAdd(category.trim(), type.trim(), priceValue);

      // Reset form on success
      setCategory("");
      setType("");
      setPrice("");
      setFieldErrors({});
      
    } catch (error) {
      console.error('Error adding scrap detail:', error);
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(fieldErrors).some(errors => errors.length > 0);
  const isFormValid = category.trim() !== '' && type.trim() !== '' && price.trim() !== '' && !hasErrors;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        <Feather name="plus" size={18} color="#2563EB" /> Add New Scrap Rate
      </Text>

      <View style={styles.form}>
        {/* Category Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Category *</Text>
          <TextInput
            style={[styles.input, fieldErrors.category?.length > 0 && styles.inputError]}
            placeholder="e.g., Metal, Plastic, Paper"
            value={category}
            onChangeText={(value) => handleInputChange('category', value)}
            onBlur={() => handleInputBlur('category', category)}
            autoCapitalize="words"
            maxLength={50}
          />
          <ValidationError errors={fieldErrors.category || []} />
        </View>

        {/* Type Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Type *</Text>
          <TextInput
            style={[styles.input, fieldErrors.type?.length > 0 && styles.inputError]}
            placeholder="e.g., Copper, Aluminum, Steel"
            value={type}
            onChangeText={(value) => handleInputChange('type', value)}
            onBlur={() => handleInputBlur('type', type)}
            autoCapitalize="words"
            maxLength={50}
          />
          <ValidationError errors={fieldErrors.type || []} />
        </View>

        {/* Price Input */}
        <View style={styles.field}>
          <Text style={styles.label}>Price per KG (₹) *</Text>
          <TextInput
            style={[styles.input, fieldErrors.price?.length > 0 && styles.inputError]}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={(value) => handleInputChange('price', value)}
            onBlur={() => handleInputBlur('price', price)}
            maxLength={10}
          />
          <ValidationError errors={fieldErrors.price || []} />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <Text style={styles.buttonText}>Adding...</Text>
          ) : (
            <>
              <Feather name="plus" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.buttonText}>Add Entry</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.requiredNote}>* Required fields</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#2c3e50",
    flexDirection: "row",
    alignItems: "center",
  },
  form: {
    flexDirection: "column",
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  requiredNote: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
  },
});
