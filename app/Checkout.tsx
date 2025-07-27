import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, FlatList, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useAddressStore } from '../store/addressStore';
import { CartItem, useCartStore } from '../store/cartStore';
import { useShippingStore } from '../store/shippingStore';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const Checkout = () => {
    const [loaded] = useFonts({
        PoppinsSemi: require("../assets/fonts/Poppins-SemiBold.ttf"),
        PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
        InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
        InterBold: require("../assets/fonts/Inter-Bold.ttf"),
        Sigmar: require("../assets/fonts/Sigmar-Regular.ttf"),
    })
    useEffect(() => {
        if (loaded) {
            return;
        }
    }, [loaded])
    const { cartItems, loadCart } = useCartStore();

    useEffect(() => {
        loadCart();
    }, []);

    // Get selected address and shipping from stores
    const { selectedAddress } = useAddressStore();
    const { selectedShipping } = useShippingStore();

    const address = selectedAddress || { label: 'Home', desc: 'lorem ispum' };
    const shipping = selectedShipping || {
        label: 'Economy',
        desc: 'Estimated Arrival: 25 Aug 2025',
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <Image source={item.image} style={styles.cartImage} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.cartName}>{item.name} {'\n'}<Text style={styles.cartPack}>{item.pack || 3}</Text></Text>
                <Text style={styles.cartPrice}>Pkr {item.price.toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <ImageBackground
            source={require('../assets/images/ss1.png')}
            style={styles.bg}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                </View>

                {/* Address */}
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <View style={styles.sectionRow}>
                    <IconSymbol name="house.fill" size={22} color={colors.white} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.addressLabel}>{address.label}</Text>
                        <Text style={styles.addressDetails}>{address.desc}</Text>
                    </View>
                    <Button onPress={() => { router.push('/ShippingAddress') }} variant="secondary" style={styles.changeBtn}>
                        Change
                    </Button>
                </View>

                {/* Shipping */}
                <Text style={styles.sectionTitle}>Choose Shipping</Text>
                <View style={styles.sectionRow}>
                    <IconSymbol name="calendar" size={22} color={colors.white} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.shippingLabel}>{shipping.label}</Text>
                        <Text style={styles.shippingEstimate}>{shipping.desc}</Text>
                    </View>
                    <Button onPress={() => { router.push('/ChooseShipping') }} variant="secondary" style={styles.changeBtn}>
                        Change
                    </Button>
                </View>

                {/* Cart Items */}
                <FlatList
                    data={cartItems}
                    renderItem={renderCartItem}
                    keyExtractor={item => item.id}
                    style={{ marginTop: 18, marginBottom: 18 }}
                    showsVerticalScrollIndicator={false}
                />

                {/* Continue to Payment Button */}
                <View style={styles.footer}>
                    <Button variant="secondary" style={styles.payBtn}>
                        Continue to Payment
                    </Button>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 0,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    backBtn: {
        padding: 4,
        marginRight: 8,
    },
    headerTitle: {
        color: colors.white,
        fontSize: 25,
        fontFamily: 'Sigmar',
        letterSpacing: 1,
        flex: 1,
        marginLeft: "18%",
    },
    sectionTitle: {
        color: colors.white,
        fontSize: 20,
        fontFamily: 'PoppinsMedium',
        marginTop: 10,
        marginBottom: 4,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    addressLabel: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: 18,
    },
    addressDetails: {
        color: colors.white,
        fontSize: 15,
        fontFamily: 'PoppinsRegular',
        opacity: 0.7,
    },
    changeBtn: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderColor: colors.white,
        borderWidth: 1,
    },
    changeBtnText: {
        color: colors.primary,
        fontFamily: "PoppinsMedium",
        fontSize: 10,
    },
    shippingLabel: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: 18,
    },
    shippingEstimate: {
        color: colors.white,
        fontSize: 15,
        fontFamily: 'PoppinsRegular',
        opacity: 0.7,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 10,
        marginBottom: 12,
    },
    cartImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        backgroundColor: colors.white,
    },
    cartName: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: 15,
        marginBottom: 2,
    },
    cartPack: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: 15,
        opacity: 0.8,
    },
    cartPrice: {
        color: colors.white,
        fontFamily: 'PoppinsBold',
        fontSize: 18,
        marginTop: 2,
    },

    footer: {
        backgroundColor: colors.secondaryLight,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: -20,
        paddingHorizontal: 20,
        height:"16%",
    },
    payBtn: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Checkout;