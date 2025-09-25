import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Button } from '../components/Button';
import { IconSymbol } from '../components/ui/IconSymbol';
import { useAddressStore } from '../store/addressStore';
import { useShippingStore } from '../store/shippingStore';
import { colors } from '../theme/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
const { width, height } = Dimensions.get('window');
type CheckoutParams = {
    name?: string;
    price?: string;
    image?: string;
    quantity?: string;
    variant?: string;
    points?: string;
  } & Record<string, string | string[]>;
const Checkout = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<CheckoutParams>();
  
  // Parse the items from the URL params or use individual params
  let cartItems: CheckoutParams[] = [];
  
  // Check if we have items in the cart (from Cart.tsx)
  if (params?.items) {
    try {
      const itemsData = Array.isArray(params.items) ? params.items[0] : params.items;
      cartItems = JSON.parse(itemsData);
    } catch (error) {
      console.error('Error parsing cart items:', error);
    }
  } 
  // If no items in cart but we have individual item params (from Mall.tsx)
  else if (params?.name) {
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

  // Log the complete params and cart items for debugging
  useEffect(() => {
        return () => {
            // Clear address and shipping when leaving Checkout
            useAddressStore.getState().setSelectedAddress(null);
            useShippingStore.getState().setSelectedShipping(null);
        };
    }, []);
 
  
    const { selectedAddress } = useAddressStore();
    const { selectedShipping } = useShippingStore();

    const address = selectedAddress
    const shipping = selectedShipping 

    const renderCartItem = ({ item }: { item: CheckoutParams }) => {
        console.log('Rendering item:', JSON.stringify(item, null, 2));
        return (
            <View style={styles.cartItem}>
                <Image 
                    source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                    style={styles.cartImage} 
                    resizeMode="cover" 
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
        <SafeAreaView style={{flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
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

                {/* Address */}
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <View style={styles.sectionRow}>
                    <IconSymbol name="location.fill" size={30} color={colors.white} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.addressLabel}>{address?.label}</Text>
                        <Text style={styles.addressDetails}>{address?.desc}</Text>
                    </View>
                    <Button onPress={() => { router.push('/ShippingAddress') }} variant="secondary" style={styles.changeBtn}>
                        Change
                    </Button>
                </View>

                {/* Shipping */}
                <Text style={styles.sectionTitle}>Choose Shipping</Text>
                <View style={styles.sectionRow}>
                    <Image source={require('../assets/Icon/Box.png')} 
                    resizeMode='contain'
                    style={{width:scale(30), height:scale(40), tintColor: colors.white}}/>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.shippingLabel}>{shipping?.label}</Text>
                        <Text style={styles.shippingEstimate}>{shipping?.desc}</Text>
                    </View>
                    <Button onPress={() => { router.push('/ChooseShipping') }} variant="secondary" style={styles.changeBtn}>
                        Change
                    </Button>
                </View>

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
                        <Text style={{color: colors.white, textAlign: 'center', marginTop: 20}}>
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
                            if (!selectedAddress) {
                                alert('Please select a shipping address');
                                return;
                            }
                            
                            if (!selectedShipping) {
                                alert('Please select a shipping method');
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
        paddingHorizontal:scale(20),
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
        lineHeight:verticalScale(18),
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
        lineHeight:verticalScale(18),
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