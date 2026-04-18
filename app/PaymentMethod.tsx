import { Button } from '@/components/Button';
import SuccessModal from '@/components/SuccessModal';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Switch
} from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';
import { createOrderApi } from '../services/orders';
import { Api_url } from '../url/url';

const { width } = Dimensions.get('window');

const PAYMENT_METHODS = [
    {
        id: 'card',
        label: 'Add Card',
        icon: <Ionicons name="card-outline" size={moderateScale(25)} color={colors.primary} />,
    },
];

const Payment = () => {
    const router = useRouter();

    const [selected, setSelected] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const { clearCart } = useCartStore();
    const { isAuthenticated, phone, token } = useAuth();

    const {
        shippingAddress: shippingAddressStr,
        shippingMethod: shippingMethodStr,
        cartItems
    } = useLocalSearchParams<any>();

    const shippingAddress = useMemo(() => shippingAddressStr ? JSON.parse(shippingAddressStr) : null, [shippingAddressStr]);
    const shippingMethod = useMemo(() => shippingMethodStr ? JSON.parse(shippingMethodStr) : null, [shippingMethodStr]);

    const parsedCartItems = useMemo(() => {
        try {
            return cartItems ? JSON.parse(cartItems) : [];
        } catch {
            return [];
        }
    }, [cartItems]);

    // ---------------- SPLIT PAYMENT ----------------
    const [splitEnabled, setSplitEnabled] = useState(false);
    const [points, setPoints] = useState('');
    const [cash, setCash] = useState('');

    const [userId, setUserId] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${Api_url}api/app-user/list/`);
                const user = res.data.find((u: any) => u.number === phone);
                setUserId(user?.id || token);
            } catch {
                setUserId(token);
            }
        };

        if (phone) fetchUser();
        else setUserId(token);
    }, [phone, token]);

    const createOrder = async () => {
        if (!selected) return Alert.alert("Error", "Select payment method");
        if (!shippingAddress || !shippingMethod) return Alert.alert("Error", "Missing shipping");

        setIsLoading(true);

        try {
            const orderData = {
                user_id: userId,
                user_detail: { number: phone },
                address: shippingAddress,
                shipping: shippingMethod,
                status: 'pending',
                product: parsedCartItems.map((item: any) => ({
                    image: item.image,
                    name: item.name,
                    quantity: item.quantity || 1,
                    price: item.price
                })),
                payment: [{
                    method: selected,
                    split: splitEnabled
                        ? { points, cash }
                        : null,
                    status: "Pending"
                }],
                created_at: new Date().toISOString(),
            };

            await createOrderApi(orderData, token || '');
            await clearCart();

            setOrderSuccess(true);
            setShowSuccessModal(true);

        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderCartItem = useCallback(({ item }: any) => (
        <View style={styles.cartItem}>
            <Image
                source={
                    item.image?.uri
                        ? { uri: item.image.uri }
                        : { uri: item.image }
                }
                style={styles.cartImage}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cartName}>{item.name}</Text>
                <Text style={styles.cartPrice}>PKR {item.price}</Text>
            </View>
        </View>
    ), []);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={require('../assets/images/ss1.png')} style={styles.background}>

                <View style={styles.container}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Payment</Text>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 20, width: '90%', alignSelf: 'center' }}>

                        {/* CARD */}
                        <TouchableOpacity
                            style={styles.cardRow}
                            onPress={() => setSelected('card')}
                        >
                            {PAYMENT_METHODS[0].icon}
                            <Text style={styles.cardLabel}>Add Card</Text>
                        </TouchableOpacity>

                        {/* SPLIT PAYMENT SECTION */}
                        <Text style={styles.sectionTitle}>Split Payment</Text>

                        <View style={styles.splitRow}>
                            <Text style={styles.cardLabel}>Enable Split Payment</Text>
                            <Switch
                                value={splitEnabled}
                                onValueChange={setSplitEnabled}
                            />
                        </View>

                        {splitEnabled && (
                            <View style={{ marginBottom: 15 }}>

                                {/* POINTS */}
                                <Text style={styles.subHeading}>Points</Text>
                                <TextInput
                                    placeholder="Enter Points"
                                    value={points}
                                    onChangeText={setPoints}
                                    keyboardType="numeric"
                                    style={styles.input}
                                />

                                {/* CASH */}
                                <Text style={styles.subHeading}>Cash Amount</Text>
                                <TextInput
                                    placeholder="Enter Cash Amount"
                                    value={cash}
                                    onChangeText={setCash}
                                    keyboardType="numeric"
                                    style={styles.input}
                                />
                            </View>
                        )}

                        {/* PRODUCTS */}
                        <Text style={styles.sectionTitle}>Products</Text>

                        <FlatList
                            data={parsedCartItems}
                            renderItem={renderCartItem}
                            keyExtractor={(item, i) => i.toString()}
                            scrollEnabled={false}
                        />

                    </ScrollView>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <Button onPress={createOrder} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : "Confirm Payment"}
                        </Button>
                    </View>

                </View>
            </ImageBackground>

            <SuccessModal
                visible={showSuccessModal}
                message={orderSuccess ? "Order Placed!" : "Failed"}
                onClose={() => router.replace('/(tabs)/Orders')}
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
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 10,
        marginBottom: 12,
    },
    cartImage: {
        width: scale(70),
        height: scale(70),
        borderRadius: 12,
        backgroundColor: colors.white,
    },
    cartName: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: moderateScale(15),
        marginBottom: 2,
    },
    cartPack: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: moderateScale(15),
        opacity: 0.8,
    },
    cartPrice: {
        color: colors.white,
        fontFamily: 'PoppinsBold',
        fontSize: moderateScale(16),
        marginTop: 2,
    },
    splitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
subHeading: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'PoppinsSemi',
    marginBottom: 6,
    marginTop: 8,
},
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
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
