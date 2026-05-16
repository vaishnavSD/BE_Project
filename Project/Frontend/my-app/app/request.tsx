import React, { useState, useEffect, useCallback } from "react";
import { 
    ScrollView, 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Alert,
    ActivityIndicator,
    Dimensions,
    Platform,
    Modal
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { dataService, TimeSlot } from "./services/dataService";

const { width } = Dimensions.get('window');

export default function Request() {
    const navigation = useNavigation();
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        address: "",
        pickupDate: "",
        timeSlot: "",
        description: "",
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

    // Load time slots when component mounts or date changes
    const loadTimeSlots = useCallback(async (date?: string) => {
        if (!date) return;
        
        setIsLoadingTimeSlots(true);
        try {
            const slots = await dataService.getTimeSlots(date);
            setTimeSlots(slots);
        } catch (error) {
            console.error('Error loading time slots:', error);
            // Fallback to default slots
            setTimeSlots([
                { id: '1', slot: '8:00 AM - 10:00 AM', available: true },
                { id: '2', slot: '10:00 AM - 12:00 PM', available: true },
                { id: '3', slot: '12:00 PM - 2:00 PM', available: true },
                { id: '4', slot: '2:00 PM - 4:00 PM', available: true },
                { id: '5', slot: '4:00 PM - 6:00 PM', available: true },
            ]);
        } finally {
            setIsLoadingTimeSlots(false);
        }
    }, []);

    // Load initial time slots
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        loadTimeSlots(tomorrow.toISOString().split('T')[0]);
    }, [loadTimeSlots]);

    // Load time slots when pickup date changes
    useEffect(() => {
        if (formData.pickupDate) {
            loadTimeSlots(formData.pickupDate);
        }
    }, [formData.pickupDate, loadTimeSlots]);

    const scrapTypes = [
        "Paper & Cardboard",
        "Plastic Bottles",
        "Metal Cans",
        "Electronics",
        "Glass",
        "Mixed Materials"
    ];

    const validateField = (field: string, value: string) => {
        const newErrors = { ...errors };
        
        switch (field) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = "Name is required";
                } else if (value.trim().length < 2) {
                    newErrors.name = "Name must be at least 2 characters";
                } else {
                    delete newErrors.name;
                }
                break;
            case 'mobile':
                if (!value.trim()) {
                    newErrors.mobile = "Mobile number is required";
                } else if (!/^\d{10,15}$/.test(value.trim())) {
                    newErrors.mobile = "Enter a valid mobile number (10-15 digits)";
                } else {
                    delete newErrors.mobile;
                }
                break;
            case 'email':
                if (!value.trim()) {
                    newErrors.email = "Email is required";
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                    newErrors.email = "Enter a valid email address";
                } else {
                    delete newErrors.email;
                }
                break;
            case 'address':
                if (!value.trim()) {
                    newErrors.address = "Address is required";
                } else if (value.trim().length < 10) {
                    newErrors.address = "Please provide a complete address";
                } else {
                    delete newErrors.address;
                }
                break;
            case 'pickupDate':
                if (!value.trim()) {
                    newErrors.pickupDate = "Pickup date is required";
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Check if date is valid
                    if (isNaN(selectedDate.getTime())) {
                        newErrors.pickupDate = "Please enter a valid date";
                    } else if (selectedDate < today) {
                        newErrors.pickupDate = "Pickup date cannot be in the past";
                    } else {
                        // Check if date is too far in the future (optional - limit to 30 days)
                        const maxDate = new Date();
                        maxDate.setDate(maxDate.getDate() + 30);
                        if (selectedDate > maxDate) {
                            newErrors.pickupDate = "Pickup date cannot be more than 30 days from today";
                        } else {
                            delete newErrors.pickupDate;
                        }
                    }
                }
                break;
            case 'description':
                if (!value.trim()) {
                    newErrors.description = "Description is required";
                } else if (value.trim().length < 10) {
                    newErrors.description = "Please provide more details about your scrap";
                } else {
                    delete newErrors.description;
                }
                break;
        }
        
        setErrors(newErrors);
    };

    const updateFormData = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        validateField(field, value);
    };

    const formatDateForInput = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const formatDateForDisplay = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getNextSevenDays = () => {
        const days = [];
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            days.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                }),
                fullLabel: date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })
            });
        }
        return days;
    };

    // Calendar component functions
    const getCurrentMonth = () => {
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth()
        };
    };

    const [currentCalendarMonth, setCurrentCalendarMonth] = useState(getCurrentMonth());

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const isDateDisabled = (year: number, month: number, day: number) => {
        const date = new Date(year, month, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const formatCalendarDate = (year: number, month: number, day: number) => {
        const date = new Date(year, month, day);
        return date.toISOString().split('T')[0];
    };

    const generateCalendarDays = () => {
        const { year, month } = currentCalendarMonth;
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push({
                day,
                date: formatCalendarDate(year, month, day),
                disabled: isDateDisabled(year, month, day),
                isToday: formatCalendarDate(year, month, day) === new Date().toISOString().split('T')[0]
            });
        }

        return days;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentCalendarMonth(prev => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();
            
            let newMonth = direction === 'next' ? prev.month + 1 : prev.month - 1;
            let newYear = prev.year;
            
            if (newMonth > 11) {
                newYear = prev.year + 1;
                newMonth = 0;
            } else if (newMonth < 0) {
                newYear = prev.year - 1;
                newMonth = 11;
            }
            
            // Prevent going to past months
            if (newYear < currentYear || (newYear === currentYear && newMonth < currentMonth)) {
                return prev;
            }
            
            // Prevent going too far in the future (limit to 12 months)
            const maxYear = currentYear + 1;
            if (newYear > maxYear || (newYear === maxYear && newMonth > currentMonth)) {
                return prev;
            }
            
            return { year: newYear, month: newMonth };
        });
    };

    const getMonthName = (month: number) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[month];
    };

    const CalendarModal = () => (
        <Modal
            visible={showCalendarModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCalendarModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity 
                            onPress={() => navigateMonth('prev')}
                            style={styles.calendarNavButton}
                        >
                            <Text style={styles.calendarNavText}>‹</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.calendarTitle}>
                            {getMonthName(currentCalendarMonth.month)} {currentCalendarMonth.year}
                        </Text>
                        
                        <TouchableOpacity 
                            onPress={() => navigateMonth('next')}
                            style={styles.calendarNavButton}
                        >
                            <Text style={styles.calendarNavText}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.calendarWeekDays}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.calendarGrid}>
                        {generateCalendarDays().map((dayData, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.calendarDay,
                                    dayData?.disabled && styles.calendarDayDisabled,
                                    dayData?.isToday && styles.calendarDayToday,
                                    formData.pickupDate === dayData?.date && styles.calendarDaySelected
                                ]}
                                onPress={() => {
                                    if (dayData && !dayData.disabled) {
                                        updateFormData('pickupDate', dayData.date);
                                        setShowCalendarModal(false);
                                    }
                                }}
                                disabled={!dayData || dayData.disabled}
                            >
                                <Text style={[
                                    styles.calendarDayText,
                                    dayData?.disabled && styles.calendarDayTextDisabled,
                                    dayData?.isToday && styles.calendarDayTextToday,
                                    formData.pickupDate === dayData?.date && styles.calendarDayTextSelected
                                ]}>
                                    {dayData?.day || ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.calendarFooter}>
                        <TouchableOpacity 
                            onPress={() => setShowCalendarModal(false)}
                            style={styles.calendarCancelButton}
                        >
                            <Text style={styles.calendarCancelText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => {
                                const today = new Date();
                                today.setDate(today.getDate() + 1);
                                updateFormData('pickupDate', today.toISOString().split('T')[0]);
                                setShowCalendarModal(false);
                            }}
                            style={styles.calendarTodayButton}
                        >
                            <Text style={styles.calendarTodayText}>Tomorrow</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const handleSubmit = async () => {
        // Validate all fields
        Object.keys(formData).forEach(field => {
            validateField(field, formData[field as keyof typeof formData]);
        });

        if (!formData.timeSlot) {
            setErrors(prev => ({ ...prev, timeSlot: "Please select a time slot" }));
        }

        // Check if there are any errors
        const hasErrors = Object.keys(errors).length > 0 || !formData.timeSlot;
        if (hasErrors) {
            Alert.alert("Validation Error", "Please fix all errors before submitting");
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

            const result = await dataService.submitUserRequest(requestData);

            if (result.success) {
                Alert.alert(
                    "Success! 🎉", 
                    result.message,
                    [
                        {
                            text: "Go to Home",
                            onPress: () => {
                                resetForm();
                                navigation.navigate('Home' as never);
                            }
                        },
                        {
                            text: "Book Another",
                            onPress: () => {
                                resetForm();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Error", result.message);
            }
        } catch (error: any) {
            console.error("Unexpected error:", error);
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            mobile: "",
            email: "",
            address: "",
            pickupDate: "",
            timeSlot: "",
            description: "",
        });
        setErrors({});
    };

    const handleBackToHome = () => {
        navigation.navigate('Home' as never);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackToHome}>
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
                        style={[styles.formInput, errors.name && styles.formInputError]}
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChangeText={(text) => updateFormData('name', text)}
                        placeholderTextColor="#95a5a6"
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.formRow}>
                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Mobile No *</Text>
                        <TextInput
                            style={[styles.formInput, errors.mobile && styles.formInputError]}
                            placeholder="Enter mobile number"
                            value={formData.mobile}
                            onChangeText={(text) => updateFormData('mobile', text)}
                            keyboardType="phone-pad"
                            placeholderTextColor="#95a5a6"
                        />
                        {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
                    </View>

                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Email *</Text>
                        <TextInput
                            style={[styles.formInput, errors.email && styles.formInputError]}
                            placeholder="Enter email address"
                            value={formData.email}
                            onChangeText={(text) => updateFormData('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#95a5a6"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Address *</Text>
                    <TextInput
                        style={[styles.formInput, styles.textArea, errors.address && styles.formInputError]}
                        placeholder="Enter your complete address with landmarks"
                        value={formData.address}
                        onChangeText={(text) => updateFormData('address', text)}
                        multiline
                        numberOfLines={3}
                        placeholderTextColor="#95a5a6"
                    />
                    {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                </View>

                <View style={styles.formRow}>
                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Pickup Date *</Text>
                        
                        {/* Quick Date Selection */}
                        <View style={styles.quickDateContainer}>
                            {getNextSevenDays().slice(0, 3).map((day, index) => (
                                <View {...({key: `quickdate-${index}`} as any)} style={{flex: 1}}>
                                    <TouchableOpacity
                                        style={[
                                            styles.quickDateButton,
                                            formData.pickupDate === day.value && styles.quickDateButtonActive
                                        ]}
                                        onPress={() => updateFormData('pickupDate', day.value)}
                                    >
                                        <Text style={[
                                            styles.quickDateText,
                                            formData.pickupDate === day.value && styles.quickDateTextActive
                                        ]}>
                                            {day.label}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {/* Calendar Button */}
                        <TouchableOpacity 
                            style={[styles.calendarButton, errors.pickupDate && styles.formInputError]}
                            onPress={() => setShowCalendarModal(true)}
                        >
                            <Text style={[
                                styles.calendarButtonText,
                                formData.pickupDate ? styles.calendarButtonTextSelected : styles.calendarButtonTextPlaceholder
                            ]}>
                                {formData.pickupDate ? formatDateForDisplay(formData.pickupDate) : 'Select date from calendar'}
                            </Text>
                            <Text style={styles.calendarButtonIcon}>📅</Text>
                        </TouchableOpacity>

                        {/* Custom Date Input */}
                        <TouchableOpacity 
                            style={[styles.dateInputButton, errors.pickupDate && styles.formInputError]}
                            onPress={() => setShowDatePicker(!showDatePicker)}
                        >
                            <Text style={[
                                styles.dateInputText,
                                formData.pickupDate ? styles.dateInputTextSelected : styles.dateInputTextPlaceholder
                            ]}>
                                {formData.pickupDate ? formatDateForDisplay(formData.pickupDate) : 'Or select custom date'}
                            </Text>
                            <Text style={styles.dateInputIcon}>📝</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <View style={styles.customDatePicker}>
                                <Text style={styles.customDateTitle}>Select Date:</Text>
                                <View style={styles.customDateGrid}>
                                    {getNextSevenDays().map((day, index) => (
                                        <View {...({key: `customdate-${index}`} as any)} style={{minWidth: '30%'}}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.customDateItem,
                                                    formData.pickupDate === day.value && styles.customDateItemActive
                                                ]}
                                                onPress={() => {
                                                    updateFormData('pickupDate', day.value);
                                                    setShowDatePicker(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.customDateItemText,
                                                    formData.pickupDate === day.value && styles.customDateItemTextActive
                                                ]}>
                                                    {day.label}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                                <TextInput
                                    style={styles.manualDateInput}
                                    placeholder="Or enter manually (YYYY-MM-DD)"
                                    value={formData.pickupDate}
                                    onChangeText={(text) => updateFormData('pickupDate', text)}
                                    placeholderTextColor="#95a5a6"
                                />
                            </View>
                        )}

                        {errors.pickupDate && <Text style={styles.errorText}>{errors.pickupDate}</Text>}
                        {!errors.pickupDate && (
                            <Text style={styles.helperText}>
                                📅 Select a date from tomorrow up to 30 days ahead
                            </Text>
                        )}
                    </View>

                    <View style={styles.formGroupHalf}>
                        <Text style={styles.formLabel}>Time Slot *</Text>
                        {isLoadingTimeSlots ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#16a34a" />
                                <Text style={styles.loadingText}>Loading available slots...</Text>
                            </View>
                        ) : (
                            <View style={styles.pickerContainer}>
                                {timeSlots.map((slot, index) => {
                                    const isSelected = formData.timeSlot === slot.slot;
                                    const isAvailable = slot.available;
                                    
                                    return (
                                        <View {...({key: `timeslot-${index}`} as any)} style={styles.timeSlotWrapper}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.timeSlotButton,
                                                    isSelected && styles.timeSlotButtonActive,
                                                    !isAvailable && styles.timeSlotButtonDisabled
                                                ]}
                                                onPress={() => {
                                                    if (isAvailable) {
                                                        setFormData({...formData, timeSlot: slot.slot});
                                                        setErrors(prev => {
                                                            const newErrors = { ...prev };
                                                            delete newErrors.timeSlot;
                                                            return newErrors;
                                                        });
                                                    }
                                                }}
                                                disabled={!isAvailable}
                                            >
                                                <Text style={[
                                                    styles.timeSlotText,
                                                    isSelected && styles.timeSlotTextActive,
                                                    !isAvailable && styles.timeSlotTextDisabled
                                                ]}>
                                                    {slot.slot}
                                                    {!isAvailable && ' (Full)'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                        {errors.timeSlot && <Text style={styles.errorText}>{errors.timeSlot}</Text>}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Scrap Type & Description *</Text>
                    <View style={styles.scrapTypesContainer}>
                        {scrapTypes.map((type, index) => {
                            return (
                                <View {...({key: `scraptype-${index}`} as any)} style={styles.scrapTypeWrapper}>
                                    <TouchableOpacity
                                        style={[
                                            styles.scrapTypeChip,
                                            formData.description.includes(type) && styles.scrapTypeChipActive
                                        ]}
                                        onPress={() => {
                                            const currentDesc = formData.description;
                                            let newDesc: string;
                                            if (currentDesc.includes(type)) {
                                                newDesc = currentDesc.replace(type, '').replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
                                            } else {
                                                newDesc = currentDesc ? `${currentDesc}, ${type}` : type;
                                            }
                                            updateFormData('description', newDesc);
                                        }}
                                    >
                                        <Text style={[
                                            styles.scrapTypeText,
                                            formData.description.includes(type) && styles.scrapTypeTextActive
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                    <TextInput
                        style={[styles.formInput, styles.textArea, errors.description && styles.formInputError]}
                        placeholder="Describe quantity, condition, and any additional details about your scrap materials"
                        value={formData.description}
                        onChangeText={(text) => updateFormData('description', text)}
                        multiline
                        numberOfLines={4}
                        placeholderTextColor="#95a5a6"
                    />
                    {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                </View>

                <TouchableOpacity 
                    style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <View style={styles.submitBtnContent}>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={styles.submitBtnText}>Submitting...</Text>
                        </View>
                    ) : (
                        <Text style={styles.submitBtnText}>
                            📅 Book Scrap Collection
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>💡 Quick Tips</Text>
                    <Text style={styles.infoText}>• Clean and sort your materials for better rates</Text>
                    <Text style={styles.infoText}>• We provide free pickup for orders above 50kg</Text>
                    <Text style={styles.infoText}>• Payment is made on the spot after weighing</Text>
                </View>
            </View>

            <CalendarModal />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fffe',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(30, 157, 71, 0.1)',
    },
    backButton: {
        color: '#1e9d47',
        fontSize: 16,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    bookingContainer: {
        backgroundColor: 'white',
        margin: 16,
        padding: 28,
        borderRadius: 24,
        shadowColor: '#1e9d47',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(30, 157, 71, 0.08)',
    },
    iconHeader: {
        alignItems: 'center',
        marginBottom: 28,
        backgroundColor: 'linear-gradient(135deg, #e8f5e9 0%, #f0f8f0 100%)',
        padding: 24,
        borderRadius: 60,
        alignSelf: 'center',
        shadowColor: '#1e9d47',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    trashIcon: {
        fontSize: 48,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a5d32',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 36,
        lineHeight: 24,
        fontWeight: '400',
    },
    formGroup: {
        marginBottom: 28,
    },
    formGroupHalf: {
        flex: 1,
        marginBottom: 24,
    },
    formRow: {
        flexDirection: width > 600 ? 'row' : 'column',
        gap: 20,
    },
    formLabel: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1a5d32',
        marginBottom: 10,
        letterSpacing: -0.2,
    },
    formInput: {
        backgroundColor: '#fafbfc',
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 14,
        fontSize: 16,
        color: '#1f2937',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    formInputError: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
        shadowColor: '#ef4444',
        shadowOpacity: 0.1,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 13,
        marginTop: 6,
        fontWeight: '600',
        letterSpacing: -0.1,
    },
    helperText: {
        color: '#6b7280',
        fontSize: 13,
        marginTop: 6,
        fontWeight: '500',
    },
    pickerContainer: {
        gap: 8,
    },
    timeSlotButton: {
        backgroundColor: '#f9fafb',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    timeSlotButtonActive: {
        backgroundColor: '#16a34a',
        borderColor: '#16a34a',
        shadowColor: '#16a34a',
        shadowOpacity: 0.2,
        elevation: 3,
    },
    timeSlotText: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
        fontWeight: '600',
    },
    timeSlotTextActive: {
        color: 'white',
        fontWeight: '700',
    },
    scrapTypesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    scrapTypeChip: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#d1d5db',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    scrapTypeChipActive: {
        backgroundColor: '#dcfce7',
        borderColor: '#16a34a',
        shadowColor: '#16a34a',
        shadowOpacity: 0.15,
        elevation: 2,
    },
    scrapTypeText: {
        fontSize: 13,
        color: '#4b5563',
        fontWeight: '600',
    },
    scrapTypeTextActive: {
        color: '#16a34a',
        fontWeight: '700',
    },
    submitBtn: {
        backgroundColor: '#16a34a',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#15803d',
    },
    submitBtnDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.8,
        shadowOpacity: 0,
        elevation: 0,
        borderColor: '#9ca3af',
    },
    submitBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    infoCard: {
        backgroundColor: '#f0fdf4',
        padding: 20,
        borderRadius: 16,
        marginTop: 28,
        borderLeftWidth: 5,
        borderLeftColor: '#16a34a',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(22, 163, 74, 0.1)',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#15803d',
        marginBottom: 12,
        letterSpacing: -0.2,
    },
    infoText: {
        fontSize: 14,
        color: '#166534',
        marginBottom: 6,
        lineHeight: 20,
        fontWeight: '500',
    },
    timeSlotWrapper: {
        // Empty wrapper for key prop
    },
    scrapTypeWrapper: {
        // Empty wrapper for key prop
    },
    quickDateContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    quickDateButton: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    quickDateButtonActive: {
        backgroundColor: '#dcfce7',
        borderColor: '#16a34a',
    },
    quickDateText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
        textAlign: 'center',
    },
    quickDateTextActive: {
        color: '#16a34a',
        fontWeight: '700',
    },
    dateInputButton: {
        backgroundColor: '#fafbfc',
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dateInputText: {
        fontSize: 16,
        fontWeight: '500',
    },
    dateInputTextSelected: {
        color: '#1f2937',
    },
    dateInputTextPlaceholder: {
        color: '#9ca3af',
    },
    dateInputIcon: {
        fontSize: 18,
    },
    customDatePicker: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    customDateTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    customDateGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    customDateItem: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    customDateItemActive: {
        backgroundColor: '#dcfce7',
        borderColor: '#16a34a',
    },
    customDateItemText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#4b5563',
        textAlign: 'center',
    },
    customDateItemTextActive: {
        color: '#16a34a',
        fontWeight: '700',
    },
    manualDateInput: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 8,
        fontSize: 14,
        color: '#374151',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    loadingText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    timeSlotButtonDisabled: {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
        opacity: 0.6,
    },
    timeSlotTextDisabled: {
        color: '#9ca3af',
        fontWeight: '400',
    },
    // Calendar styles
    calendarButton: {
        backgroundColor: '#e8f5e9',
        paddingVertical: 18,
        paddingHorizontal: 18,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#16a34a',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    calendarButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    calendarButtonTextSelected: {
        color: '#15803d',
    },
    calendarButtonTextPlaceholder: {
        color: '#16a34a',
    },
    calendarButtonIcon: {
        fontSize: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 350,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    calendarNavButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    calendarNavText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
    },
    calendarWeekDays: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    calendarWeekDay: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        paddingVertical: 8,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: 4,
    },
    calendarDayDisabled: {
        opacity: 0.3,
    },
    calendarDayToday: {
        backgroundColor: '#fef3c7',
        borderWidth: 2,
        borderColor: '#f59e0b',
    },
    calendarDaySelected: {
        backgroundColor: '#16a34a',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    calendarDayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    calendarDayTextDisabled: {
        color: '#d1d5db',
    },
    calendarDayTextToday: {
        color: '#f59e0b',
        fontWeight: '700',
    },
    calendarDayTextSelected: {
        color: 'white',
        fontWeight: '700',
    },
    calendarFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    calendarCancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
    },
    calendarCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    calendarTodayButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#16a34a',
        alignItems: 'center',
    },
    calendarTodayText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
});