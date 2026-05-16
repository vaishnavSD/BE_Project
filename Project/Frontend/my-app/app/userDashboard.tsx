import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, removeUser, isAgent } from "../src/utils/auth";
import { createRobustApiClient } from "./config/api";

interface CollectedScrap {
  id: string;
  agentname: string;
  agent_MobileNo: string;
  customername: string;
  customer_MobileNo: string;
  customerEmail: string;
  address: string;
  totalamount: number;
  paymentstatus: string;
  dateNtime: string;
}

export default function UserDashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [collectedScrap, setCollectedScrap] = useState<CollectedScrap[]>([]);
  const [showCollectedScrap, setShowCollectedScrap] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isAgent()) {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    await removeUser();
    navigation.navigate('Login' as never);
  };

  const fetchCollectedScrap = async () => {
    if (!user || !user.mobile_No) return;
    
    setLoading(true);
    try {
      const apiClient = createRobustApiClient();
      const response = await apiClient.get(`/collection/agent/${user.mobile_No}`);
      
      if (response.data && response.data.data) {
        setCollectedScrap(response.data.data);
      } else {
        setCollectedScrap([]);
      }
    } catch (error) {
      console.error('Error fetching collected scrap:', error);
      Alert.alert(
        'Error', 
        'Failed to fetch collected scrap data. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      setCollectedScrap([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowCollectedScrap = () => {
    if (!showCollectedScrap) {
      fetchCollectedScrap();
    }
    setShowCollectedScrap(!showCollectedScrap);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return '#27ae60';
      case 'pending': return '#f39c12';
      case 'unpaid': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderScrapItem = ({ item }: { item: CollectedScrap }) => (
    <View style={styles.scrapItem}>
      <View style={styles.scrapHeader}>
        <Text style={styles.scrapType}>Collection #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.paymentstatus) }]}>
          <Text style={styles.statusText}>{item.paymentstatus.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.scrapDetails}>
        <Text style={styles.detailText}>Customer: {item.customername}</Text>
        <Text style={styles.detailText}>Phone: {item.customer_MobileNo}</Text>
        <Text style={styles.detailText}>Date: {formatDate(item.dateNtime)}</Text>
        <Text style={styles.detailText}>Address: {item.address}</Text>
        <Text style={styles.amountText}>Amount: ₹{item.totalamount}</Text>
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>♻ ScrapWale</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeTitle}>Welcome, {user.name}!</Text>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.collectBtn} 
            onPress={() => navigation.navigate('AvailableRequests' as never)}
          >
            <Text style={styles.collectIcon}>📋</Text>
            <Text style={styles.collectText}>Available Requests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.pendingBtn} 
            onPress={() => navigation.navigate('PendingPickups' as never)}
          >
            <Text style={styles.pendingIcon}>⏳</Text>
            <Text style={styles.pendingText}>Pending Pickups</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.myScrapBtn} 
            onPress={handleShowCollectedScrap}
          >
            <Text style={styles.myScrapIcon}>📦</Text>
            <Text style={styles.myScrapText}>My Collections</Text>
          </TouchableOpacity>
        </View>

        {/* Collected Scrap Section */}
        {showCollectedScrap && (
          <View style={styles.collectedScrapSection}>
            <Text style={styles.sectionTitle}>My Collected Scrap</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#27ae60" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : (
              <>
                {/* Summary Cards */}
                {collectedScrap.length > 0 && (
                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryValue}>{collectedScrap.length}</Text>
                      <Text style={styles.summaryLabel}>Collections</Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryValue}>
                        {collectedScrap.filter(item => item.paymentstatus.toLowerCase() === 'paid').length}
                      </Text>
                      <Text style={styles.summaryLabel}>Paid</Text>
                    </View>
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryValue}>
                        ₹{collectedScrap.reduce((sum, item) => sum + item.totalamount, 0)}
                      </Text>
                      <Text style={styles.summaryLabel}>Total Earned</Text>
                    </View>
                  </View>
                )}

                {/* Scrap List */}
                {collectedScrap.length > 0 ? (
                  <FlatList
                    data={collectedScrap}
                    renderItem={renderScrapItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No scrap collected yet</Text>
                    <Text style={styles.emptySubtext}>Start collecting scrap to see your history here</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}


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
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e9d47',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    color: '#2c3e50',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 30,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 30,
  },
  collectBtn: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  collectIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  collectText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pendingBtn: {
    flex: 1,
    backgroundColor: '#f39c12',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pendingIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  pendingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  myScrapBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  myScrapIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  myScrapText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  collectedScrapSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  scrapItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  scrapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  scrapType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrapDetails: {
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});