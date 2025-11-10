import { useAuth } from '@/hooks/useAuth';
import { useAddressStore } from '@/store/addressStore';
import { useShippingStore } from '@/store/shippingStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/ui/IconSymbol';
import { colors } from '../theme/colors';
import AlertModal from '@/components/Alert';
const { width, height } = Dimensions.get('window');
type CheckoutParams = {
    name?: string;
    price?: string;
    image?: string;
    cost_price?: string;
    quantity?: string;
    variant?: string;
    points?: string;
} & Record<string, string | string[]>;
const Checkout = () => {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<CheckoutParams>();
    const { selectedAddress } = useAddressStore();
    const { selectedShipping } = useShippingStore();
    const { isAuthenticated } = useAuth();
    const [AddressModal, setAddressModal] = useState(false);
    const [ShippingModal, setShippingModal] = useState(false);
    const handleAddressModalClose = () => {
        setAddressModal(false);
        router.push('/ShippingAddress');
    };

    const handleShippingModalClose = () => {
        setShippingModal(false);
        router.push('/ChooseShipping');
    };

    let cartItems: CheckoutParams[] = [];

    if (params?.items) {
        try {
            const itemsData = Array.isArray(params.items) ? params.items[0] : params.items;
            cartItems = JSON.parse(itemsData);
        } catch (error) {
            console.error('Error parsing cart items:', error);
        }
    } else if (params?.name) {
        cartItems = [{
            name: params.name || '',
            image: params.image || '',
            quantity: params.quantity || '1',
            variant: params.variant || '',
            points: params.points || '0',
            description: params.description || '',
            type: params.type || '',
            userPoints: params.userPoints || '0'
        }];
    }



    const renderCartItem = ({ item }: { item: CheckoutParams }) => {
        console.log('Rendering item:', JSON.stringify(item, null, 2));
        return (
            <View style={styles.cartItem}>
                <Image
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                    style={styles.cartImage}
                    resizeMode="contain"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cartName}>
                        {item.name}
                        {item.variant && <Text style={styles.cartPack}>{'\n'}{item.variant}</Text>}
                    </Text>
                    {item.price && item.price !== 'null' ? (
                        <Text style={styles.cartPrice}>Pkr {item.price}</Text>
                    ) : item.points && item.points !== 'null' ? (
                        <Text style={styles.cartPrice}>Pts: {item.points}</Text>
                    ) : (
                        <Text style={styles.cartPrice}>No price available</Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
            <ImageBackground
                source={require('../assets/images/ss1.png')}
                style={styles.bg}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.backBtn} onPress={router.back}>
                            <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Checkout</Text>
                    </View>

                    {/* Address - Only show for logged-in users */}
                    {isAuthenticated ? (
                        <>
                            <Text style={styles.sectionTitle}>Shipping Address</Text>
                            <View style={styles.sectionRow}>
                                <IconSymbol name="location.fill" size={30} color={colors.white} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.addressLabel}>
                                        {selectedAddress ? `${selectedAddress.street}` : 'Select Address'}
                                    </Text>
                                    {selectedAddress ? (
                                        <View>
                                            <Text style={styles.addressDetails}>{selectedAddress.street}</Text>
                                            <Text style={styles.addressDetails}>
                                                {selectedAddress.city}{selectedAddress.block ? `, ${selectedAddress.block}` : ''}
                                            </Text>

                                        </View>
                                    ) : (
                                        <Text style={styles.addressDetails}>No Address Selected</Text>
                                    )}
                                </View>
                                <Button
                                    onPress={() => router.push('/ShippingAddress')}
                                    variant="secondary"
                                    style={styles.changeBtn}
                                >
                                    {selectedAddress ? 'Change' : 'Change'}
                                </Button>
                            </View>
                            <AlertModal
                                visible={AddressModal}
                                message="Address Required"
                                subtitle="Please add an address before redeeming."
                                autoCloseDelay={1000}
                                onClose={handleAddressModalClose}
                            />
                        
                            <Text style={styles.sectionTitle}>Shipping Method</Text>
                            <View style={styles.sectionRow}>
                                {selectedShipping ? (
                                    <Image
                                        source={selectedShipping.image}
                                        resizeMode='contain'
                                        style={{ width: scale(30), height: scale(40), tintColor: colors.white }}
                                    />
                                ) : (
                                    <Image
                                        source={require('../assets/images/Box.png')}
                                        resizeMode='contain'
                                        style={{ width: scale(30), height: scale(40), tintColor: colors.white }}
                                    />
                                )}
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.shippingLabel}>
                                        {selectedShipping ? selectedShipping.label : 'Select Shipping'}
                                    </Text>
                                    <Text style={styles.shippingEstimate}>
                                        {selectedShipping ? selectedShipping.desc : 'No Shipping Method Selected'}
                                    </Text>
                                </View>
                                <Button
                                    onPress={() => router.push('/ChooseShipping')}
                                    variant="secondary"
                                    style={styles.changeBtn}
                                >
                                    {selectedShipping ? 'Change' : 'Select'}
                                </Button>
                            </View>
                            <AlertModal
                                visible={ShippingModal}
                                message="Shipping Required"
                                subtitle="Please add a shipping method before redeeming."
                                autoCloseDelay={1000}
                                onClose={handleShippingModalClose}
                            />
                        </>
                    ) : (
                        <View style={styles.loginPrompt}>
                            <Text style={styles.loginText}>Please log in to manage shipping options</Text>
                            <Button
                                onPress={() => router.push('/Login')}
                                variant="secondary"
                                style={styles.loginButton}
                            >
                                Log In
                            </Button>
                        </View>
                    )}

                    {/* Cart Items */}
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item, index) => {
                            const variantKey = item.variant ? `-${JSON.stringify(item.variant)}` : '';
                            return `${item.name || 'item'}-${index}${variantKey}`;
                        }}
                        style={{ marginTop: 18, marginBottom: 18 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={{ color: colors.white, textAlign: 'center', marginTop: 20 }}>
                                No items in cart
                            </Text>
                        }
                    />

                    {/* Continue to Payment Button */}
                    <View style={styles.footer}>
                        <Button
                            variant="secondary"
                            style={styles.payBtn}
                            onPress={() => {
                                if (!isAuthenticated) {
                                    Alert.alert('Login Required', 'Please log in to proceed with checkout');
                                    router.push('/Login');
                                    return;
                                }

                                if (!selectedAddress) {
                                   setAddressModal(true)
                                    return;
                                }

                                if (!selectedShipping) {
                                  setShippingModal(true)
                                    return;
                                }

                                router.push({
                                    pathname: '/PaymentMethod',
                                    params: {
                                        cartItems: JSON.stringify(cartItems),
                                        shippingAddress: JSON.stringify(selectedAddress),
                                        shippingMethod: JSON.stringify(selectedShipping)
                                    }
                                });
                            }}
                        >
                            Continue to Payment
                        </Button>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
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
        paddingHorizontal: scale(20),
    },
    headerRow: {
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
        fontSize: moderateScale(20),
        fontFamily: 'PoppinsMedium',
        marginTop: 10,
        marginBottom: 4,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
    },
    addressLabel: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: moderateScale(18),
        lineHeight: verticalScale(18),
    },
    addressDetails: {
        color: colors.white,
        fontSize: moderateScale(15),
        fontFamily: 'PoppinsRegular',
        opacity: 0.7,
    },
    changeBtn: {
        borderRadius: 16,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderColor: colors.white,
        borderWidth: 1,
    },
    changeBtnText: {
        color: colors.primary,
        fontFamily: "PoppinsMedium",
        fontSize: moderateScale(10),
    },
    shippingLabel: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: moderateScale(18),
        lineHeight: verticalScale(18),
    },
    shippingEstimate: {
        color: colors.white,
        fontSize: moderateScale(12),
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
    loginPrompt: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
        alignItems: 'center',
    },
    loginText: {
        color: colors.white,
        fontFamily: 'PoppinsMedium',
        fontSize: moderateScale(16),
        marginBottom: 12,
        textAlign: 'center',
    },
    loginButton: {
        width: '60%',
        borderRadius: 8,
    },
    footer: {
        backgroundColor: colors.secondaryLight,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: scale(-20),
        paddingHorizontal: scale(20),
        height: verticalScale(100),
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