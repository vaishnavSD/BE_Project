import React, { useState } from "react";
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Modal 
} from "react-native";
import { router } from "expo-router";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";
import { saveUser } from "../src/utils/auth";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("agent");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate inputs
    if (!mobile.trim()) {
      setError("Please enter your mobile number");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    if (!role) {
      setError("Please select your role");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const robustClient = createRobustApiClient();
      const response = await robustClient.post(API_ENDPOINTS.LOGIN, {
        mobile_No: mobile,
        password: password,
      });

      if (response.data.user) {
        // Check if the role matches
        if (response.data.user.role !== role) {
          setError(`Invalid role. You are registered as ${response.data.user.role}`);
          setLoading(false);
          return;
        }

        // Save user data to storage
        await saveUser(response.data.user);

        // Navigate based on role
        if (role === "admin") {
          router.replace("/adminDashboard");
        } else {
          router.replace("/userDashboard");
        }
      } else {
        setError("Invalid login response from server");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message === "Unable to connect to server") {
        setError("Unable to connect to server. Please check your internet connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your credentials to access your account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Mobile Number</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.fieldLabel}>Password</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Text style={styles.fieldLabel}>Role</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleButton, role === "agent" && styles.roleButtonActive]}
            onPress={() => setRole("agent")}
          >
            <Text style={[styles.roleText, role === "agent" && styles.roleTextActive]}>Agent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === "admin" && styles.roleButtonActive]}
            onPress={() => setRole("admin")}
          >
            <Text style={[styles.roleText, role === "admin" && styles.roleTextActive]}>Admin</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.push("/Home")}
        >
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <TouchableOpacity style={styles.closeBtn} onPress={closePopup}>
              <Text style={styles.closeBtnText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.popupTitle}>Forgot Password?</Text>
            <Text style={styles.popupMessage}>
              Please contact your administrator to reset your password.
            </Text>
            <View style={styles.popupContact}>
              <Text style={styles.contactText}>📧 Email: admin@scrapwale.com</Text>
              <Text style={styles.contactText}>📞 Phone: +91 98765 43210</Text>
            </View>
            <TouchableOpacity style={styles.popupBtn} onPress={closePopup}>
              <Text style={styles.popupBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginBox: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 60,
    padding: 35,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 14,
    fontSize: 20,
    opacity: 0.5,
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 14,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    fontSize: 14,
    color: '#2c3e50',
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#2c3e50',
  },
  roleText: {
    fontSize: 14,
    color: '#95a5a6',
    fontWeight: '500',
  },
  roleTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotLink: {
    marginTop: 18,
    color: '#95a5a6',
    fontSize: 14,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#1e9d47',
    fontSize: 16,
    fontWeight: '500',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popupBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 24,
    color: '#95a5a6',
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  popupMessage: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
    lineHeight: 22,
    textAlign: 'center',
  },
  popupContact: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  contactText: {
    fontSize: 14,
    color: '#2c3e50',
    marginVertical: 4,
  },
  popupBtn: {
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  popupBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
