import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ActivityIndicator, Alert, Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

const PAYMENT_METHODS =
[
    {
        id: 'card',
        label: 'Add Card',
        icon: <Ionicons name="card-outline" size={moderateScale(25)}color={colors.primary} />,
        type: 'card',
    },
];

const MORE_OPTIONS = 
[
    {
        id: 'easypaisa',
        label: 'Easypaisa',
        icon: require('../assets/images/easypaisa.png'), 
    },
    {
        id: 'jazzcash', 
        label: 'Jazzcash',
        icon: require('../assets/images/jazzcash.png'),
    },
    {
        id: 'cod',
        label: 'Cash on Delivery',
        icon: require('../assets/images/cash.png'),
    },
];

interface OrderItem {
    image: string;
    name: string;
    pts: number;
    variants: string;
    price: string;
}

interface OrderData {
    address: string;
    shipping: string;
    status: string;
    items: OrderItem[];
}

const Payment = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [selected, setSelected] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { shippingAddress, shippingMethod, cartItems } = useLocalSearchParams<{
        shippingAddress: any;
        shippingMethod: any;
        cartItems: string;
    }>();
    
    const { isAuthenticated, phone, token, user } = useAuth();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://192.168.1.107:8000/api/app-user/list/');
                const users = response.data; // Assuming the API returns an array of users
                
                // Find user by phone number
                const matchedUser = users.find((u: any) => u.number === phone);
                
                if (matchedUser) {
                    setUserId(matchedUser.id); 
                    console.log('Matched user ID:', matchedUser.id);
                } else {
                    console.log('No user found with phone:', phone);
                    setUserId(token); // Fallback to token if no match found
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUserId(token); // Fallback to token on error
            }
        };

        if (phone) {
            fetchUserData();
        } else {
            setUserId(token); // Fallback to token if no phone
        }
    }, [phone, token]);

    
    // Parse the cart items if they're a string
    const parsedCartItems = useMemo(() => {
        try {
            return cartItems ? JSON.parse(cartItems) : [];
        } catch (e) {
            console.error('Error parsing cart items:', e);
            return [];
        }
    }, [cartItems]);

    const createOrder = async (paymentMethod: string) => {
        if (!shippingAddress || !shippingMethod) {
            Alert.alert('Error', 'Missing shipping information');
            return;
        }

        if (!isAuthenticated || !token) {
            Alert.alert('Authentication Required', 'Please log in to place an order');
            return;
        }

        setIsLoading(true);
        
        try {
            // Parse shipping address if it's a string
            const addressObj = typeof shippingAddress === 'string' 
                ? JSON.parse(shippingAddress) 
                : shippingAddress;
                
            // Parse shipping method if it's a string
            const methodObj = typeof shippingMethod === 'string'
                ? JSON.parse(shippingMethod)
                : shippingMethod;


            console.log('Phone number:', phone, 'Type:', typeof phone);
            const orderData = {
                user_id: userId ,
                user_detail: {
                    number: phone 
                },
                address: addressObj?.desc || 'Test',
                shipping: methodObj?.label || 'Test',
                status: 'pending',
                product: parsedCartItems.map((item: any) => ({
                    image: item.image,
                    name: item.name || 'Product',
                    pts: item.points,
                    quantity: item.quantity,
                    variants: item.pack,
                    price: item.price ? (parseFloat(item.price) * (item.quantity || 1)).toFixed(2) : '0.00',
                })),
                payment: [
                    {
                        method: selected, 
                        status: 'Pending'
                    }
                ], 
                created_at: new Date().toISOString()
            };

            console.log('Sending order data:', JSON.stringify(orderData, null, 2));
            
            const API_URL = 'http://192.168.1.107:8000/api/create-order/';
            console.log('Sending request to:', API_URL);
            
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(orderData)
                });

                // Log response status and headers for debugging
                console.log('Response status:', response.status, response.statusText);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));

                const responseText = await response.text();
                console.log('Raw response text:', responseText);

                // Try to parse as JSON if the response is not empty
                let responseData;
                try {
                    responseData = responseText ? JSON.parse(responseText) : {};
                } catch (jsonError) {
                    console.error('Failed to parse JSON response. Response text:', responseText);
                    throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 200)}`);
                }

                // Log parsed response data
                console.log('Parsed response data:', responseData);

                if (!response.ok) {
                    console.error('API Error Status:', response.status);
                    console.error('API Error Data:', responseData);
                    
                    // Handle 400 Bad Request specifically
                    if (response.status === 400) {
                        const errorMessage = responseData.detail || 
                                          responseData.message || 
                                          responseData.error || 
                                          'Bad request';
                        throw new Error(`Validation error: ${errorMessage}`);
                    }
                    
                    throw new Error(
                        responseData.detail || 
                        responseData.message || 
                        responseData.error || 
                        `Server error: ${response.status} ${response.statusText}`
                    );
                }

                return responseData;
            } catch (error: any) {
                console.error('Request failed:', error);
                throw error;
            }

            // Navigate to order confirmation screen on success
            router.push({
                pathname: '/Payment',
          
            });
        } catch (error: any) {
            console.error('Order creation error:', error);
            Alert.alert('Error', error.message || 'Failed to create order');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentMethodSelect = (methodId: string) => {
        setSelected(methodId);
        if (methodId === 'cod') {
            createOrder('cod');
        }
    };

    return (
        <SafeAreaView style={{flex: 1, paddingBottom: Math.max(verticalScale(4))}}>
            <ImageBackground
                source={require('../assets/images/ss1.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={moderateScale(28)} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Method</Text>
                </View>
                <ScrollView contentContainerStyle={{ flexGrow:1, paddingHorizontal: 16, justifyContent: 'flex-start', }} showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>Credit & Debit Card</Text>
                    <TouchableOpacity
                        style={[
                            styles.cardRow,
                            selected === 'card' && styles.selectedRow,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => { setSelected('card'); router.push('/Card'); }}
                    >
                        <View style={styles.iconBox}>{PAYMENT_METHODS[0].icon}</View>
                        <Text style={styles.cardLabel}>{PAYMENT_METHODS[0].label}</Text>
                    </TouchableOpacity>

                    {/* More Payment Options */}
                    <Text style={styles.sectionTitle}>More Payment Options</Text>
                    {MORE_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionRow,
                                selected === option.id && styles.selectedRow,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handlePaymentMethodSelect(option.id)}
                        >
                            <Image source={option.icon} style={styles.optionIcon} resizeMode="contain" />
                            <Text style={styles.optionLabel}>{option.label}</Text>

                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {/* Confirm Payment Button */}
                <View style={styles.footer}>
                    <Button
                        variant="secondary"
                        style={[
                            styles.confirmBtn,
                            isLoading && styles.disabledBtn
                        ]}
                        onPress={() => createOrder(selected)}
                        disabled={isLoading}
                    >
{isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            'Confirm Payment'
                        )}
                    </Button>
                </View>
            </View>
        </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
    
    },
    header: {
     flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: verticalScale(80),
    position: 'relative',
    paddingHorizontal: scale(18),
    marginTop: verticalScale(20),
    },
    backBtn: {
     width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    zIndex: 1,
    },
    headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: moderateScale(28),
    color: '#fff',
    fontFamily: 'Sigmar',
    letterSpacing: 1,
    lineHeight: verticalScale(55),
    },
    sectionTitle: {
        color: colors.white,
        fontSize: moderateScale(18),
        fontFamily: 'PoppinsSemi',
        marginTop: 8,
        marginBottom: 8,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(14),
        marginBottom: verticalScale(12),
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    selectedRow: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    iconBox: {
        width: scale(26),
        height: verticalScale(26),
        justifyContent: 'center',
        marginRight: 12,
    },
    cardLabel: {
        color: colors.primary,
        fontSize: moderateScale(14),
        fontFamily: 'PoppinsSemi',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    optionIcon: {
        width: scale(32),
        height: verticalScale(32),
        marginRight: 12,
    },
    optionLabel: {
        color: colors.primary,
        fontSize: moderateScale(14),
        fontFamily: 'PoppinsSemi',
    },
    footer: {
        backgroundColor: colors.secondaryLight,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        height: verticalScale(100),
    },
    confirmBtn: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledBtn: {
        backgroundColor: 'gray',
    },
});

export default Payment;