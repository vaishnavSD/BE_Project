import React from 'react';
import { View, Text, ScrollView, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface TableProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TableHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TableBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TableFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TableRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface TableHeadProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface TableCellProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface TableCaptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

const Table: React.FC<TableProps> = ({ children, style }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, style]}>
        {children}
      </View>
    </ScrollView>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, style }) => {
  return (
    <View style={[styles.tableHeader, style]}>
      {children}
    </View>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ children, style }) => {
  return (
    <View style={[styles.tableBody, style]}>
      {children}
    </View>
  );
};

const TableFooter: React.FC<TableFooterProps> = ({ children, style }) => {
  return (
    <View style={[styles.tableFooter, style]}>
      {children}
    </View>
  );
};

const TableRow: React.FC<TableRowProps> = ({ children, style }) => {
  return (
    <View style={[styles.tableRow, style]}>
      {children}
    </View>
  );
};

const TableHead: React.FC<TableHeadProps> = ({ children, style }) => {
  return (
    <Text style={[styles.tableHead, style]}>
      {children}
    </Text>
  );
};

const TableCell: React.FC<TableCellProps> = ({ children, style }) => {
  return (
    <Text style={[styles.tableCell, style]}>
      {children}
    </Text>
  );
};

const TableCaption: React.FC<TableCaptionProps> = ({ children, style }) => {
  return (
    <Text style={[styles.tableCaption, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  table: {
    minWidth: '100%',
    backgroundColor: '#FFFFFF',
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableBody: {
    // No specific styles needed
  },
  tableFooter: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 40,
    alignItems: 'center',
  },
  tableHead: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'left',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'left',
  },
  tableCaption: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
});

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
export default Table;
