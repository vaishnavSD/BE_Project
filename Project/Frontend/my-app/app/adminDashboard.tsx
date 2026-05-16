import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, removeUser, isAdmin } from "../src/utils/auth";
import AdminProtected from "./components/admin-protected";

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isAdmin()) {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
  }, []);

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
    <AdminProtected>
      <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>♻ ScrapWale</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>Administrator</Text>
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
          <Text style={styles.welcomeTitle}>Welcome back, {user.name}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Here's what's happening with your scrap collection business today.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Manage your business operations efficiently</Text>
          
          {/* Primary Actions Row */}
          <View style={styles.primaryActionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.primaryAction]} onPress={() => navigation.navigate('ViewRequests' as never)}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📝</Text>
              </View>
              <Text style={styles.actionTitle}>View Requests</Text>
              <Text style={styles.actionSubtitle}>Manage customer requests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.primaryAction]} onPress={() => navigation.navigate('ViewCollections' as never)}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🚚</Text>
              </View>
              <Text style={styles.actionTitle}>Collections</Text>
              <Text style={styles.actionSubtitle}>Track pickup schedules</Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Actions Grid */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryAction]} onPress={() => navigation.navigate('AddEmployee' as never)}>
              <View style={styles.smallIconContainer}>
                <Text style={styles.smallActionIcon}>➕</Text>
              </View>
              <Text style={styles.secondaryActionText}>Add Employee</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryAction]} onPress={() => navigation.navigate('ManageAgents' as never)}>
              <View style={styles.smallIconContainer}>
                <Text style={styles.smallActionIcon}>👥</Text>
              </View>
              <Text style={styles.secondaryActionText}>Manage Staff</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryAction]} onPress={() => navigation.navigate('ScrapDetails' as never)}>
              <View style={styles.smallIconContainer}>
                <Text style={styles.smallActionIcon}>📋</Text>
              </View>
              <Text style={styles.secondaryActionText}>Scrap Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.secondaryAction]} onPress={() => navigation.navigate('Reports' as never)}>
              <View style={styles.smallIconContainer}>
                <Text style={styles.smallActionIcon}>📊</Text>
              </View>
              <Text style={styles.secondaryActionText}>Reports</Text>
            </TouchableOpacity>

          </View>
        </View>
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
    color: '#667eea',
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
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#2c3e50',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
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
    fontSize: 24,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 25,
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    backgroundColor: '#667eea',
    padding: 24,
    flex: 1,
    minHeight: 140,
  },
  secondaryAction: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
    width: '48%',
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
    backgroundColor: '#667eea',
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