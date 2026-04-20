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

const PAYMENT_METHODS = [
    {
        id: 'card',
        label: 'Add Card',
        icon: <Ionicons name="card-outline" size={moderateScale(25)} color={colors.primary} />,
    },
];
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
    const createOrder = async () => {
        if (!selected) return Alert.alert("Error", "Select payment method");
        if (!shippingAddress || !shippingMethod) return Alert.alert("Error", "Missing shipping");

        setIsLoading(true);

        try {
            const orderData = {
                user_id: userId,
                applied_points: points || 0,
                user_detail: { number: phone },
                address: shippingAddress,
                shipping: shippingMethod,
                status: 'pending',
                product: parsedCartItems.map((item: any) => ({
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

                        <TouchableOpacity
                            style={styles.cardRow}
                            onPress={() => setSelected('card')}
                        >
                            {/* LEFT SIDE */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                {PAYMENT_METHODS[0].icon}
                                <Text style={[styles.cardLabel, { marginLeft: 10 }]}>Add Card</Text>
                            </View>

                            {/* RIGHT SIDE (RADIO) */}
                            <View style={[
                                styles.radioButton,
                                selected === 'card' && styles.radioButtonSelected
                            ]}>
                                {selected === 'card' && <View style={styles.radioButtonInner} />}
                            </View>
                        </TouchableOpacity>

                        {/* SPLIT PAYMENT SECTION */}
                        <Text style={styles.sectionTitle}>Split Payment</Text>

                        <View style={styles.splitRow}>
                            <Text style={styles.cardLabel}>Enable Split Payment</Text>
                            <Switch
                                value={splitEnabled}
                                onValueChange={setSplitEnabled}
                                trackColor={{
                                    false: '#ccc',
                                    true: 'red',   // ON state background
                                }}
                                thumbColor={splitEnabled ? 'red' : '#f4f3f4'}
                            />
                        </View>

                        {splitEnabled && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={styles.subHeading}>Total Points</Text>
                                <TextInput
                                    placeholder="Enter Points"
                                    placeholderTextColor="#999"
                                    editable={false}
                                    value={(typeof user === 'object' && user?.total_points?.toString()) || ''}
                                    keyboardType="numeric"
                                    style={styles.input}
                                />

                                <TextInput
                                    placeholder="Enter Points"
                                    placeholderTextColor="#999"
                                    value={points}
                                    keyboardType="numeric"
                                    onChangeText={(value) => {
                                        const numericValue = value.replace(/[^0-9]/g, '');

                                        const maxPoints =
                                            typeof user === 'object' ? Number(user?.total_points) || 0 : 0;

                                        if (Number(numericValue) <= maxPoints) {
                                            setPoints(numericValue);
                                        } else {
                                            setPoints(maxPoints.toString());
                                            Alert.alert('Limit exceeded', 'You cannot use more than your total points');
                                        }
                                    }}
                                    style={styles.input}
                                />

                                {/* CASH */}
                                <Text style={styles.subHeading}>Cash Amount</Text>
                                <TextInput
                                    placeholder="Enter Cash Amount"
                                    value={finalTotal?.toString() || ''}
                                    editable={false}
                                    keyboardType="numeric"
                                    style={styles.input}
                                />
                            </View>
                        )}
                        <Text style={styles.sectionTitle}>More Options</Text>

                        {MORE_OPTIONS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.cardRow,
                                    selected === item.id && styles.selectedRow
                                ]}
                                onPress={() => setSelected(item.id)}
                            >
                                {/* LEFT SIDE */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Image
                                        source={item.icon}
                                        style={{ width: 25, height: 25, marginRight: 10 }}
                                    />
                                    <Text style={styles.cardLabel}>{item.label}</Text>
                                </View>

                                {/* RIGHT SIDE RADIO */}
                                <View style={[
                                    styles.radioButton,
                                    selected === item.id && styles.radioButtonSelected
                                ]}>
                                    {selected === item.id && <View style={styles.radioButtonInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}
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

                            <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 12 }}>
                                <Text>Total: PKR {cartTotal.toFixed(2)}</Text>

                                {splitEnabled && (
                                    <Text>Redeem: - PKR {redeemValue.toFixed(2)}</Text>
                                )}

                                <Text style={{ fontWeight: 'bold', marginTop: 5 }}>
                                    Payable: PKR {finalTotal.toFixed(2)}
                                </Text>
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
        paddingVertical: 12,
        backgroundColor: colors.primary,
    },
    disabledBtn: { backgroundColor: 'gray' },
});

export default Payment;
