import { Button } from '@/components/Button';
import SuccessModal from '@/components/SuccessModal';
import { useAuth } from '@/hooks/useAuth';
import { fetchUsers, UserItem } from '@/services/user';
import { useCartStore } from '@/store/cartStore';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';
import { createOrderApi } from '../services/orders';

const { width } = Dimensions.get('window');

// const PAYMENT_METHODS = [
//     {
//         id: 'card',
//         label: 'Add Card',
//         icon: <Ionicons name="card-outline" size={moderateScale(25)} color={colors.primary} />,
//     },
// ];
const MORE_OPTIONS =
    [
        {
            id: 'Cod',
            label: 'Cash on Delivery',
            icon: require('../assets/images/cash.png'),
        },
    ];
const Payment = () => {
    const router = useRouter();
    const [selected, setSelected] = useState<string>('Cod');
    const [isLoading, setIsLoading] = useState(false);

    const { clearCart } = useCartStore();
    const { isAuthenticated, phone, token } = useAuth();

    const {
        shippingAddress: shippingAddressStr,
        // shippingMethod: shippingMethodStr,
        cartItems
    } = useLocalSearchParams<any>();

    const shippingAddress = useMemo(() => shippingAddressStr ? JSON.parse(shippingAddressStr) : null, [shippingAddressStr]);
    // const shippingMethod = useMemo(() => shippingMethodStr ? JSON.parse(shippingMethodStr) : null, [shippingMethodStr]);

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
    const [isRedeemChecked, setIsRedeemChecked] = useState(true);
    const [cash, setCash] = useState('');
    const [user, setUser] = useState<UserItem | string | null | undefined>(undefined);
    const [userId, setUserId] = useState<string | number | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await fetchUsers();
                const matchedUser = users.find((u) => u.number === phone);

                if (matchedUser) {
                    setUser(matchedUser);
                    setUserId(matchedUser.id);
                    console.log('Matched user:', matchedUser);
                    console.log('Matched user ID:', matchedUser.id);
                } else {
                    console.log('No user found with phone:', phone);
                    setUser(token);
                }
            } catch (error) {
                console.error('Error loading users:', error);
                setUser(token);
            }
        };
        if (phone) {
            loadUsers();
        } else {
            setUser(token); // Fallback to token if no phone
        }

    }, [phone, token]);
    useEffect(() => {
        if (typeof user === 'object' && user?.total_points) {
            setPoints(user.total_points.toString());
        }
    }, [user]);
    useEffect(() => {
        if (splitEnabled) {
            // ON → restore max points
            const maxPoints =
                typeof user === 'object' ? Number(user?.total_points) || 0 : 0;

            setPoints(maxPoints.toString());
            setIsRedeemChecked(true);
        } else {
            // OFF → clear everything
            setPoints('');
            setIsRedeemChecked(false);
        }
    }, [splitEnabled, user]);
    const createOrder = async () => {
        if (!selected) return Alert.alert("Error", "Select payment method");
        if (!shippingAddress) return Alert.alert("Error", "Missing shipping");

        setIsLoading(true);

        try {
            const orderData = {
                user_id: userId,
                applied_points: points || 0,
                user_detail: { number: phone },
                address: shippingAddress,
                shipping: 'Standard',
                status: 'pending', 
                discount_code: discount.code || '',
                discount_type: discount.type || 0,
                discount_amount: discount.amount,
                product: parsedCartItems.map((item: any) => ({
                    id: item.id,
                    image: item.image,
                    name: item.name,
                    pts: item.points || null,
                    quantity: item.quantity || 1,
                    variants: item.variants || null,
                    price: item.price
                })),
                payment: [{
                    method: selected,
                    status: "Pending"
                }],
                created_at: new Date().toISOString(),
            };
            console.log('Order data:', orderData);
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
    const cartTotal = useMemo(() => {
        return parsedCartItems.reduce((sum: number, item: any) => {
            return sum + (item.price * (item.quantity || 1));
        }, 0);
    }, [parsedCartItems]);
    const redeemValue = useMemo(() => {
        const pts = Number(points) || 0;
        const pointValue = typeof user === 'object' ? Number(user?.point_value) || 0 : 0;

        return pts * pointValue;
    }, [points, user]);
    const discount = useMemo(() => {
        if (!parsedCartItems.length) {
            return { amount: 0, type: null, code: null };
        }

        return {
            amount: Number(parsedCartItems[0]?.discount_amount) || 0,
            type: parsedCartItems[0]?.discount_type || null,
            code: parsedCartItems[0]?.discount_code || null,
        };
    }, [parsedCartItems]);
    const finalTotal = useMemo(() => {
        const total = cartTotal - redeemValue;
        return total > 0 ? total : 0; // prevent negative
    }, [cartTotal, redeemValue]);
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
                {item.variant && (
                    <Text style={styles.cartPack}>
                        {item.variant}
                    </Text>
                )}
                <Text style={{ color: 'white' }}>Qty: {item.quantity}</Text>
                <Text style={styles.cartPrice}>Rs {item.price}</Text>
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

                        {/* <TouchableOpacity
                            style={styles.cardRow}
                            onPress={() => setSelected('card')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                {PAYMENT_METHODS[0].icon}
                                <Text style={[styles.cardLabel, { marginLeft: 10 }]}>Add Card</Text>
                            </View>
                            <View style={[
                                styles.radioButton,
                                selected === 'card' && styles.radioButtonSelected
                            ]}>
                                {selected === 'card' && <View style={styles.radioButtonInner} />}
                            </View>
                        </TouchableOpacity> */}

                        {/* SPLIT PAYMENT SECTION */}
                        <View style={styles.splitRow}>
                            <Text style={styles.sectionTitle}>Want to split payment</Text>
                            <Switch
                                value={splitEnabled}
                                onValueChange={setSplitEnabled}
                                trackColor={{
                                    false: '#ccc',
                                    true: '#ccc',   // ON state background
                                }}
                                thumbColor={splitEnabled ? 'red' : '#f4f3f4'}
                            />
                        </View>

                        {splitEnabled && (
                            <View style={{ marginBottom: 15 }}>

                                {/* ROW: CHECKBOX + LABEL + INPUT */}
                                <View style={styles.redeemRow}>

                                    {/* LEFT: CHECKBOX + TEXT */}
                                    <TouchableOpacity
                                        style={styles.redeemLeft}
                                        onPress={() => {
                                            setIsRedeemChecked(!isRedeemChecked);

                                            if (!isRedeemChecked) {
                                                // turning ON → restore max points
                                                const maxPoints =
                                                    typeof user === 'object' ? Number(user?.total_points) || 0 : 0;
                                                setPoints(maxPoints.toString());
                                            } else {
                                                // turning OFF → clear points
                                                setPoints('');
                                            }
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[
                                            styles.checkbox,
                                            isRedeemChecked ? styles.checkboxActive : {}
                                        ]}>
                                            {isRedeemChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>

                                        <Text style={styles.redeemText}>Redeemable Points</Text>
                                    </TouchableOpacity>

                                    <TextInput
                                        placeholder="0"
                                        placeholderTextColor="#999"
                                        value={points}
                                        keyboardType="numeric"
                                        editable={splitEnabled && isRedeemChecked}   // ✅ HARD DISABLE
                                        selectTextOnFocus={splitEnabled && isRedeemChecked} // ✅ prevent cursor
                                        pointerEvents={isRedeemChecked ? 'auto' : 'none'}   // ✅ block touches
                                        style={[
                                            styles.redeemInput,
                                            !isRedeemChecked && styles.disabledInput
                                        ]}
                                        onChangeText={(value) => {
                                            if (!isRedeemChecked) return; // extra safety

                                            const numericValue = value.replace(/[^0-9]/g, '');
                                            const maxPoints =
                                                typeof user === 'object'
                                                    ? Number(user?.total_points) || 0
                                                    : 0;

                                            if (Number(numericValue) <= maxPoints) {
                                                setPoints(numericValue);
                                            } else {
                                                setPoints(maxPoints.toString());
                                                Alert.alert('Limit exceeded', 'You cannot use more than your total points');
                                            }
                                        }}
                                    />
                                </View>
                                <View style={styles.calcBox}>

                                    {/* TOP ROW */}
                                    <View style={styles.calcRow}>
                                        <Text style={styles.calcLabel}>Available</Text>
                                        <Text style={styles.calcValue}>
                                            {typeof user === 'object' ? user?.total_points || 0 : 0} pts
                                        </Text>
                                    </View>

                                    {/* DIVIDER */}
                                    <View style={styles.calcDivider} />

                                    {/* CALCULATION ROW */}
                                    <View style={styles.calcRow}>
                                        <Text style={styles.calcLabel}>
                                            {points || 0} pts × {typeof user === 'object' ? Number(user?.point_value || 0) : 0}
                                        </Text>
                                        <Text style={styles.calcValue}>
                                            Rs {redeemValue.toFixed(2)}
                                        </Text>
                                    </View>

                                </View>

                                {/* CASH ON DELIVERY BELOW */}
                                {MORE_OPTIONS.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.cardRow,
                                            selected === item.id && styles.selectedRow
                                        ]}
                                        onPress={() => setSelected(item.id)}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <Image
                                                source={item.icon}
                                                style={{ width: 25, height: 25, marginRight: 10 }}
                                            />
                                            <Text style={styles.cardLabel}>{item.label}</Text>
                                        </View>

                                        <View style={[
                                            styles.radioButton,
                                            selected === item.id && styles.radioButtonSelected
                                        ]}>
                                            {selected === item.id && <View style={styles.radioButtonInner} />}
                                        </View>
                                    </TouchableOpacity>
                                ))}

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
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.sectionTitle}>Summary</Text>
                            <View style={styles.summaryBox}>

                                {/* TOTAL */}
                                <View style={styles.calcRow}>
                                    <Text style={styles.calcLabel}>Subtotal</Text>
                                    <Text style={styles.calcValue}>Rs {cartTotal.toFixed(2)}</Text>
                                </View>

                                {/* DISCOUNT */}
                                {discount.amount > 0 && (
                                    <View style={styles.calcRow}>
                                        <Text style={styles.calcLabel}>Discount</Text>
                                        <Text style={styles.negativeValue}>- Rs {discount.amount}</Text>
                                    </View>
                                )}

                                {/* POINTS */}
                                {splitEnabled && Number(points) > 0 && (
                                    <View style={styles.calcRow}>
                                        <Text style={styles.calcLabel}>Points Redeemed</Text>
                                        <Text style={styles.negativeValue}>
                                            Rs {redeemValue.toFixed(2)}
                                        </Text>
                                    </View>
                                )}

                                {/* DIVIDER */}
                                <View style={styles.calcDivider} />

                                {/* FINAL */}
                                <View style={styles.calcRow}>
                                    <Text style={styles.totalLabel}>Total Payable</Text>
                                    <Text style={styles.totalValue}>
                                        Rs {(finalTotal - discount.amount).toFixed(2)}
                                    </Text>
                                </View>

                            </View>
                        </View>
                    </ScrollView>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <Button onPress={createOrder} disabled={isLoading} style={styles.confirmBtn}>
                            <Text style={{ color: colors.white, textAlign: 'center' }}>Confirm Payment</Text>
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
        marginTop: 10,
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
        width: scale(80),
        height: scale(80),
        borderRadius: 12,
        backgroundColor: colors.white,
    },
    cartName: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: moderateScale(15),
    },
    cartPack: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: moderateScale(12),
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
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    redeemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    redeemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },

    checkboxActive: {
        backgroundColor: colors.primary,
    },

    redeemText: {
        color: colors.primary,
        fontFamily: 'PoppinsSemi',
        fontSize: 14,
    },

    redeemInput: {
        minWidth: 80,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        textAlign: 'right',
    },
    disabledInput: {
        backgroundColor: '#f3f4f6',
        color: '#9ca3af',
        borderColor: '#e5e7eb',
    },
    availablePoints: {
        color: '#fff',
        fontSize: 12,

        opacity: 0.8,
    },
    calcBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 10,
        marginTop: 8,
        marginBottom: 10,
    },

    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14,
        padding: 12,
    },

    negativeValue: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'PoppinsSemi',
    },

    totalLabel: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'PoppinsSemi',
    },

    totalValue: {
        color: '#4ade80', // green highlight
        fontSize: 16,
        fontFamily: 'PoppinsBold',
    },
    calcLabel: {
        color: '#fff',
        fontSize: 13,
        opacity: 0.8,
    },

    calcValue: {
        color: '#fff',
        fontSize: 13,
        fontFamily: 'PoppinsSemi',
    },

    calcDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 6,
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
        paddingVertical: 12,
        backgroundColor: colors.primary,
    },
    disabledBtn: { backgroundColor: 'gray' },
});

export default Payment;
