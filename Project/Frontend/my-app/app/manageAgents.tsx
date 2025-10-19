import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";
import EditAgentModal from "./components/edit-agent-modal";
import AdminProtected from "./components/admin-protected";
import { ValidationHelpers } from "../src/utils/validation";
import ValidationError from "./components/validation-error";

interface Agent {
  id: number;
  name: string;
  email: string;
  mobile_No: string;
  address: string;
  role: string;
}

export default function ManageAgents() {
  const navigation = useNavigation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchErrors, setSearchErrors] = useState<string[]>([]);

  const apiClient = createRobustApiClient();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setError(null);
      console.log('Fetching agents from API...');
      const response = await apiClient.get(API_ENDPOINTS.USERS);
      console.log('Users API response:', response.data);
      
      // Filter to get only agents (non-admin users)
      const agentsData = Array.isArray(response.data) 
        ? response.data.filter(user => user.role !== 'admin') 
        : [];
      
      setAgents(agentsData);
      console.log('Agents loaded successfully:', agentsData.length);
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      
      let errorMessage = 'Failed to fetch agents.';
      
      if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Users endpoint not found. Please check the API configuration.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAgents();
  };

  const handleDeleteAgent = async (id: number, name: string) => {
    console.log('Delete button clicked for agent:', { id, name });
    
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete agent "${name}"?\n\nThis action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Starting delete process for agent:', name, 'ID:', id);
              console.log('Delete URL:', `${API_ENDPOINTS.USERS}/${id}`);
              
              const response = await apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`);
              console.log('Delete response:', response.data);
              
              Alert.alert("Success", `Agent "${name}" has been deleted successfully!`);
              
              // Refresh the list
              console.log('Refreshing agents list...');
              await fetchAgents();
            } catch (err: any) {
              console.error("Error deleting agent:", err);
              console.error("Error details:", {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
              });
              
              let errorMessage = 'Failed to delete agent. Please try again.';
              
              if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
              } else if (err.response?.status === 404) {
                errorMessage = 'Agent not found. It may have already been deleted.';
              } else if (err.response?.status === 403) {
                errorMessage = 'Cannot delete this user. Admin users cannot be deleted.';
              } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
              } else if (err.message.includes('timeout')) {
                errorMessage = 'Request timeout. Please check your connection and try again.';
              }
              
              Alert.alert("Delete Failed", errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditModalVisible(true);
  };

  const handleSaveAgent = async (updatedAgent: Agent) => {
    // This will be implemented when the backend update endpoint is ready
    console.log('Save agent:', updatedAgent);
    Alert.alert(
      "Coming Soon",
      "Agent update functionality will be available soon!\n\nThe backend API for updating agents is currently being developed.",
      [
        { 
          text: "OK", 
          onPress: () => {
            setEditModalVisible(false);
            setSelectedAgent(null);
          }
        }
      ]
    );
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // Validate search input
    const validation = ValidationHelpers.validateSearch(query);
    if (!validation.isValid) {
      setSearchErrors(validation.errors);
    } else {
      setSearchErrors([]);
    }
  };

  const filteredAgents = agents.filter(agent => {
    // Only filter if search is valid
    if (searchErrors.length > 0) {
      return true; // Show all agents if search is invalid
    }
    
    const matchesSearch = searchQuery === '' || 
                         agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.mobile_No.includes(searchQuery);
    
    const matchesRole = filterRole === "all" || agent.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getUniqueRoles = () => {
    const roles = [...new Set(agents.map(agent => agent.role))];
    return roles.filter(role => role !== 'admin');
  };

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
        <Text style={styles.title}>Manage Agents</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.addAgentBtn} 
            onPress={() => navigation.navigate('AgentSignup' as never)}
          >
            <Text style={styles.addAgentIcon}>👤</Text>
            <Text style={styles.addAgentText}>Add New Agent</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <TextInput
            style={[styles.searchInput, searchErrors.length > 0 && styles.searchInputError]}
            placeholder="Search agents by name, email, or mobile..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            maxLength={100}
          />
          <ValidationError errors={searchErrors} />
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Filter by role:</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity
                style={[styles.filterBtn, filterRole === "all" && styles.filterBtnActive]}
                onPress={() => setFilterRole("all")}
              >
                <Text style={[styles.filterBtnText, filterRole === "all" && styles.filterBtnTextActive]}>
                  All ({agents.length})
                </Text>
              </TouchableOpacity>
              {getUniqueRoles().map(role => (
                <TouchableOpacity
                  key={role}
                  style={[styles.filterBtn, filterRole === role && styles.filterBtnActive]}
                  onPress={() => setFilterRole(role)}
                >
                  <Text style={[styles.filterBtnText, filterRole === role && styles.filterBtnTextActive]}>
                    {role} ({agents.filter(a => a.role === role).length})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading agents...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAgents}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredAgents.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {searchQuery || filterRole !== "all" ? "No agents match your search" : "No agents found"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || filterRole !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Add your first agent to get started"}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{filteredAgents.length}</Text>
                <Text style={styles.statLabel}>
                  {searchQuery || filterRole !== "all" ? "Filtered" : "Total"} Agents
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getUniqueRoles().length}</Text>
                <Text style={styles.statLabel}>Roles</Text>
              </View>
            </View>

            {filteredAgents.map((agent) => (
              <View key={agent.id} style={styles.agentCard}>
                <View style={styles.agentHeader}>
                  <View style={styles.agentInfo}>
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>{agent.role}</Text>
                    </View>
                  </View>
                  <Text style={styles.agentId}>ID: #{agent.id}</Text>
                </View>

                <View style={styles.agentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📧 Email:</Text>
                    <Text style={styles.detailValue}>{agent.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📱 Mobile:</Text>
                    <Text style={styles.detailValue}>{agent.mobile_No}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Address:</Text>
                    <Text style={styles.detailValue}>{agent.address}</Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => handleEditAgent(agent)}
                  >
                    <Text style={styles.actionBtnText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteAgent(agent.id, agent.name)}
                  >
                    <Text style={styles.actionBtnText}>🗑 Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      <EditAgentModal
        visible={editModalVisible}
        agent={selectedAgent}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedAgent(null);
        }}
        onSave={handleSaveAgent}
      />
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
  actionSection: {
    marginBottom: 20,
  },
  addAgentBtn: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addAgentIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  addAgentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
  },
  searchInputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  filterSection: {
    marginTop: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterBtnActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterBtnText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  filterBtnTextActive: {
    color: 'white',
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
    color: '#667eea',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textTransform: 'uppercase',
    fontWeight: '600',
    textAlign: 'center',
  },
  agentCard: {
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
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  agentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 10,
  },
  roleBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  agentId: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  agentDetails: {
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
    width: 80,
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
  editBtn: {
    backgroundColor: '#f39c12',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});