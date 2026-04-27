import { Button } from '@/components/Button';
import { selectPhone } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ImageBackground, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useCartStore } from '../../store/cartStore';
import { Api_url } from '@/url/url';
interface CartItem {
  id: string;
  name: string;
  pack: string;
  price: number;
  sale_price?: number;
  points: number;
  quantity: number;
  stock: number;
  image: any;
  variant?: {
    price: number;
    sale_price?: number;
  };
}

interface SizeOption {
  label: string;
  value: string;
  price: number;
}

const sizes: SizeOption[] = [];

export default function CartScreen() {
  const router = useRouter();
  const phone = useAppSelector(selectPhone);
  const [loading, setLoading] = useState(true);
  const allCartItems = useCartStore((state: any) => state.cartItems);
  const cartItems = allCartItems.filter((item: any) =>
    String(item.user) === String(phone)
  );
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState<any>(null);
  const [discountMessage, setDiscountMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [addToCartModalVisible, setAddToCartModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [emptyCartMessage, setEmptyCartMessage] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (phone) {
      useCartStore.getState().loadCart().then(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [phone]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subTotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 0;
  const totalCost = subTotal + deliveryFee - (discount?.discount_amount || 0);
  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      setDiscountMessage('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    setDiscountMessage('');


    try {
      console.log('Sending request to validate promo code:', promoCode.trim());
      const response = await fetch(`${Api_url}api/discounts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          total: subTotal,
          products: cartItems.map((item: any) => Number(item.id)),
          items: cartItems.map((item: any) => ({
            id: Number(item.id),
            price: item.price,
            quantity: item.quantity,
          })),
          phone: phone,
        }),
      });
      console.log("Coupon validation response:", JSON.stringify({
        code: promoCode.trim(),
        total: subTotal,
        products: cartItems.map((item: any) => Number(item.id)),
        items: cartItems.map((item: any) => ({
          id: Number(item.id),
          price: item.price,
          quantity: item.quantity,
        })),
        phone: phone,
      }),)
      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Invalid coupon code for this product');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        const errorMessage = data.detail || data.message || `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.valid) {


        setDiscount(data);
        setDiscountMessage(data.message || 'Promo code applied successfully!');
      } else {
        setDiscount(null);
        setDiscountMessage(data.message || 'Invalid promo code');
        Alert.alert('Invalid Code', data.message || 'The promo code is not valid.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate promo code';
      setDiscount(null);
      setDiscountMessage(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground
        source={require('../../assets/images/Cart.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={router.back}>
              <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cart</Text>
            <View style={styles.backButton} />
          </View>
          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {cartItems.map((item: CartItem, index: number) => {
              const variantKey = item.variant ? `-${JSON.stringify(item.variant)}` : '';
              const uniqueKey = `${item.id}${variantKey}-${index}`;

              return (
                <View key={uniqueKey}>
                  <View style={styles.cartItem}>
                    <View style={styles.imageContainer}>
                      <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={styles.productImage} />
                      <Text style={styles.productPoints}>{item.points} Pts</Text>
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                      {item.pack && <Text style={styles.productPack}>{item.pack}</Text>}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {item.sale_price ? (
                          <>
                            <Text style={[styles.productPrice, { color: 'white' }]}>
                              Pkr {(item.sale_price || 0).toLocaleString()}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.productPrice}>
                            Rs {(item.price || 0).toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.rightSection}>
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.minusButton}
                          onPress={() => useCartStore.getState().updateQuantity(item.id, -1, undefined, item.variant)}
                        >
                          <Ionicons name="remove" size={moderateScale(20)} color="red" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={[
                            styles.plusButton,
                          ]}
                          onPress={() => useCartStore.getState().updateQuantity(item.id, 1, undefined, item.variant)}
                        >
                          <Ionicons
                            name="add"
                            size={moderateScale(20)}
                            color={'red'}
                          />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                          setSelectedItem(item);
                          setDeleteModalVisible(true);
                        }}
                      >
                        <Ionicons name="trash-outline" size={moderateScale(20)} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {index < cartItems.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })}
            {/* Checkout Button */}
            <View style={styles.checkoutContainer}>
              {!phone ? (
                <Button
                  variant="primary"
                  style={styles.checkoutButton}
                  onPress={() => router.push('/Login')}
                >
                  Login to Checkout
                </Button>
              ) : (
                <Button
                  variant="primary"
                  style={styles.checkoutButton}
                  onPress={() => {
                    if (cartItems.length > 0) {
                      setCheckoutModalVisible(true);
                    } else {
                      setEmptyCartMessage('Please add a product to your cart before checking out.');
                      setTimeout(() => setEmptyCartMessage(''), 2000);
                    }
                  }}
                  disabled={cartItems.length === 0}
                >
                  Checkout
                </Button>
              )}
            </View>
          </ScrollView>

          {/* Delete Modal */}
          <Modal
            visible={deleteModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setDeleteModalVisible(false)}
          >
            <Pressable style={modalStyles.overlay} onPress={() => setDeleteModalVisible(false)}>
              <View style={modalStyles.container}>
                <Text style={modalStyles.title}>Remove from Cart</Text>
                <View style={modalStyles.divider} />
                {selectedItem && (
                  <View style={modalStyles.itemRow}>
                    <Image source={selectedItem && typeof selectedItem.image === 'string' ? { uri: selectedItem.image } : selectedItem.image} style={modalStyles.itemImage} />
                    <View>
                      <Text style={modalStyles.itemName} numberOfLines={2}>{selectedItem.name}</Text>
                      <Text style={modalStyles.itemPrice}>Rs {selectedItem.price}</Text>
                    </View>
                  </View>
                )}
                <View style={modalStyles.buttonRow}>
                  <Button
                    variant="primary"
                    style={modalStyles.cancelButton}
                    onPress={() => setDeleteModalVisible(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={modalStyles.removeButton}
                    onPress={() => {
                      if (selectedItem) {
                        useCartStore.getState().removeItem(
                          selectedItem.id,
                          undefined,
                          selectedItem.variant
                        );
                        setDeleteModalVisible(false);
                        setSelectedItem(null);
                      }
                    }}>
                    Yes, Remove
                  </Button>
                </View>
              </View>
            </Pressable>
          </Modal>
          <Modal
            visible={checkoutModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setCheckoutModalVisible(false)}
          >
            <Pressable style={checkoutModalStyles.overlay} onPress={() => setCheckoutModalVisible(false)}>
              <View style={checkoutModalStyles.container}>
                {/* Promo Code Row */}
                <View style={checkoutModalStyles.promoRow}>
                  <View style={[checkoutModalStyles.promoInputBox, { flexDirection: 'row', alignItems: 'center' }]}>
                    <TextInput
                      style={[checkoutModalStyles.promoInputText, { flex: 1 }]}
                      placeholder="Promo Code"
                      placeholderTextColor="#B0B0B0"
                      value={promoCode}
                      onChangeText={setPromoCode}
                    />
                    <TouchableOpacity
                      style={[checkoutModalStyles.applyButton, isValidating && { opacity: 0.6 }]}
                      onPress={validatePromoCode}
                      disabled={!promoCode.trim() || isValidating}
                    >
                      <Text style={checkoutModalStyles.applyButtonText}>
                        {isValidating ? 'Validating...' : 'Apply'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Discount Message */}
                {discountMessage ? (
                  <View style={[
                    styles.discountMessage,
                    {
                      backgroundColor: discountMessage === 'Coupon applied successfully!' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                      borderLeftColor: discountMessage === 'Coupon applied successfully!' ? '#28a745' : '#dc3545'
                    }
                  ]}>
                    <Text style={[
                      styles.discountMessageText,
                      { color: discountMessage === 'Coupon applied successfully!' ? '#28a745' : '#dc3545' }
                    ]}>
                      {discountMessage}
                    </Text>
                  </View>
                ) : null}
                <View style={checkoutModalStyles.calcRow}>
                  <Text style={checkoutModalStyles.label}>Sub-Total</Text>
                  <Text style={checkoutModalStyles.valueBold}>Rs {subTotal.toLocaleString()}</Text>
                </View>
                <View style={checkoutModalStyles.calcRow}>
                  <Text style={checkoutModalStyles.label}>Delivery Fee</Text>
                  <Text style={checkoutModalStyles.valueBold}>Rs {deliveryFee.toLocaleString()}</Text>
                </View>
                {discount?.discount_amount > 0 && (
                  <View style={checkoutModalStyles.calcRow}>
                    <Text style={checkoutModalStyles.label}>Discount Applied</Text>
                    <Text style={[checkoutModalStyles.discountValue, { color: '#28a745' }]}>
                      Rs {discount.discount_amount.toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={checkoutModalStyles.divider} />
                <View style={checkoutModalStyles.calcRow}>
                  <Text style={checkoutModalStyles.label}>Total Cost</Text>
                  <Text style={checkoutModalStyles.totalValue}>Rs {totalCost.toLocaleString()}</Text>
                </View>

                {/* Proceed Button */}
                <Pressable
                  style={({ hovered }) => [
                    checkoutModalStyles.proceedButton,
                    hovered && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => {
                    if (cartItems.length === 0) return;
                    setCheckoutModalVisible(false);
                    // Convert cart items to a format that can be passed as URL params
                    const itemsParam = JSON.stringify(cartItems.map((item: CartItem) => ({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image,
                      quantity: item.quantity,
                      discount_amount: discount?.discount_amount,
                      discount_type: discount?.discount_type,
                      discount_code: discount?.code,
                      variant: item.pack,
                      points: item.points,
                    })));

                    router.push({
                      pathname: '/Checkout',
                      params: {
                        items: itemsParam
                      }
                    });
                  }}
                >
                  <Text style={checkoutModalStyles.proceedButtonText}>Proceed to Checkout</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          {/* Add to Cart Modal */}
          <Modal
            visible={addToCartModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setAddToCartModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              <View style={{ backgroundColor: '#FBF4E4', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, width: '100%', maxWidth: '100%', alignSelf: 'center', }}>
                <Text style={{ color: '#E53935', fontFamily: 'PoppinsBold', fontSize: 18, marginBottom: 10 }}>Sizes</Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  {sizes.map((s, i) => (
                    <TouchableOpacity
                      key={s.label}
                      onPress={() => setSelectedSize(s.label)}
                      style={{
                        borderWidth: selectedSize === s.label ? 2 : 0,
                        borderColor: '#E53935',
                        borderRadius: 12,
                        backgroundColor: '#fff',
                        marginRight: 16,
                        padding: 8,
                        alignItems: 'center',
                        width: 90,
                      }}
                    >
                      <View style={{ width: 48, height: 32, backgroundColor: '#F2F2F2', borderRadius: 8, marginBottom: 6 }} />
                      <Text style={{ color: selectedSize === s.label ? '#E53935' : '#1A1A1A', fontFamily: 'PoppinsBold', fontSize: 14 }}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ height: 1, backgroundColor: '#E5E5E5', marginVertical: 10 }} />
                <Text style={{ color: '#E53935', fontFamily: 'PoppinsBold', fontSize: 16, marginBottom: 8 }}>Quantity</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <TouchableOpacity
                    style={{ backgroundColor: '#E5E5E5', borderRadius: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                    onPress={() => setQty(q => Math.max(1, q - 1))}
                  >
                    <Ionicons name="remove" size={20} color="#E53935" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 18, fontFamily: 'PoppinsBold', color: '#E53935', marginHorizontal: 8 }}>{qty}</Text>
                  <TouchableOpacity
                    style={{ backgroundColor: '#E5E5E5', borderRadius: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
                    onPress={() => setQty(q => q + 1)}
                  >
                    <Ionicons name="add" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
                <View style={{ height: 1, backgroundColor: '#E5E5E5', marginVertical: 10 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ color: '#E53935', fontFamily: 'PoppinsBold', fontSize: 24 }}>
                      Pkr {selectedItem ? (selectedItem.sale_price || selectedItem.price) * qty : 0}/-
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{ backgroundColor: '#E53935', borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}
                    onPress={() => setAddToCartModalVisible(false)}
                  >
                    <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontFamily: 'PoppinsBold', fontSize: 16 }}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Empty Cart Message */}
          {emptyCartMessage ? (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
              <View style={{ backgroundColor: '#E53935', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{emptyCartMessage}</Text>
              </View>
            </View>
          ) : null}

        </View>
      </ImageBackground>
    </SafeAreaView>

  );
}

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
  backButton: {
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
  cartList: {
    flex: 1,
    paddingHorizontal: scale(20),
    height: verticalScale(2022),
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: verticalScale(15),
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: scale(15),
  },
  discountMessage: {
    padding: verticalScale(10),
    marginHorizontal: scale(20),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
  },
  discountMessageText: {
    fontSize: moderateScale(14),
    fontFamily: "PoppinsMedium",
    color: '#28a745',
    textAlign: 'center',
  },
  productImage: {
    width: "100%",
    resizeMode: 'contain',
    height: moderateScale(80),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(4),
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: moderateScale(14),
    fontFamily: "PoppinsMedium",
    color: 'white',
    marginBottom: verticalScale(2),
  },
  productPack: {
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    fontFamily: "PoppinsMedium",
    marginBottom: verticalScale(4),
  },
  productPrice: {
    fontSize: moderateScale(16),
    fontFamily: "PoppinsBold",
    color: 'white',
    marginBottom: verticalScale(2),
  },
  productPoints: {
    fontSize: moderateScale(18),
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: "PoppinsBold",
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(8),
  },
  minusButton: {
    backgroundColor: "white",
    width: moderateScale(24),
    height: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(4),
  },
  plusButton: {
    backgroundColor: "white",
    width: moderateScale(24),
    height: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(4),
  },
  quantityText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginHorizontal: scale(12),
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#999',
  },
  removeButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: verticalScale(1),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: verticalScale(5),
  },
  checkoutContainer: {
    paddingHorizontal: scale(25),
    paddingVertical: verticalScale(60),
    marginBottom: verticalScale(20),
  },
  checkoutButton: {
    backgroundColor: 'white',
    borderRadius: moderateScale(25),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
    bottom: verticalScale(20),
  },
  checkoutText: {
    color: '#FF0000',
    fontSize: moderateScale(18),
    fontFamily: "PoppinsMedium",
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#E53935',
    borderTopLeftRadius: moderateScale(32),
    borderTopRightRadius: moderateScale(32),
    padding: scale(24),
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginBottom: verticalScale(8),
  },
  divider: {
    width: '100%',
    height: verticalScale(1),
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: verticalScale(8),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(16),
    width: scale(320),
  },
  itemImage: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(12),
    backgroundColor: 'white',
    marginRight: scale(10),
  },
  itemName: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    marginBottom: verticalScale(4),
  },
  itemPrice: {
    color: 'white',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: verticalScale(24),
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: moderateScale(24),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(32),
    marginRight: scale(12),
  },
  cancelText: {
    color: '#E53935',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: 'white',
    borderRadius: moderateScale(24),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(32),
  },
  removeText: {
    color: '#E53935',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
});

const checkoutModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF8F6',
    borderTopLeftRadius: moderateScale(28),
    borderTopRightRadius: moderateScale(28),
    padding: scale(24),
    alignItems: 'center',
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(18),
    marginTop: verticalScale(8),
  },
  promoInputBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: moderateScale(34),
    borderWidth: moderateScale(2),
    borderColor: '#E53935',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(6),
    marginRight: scale(10),
  },
  promoInputText: {
    color: '#E53935',
    fontSize: moderateScale(16),
  },
  applyButton: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(25),
    paddingVertical: verticalScale(4),
    paddingHorizontal: scale(22),
  },
  applyButtonText: {
    color: 'white',
    fontFamily: 'PoppinsMedium',
    fontSize: moderateScale(16),
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: verticalScale(4),
  },
  label: {
    color: '#E53935',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  valueBold: {
    color: '#E53935',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  discountValue: {
    color: '#E53935',
    fontSize: moderateScale(16),
    fontWeight: 'bold',
  },
  divider: {
    width: '100%',
    height: verticalScale(1),
    backgroundColor: '#E5E5E5',
    marginVertical: verticalScale(12),
  },
  totalValue: {
    color: '#E53935',
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
  proceedButton: {
    backgroundColor: '#E53935',
    borderRadius: moderateScale(24),
    width: '100%',
    alignItems: 'center',
    paddingVertical: verticalScale(14),
    marginTop: verticalScale(24),
  },
  proceedButtonText: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
}); 