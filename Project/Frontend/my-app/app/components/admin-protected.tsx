import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { getCurrentUser, isAdmin } from '../../src/utils/auth';
import { ValidationHelpers } from '../../src/utils/validation';

interface AdminProtectedProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

export default function AdminProtected({ children, fallbackRoute = '/login' }: AdminProtectedProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const user = getCurrentUser();
        const validation = ValidationHelpers.validateAdminAccess(user);
        
        if (!validation.isValid) {
          console.log('Admin access denied:', validation.errors);
          router.replace(fallbackRoute);
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.replace(fallbackRoute);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [fallbackRoute]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Verifying access...</Text>
      </View>
    );
  }

  if (!isAuthorized) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🚫</Text>
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorMessage}>
          You don't have permission to access this page.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
});