import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons"; // provides icons like edit, x, check

export interface DataEntry {
  id?: number;
  category: string;
  type: string;
  price: number | string;
}

interface DataTableProps {
  data: DataEntry[];
  onDelete: (id: number, type: string) => void;
  onEditPrice: (id: number, type: string, newPrice: number) => void;
}

export default function DataTable({ data, onDelete, onEditPrice }: DataTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Helper function to safely convert and format price
  const formatPrice = (price: number | string | null | undefined): string => {
    const numPrice = Number(price || 0);
    if (isNaN(numPrice)) {
      return '0.00';
    }
    return numPrice.toFixed(2);
  };

  // Helper function to safely get numeric price
  const getNumericPrice = (price: number | string | null | undefined): number => {
    const numPrice = Number(price || 0);
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const handleStartEdit = (id: number, currentPrice: number) => {
    console.log('Starting edit for ID:', id, 'Current price:', currentPrice);
    setEditingId(id);
    setEditValue(currentPrice.toString());
  };

  const handleSaveEdit = () => {
    console.log('Saving edit for ID:', editingId, 'New value:', editValue);
    
    if (editingId === null) {
      console.log('No editing ID set');
      return;
    }

    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice < 0) {
      Alert.alert("Invalid Input", "Please enter a valid positive number");
      return;
    }

    // Round to 2 decimal places for consistency
    const roundedPrice = Math.round(newPrice * 100) / 100;

    // Find item by ID or by index if ID is not available
    let item = data.find(d => d.id === editingId);
    if (!item) {
      // Fallback to finding by index
      item = data[editingId];
    }
    
    console.log('Found item for editing:', item);
    
    if (item) {
      console.log('Calling onEditPrice with:', editingId, item.type, roundedPrice);
      onEditPrice(editingId, item.type, roundedPrice);
    } else {
      console.log('Item not found for ID:', editingId);
      Alert.alert("Error", "Item not found. Please refresh and try again.");
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const renderRow = ({ item, index }: { item: DataEntry; index: number }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.category}</Text>
      <Text style={styles.cell}>{item.type}</Text>
      <View style={styles.cell}>
        {editingId === (item.id || index) ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity style={styles.iconButton} onPress={handleSaveEdit}>
              <Feather name="check" size={16} color="green" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleCancelEdit}>
              <Feather name="x" size={16} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.rateDisplay}
            onPress={() => {
              console.log('Rate clicked for item:', item, 'Index:', index);
              const itemId = item.id || index;
              const itemPrice = getNumericPrice(item.price);
              console.log('Using ID:', itemId, 'Price:', itemPrice, 'Type:', typeof itemPrice, 'Original:', item.price);
              handleStartEdit(itemId, itemPrice);
            }}
          >
            <Text>₹{formatPrice(item.price)}</Text>
            <Feather name="edit-2" size={14} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          console.log('Delete button clicked for item:', item, 'Index:', index);
          const itemId = item.id || index;
          console.log('Calling onDelete with ID:', itemId, 'Type:', item.type);
          onDelete(itemId, item.type);
        }}
      >
        <Feather name="trash-2" size={16} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.table}>
      {data.length === 0 ? (
        <Text style={styles.emptyText}>No data available. Add your first entry below.</Text>
      ) : (
        <>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Category</Text>
            <Text style={styles.headerCell}>Type</Text>
            <Text style={styles.headerCell}>Price (₹)</Text>
            <Text style={styles.headerCell}>Actions</Text>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item, index) => {
              const key = item.id ? item.id.toString() : `fallback-${index}`;
              console.log('Key for item:', key, 'Item:', item);
              return key;
            }}
            renderItem={renderRow}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#667eea",
  },
  input: {
    borderWidth: 2,
    borderColor: "#667eea",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    marginRight: 6,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  iconButton: {
    padding: 4,
    marginHorizontal: 2,
  },
  rateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 36,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
    minHeight: 32,
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#6B7280",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 2,
    borderBottomColor: "#D1D5DB",
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});
