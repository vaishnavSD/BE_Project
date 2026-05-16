import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from "../src/utils/auth";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";

interface ScrapRequest {
  id: number;
  name: string;
  mobile_No: string;
  address: string;
  email: string;
  pickUp_Date: string;
  time_slot: string;
  description: string;
  status: string;
  call_agent_notes?: string;
}

export default function AvailableRequests() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiClient = createRobustApiClient();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'agent') {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError(null);
      const response = await apiClient.get(`${API_ENDPOINTS.USER_REQUESTS}/approved`);
      setRequests(response.data);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptRequest = async (requestId: number, customerName: string) => {
    if (!user) return;

    Alert.alert(
      'Accept Request',
      `Do you want to accept this request from ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await apiClient.put(
                `${API_ENDPOINTS.USER_REQUESTS}/${requestId}/agent-accept`,
                { agentId: user.id }
              );
              
              Alert.alert(
                'Success',
                'Request accepted! You can now collect scrap from this customer.',
                [
                  {
                    text: 'Collect Now',
                    onPress: () => navigation.navigate('ScrapCollection' as never, { requestId })
                  },
                  {
                    text: 'OK',
                    onPress: () => fetchRequests()
                  }
                ]
              );
            } catch (error: any) {
              console.error('Error accepting request:', error);
              Alert.alert('Error', 'Failed to accept request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('UserDashboard' as never)}
          style={styles.backButtonContainer}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Available Requests</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📋 Approved Requests</Text>
          <Text style={styles.infoSubtitle}>
            These requests have been verified by call agents. Accept a request to start collection.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No available requests</Text>
            <Text style={styles.emptySubtext}>
              New approved requests will appear here
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{requests.length}</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
            </View>

            {requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{request.name}</Text>
                    <Text style={styles.requestId}>ID: #{request.id}</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Verified</Text>
                  </View>
                </View>

                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📱 Mobile:</Text>
                    <Text style={styles.detailValue}>{request.mobile_No}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📧 Email:</Text>
                    <Text style={styles.detailValue}>{request.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Address:</Text>
                    <Text style={styles.detailValue}>{request.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Pickup Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(request.pickUp_Date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>⏰ Time Slot:</Text>
                    <Text style={styles.detailValue}>{request.time_slot}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📝 Description:</Text>
                    <Text style={styles.detailValue}>{request.description}</Text>
                  </View>
                  {request.call_agent_notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>📞 Call Agent Notes:</Text>
                      <Text style={styles.notesValue}>{request.call_agent_notes}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAcceptRequest(request.id, request.name)}
                >
                  <Text style={styles.acceptButtonText}>✓ Accept Request</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
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
  infoSection: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
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
  emptyText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  requestId: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#27ae60',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  requestDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
    width: 100,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    flexWrap: 'wrap',
  },
  notesContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f39c12',
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 5,
  },
  notesValue: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  acceptButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
