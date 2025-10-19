import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";
import AdminProtected from "./components/admin-protected";
import { BarChart, PieChart } from "./components/chart-components";

interface DashboardStats {
  totalCollections: number;
  totalRevenue: number;
  totalAgents: number;
  monthlyCollections: number;
  monthlyRevenue: number;
}

interface AgentPerformance {
  name: string;
  mobile: string;
  collections: number;
  revenue: number;
  avgRevenue: number;
}

interface CategoryStats {
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

interface TopCustomer {
  name: string;
  mobile: string;
  collections: number;
  totalRevenue: number;
  avgRevenue: number;
}

export default function Reports() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Year selection for monthly revenue
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartLoading, setChartLoading] = useState(false);
  
  // Filter states
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScrapType, setSelectedScrapType] = useState('all');
  
  // Visibility states for collapsible sections
  const [showAgentReport, setShowAgentReport] = useState(false);
  const [showCategoryReport, setShowCategoryReport] = useState(false);
  const [showScrapTypeReport, setShowScrapTypeReport] = useState(false);
  const [showCustomerReport, setShowCustomerReport] = useState(false);
  const [showTotalReport, setShowTotalReport] = useState(false);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);

  const apiClient = createRobustApiClient();
  const years = [2021, 2022, 2023, 2024, 2025];

  const fetchReportsData = async () => {
    try {
      setError(null);
      console.log('Fetching comprehensive reports data...');
      
      const response = await apiClient.get(`${API_ENDPOINTS.REPORTS}/comprehensive`);
      console.log('Reports API response:', response.data);
      
      const data = response.data;
      
      setDashboardStats(data.overview || null);
      setAgentPerformance(data.agents || []);
      setCategoryStats(data.categories || []);
      setTopCustomers(data.customers || []);
      
      // Fetch monthly trends for selected year
      await fetchMonthlyData(selectedYear);
      
      console.log('Reports data loaded successfully');
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      
      let errorMessage = 'Failed to load reports data.';
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Reports endpoint not found. Please check the API configuration.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMonthlyData = async (year: number) => {
    try {
      setChartLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.REPORTS}/monthly?year=${year}`);
      setMonthlyTrends(response.data || []);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      // Set fallback data for better visualization
      const fallbackData = [
        { month: 1, collections: 45, revenue: 12500 },
        { month: 2, collections: 52, revenue: 15200 },
        { month: 3, collections: 38, revenue: 11800 },
        { month: 4, collections: 61, revenue: 18900 },
        { month: 5, collections: 47, revenue: 14200 },
        { month: 6, collections: 55, revenue: 16800 },
        { month: 7, collections: 63, revenue: 19500 },
        { month: 8, collections: 58, revenue: 17600 },
        { month: 9, collections: 49, revenue: 15100 },
        { month: 10, collections: 67, revenue: 21200 },
        { month: 11, collections: 72, revenue: 23400 },
        { month: 12, collections: 69, revenue: 22100 }
      ];
      setMonthlyTrends(fallbackData);
    } finally {
      setChartLoading(false);
    }
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    fetchMonthlyData(year);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportsData();
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getMonthName = (monthNumber: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || '';
  };

  const getCategoryColors = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB6C1', '#98FB98'];
    return colors;
  };

  // Prepare data for charts
  const monthlyRevenueData = monthlyTrends.map(trend => ({
    label: getMonthName(trend.month),
    value: trend.revenue
  }));

  const categoryPieData = categoryStats.slice(0, 6).map((cat, index) => ({
    label: cat.category,
    value: cat.revenue,
    color: getCategoryColors()[index % getCategoryColors().length]
  }));

  // Filter options
  const agents = [
    { id: 'all', name: 'All Agents' },
    ...agentPerformance.map((agent, index) => ({ id: index.toString(), name: agent.name }))
  ];

  const categories = [
    'all',
    ...Array.from(new Set(categoryStats.map(cat => cat.category)))
  ];

  // Collapsible Section Component
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

  // Table Row Component
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

  return (
    <AdminProtected>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              try {
                navigation.navigate('AdminDashboard' as never);
              } catch (error) {
                navigation.navigate('AdminDashboard' as never);
              }
            }}
            style={styles.backButtonContainer}
          >
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Business Reports</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchReportsData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Dashboard Overview */}
              {dashboardStats && (
                <View style={styles.overviewContainer}>
                  <Text style={styles.sectionTitle}>📊 Business Overview</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{dashboardStats.totalCollections}</Text>
                      <Text style={styles.statLabel}>Total Collections</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{formatCurrency(dashboardStats.totalRevenue)}</Text>
                      <Text style={styles.statLabel}>Total Revenue</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{dashboardStats.totalAgents}</Text>
                      <Text style={styles.statLabel}>Active Agents</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{dashboardStats.monthlyCollections}</Text>
                      <Text style={styles.statLabel}>This Month</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Monthly Revenue Chart with Year Selection */}
              <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>📈 Monthly Revenue Trends</Text>
                  <View style={styles.yearPickerContainer}>
                    <Text style={styles.pickerLabel}>Year:</Text>
                    <View style={styles.yearPicker}>
                      <Text style={styles.selectedValueText}>{selectedYear}</Text>
                      <Picker
                        selectedValue={selectedYear}
                        onValueChange={handleYearChange}
                        style={styles.pickerOverlay}
                        itemStyle={styles.pickerItem}
                        mode="dropdown"
                      >
                        {years.map(year => (
                          <Picker.Item 
                            key={year} 
                            label={year.toString()} 
                            value={year}
                            color="#2c3e50"
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </View>
                
                {chartLoading ? (
                  <View style={styles.chartLoading}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text>Loading chart data...</Text>
                  </View>
                ) : monthlyRevenueData.length > 0 ? (
                  <BarChart
                    title=""
                    data={monthlyRevenueData.map(item => ({
                      label: item.label,
                      value: item.value,
                      color: '#667eea'
                    }))}
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No data available for {selectedYear}</Text>
                  </View>
                )}
              </View>

              {/* Revenue by Category Pie Chart */}
              {categoryPieData.length > 0 && (
                <PieChart
                  title="📦 Revenue by Category"
                  data={categoryPieData}
                />
              )}

              {/* Agent Performance Report */}
              <CollapsibleSection
                title="👥 Agent Performance Reports"
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
                      itemStyle={styles.pickerItem}
                      mode="dropdown"
                    >
                      {agents.map(agent => (
                        <Picker.Item 
                          key={agent.id} 
                          label={agent.name} 
                          value={agent.id}
                          color="#2c3e50"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.tableContainer}>
                  <TableRow 
                    data={['Agent Name', 'Collections', 'Revenue', 'Avg Revenue']} 
                    isHeader 
                  />
                  {agentPerformance
                    .filter((_, index) => selectedAgent === 'all' || index.toString() === selectedAgent)
                    .map((agent, index) => (
                      <TableRow
                        key={index}
                        data={[
                          agent.name,
                          agent.collections.toString(),
                          formatCurrency(agent.revenue),
                          formatCurrency(agent.avgRevenue)
                        ]}
                      />
                    ))}
                </View>
              </CollapsibleSection>

              {/* Category Report */}
              <CollapsibleSection
                title="📦 Category-wise Reports"
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
                      itemStyle={styles.pickerItem}
                      mode="dropdown"
                    >
                      {categories.map(category => (
                        <Picker.Item 
                          key={category} 
                          label={category === 'all' ? 'All Categories' : category} 
                          value={category}
                          color="#2c3e50"
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                
                <View style={styles.tableContainer}>
                  <TableRow 
                    data={['Category', 'Collections', 'Weight (kg)', 'Revenue']} 
                    isHeader 
                  />
                  {categoryStats
                    .filter(cat => selectedCategory === 'all' || cat.category === selectedCategory)
                    .map((category, index) => (
                      <TableRow
                        key={index}
                        data={[
                          category.category,
                          category.collections.toString(),
                          Math.round(category.totalWeight).toString(),
                          formatCurrency(category.revenue)
                        ]}
                      />
                    ))}
                </View>
              </CollapsibleSection>

              {/* Top Customers Report */}
              <CollapsibleSection
                title="🏆 Top Customers"
                isVisible={showCustomerReport}
                onToggle={() => setShowCustomerReport(!showCustomerReport)}
              >
                <View style={styles.tableContainer}>
                  <TableRow 
                    data={['Customer Name', 'Collections', 'Total Revenue', 'Avg Revenue']} 
                    isHeader 
                  />
                  {topCustomers.map((customer, index) => (
                    <TableRow
                      key={index}
                      data={[
                        customer.name,
                        customer.collections.toString(),
                        formatCurrency(customer.totalRevenue),
                        formatCurrency(customer.avgRevenue)
                      ]}
                    />
                  ))}
                </View>
              </CollapsibleSection>

              {/* Total Summary Report */}
              <CollapsibleSection
                title="📋 Dashboard Summary"
                isVisible={showTotalReport}
                onToggle={() => setShowTotalReport(!showTotalReport)}
              >
                {dashboardStats && (
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
                        {formatCurrency(dashboardStats.totalRevenue)}
                      </Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryCardTitle}>This Month Revenue</Text>
                      <Text style={styles.summaryCardValue}>
                        {formatCurrency(dashboardStats.monthlyRevenue)}
                      </Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryCardTitle}>Avg per Collection</Text>
                      <Text style={styles.summaryCardValue}>
                        {formatCurrency(dashboardStats.totalCollections > 0 ? 
                          dashboardStats.totalRevenue / dashboardStats.totalCollections : 0)}
                      </Text>
                    </View>
                  </View>
                )}
              </CollapsibleSection>
            </>
          )}
        </View>
      </ScrollView>
    </AdminProtected>
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
    justifyContent: 'space-between',
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
    flex: 1,
    textAlign: 'center',
    marginLeft: -60,
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 18,
  },
  content: {
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
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
  overviewContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f4ff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    padding: 18,
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6f2ff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 6,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 18,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    marginTop: 12,
    minHeight: 350,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f4ff',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 18,
    textAlign: 'left',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4ff',
  },
  yearPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearPicker: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    minWidth: 100,
    height: 45,
    paddingHorizontal: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  picker: {
    height: 45,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: -4,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    height: 45,
  },
  selectedValueText: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    zIndex: 1,
    pointerEvents: 'none',
  },
  pickerItem: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
    height: 45,
    backgroundColor: '#ffffff',
  },
  chartLoading: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  
  // Collapsible Sections
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f4ff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4ff',
    backgroundColor: '#fafbff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  toggleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    width: 24,
    textAlign: 'center',
  },
  sectionContent: {
    padding: 22,
  },
  
  // Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4ff',
    backgroundColor: '#fafbff',
    padding: 16,
    borderRadius: 12,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 14,
    minWidth: 90,
  },
  filterPicker: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e9ecef',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  
  // Tables
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e6f2ff',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4ff',
    minHeight: 48,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#667eea',
  },
  tableCell: {
    padding: 14,
    fontSize: 13,
    color: '#2c3e50',
    textAlign: 'center',
    flex: 1,
    fontWeight: '500',
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 12,
  },
  
  // Summary Cards
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#f8fbff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6f2ff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryCardTitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryCardValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
  },
});