import { Button } from '@/components/Button';
import SuccessModal from '@/components/SuccessModal';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createOrderApi } from '../services/orders';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Api_url } from '../url/url';
const { width, height } = Dimensions.get('window');

const PAYMENT_METHODS = [
    {
        id: 'card',
        label: 'Add Card',
        icon: <Ionicons name="card-outline" size={moderateScale(25)} color={colors.primary} />,
        type: 'card',
    },
];

const MORE_OPTIONS = [
    { id: 'easypaisa', label: 'Easypaisa', icon: require('../assets/images/easypaisa.png') },
    { id: 'jazzcash', label: 'Jazzcash', icon: require('../assets/images/jazzcash.png') },
    { id: 'Cod', label: 'Cash on Delivery', icon: require('../assets/images/cash.png') },
];

const RadioButton = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.radioButton, selected && styles.radioButtonSelected]}
        onPress={onPress}
    >
        {selected && <View style={styles.radioButtonInner} />}
    </TouchableOpacity>
);

const Payment = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [selected, setSelected] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const { clearCart } = useCartStore();
    const { shippingAddress: shippingAddressStr, shippingMethod: shippingMethodStr, cartItems } = useLocalSearchParams<{
        shippingAddress: string;
        shippingMethod: string;
        cartItems: string;
    }>();
    const shippingAddress = shippingAddressStr ? JSON.parse(shippingAddressStr) : null;
    const shippingMethod = shippingMethodStr ? JSON.parse(shippingMethodStr) : null;

    const { isAuthenticated, phone, token, user } = useAuth();
    const [userId, setUserId] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.replace({
            pathname: '/(tabs)/Orders',
            params: { showSuccess: 'true', orderSuccess: 'true' }
        });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${Api_url}api/app-user/list/`);
                const users = response.data;

                const matchedUser = users.find((u: any) => u.number === phone);

                if (matchedUser) {
                    setUserId(matchedUser.id);
                } else {
                    setUserId(token);
                }
            } catch (error) {
                setUserId(token);
            }
        };

        if (phone) fetchUserData();
        else setUserId(token);

    }, [phone, token]);

    const parsedCartItems = useMemo(() => {
        try {
            return cartItems ? JSON.parse(cartItems) : [];
        } catch (e) {
            console.error('Error parsing cart items:', e);
            return [];
        }
    }, [cartItems]);

    // ------------------ CREATE ORDER ------------------
    const createOrder = async () => {
        if (!selected) {
            Alert.alert("Error", "Please select a payment method");
            return;
        }

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
            const orderData = {
                user_id: userId,
                user_detail: { number: phone },
                address: shippingAddress,
                shipping: shippingMethod,
                status: 'pending',
                product: parsedCartItems.map((item: any) => ({
                    image: item.image || null,
                    name: item.name || null,
                    pts: item.points || null,
                    quantity: item.quantity || null,
                    variants: item.variants || null,
                    cost_price: item.cost_price || null,
                    price: item.price
                        ? (parseFloat(item.price) * (item.quantity || 1)).toFixed(2)
                        : '0.00',
                })),
                payment: [{ method: selected, status: "Pending" }],
                created_at: new Date().toISOString(),
            };

            const response = await createOrderApi(orderData, token);

            await clearCart();
            setOrderSuccess(true);
            setShowSuccessModal(true);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Order Failed');
            console.error('Order error:', error);

        } finally {
            setIsLoading(false);
        }
    };
    // -----------------------------------------------------

    const renderPaymentOption = (item: any) => {
        const isSelected = selected === item.id;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.paymentOption, isSelected && styles.selectedPaymentOption]}
                onPress={() => setSelected(item.id)}
            >
                <View style={styles.paymentOptionContent}>
                    <View style={styles.paymentOptionLeft}>
                        <Image source={item.icon} style={styles.paymentIcon} />
                        <Text style={styles.paymentLabel}>{item.label}</Text>
                    </View>
                    <RadioButton selected={isSelected} onPress={() => setSelected(item.id)} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={require('../assets/images/ss1.png')} style={styles.background}>

                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={moderateScale(28)} color={colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Payment Method</Text>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingHorizontal: 16 }}>

                        <Text style={styles.sectionTitle}>Credit & Debit Card</Text>

                        <TouchableOpacity
                            style={[styles.cardRow, selected === "card" && styles.selectedRow]}
                            onPress={() => { setSelected('card'); router.push('/Card'); }}
                        >
                            <View style={styles.iconBox}>{PAYMENT_METHODS[0].icon}</View>
                            <Text style={styles.cardLabel}>{PAYMENT_METHODS[0].label}</Text>
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>More Payment Options</Text>

                        {MORE_OPTIONS.map(renderPaymentOption)}

                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            variant="secondary"
                            style={[styles.confirmBtn, isLoading && styles.disabledBtn]}
                            onPress={createOrder}
                            disabled={isLoading}
                        >
                            {isLoading ? <ActivityIndicator color="#fff" /> : "Confirm Payment"}
                        </Button>
                    </View>
                </View>
            </ImageBackground>

            <SuccessModal
                visible={showSuccessModal}
                message={orderSuccess ? "Order Placed Successfully!" : "Order Failed"}
                subtitle={orderSuccess
                    ? "Your order has been placed successfully"
                    : "There was an error processing your order."}
                autoCloseDelay={1000}
                onClose={handleSuccessModalClose}
            />

        </SafeAreaView>
    );
};

// ------------------ STYLES ------------------
const styles = StyleSheet.create({
    paymentOption: {
        backgroundColor: colors.white,
        borderRadius: moderateScale(8),
        padding: moderateScale(15),
        marginBottom: moderateScale(10),
        borderWidth: 1,
        borderColor: colors.white,
    },
    selectedPaymentOption: { borderColor: colors.primary },
    paymentOptionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIcon: {
        width: moderateScale(25),
        height: moderateScale(25),
        marginRight: moderateScale(12),
    },
    paymentLabel: {
        fontSize: moderateScale(14),
        fontFamily: 'PoppinsSemi',
    },
    radioButton: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: { 
     borderColor: colors.primary,
     },
    radioButtonInner: {
        width: moderateScale(12),
        height: moderateScale(12),
        borderRadius: 6,
        backgroundColor: colors.primary,
    },
    background: { flex: 1 },
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        marginTop: 20,
        height: 80,
        position: 'relative',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        zIndex: 1,
    },
    headerTitle: {
        position: 'absolute',
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: 28,
        color: '#fff',
        fontFamily: 'Sigmar',
        letterSpacing: 1,
    },
    sectionTitle: {
        color: colors.white,
        fontSize: 18,
        fontFamily: 'PoppinsSemi',
        marginTop: 10,
        marginBottom: 8,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    selectedRow: { borderWidth: 2, borderColor: colors.primary },
    iconBox: {
        width: 26,
        height: 26,
        justifyContent: 'center',
        marginRight: 12,
    },
    cardLabel: {
        color: colors.primary,
        fontSize: 14,
        fontFamily: 'PoppinsSemi',
    },
    footer: {
        backgroundColor: colors.secondaryLight,
        padding: 18,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: 100,
        justifyContent: 'center',
    },
    confirmBtn: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: colors.primary,
    },
    disabledBtn: { backgroundColor: 'gray' },
});

export default Payment;
