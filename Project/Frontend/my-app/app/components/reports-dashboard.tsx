import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AreaChart } from './advanced-charts';
import { PieChart } from './chart-components';
import { createRobustApiClient } from '../config/api';

const { width: screenWidth } = Dimensions.get('window');

interface RevenueData {
  month: string;
  revenue: number;
}

interface AgentReport {
  name: string;
  mobile: string;
  collections: number;
  revenue: number;
  avgRevenue: number;
}

interface CategoryReport {
  category: string;
  collections: number;
  totalWeight: number;
  revenue: number;
}

interface MonthlyTrend {
  month: number;
  collections: number;
  revenue: number;
}

interface CustomerReport {
  name: string;
  mobile: string;
  collections: number;
  totalRevenue: number;
  avgRevenue: number;
}

export default function ReportsDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Visibility states for sections
  const [showAgentReport, setShowAgentReport] = useState(false);
  const [showCategoryReport, setShowCategoryReport] = useState(false);
  const [showCustomerReport, setShowCustomerReport] = useState(false);
  const [showTotalReport, setShowTotalReport] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  
  // Data states
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueData[]>([]);
  const [agentReports, setAgentReports] = useState<AgentReport[]>([]);
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([]);
  const [customerReports, setCustomerReports] = useState<CustomerReport[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCollections: 0,
    totalRevenue: 0,
    totalAgents: 0,
    monthlyCollections: 0,
    monthlyRevenue: 0
  });

  const apiClient = createRobustApiClient();
  const years = [2021, 2022, 2023, 2024, 2025];
  
  // Month names for chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fetch all reports data
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive report data
      const response = await apiClient.get('/reports/comprehensive');
      const data = response.data;
      
      // Set dashboard stats
      setDashboardStats(data.overview);
      
      // Set agent reports
      setAgentReports(data.agents || []);
      
      // Set category reports
      setCategoryReports(data.categories || []);
      
      // Set customer reports
      setCustomerReports(data.customers || []);
      
      // Fetch monthly trends for selected year
      await fetchMonthlyData(selectedYear);
      
    } catch (error) {
      console.error('Error fetching reports data:', error);
      Alert.alert('Error', 'Failed to load reports data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch monthly revenue data for specific year
  const fetchMonthlyData = async (year: number) => {
    try {
      setChartLoading(true);
      const response = await apiClient.get(`/reports/monthly?year=${year}`);
      const monthlyData = response.data;
      
      // Convert to chart format
      const chartData = monthlyData.map((item: MonthlyTrend) => ({
        month: monthNames[item.month - 1],
        revenue: item.revenue
      }));
      
      setMonthlyRevenue(chartData);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      Alert.alert('Error', 'Failed to load monthly revenue data.');
    } finally {
      setChartLoading(false);
    }
  };

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    fetchMonthlyData(year);
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  // Format revenue data for chart
  const chartData = monthlyRevenue.map(item => ({
    label: item.month,
    value: item.revenue
  }));

  // Prepare pie chart data for categories
  const categoryPieData = categoryReports.slice(0, 6).map((cat, index) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return {
      label: cat.category,
      value: cat.revenue,
      color: colors[index % colors.length]
    };
  });

  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const avgMonthlyRevenue = monthlyRevenue.length > 0 ? totalRevenue / monthlyRevenue.length : 0;

  // Get unique agents and categories for filters
  const agents = [
    { id: 'all', name: 'All Agents' },
    ...agentReports.map((agent, index) => ({ id: index.toString(), name: agent.name }))
  ];

  const categories = [
    'all',
    ...Array.from(new Set(categoryReports.map(cat => cat.category)))
  ];

  const CollapsibleSection = ({ 
    title, 
    isVisible, 
    onToggle, 
    children 
  }: { 
    title: string; 
    isVisible: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
  }) => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.toggleIcon}>{isVisible ? '−' : '+'}</Text>
      </TouchableOpacity>
      {isVisible && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );

  const TableRow = ({ 
    data, 
    isHeader = false 
  }: { 
    data: string[]; 
    isHeader?: boolean;
  }) => (
    <View style={[styles.tableRow, isHeader && styles.tableHeader]}>
      {data.map((cell, index) => (
        <Text 
          key={index} 
          style={[
            styles.tableCell, 
            isHeader && styles.tableCellHeader,
            { flex: index === 0 ? 2 : 1 }
          ]}
        >
          {cell}
        </Text>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Revenue Chart Section */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Monthly Revenue</Text>
          <View style={styles.yearPicker}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={handleYearChange}
              style={styles.picker}
            >
              {years.map(year => (
                <Picker.Item key={year} label={year.toString()} value={year} />
              ))}
            </Picker>
          </View>
        </View>
        
        {chartLoading ? (
          <View style={styles.chartLoading}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text>Loading chart data...</Text>
          </View>
        ) : (
          <AreaChart
            data={chartData}
            title=""
            color="#667eea"
          />
        )}
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
            <Text style={styles.summaryValue}>₹{totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg Monthly</Text>
            <Text style={styles.summaryValue}>₹{Math.round(avgMonthlyRevenue).toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Revenue by Category Pie Chart */}
      {categoryPieData.length > 0 && (
        <View style={styles.chartSection}>
          <PieChart
            title="Revenue by Category"
            data={categoryPieData}
          />
        </View>
      )}

      {/* Agent-wise Report */}
      <CollapsibleSection
        title="Agent Performance Reports"
        isVisible={showAgentReport}
        onToggle={() => setShowAgentReport(!showAgentReport)}
      >
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Select Agent:</Text>
          <View style={styles.filterPicker}>
            <Picker
              selectedValue={selectedAgent}
              onValueChange={setSelectedAgent}
              style={styles.picker}
            >
              {agents.map(agent => (
                <Picker.Item key={agent.id} label={agent.name} value={agent.id} />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.table}>
          <TableRow 
            data={['Agent Name', 'Collections', 'Revenue (₹)', 'Avg Revenue']} 
            isHeader 
          />
          {agentReports
            .filter((_, index) => selectedAgent === 'all' || index.toString() === selectedAgent)
            .map((agent, index) => (
              <TableRow
                key={index}
                data={[
                  agent.name,
                  agent.collections.toString(),
                  Math.round(agent.revenue).toLocaleString(),
                  Math.round(agent.avgRevenue).toLocaleString()
                ]}
              />
            ))}
        </View>
      </CollapsibleSection>

      {/* Category Report */}
      <CollapsibleSection
        title="Category-wise Reports"
        isVisible={showCategoryReport}
        onToggle={() => setShowCategoryReport(!showCategoryReport)}
      >
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Select Category:</Text>
          <View style={styles.filterPicker}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={setSelectedCategory}
              style={styles.picker}
            >
              {categories.map(category => (
                <Picker.Item 
                  key={category} 
                  label={category === 'all' ? 'All Categories' : category} 
                  value={category} 
                />
              ))}
            </Picker>
          </View>
        </View>
        
        <View style={styles.table}>
          <TableRow 
            data={['Category', 'Collections', 'Weight (kg)', 'Revenue (₹)']} 
            isHeader 
          />
          {categoryReports
            .filter(cat => selectedCategory === 'all' || cat.category === selectedCategory)
            .map((category, index) => (
              <TableRow
                key={index}
                data={[
                  category.category,
                  category.collections.toString(),
                  Math.round(category.totalWeight).toString(),
                  Math.round(category.revenue).toLocaleString()
                ]}
              />
            ))}
        </View>
      </CollapsibleSection>

      {/* Customer Report */}
      <CollapsibleSection
        title="Top Customers"
        isVisible={showCustomerReport}
        onToggle={() => setShowCustomerReport(!showCustomerReport)}
      >
        <View style={styles.table}>
          <TableRow 
            data={['Customer Name', 'Collections', 'Total Revenue', 'Avg Revenue']} 
            isHeader 
          />
          {customerReports.map((customer, index) => (
            <TableRow
              key={index}
              data={[
                customer.name,
                customer.collections.toString(),
                Math.round(customer.totalRevenue).toLocaleString(),
                Math.round(customer.avgRevenue).toLocaleString()
              ]}
            />
          ))}
        </View>
      </CollapsibleSection>

      {/* Total Summary Report */}
      <CollapsibleSection
        title="Dashboard Summary"
        isVisible={showTotalReport}
        onToggle={() => setShowTotalReport(!showTotalReport)}
      >
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Total Collections</Text>
            <Text style={styles.summaryCardValue}>{dashboardStats.totalCollections}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Total Agents</Text>
            <Text style={styles.summaryCardValue}>{dashboardStats.totalAgents}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>This Month Collections</Text>
            <Text style={styles.summaryCardValue}>{dashboardStats.monthlyCollections}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Total Revenue</Text>
            <Text style={styles.summaryCardValue}>
              ₹{Math.round(dashboardStats.totalRevenue).toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>This Month Revenue</Text>
            <Text style={styles.summaryCardValue}>
              ₹{Math.round(dashboardStats.monthlyRevenue).toLocaleString()}
            </Text>
          </View>
        </View>
      </CollapsibleSection>
    </ScrollView>
  );
}const 
styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  chartLoading: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  
  // Chart Section
  chartSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  yearPicker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minWidth: 100,
  },
  picker: {
    height: 40,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // Collapsible Sections
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  toggleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    width: 24,
    textAlign: 'center',
  },
  sectionContent: {
    padding: 16,
  },
  
  // Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 12,
    minWidth: 80,
  },
  filterPicker: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  
  // Tables
  table: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minHeight: 44,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  tableCellHeader: {
    fontWeight: '600',
    color: '#495057',
  },
  
  // Summary Cards
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryCardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});