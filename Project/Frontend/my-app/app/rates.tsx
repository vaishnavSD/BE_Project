import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from "react-native";
import { dataService, ScrapRate } from "./services/dataService";
import { useNavigation } from '@react-navigation/native';

export default function RatesPage() {
    const navigation = useNavigation();
    const [scrapRates, setScrapRates] = useState<ScrapRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Calculator state
    const [showCalculator, setShowCalculator] = useState(true);
    const [calculatorData, setCalculatorData] = useState({
        category: '',
        type: '',
        rate: 0,
        quantity: 0,
        totalAmount: 0
    });
    const [availableTypes, setAvailableTypes] = useState<ScrapRate[]>([]);

    // Dropdown states
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    useEffect(() => {
        fetchScrapRates();
    }, []);

    const fetchScrapRates = async () => {
        setLoading(true);
        
        try {
            const rates = await dataService.getScrapRates();
            setScrapRates(rates);
        } catch (error: any) {
            console.error("Error fetching scrap rates:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'paper':
                return '📄';
            case 'metal':
                return '⚙️';
            case 'plastic':
                return '🧴';
            case 'electronics':
                return '💻';
            case 'glass':
                return '🥃';
            default:
                return '♻️';
        }
    };

    const getCategories = (): string[] => {
        const categorySet = new Set<string>();
        scrapRates.forEach(item => {
            if (item.category && typeof item.category === 'string') {
                categorySet.add(item.category.toLowerCase());
            }
        });
        return Array.from(categorySet).filter(cat => cat);
    };

    const getFilteredRates = () => {
        if (selectedCategory === 'all') return scrapRates;
        return scrapRates.filter(item => item.category?.toLowerCase() === selectedCategory);
    };

    // Calculator functions
    const handleCategoryChange = (category: string) => {
        const types = scrapRates.filter(item => item.category?.toLowerCase() === category.toLowerCase());
        setAvailableTypes(types);
        setCalculatorData({
            ...calculatorData,
            category,
            type: '',
            rate: 0,
            totalAmount: 0
        });
    };

    const handleTypeChange = (type: string) => {
        const selectedItem = scrapRates.find(item => item.type === type);
        const rate = selectedItem ? selectedItem.price : 0;
        const totalAmount = rate * calculatorData.quantity;

        setCalculatorData({
            ...calculatorData,
            type,
            rate,
            totalAmount
        });
    };

    const handleQuantityChange = (quantity: number) => {
        const totalAmount = calculatorData.rate * quantity;
        setCalculatorData({
            ...calculatorData,
            quantity,
            totalAmount
        });
    };

    const resetCalculator = () => {
        setCalculatorData({
            category: '',
            type: '',
            rate: 0,
            quantity: 0,
            totalAmount: 0
        });
        setAvailableTypes([]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.navbar}>
                    <Text style={styles.logo}>♻ ScrapWale</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Home' as never)}>
                        <Text style={styles.backButton}>← Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Scrap Value Calculator</Text>
                <Text style={styles.subtitle}>Calculate the value of your scrap materials instantly</Text>

                {/* Calculator Toggle Button */}
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setShowCalculator(!showCalculator)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.toggleButtonIcon}>
                        {showCalculator ? '📱' : '🧮'}
                    </Text>
                    <Text style={styles.toggleButtonText}>
                        {showCalculator ? 'Hide Calculator' : 'Show Calculator'}
                    </Text>
                    <Text style={styles.toggleButtonArrow}>
                        {showCalculator ? '▲' : '▼'}
                    </Text>
                </TouchableOpacity>

                {/* Calculator Section */}
                {showCalculator && (
                    <View style={styles.calculatorContainer}>
                        <View style={styles.calculatorHeader}>
                            <Text style={styles.calculatorIcon}>🧮</Text>
                            <Text style={styles.calculatorTitle}>Scrap Calculator</Text>
                        </View>
                        <Text style={styles.calculatorSubtitle}>Select your scrap category and type to calculate the total amount</Text>

                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Loading calculator...</Text>
                            </View>
                        ) : (
                            <View style={styles.calculatorForm}>
                                {/* Category Dropdown */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Category</Text>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowCategoryDropdown(true)}
                                    >
                                        <Text style={[styles.dropdownButtonText, !calculatorData.category && styles.placeholderText]}>
                                            {calculatorData.category ?
                                                calculatorData.category.charAt(0).toUpperCase() + calculatorData.category.slice(1) :
                                                'Select Category'
                                            }
                                        </Text>
                                        <Text style={styles.dropdownArrow}>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Type Dropdown */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Type</Text>
                                    <TouchableOpacity
                                        style={[styles.dropdownButton, !calculatorData.category && styles.dropdownButtonDisabled]}
                                        onPress={() => calculatorData.category && setShowTypeDropdown(true)}
                                        disabled={!calculatorData.category}
                                    >
                                        <Text style={[styles.dropdownButtonText, !calculatorData.type && styles.placeholderText]}>
                                            {calculatorData.type || 'Select Type'}
                                        </Text>
                                        <Text style={styles.dropdownArrow}>▼</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Rate Display */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Rate (₹/kg)</Text>
                                    <View style={styles.rateDisplay}>
                                        <Text style={styles.rateValue}>₹{calculatorData.rate}</Text>
                                    </View>
                                </View>

                                {/* Quantity Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Quantity (kg)</Text>
                                    <TextInput
                                        style={styles.quantityInput}
                                        value={calculatorData.quantity.toString()}
                                        onChangeText={(text) => {
                                            const quantity = parseFloat(text) || 0;
                                            handleQuantityChange(quantity);
                                        }}
                                        placeholder="Enter quantity"
                                        keyboardType="numeric"
                                    />
                                </View>

                                {/* Total Amount Display */}
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Total Amount</Text>
                                    <Text style={styles.totalAmount}>₹{calculatorData.totalAmount.toFixed(2)}</Text>
                                    <Text style={styles.calculationBreakdown}>
                                        {calculatorData.quantity} kg × ₹{calculatorData.rate}/kg
                                    </Text>
                                </View>

                                {/* Reset Button */}
                                <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
                                    <Text style={styles.resetButtonText}>Reset Calculator</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Current Rates Section */}
                <View style={styles.ratesSection}>
                    <Text style={styles.ratesTitle}>Current Scrap Rates</Text>
                    <Text style={styles.ratesSubtitle}>Get the best prices for your recyclable materials</Text>

                    {/* Category Filter */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
                        <TouchableOpacity
                            style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
                            onPress={() => setSelectedCategory('all')}
                        >
                            <Text style={[styles.categoryButtonText, selectedCategory === 'all' && styles.categoryButtonTextActive]}>All</Text>
                        </TouchableOpacity>
                        {getCategories().map((category: string) => (
                            // @ts-ignore
                            <View key={category}>
                                <TouchableOpacity
                                    style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.ratesContainer}>
                        {getFilteredRates().length > 0 ? (
                            getFilteredRates().map((item, index) => (
                                // @ts-ignore
                                <View key={`${item.category}-${item.type}-${index}`}>
                                    <TouchableOpacity
                                        style={styles.rateItem}
                                        onPress={() => {
                                            handleCategoryChange(item.category);
                                            handleTypeChange(item.type);
                                        }}
                                    >
                                        <View style={styles.rateHeader}>
                                            <Text style={styles.rateIcon}>{getCategoryIcon(item.category)}</Text>
                                            <View style={styles.rateInfo}>
                                                <Text style={styles.rateType}>{item.type}</Text>
                                                <Text style={styles.rateCategory}>{item.category}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.ratePrice}>
                                            <Text style={styles.priceAmount}>₹{item.price}</Text>
                                            <Text style={styles.priceUnit}>per kg</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>No rates available</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Category Dropdown Modal */}
            <Modal
                visible={showCategoryDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCategoryDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setShowCategoryDropdown(false)}
                >
                    <View style={styles.dropdownModal}>
                        <Text style={styles.dropdownModalTitle}>Select Category</Text>
                        {getCategories().map((category: string) => (
                            <View {...({key: `category-${category}`} as any)}>
                                <TouchableOpacity
                                    style={styles.dropdownOption}
                                    onPress={() => {
                                        handleCategoryChange(category);
                                        setShowCategoryDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownOptionText}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Type Dropdown Modal */}
            <Modal
                visible={showTypeDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowTypeDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setShowTypeDropdown(false)}
                >
                    <View style={styles.dropdownModal}>
                        <Text style={styles.dropdownModalTitle}>Select Type</Text>
                        {availableTypes.map((item, index) => (
                            <View {...({key: `type-${item.type}-${index}`} as any)}>
                                <TouchableOpacity
                                    style={styles.dropdownOption}
                                    onPress={() => {
                                        handleTypeChange(item.type);
                                        setShowTypeDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownOptionText}>{item.type}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fffe',
    },
    header: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingTop: 50,
    },
    logo: {
        color: '#1e9d47',
        fontSize: 24,
        fontWeight: 'bold',
    },
    backButton: {
        color: '#1e9d47',
        fontSize: 16,
        fontWeight: '500',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e9d47',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },

    // Toggle Button Styles
    toggleButton: {
        backgroundColor: '#1e9d47',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        transform: [{ scale: 1 }],
    },
    toggleButtonIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    toggleButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    toggleButtonArrow: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },

    // Calculator Styles
    calculatorContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 2,
        borderColor: '#e8f5e8',
    },
    calculatorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    calculatorIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    calculatorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    calculatorSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
        lineHeight: 20,
    },
    calculatorForm: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 4,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    dropdownButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 50,
    },
    dropdownButtonDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.6,
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    placeholderText: {
        color: '#999',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
    },
    dropdownModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    dropdownOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownOptionText: {
        fontSize: 16,
        color: '#333',
    },
    rateDisplay: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rateValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e9d47',
    },
    quantityInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    totalContainer: {
        backgroundColor: '#e8f5e8',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    totalAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1e9d47',
        marginBottom: 4,
    },
    calculationBreakdown: {
        fontSize: 14,
        color: '#666',
    },
    resetButton: {
        backgroundColor: '#ff6b6b',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 8,
    },
    resetButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },

    // Rates Section Styles
    ratesSection: {
        marginTop: 10,
    },
    ratesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e9d47',
        textAlign: 'center',
        marginBottom: 8,
    },
    ratesSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    categoryFilter: {
        marginBottom: 20,
    },
    categoryButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    categoryButtonActive: {
        backgroundColor: '#1e9d47',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    categoryButtonTextActive: {
        color: 'white',
    },

    loadingContainer: {
        padding: 60,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
    ratesContainer: {
        gap: 15,
    },
    rateItem: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rateIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    rateInfo: {
        flex: 1,
    },
    rateType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    rateCategory: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    ratePrice: {
        alignItems: 'flex-end',
    },
    priceAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e9d47',
    },
    priceUnit: {
        fontSize: 12,
        color: '#666',
    },
    noDataContainer: {
        padding: 40,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});