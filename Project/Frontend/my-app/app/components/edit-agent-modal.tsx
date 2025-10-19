import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface Agent {
  id: number;
  name: string;
  email: string;
  mobile_No: string;
  address: string;
  role: string;
}

interface EditAgentModalProps {
  visible: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSave: (updatedAgent: Agent) => void;
}

export default function EditAgentModal({ visible, agent, onClose, onSave }: EditAgentModalProps) {
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    email: agent?.email || '',
    mobile_No: agent?.mobile_No || '',
    address: agent?.address || '',
    role: agent?.role || 'agent',
  });

  const handleSave = () => {
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile_No.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (agent) {
      const updatedAgent: Agent = {
        ...agent,
        ...formData,
      };
      onSave(updatedAgent);
    }
  };

  const resetForm = () => {
    if (agent) {
      setFormData({
        name: agent.name,
        email: agent.email,
        mobile_No: agent.mobile_No,
        address: agent.address,
        role: agent.role,
      });
    }
  };

  React.useEffect(() => {
    if (visible && agent) {
      resetForm();
    }
  }, [visible, agent]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Agent</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.comingSoonContainer}>
            <Text style={styles.comingSoonTitle}>🚧 Coming Soon!</Text>
            <Text style={styles.comingSoonText}>
              Edit agent functionality is currently under development.
            </Text>
            <Text style={styles.comingSoonSubtext}>
              This feature will allow you to modify agent details including:
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>• Name and contact information</Text>
              <Text style={styles.featureItem}>• Role assignments</Text>
              <Text style={styles.featureItem}>• Address updates</Text>
              <Text style={styles.featureItem}>• Status management</Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 15,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    paddingLeft: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});