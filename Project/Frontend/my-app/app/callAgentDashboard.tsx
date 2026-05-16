import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput, Modal } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, removeUser } from "../src/utils/auth";
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

export default function CallAgentDashboard() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ScrapRequest | null>(null);
  const [notes, setNotes] = useState("");

  const apiClient = createRobustApiClient();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'call_agent') {
      navigation.navigate('Login' as never);
      return;
    }
    setUser(currentUser);
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.USER_REQUESTS_GET);
      // Show only pending requests for call agent
      const pendingRequests = response.data.filter((req: ScrapRequest) => req.status === 'Pending');
      setRequests(pendingRequests);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApproveRequest = (request: ScrapRequest) => {
    setSelectedRequest(request);
    setNotes("");
    setModalVisible(true);
  };

  const confirmApproval = async () => {
    if (!selectedRequest || !user) return;

    try {
      await apiClient.put(
        `${API_ENDPOINTS.USER_REQUESTS}/${selectedRequest.id}/call-agent-approve`,
        {
          callAgentId: user.id,
          notes: notes
        }
      );
      
      Alert.alert('Success', 'Request approved successfully! Agent can now accept this request.');
      setModalVisible(false);
      setSelectedRequest(null);
      setNotes("");
      fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (id: number) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.put(`${API_ENDPOINTS.USER_REQUESTS}/${id}`, { status: 'Rejected' });
              Alert.alert('Success', 'Request rejected');
              fetchRequests();
            } catch (error: any) {
              console.error('Error rejecting request:', error);
              Alert.alert('Error', 'Failed to reject request');
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await removeUser();
    navigation.navigate('Login' as never);
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>📞 Call Agent</Text>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>Call Agent</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Pending Customer Requests 📋</Text>
          <Text style={styles.welcomeSubtitle}>
            Call customers to verify their requests and approve them for agent pickup
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
            <Text style={styles.emptyText}>No pending requests</Text>
            <Text style={styles.emptySubtext}>New customer requests will appear here</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{requests.length}</Text>
                <Text style={styles.statLabel}>Pending Calls</Text>
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
                    <Text style={styles.statusText}>Pending</Text>
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
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApproveRequest(request)}
                  >
                    <Text style={styles.actionBtnText}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleRejectRequest(request.id)}
                  >
                    <Text style={styles.actionBtnText}>✗ Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Approval Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Approve Request</Text>
            <Text style={styles.modalSubtitle}>
              Customer: {selectedRequest?.name}
            </Text>
            
            <Text style={styles.inputLabel}>Call Notes (Optional):</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add notes about the call..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={confirmApproval}
              >
                <Text style={styles.modalBtnText}>Confirm Approval</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 15,
  },
  welcomeSection: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 22,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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
    color: '#667eea',
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
    backgroundColor: '#f39c12',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#27ae60',
  },
  rejectBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#95a5a6',
  },
  confirmBtn: {
    backgroundColor: '#27ae60',
  },
  modalBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
