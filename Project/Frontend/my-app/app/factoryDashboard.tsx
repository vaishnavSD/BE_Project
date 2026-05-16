import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, removeUser, isFactory } from "../src/utils/auth";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";

interface DashboardStats {
  pending: number;
  collected: number;
  totalCollectedAmount: number;
}

export default function FactoryDashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    pending: 0,
    collected: 0,
    totalCollectedAmount: 0
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isFactory()) {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const apiClient = createRobustApiClient();
      const response = await apiClient.get(API_ENDPOINTS.FACTORY_DASHBOARD_STATS);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await removeUser();
    navigation.navigate('Login' as never);
  };

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
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🏭 Factory Control</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>Factory Employee</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Collection Management Dashboard 📦</Text>
          <Text style={styles.welcomeSubtitle}>
            Mark scrap collections as collected by factory for processing.
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.pendingCard]}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending Collection</Text>
            </View>
            <View style={[styles.statCard, styles.collectedCard]}>
              <Text style={styles.statNumber}>{stats.collected}</Text>
              <Text style={styles.statLabel}>Collected</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.amountCard]}>
              <Text style={styles.statNumber}>₹{stats.totalCollectedAmount}</Text>
              <Text style={styles.statLabel}>Total Collected Value</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Collection Management</Text>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.primaryAction]} 
            onPress={() => navigation.navigate('FactoryReview' as never)}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📦</Text>
            </View>
            <Text style={styles.actionTitle}>Mark Collections</Text>
            <Text style={styles.actionSubtitle}>
              {stats.pending} collections ready for pickup
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.secondaryAction]}
              onPress={() => navigation.navigate('FactoryApproved' as never)}
            >
              <View style={styles.smallIconContainer}>
                <Text style={styles.smallActionIcon}>✅</Text>
              </View>
              <Text style={styles.secondaryActionText}>Collected Items</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e67e22',
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  userRole: {
    fontSize: 12,
    color: '#95a5a6',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  collectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  amountCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  quickActions: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#2c3e50',
    marginBottom: 20,
    fontWeight: '700',
  },
  actionBtn: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#e67e22',
    padding: 24,
    marginBottom: 15,
    minHeight: 120,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryAction: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
    flex: 1,
    minHeight: 100,
  },
  actionIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  smallIconContainer: {
    backgroundColor: '#e67e22',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 24,
  },
  smallActionIcon: {
    fontSize: 18,
  },
  actionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  secondaryActionText: {
    color: '#2c3e50',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});