import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { dataService, ScrapRate } from './services/dataService';

export default function Home() {
    const navigation = useNavigation();
    const [scrapRates, setScrapRates] = useState<ScrapRate[]>([]);
    const [isLoadingRates, setIsLoadingRates] = useState(true);
    const [isOnline, setIsOnline] = useState(true);

    // Load scrap rates from backend
    useEffect(() => {
        loadScrapRates();
    }, []);

    const loadScrapRates = async () => {
        setIsLoadingRates(true);

        try {
            const rates = await dataService.getScrapRates();
            setScrapRates(rates);
            setIsOnline(dataService.getConnectionStatus());
        } catch (error) {
            console.log('Error loading scrap rates:', error);
            setIsOnline(false);
        } finally {
            setIsLoadingRates(false);
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
            default:
                return '♻️';
        }
    };

    const handleLogin = () => {
        console.log('Navigating to Login...');
        navigation.navigate('Login' as never);
    };

    const handleBookPickup = () => {
        console.log('Navigating to Request...');
        navigation.navigate('Request' as never);
    };

    const handleViewAllRates = () => {
        console.log('Navigating to Rates...');
        navigation.navigate('Rates' as never);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.app}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.navbar}>
                        <Text style={styles.logo}>♻ ScrapWale</Text>
                        <View style={styles.navButtons}>
                            <TouchableOpacity style={styles.btnSecondary} onPress={handleLogin}>
                                <Text style={styles.btnSecondaryText}>Login</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btn} onPress={handleBookPickup}>
                                <Text style={styles.btnText}>Book Pickup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Turn Scrap into Cash Instantly!</Text>
                    <Text style={styles.heroSubtitle}>ScrapWale helps you recycle paper, plastic, and metal — and get paid at your doorstep.</Text>
                    <TouchableOpacity style={styles.btn} onPress={handleBookPickup}>
                        <Text style={styles.btnText}>Schedule a Pickup</Text>
                    </TouchableOpacity>
                </View>

                {/* Current Market Rates */}
                <View style={styles.rateSliderSection}>
                    <View style={styles.rateSectionHeader}>
                        <Text style={styles.sectionTitle}>📈 Current Market Rates</Text>
                        <View style={[styles.liveIndicator, !isOnline && styles.offlineIndicator]}>
                            <View style={styles.liveDot}></View>
                            <Text style={styles.liveText}>{isOnline ? 'LIVE' : 'OFFLINE'}</Text>
                        </View>
                    </View>
                    <Text style={styles.sectionSubtitle}>
                        {isOnline ? 'Updated daily' : 'Showing cached rates'}
                    </Text>

                    {isLoadingRates ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#1e9d47" />
                            <Text style={styles.loadingText}>Loading current rates...</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rateSlider}>
                            {scrapRates.map((item, index) => (
                                <View {...({ key: `rate-${item.id || index}` } as any)} style={styles.rateItem}>
                                    <View style={styles.rateItemContent}>
                                        <Text style={styles.rateIcon}>{getCategoryIcon(item.category)}</Text>
                                        <View style={styles.rateDetails}>
                                            <Text style={styles.rateType}>{item.type}</Text>
                                            <Text style={styles.rateCategory}>{item.category}</Text>
                                        </View>
                                        <View style={styles.ratePriceContainer}>
                                            <Text style={styles.ratePrice}>₹{item.price}</Text>
                                            <Text style={styles.ratePriceUnit}>/{item.unit || 'kg'}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity style={[styles.btn, styles.viewAllBtn]} onPress={handleViewAllRates}>
                        <Text style={styles.btnText}>📊 View Calculator & All Rates</Text>
                    </TouchableOpacity>
                </View>

                {/* Services */}
                <View style={styles.services}>
                    <Text style={styles.sectionTitle}>Our Services</Text>
                    <View style={styles.serviceCards}>
                        <View style={styles.card}>
                            <Text style={styles.icon}>📄</Text>
                            <Text style={styles.cardTitle}>Paper Scrap</Text>
                            <Text style={styles.cardText}>Recycle newspapers, books, and office waste easily.</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.icon}>⚙️</Text>
                            <Text style={styles.cardTitle}>Metal Scrap</Text>
                            <Text style={styles.cardText}>Sell iron, steel, and other metals for fair rates.</Text>
                        </View>
                        <View style={styles.card}>
                            <Text style={styles.icon}>🧴</Text>
                            <Text style={styles.cardTitle}>Plastic Scrap</Text>
                            <Text style={styles.cardText}>We collect and recycle all kinds of plastics responsibly.</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerTitle}>ScrapWale</Text>
                    <Text style={styles.footerText}>📍 Pune, Maharashtra</Text>
                    <Text style={styles.footerText}>📞 +91 98765 43210 | ✉ support@scrapwale.in</Text>
                    <Text style={styles.footerText}>© {new Date().getFullYear()} ScrapWale. All rights reserved.</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    app: {
        flex: 1,
        backgroundColor: '#fff',
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
        paddingTop: 50,
        paddingBottom: 20,
    },
    logo: {
        color: '#1e9d47',
        fontSize: 24,
        fontWeight: 'bold',
    },
    navButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    btn: {
        backgroundColor: '#1e9d47',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 6,
    },
    btnText: {
        color: 'white',
        fontWeight: '500',
    },
    btnSecondary: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#1e9d47',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 6,
    },
    btnSecondaryText: {
        color: '#1e9d47',
        fontWeight: '500',
    },
    hero: {
        alignItems: 'center',
        paddingTop: 80,
        paddingBottom: 60,
        paddingHorizontal: 20,
        backgroundColor: '#f0f9f4',
        marginTop: 20,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e9d47',
        textAlign: 'center',
        marginBottom: 15,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24,
    },
    services: {
        paddingVertical: 40,
        paddingHorizontal: 20,
        backgroundColor: '#f7fff9',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    serviceCards: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        width: 280,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
        alignItems: 'center',
    },
    icon: {
        fontSize: 40,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    rateSliderSection: {
        paddingVertical: 30,
        backgroundColor: '#f0f9f4',
        alignItems: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e0f2e0',
    },
    rateSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    offlineIndicator: {
        backgroundColor: '#ff9500',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginRight: 4,
    },
    liveText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    rateSlider: {
        marginVertical: 15,
        paddingLeft: 20,
    },
    rateItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        marginRight: 15,
        width: 180,
        borderLeftWidth: 4,
        borderLeftColor: '#1e9d47',
    },
    rateItemContent: {
        padding: 16,
        flexDirection: 'column',
        alignItems: 'center',
    },
    rateIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    rateDetails: {
        alignItems: 'center',
        marginBottom: 12,
    },
    rateType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    rateCategory: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
        backgroundColor: '#f0f9f4',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    ratePriceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    ratePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e9d47',
    },
    ratePriceUnit: {
        fontSize: 12,
        color: '#666',
        marginLeft: 2,
    },
    viewAllBtn: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    footer: {
        backgroundColor: '#1e9d47',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    footerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    footerText: {
        fontSize: 12,
        color: 'white',
        marginBottom: 5,
        textAlign: 'center',
    },
    loadingContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
});