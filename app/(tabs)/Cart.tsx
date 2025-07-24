import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCartStore } from '../../store/cartStore';

interface CartItem {
  id: string;
  name: string;
  pack: string;
  price: number;
  points: number;
  quantity: number;
  image: any;
}

export default function CartScreen() {
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const allCartItems = useCartStore((state: any) => state.cartItems);
  const cartItems = allCartItems.filter((item: any) => item.user === phone);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [addToCartModalVisible, setAddToCartModalVisible] = useState(false);
  const [selectedSize, setSelectedSize] = useState('Pack of 3');
  const [qty, setQty] = useState(1);
  const [loaded] = useFonts({
    RussoOne: require("../../assets/fonts/RussoOne-Regular.ttf"),
    PoppinsMedium: require("../../assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemi: require("../../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../../assets/fonts/Poppins-Bold.ttf"),
    Sigmar: require("../../assets/fonts/Sigmar-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      return;
    }
  }, [loaded]);

  const migrateCartItems = async () => {
    const phone = await AsyncStorage.getItem('phone');
    if (!phone) return;
    const raw = await AsyncStorage.getItem('cartItems');
    if (!raw) return;
    const items = JSON.parse(raw);
    const migrated = items.map((item: any) =>
      item.user ? item : { ...item, user: phone }
    );
    await AsyncStorage.setItem('cartItems', JSON.stringify(migrated));
  };

  useEffect(() => {
    migrateCartItems().then(() => {
      Promise.all([
        AsyncStorage.getItem('phone').then(setPhone),
        useCartStore.getState().loadCart()
      ]).then(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Loading...</Text></View>;
  }

  const sizes = [
    { label: 'Pack of 3', price: 200 },
    { label: 'Pack of 7x4', price: 400 },
    { label: 'Pack of 3x12', price: 600 },
  ];

  // Dynamic calculations
  const subTotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 120;
  const discount = Math.round(subTotal * 0.10); // 10% discount
  const totalCost = subTotal + deliveryFee - discount;

  return (
    <ImageBackground
      source={require('../../assets/images/Cart.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Cart</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Cart Items */}
        <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
          {cartItems.map((item: CartItem, index: number) => (
            <View key={item.id + '-' + index}>
              <View style={styles.cartItem}>
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.productImage} />
                  <Text style={styles.productPoints}>{item.points} Pts</Text>
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {item.pack && <Text style={styles.productPack}>{item.pack}</Text>}
                  <Text style={styles.productPrice}>Pkr {item.price.toLocaleString()}</Text>
                </View>

                <View style={styles.rightSection}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.minusButton}
                      onPress={() => useCartStore.getState().updateQuantity(item.id, -1)}
                    >
                      <Ionicons name="remove" size={20} color="red" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.plusButton}
                      onPress={() => useCartStore.getState().updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={20} color="red" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setSelectedItem(item);
                      setDeleteModalVisible(true);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              {index < cartItems.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
            <Button variant="primary" style={styles.checkoutButton} onPress={() => setCheckoutModalVisible(true)}>
              Checkout
            </Button>
          </View>
        </ScrollView>

        {/* Delete Modal */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={modalStyles.overlay}>
            <View style={modalStyles.container}>
              <Text style={modalStyles.title}>Remove from Cart</Text>
              <View style={modalStyles.divider} />
              {selectedItem && (
                <View style={modalStyles.itemRow}>
                  <Image source={selectedItem.image} style={modalStyles.itemImage} />
                  <View>
                    <Text style={modalStyles.itemName}>{selectedItem.name}</Text>
                    <Text style={modalStyles.itemPrice}>Pkr {selectedItem.price}</Text>
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
                      useCartStore.getState().removeItem(selectedItem.id);
                      setDeleteModalVisible(false);
                    }
                  }}>
                  Yes, Remove
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Checkout Modal */}
        <Modal
          visible={checkoutModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCheckoutModalVisible(false)}
        >
          <View style={checkoutModalStyles.overlay}>
            <View style={checkoutModalStyles.container}>
              {/* Promo Code Row */}
              <View style={checkoutModalStyles.promoRow}>
                <View style={checkoutModalStyles.promoInputBox}>
                  <TextInput
                    style={checkoutModalStyles.promoInputText}
                    placeholder="Promo Code"
                    placeholderTextColor="#B0B0B0"
                    value={promoCode}
                    onChangeText={setPromoCode}
                  />
                </View>
                <TouchableOpacity style={checkoutModalStyles.applyButton}>
                  <Text style={checkoutModalStyles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Calculation Rows */}
              <View style={checkoutModalStyles.calcRow}>
                <Text style={checkoutModalStyles.label}>Sub-Total</Text>
                <Text style={checkoutModalStyles.valueBold}>Pkr {subTotal.toLocaleString()}</Text>
              </View>
              <View style={checkoutModalStyles.calcRow}>
                <Text style={checkoutModalStyles.label}>Delivery Fee</Text>
                <Text style={checkoutModalStyles.valueBold}>Pkr {deliveryFee.toLocaleString()}</Text>
              </View>
              <View style={checkoutModalStyles.calcRow}>
                <Text style={checkoutModalStyles.label}>Discount</Text>
                <Text style={checkoutModalStyles.discountValue}>10%(Pkr-{discount})</Text>
              </View>
              <View style={checkoutModalStyles.divider} />
              <View style={checkoutModalStyles.calcRow}>
                <Text style={checkoutModalStyles.label}>Total Cost</Text>
                <Text style={checkoutModalStyles.totalValue}>Pkr {totalCost.toLocaleString()}</Text>
              </View>

              {/* Proceed Button */}

              <Button
                variant="secondary"
                style={checkoutModalStyles.proceedButton}
                onPress={() => setCheckoutModalVisible(false)}
              >
                Proceed to Checkout
              </Button>
            </View>
          </View>
        </Modal>

        {/* Add to Cart Modal */}
        <Modal
          visible={addToCartModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAddToCartModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <View style={{ backgroundColor: '#FBF4E4', borderRadius: 24, padding: 24, width: 340, maxWidth: '95%' }}>
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
                    Pkr {(sizes.find(s => s.label === selectedSize)?.price ?? 0) * qty}/-
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

      </View>
    </ImageBackground>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Sigmar",
    color: 'white',
  },

  cartList: {
    flex: 1,
    paddingHorizontal: 20,
    height: 2022,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 4,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
    color: 'white',
    marginBottom: 2,
  },
  productPack: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: "PoppinsMedium",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: "PoppinsBold",
    color: 'white',
    marginBottom: 2,
  },
  productPoints: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: "PoppinsBold",
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  minusButton: {
    backgroundColor: "white",
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  plusButton: {
    backgroundColor: "white",
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  quantityText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 5,
  },
  checkoutContainer: {
    paddingHorizontal: 25,
    paddingVertical: 60,
  },
  checkoutButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    alignItems: 'center',
    bottom: 20,
  },
  checkoutText: {
    color: '#FF0000',
    fontSize: 18,
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'white',
    marginRight: 16,
  },
  itemName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginRight: 12,
  },
  cancelText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  removeText: {
    color: '#E53935',
    fontSize: 16,
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
    marginTop: 8,
  },
  promoInputBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E53935',
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 10,
  },
  promoInputText: {
    color: '#B0B0B0',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: 'white',
    borderColor: '#E53935',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  applyButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 4,
  },
  label: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
  valueBold: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discountValue: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalValue: {
    color: '#E53935',
    fontSize: 20,
    fontWeight: 'bold',
  },
  proceedButton: {
    backgroundColor: '#E53935',
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 24,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 