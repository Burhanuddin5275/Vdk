import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import SuccessModal from '@/components/SuccessModal';
import { Alert, Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Api_url } from '../url/url';
import TabLayout from './(tabs)/_layout';
import { cancelOrder } from '../services/orders';     // <--- NEW IMPORT

const bgImage = require('../assets/images/ss1.png');

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  pts: number;
}

interface OrderData {
  id: string;
  total: string;
  status: string;
  created_at: string;
  items: OrderItem[];
  address?: string;
  shipping?: string;
  points_discount?: number;
  user_id?: string;
  type?: string;
}

const getStatusSteps = (status: string, createdAt: string) => {
  const steps = [
    {
      label: 'Order placed!',
      done: true,
      active: status === 'pending'
    },
    {
      label: 'Preparing for dispatch',
      done: ['process', 'on_the_way', 'delivered', 'cancelled'].includes(status),
      active: status === 'process'
    },
    {
      label: 'Out for delivery',
      done: ['on_the_way', 'delivered', 'cancelled'].includes(status),
      active: status === 'on_the_way'
    },
    {
      label: status === 'cancelled' ? 'Order cancelled' : 'Order delivered',
      done: ['delivered', 'cancelled'].includes(status),
      active: ['delivered', 'cancelled'].includes(status)
    },
  ];

  return steps;
};

const OrderTracker = () => {
  const { order: orderString } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [order, setOrder] = useState<OrderData | null>(
    orderString ? JSON.parse(orderString as string) : null
  );

  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  React.useEffect(() => {
    console.log('ORDER DATA:', order);
    console.log('POINTS DISCOUNT:', order?.points_discount);
  }, [order]);
  const handleCancelPress = () => {
    setShowCancelModal(true);
  };

  // ⭐ NEW CLEAN VERSION USING THE SHARED API FILE
  const handleCancelOrder = async () => {
    if (!order) return;

    setShowCancelModal(false);
    setIsCancelling(true);

    try {
      await cancelOrder(order.id);

      // update UI
      setOrder(prev => ({ ...prev!, status: "cancelled" }));
      setShowSuccessModal(true);

      setTimeout(() => setShowSuccessModal(false), 2000);

    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  const statusSteps = order ? getStatusSteps(order.status, order.created_at) : [];
  const orderDate = order ? new Date(order.created_at).toLocaleDateString() : '';
  const totalItems = order?.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
  const itemsTotal = order?.items.reduce((s, i) => s + parseFloat(i.price || '0'), 0) || 0;
  const discount = order?.points_discount || 0;
  const finalTotal = itemsTotal - discount;
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <SuccessModal
        visible={showSuccessModal}
        message="Your order has been cancelled successfully"
        onClose={() => setShowSuccessModal(false)}
        autoCloseDelay={2000}
      />

      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={router.back}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Order Tracker</Text>
          </View>

          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order # {order?.id}</Text>
              <Text style={styles.orderDate}>Placed on: {orderDate}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginLeft: verticalScale(90) }}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: '/Chat',
                    params: { orderId: order?.id }
                  })
                }
              >
                <Ionicons name="chatbubble-ellipses-outline" size={24} color="red" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCancelPress}
                disabled={isCancelling}
              >
                <Ionicons name="close-circle-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Status Timeline */}
          <View style={styles.timelineContainer}>
            {statusSteps.map((step, i) => (
              <View key={i} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.circle, step.done && styles.circleActive]} />
                  {i < statusSteps.length - 1 && <View style={styles.verticalLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, step.done && styles.timelineLabelActive]}>
                    {step.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Items Header */}
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsHeaderText}>Order items</Text>
            <Text style={styles.itemsHeaderText}>{totalItems} items</Text>
          </View>

          {/* Items List */}
          <FlatList
            data={order?.items || []}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.productRow}>
                <Image
                  source={{
                    uri: item.image?.startsWith("http")
                      ? item.image
                      : `${Api_url}${item.image}`
                  }}
                  style={styles.productImage}
                />

                <View style={styles.productInfo}>
                  <View style={{ width: scale(150) }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.quantityText}>Qty: {item.quantity}</Text>
                    <Text style={styles.productPack}>Pts: {item.pts}</Text>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>
                      Rs. {parseFloat(item.price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Total */}
          {order?.items?.length ? (
            <View style={styles.totalContainer}>
              {order?.type !== 'redeem' && Number(order?.points_discount) > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Points discount:
                  </Text>

                  <Text style={{ fontSize: scale(15), color: 'white' }}>
                    Rs. {order.points_discount}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {order.type === 'redeem' ? 'Redeem' : 'Order Total:'}
                </Text>

                <Text style={styles.totalAmount}>
                  {order.type === 'redeem'
                    ? `${order.items[0]?.pts} PTS`
                    : `Rs. ${finalTotal.toFixed(2)}`
                  }
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        <TabLayout />

        {/* Cancel Modal */}
        {showCancelModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cancel Order</Text>
              <Text style={styles.modalText}>
                Are you sure you want to cancel this order? This action cannot be undone.
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCancelModal(false)}
                >
                  <Text style={styles.cancelButtonText}>No, Keep It</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCancelOrder}
                  disabled={isCancelling}
                >
                  <Text style={styles.confirmButtonText}>
                    {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ImageBackground>
    </SafeAreaView>
  );
};

const NAV_HEIGHT = 90;
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  actionButton: {
    padding: scale(6),
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#ff4444',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Success Modal Styles
  successModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  successModalContent: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  successModalText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
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
  orderNumber: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  orderDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(12),
    fontFamily: 'Poppins',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
    width: '100%',
  },
  timelineContainer: {
    marginVertical: 10,
    marginLeft: 2,
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 28,
  },
  circle: {
    width: scale(14),
    height: scale(14),
    borderRadius: scale(7),
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    marginBottom: 2,
  },
  circleActive: {
    backgroundColor: '#fff',
  },
  verticalLine: {
    width: 2,
    height: verticalScale(20),
    backgroundColor: '#fff',
    opacity: 0.5,
    marginTop: 0,
    marginBottom: 0,
  },
  timelineContent: {
    marginLeft: scale(8),
    flex: 1,
  },
  timelineLabel: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: "Montserrat"
  },
  timelineLabelActive: {
    fontFamily: "Montserrat"
  },
  timelineDate: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
    marginTop: 2,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: scale(20),
  },
  itemsHeaderText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: "Montserrat"
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: scale(20),
  },
  productImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: "PoppinsMedium",
  },
  productPack: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: "PoppinsMedium"
  },
  productPrice: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: "PoppinsSemiBold",
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  quantityText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'Poppins',
    opacity: 0.8,
  },
  totalContainer: {
    padding: scale(16),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: verticalScale(8),
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsSemi',
  },
  totalAmount: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsBold',
  },
});

export default OrderTracker;