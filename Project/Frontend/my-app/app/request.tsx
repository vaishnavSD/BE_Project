import React, { useState } from "react";
import { 
    ScrollView, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert 
} from "react-native";
import { router } from "expo-router";
import { createRobustApiClient, API_ENDPOINTS } from "./config/api";

export default function Request() {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        address: "",
        pickupDate: "",
        timeSlot: "",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timeSlots = [
        "8:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM",
        "12:00 PM - 2:00 PM",
        "2:00 PM - 4:00 PM",
        "4:00 PM - 6:00 PM",
    ];

    const handleSubmit = async () => {
        // Validate form data
        if (!formData.name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return;
        }
        if (!formData.mobile.trim()) {
            Alert.alert("Error", "Please enter your mobile number");
            return;
        }
        if (!/^\d{10,15}$/.test(formData.mobile.trim())) {
            Alert.alert("Error", "Please enter a valid mobile number (10-15 digits)");
            return;
        }
        if (!formData.email.trim()) {
            Alert.alert("Error", "Please enter your email");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }
        if (!formData.address.trim()) {
            Alert.alert("Error", "Please enter your address");
            return;
        }
        if (!formData.pickupDate.trim()) {
            Alert.alert("Error", "Please enter pickup date");
            return;
        }
        if (!formData.timeSlot) {
            Alert.alert("Error", "Please select a time slot");
            return;
        }
        if (!formData.description.trim()) {
            Alert.alert("Error", "Please enter description");
            return;
        }

        setIsSubmitting(true);

        try {
            const requestData = {
                name: formData.name.trim(),
                mobile_No: formData.mobile.trim(),
                email: formData.email.trim(),
                address: formData.address.trim(),
                pickUp_Date: formData.pickupDate.trim(),
                time_slot: formData.timeSlot,
                description: formData.description.trim()
            };

            console.log("Submitting request data:", requestData);

            const apiClient = createRobustApiClient();
            const response = await apiClient.post('/userRequests/add', requestData);

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Booking submitted successfully! We'll contact you soon.");
                // Reset form
                setFormData({
                    name: "",
                    mobile: "",
                    email: "",
                    address: "",
                    pickupDate: "",
                    timeSlot: "",
                    description: "",
                });
            } else {
                throw new Error(`Unexpected status code: ${response.status}`);
            }
        } catch (error: any) {
            console.error("Error submitting booking:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config?.url
            });
            
            let errorMessage = "Failed to submit booking. Please try again.";
            
            if (error.response?.data?.errors) {
                errorMessage = error.response.data.errors;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message === "Unable to connect to server") {
                errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
            }
            
            Alert.alert("Error", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/Home')}>
                    <Text style={styles.backButton}>← Back to Home</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.bookingContainer}>
                <View style={styles.iconHeader}>
                    <Text style={styles.trashIcon}>🗑️</Text>
                </View>

                <Text style={styles.pageTitle}>Scrap Collection Booking</Text>
                <Text style={styles.pageSubtitle}>Schedule a pickup for your recyclable materials</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Name *</Text>
                    <TextInput
                        style={styles.formInput}
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({...formData, name: text})}
                    />
                </View>

                <View style={styles.formRow}>
                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Mobile No *</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="Enter mobile number"
                            value={formData.mobile}
                            onChangeText={(text) => setFormData({...formData, mobile: text})}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Email *</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="Enter email address"
                            value={formData.email}
                            onChangeText={(text) => setFormData({...formData, email: text})}
                            keyboardType="email-address"
                        />
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Address *</Text>
                    <TextInput
                        style={[styles.formInput, styles.textArea]}
                        placeholder="Enter your complete address"
                        value={formData.address}
                        onChangeText={(text) => setFormData({...formData, address: text})}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View style={styles.formRow}>
                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Pickup Date *</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="YYYY-MM-DD (e.g., 2024-01-20)"
                            value={formData.pickupDate}
                            onChangeText={(text) => setFormData({...formData, pickupDate: text})}
                        />
                    </View>

                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Time Slot *</Text>
                        <View style={styles.pickerContainer}>
                            {timeSlots.map((slot, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.timeSlotButton,
                                        formData.timeSlot === slot && styles.timeSlotButtonActive
                                    ]}
                                    onPress={() => setFormData({...formData, timeSlot: slot})}
                                >
                                    <Text style={[
                                        styles.timeSlotText,
                                        formData.timeSlot === slot && styles.timeSlotTextActive
                                    ]}>
                                        {slot}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Description About Your Scrap *</Text>
                    <TextInput
                        style={[styles.formInput, styles.textArea]}
                        placeholder="Describe the type and quantity of scrap materials"
                        value={formData.description}
                        onChangeText={(text) => setFormData({...formData, description: text})}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    <Text style={styles.submitBtnText}>
                        {isSubmitting ? "Submitting..." : "Book Scrap Collection"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f5e9',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    backButton: {
        color: '#1e9d47',
        fontSize: 16,
        fontWeight: '500',
    },
    bookingContainer: {
        backgroundColor: 'white',
        margin: 20,
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    iconHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    trashIcon: {
        fontSize: 48,
        color: '#1e9d47',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 10,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#95a5a6',
        textAlign: 'center',
        marginBottom: 30,
    },
    formGroup: {
        marginBottom: 20,
    },
    formGroupHalf: {
        flex: 1,
        marginBottom: 20,
    },
    formRow: {
        flexDirection: 'row',
        gap: 15,
    },
    formLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: '#2c3e50',
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        fontSize: 14,
        color: '#2c3e50',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        gap: 8,
    },
    timeSlotButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 5,
    },
    timeSlotButtonActive: {
        backgroundColor: '#1e9d47',
    },
    timeSlotText: {
        fontSize: 12,
        color: '#2c3e50',
        textAlign: 'center',
    },
    timeSlotTextActive: {
        color: 'white',
    },
    submitBtn: {
        backgroundColor: '#1e9d47',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    submitBtnDisabled: {
        backgroundColor: '#95a5a6',
        opacity: 0.7,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '600',
    },
});