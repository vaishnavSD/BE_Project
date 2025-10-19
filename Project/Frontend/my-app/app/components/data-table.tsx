import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// Simplified data table without inline editing

export interface DataEntry {
  id?: number;
  category: string;
  type: string;
  price: number | string;
}

interface DataTableProps {
  data: DataEntry[];
  onDelete: (id: number, type: string) => void;
  onEdit: (id: number, type: string, currentPrice: number) => void;
}

export default function DataTable({ data, onDelete, onEdit }: DataTableProps) {
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

  const renderRow = ({ item, index }: { item: DataEntry; index: number }) => {
    const key = item.id ? item.id.toString() : `fallback-${index}`;
    return (
    <View key={key} style={styles.row}>
      <Text style={styles.cell}>{item.category}</Text>
      <Text style={styles.cell}>{item.type}</Text>
      <View style={styles.cell}>
        <TouchableOpacity
          style={styles.priceContainer}
          onPress={() => {
            const itemId = item.id || index;
            const itemPrice = getNumericPrice(item.price);
            onEdit(itemId, item.type, itemPrice);
          }}
        >
          <Text style={styles.priceText}>₹{formatPrice(item.price)}</Text>
          <Text style={styles.editHint}>Tap to edit</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          const itemId = item.id || index;
          onDelete(itemId, item.type);
        }}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
    );
  };

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
          <View>
            {data.map((item, index) => 
              renderRow({ item, index })
            )}
          </View>
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
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  cell: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 4,
    color: "#374151",
  },
  priceContainer: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3B82F6",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 2,
  },
  editHint: {
    fontSize: 10,
    color: "#6B7280",
    fontStyle: "italic",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#6B7280",
  },
  headerRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
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
