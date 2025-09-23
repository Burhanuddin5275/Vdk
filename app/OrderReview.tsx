import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import TabLayout from './(tabs)/_layout';

const bgImage = require('../assets/images/ss1.png');

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  pts?: number;
  pack?: string;
}

interface OrderData {
  id: string;
  total: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

const statusSteps = [
  { label: 'Order placed!', date: '04/20/2025, 11:00 AM', done: true },
  { label: 'Preparing for dispatch', date: '04/20/2025, 03:23 PM', done: true },
  { label: 'Out for delivery', date: '', done: false },
  { label: 'Order delivered', date: '', done: false },
];
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
// Determine status steps based on order status
const getStatusSteps = (status: string, createdAt: string) => {
  const baseDate = new Date(createdAt);
  const steps = [
    {
      label: 'Order placed!',
      date: formatDate(createdAt),
      done: true
    },
    {
      label: 'Preparing for dispatch',
      date: status !== 'pending' ? formatDate(new Date(baseDate.getTime() + 2 * 60 * 60 * 1000).toISOString()) : '',
      done: ['process', 'delivered', 'cancelled'].includes(status)
    },
    {
      label: 'Out for delivery',
      date: ['delivered', 'cancelled'].includes(status) ? formatDate(new Date(baseDate.getTime() + 4 * 60 * 60 * 1000).toISOString()) : '',
      done: ['delivered', 'cancelled'].includes(status)
    },
    {
      label: status === 'cancelled' ? 'Order cancelled' : 'Order delivered',
      date: status === 'delivered' || status === 'cancelled' ? formatDate(new Date(baseDate.getTime() + 6 * 60 * 60 * 1000).toISOString()) : '',
      done: ['delivered', 'cancelled'].includes(status)
    },
  ];
  return steps;
};

const OrderReview = () => {
  const { order: orderString } = useLocalSearchParams();
  const order: OrderData | null = orderString ? JSON.parse(orderString as string) : null;
  const [modalVisible, setModalVisible] = React.useState(true);
  const [reviewText, setReviewText] = React.useState('');
  const [rating, setRating] = React.useState(0);
  const insets = useSafeAreaInsets();

  // Get status steps based on order status
  const statusSteps = order ? getStatusSteps(order.status, order.created_at) : [];

  // Format the order date
  const orderDate = order ? new Date(order.created_at).toLocaleDateString() : '';

  // Calculate total items
  const totalItems = order?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No order data found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={router.back}>
              <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Review</Text>
          </View>
          {/* Order Number */}
          <Text style={styles.orderNumber}>Order # {order?.id || 'N/A'}</Text>
          <Text style={styles.orderDate}>Placed on: {orderDate}</Text>
          <View style={styles.divider} />
          {/* Status Timeline */}
          <View style={styles.timelineContainer}>
            {statusSteps.map((step, idx) => (
              <View key={idx} style={styles.timelineStep}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.circle, step.done && styles.circleActive]} />
                  {idx < statusSteps.length - 1 && (
                    <View style={styles.verticalLine} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, step.done && styles.timelineLabelActive]}>{step.label}</Text>
                  {!!step.date && <Text style={styles.timelineDate}>{step.date}</Text>}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.divider} />

          {/* Order Items */}
          <View style={styles.itemsHeader}>
            <Text style={styles.itemsHeaderText}>Order items</Text>
            <Text style={styles.itemsHeaderText}>
              {order.items.length} product{order.items.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Product List */}
          <FlatList
            data={order?.items || []}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => (
              <View style={styles.productRow}>
                {item.image ? (
                  <Image 
                    source={{ 
                      uri: item.image && !item.image.startsWith('http') 
                        ? `http://192.168.1.107:8000${item.image.startsWith('/') ? '' : '/'}${item.image}`
                        : item.image 
                    }} 
                    style={styles.productImage}
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  />
                ) : (
                  <View style={[styles.productImage, styles.placeholderImage]}>
                    <Ionicons name="image-outline" size={24} color="#999" />
                  </View>
                )}
                <View style={styles.productInfo}>
                  <View>
                    <Text style={styles.productName}>{item.name || 'Product'}</Text>
                    <Text style={styles.quantityText}>Qty: {item.quantity || 1}</Text>
                    <Text style={styles.productPack}>Pts: {item.pts}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>Rs. {parseFloat(item.price || '0').toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No items found in this order</Text> 
              </View>
            }
            style={{ flexGrow: 0 }}
          />
          {/* Order Total */}
          {order?.items?.length > 0 && (
            <View style={styles.totalContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Order Total:</Text>
                <Text style={styles.totalAmount}>
                  Rs. {order.items.reduce((sum, item) => sum + (parseFloat(item.price)), 0).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </View>
        {/* Order Review Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.reviewModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.reviewTitle}>Order Review</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <AntDesign name="closecircle" size={moderateScale(28)} color="#E53935" />
                </TouchableOpacity>
              </View>
              <View style={styles.ratingRow}>
                {/* Interactive star rating */}
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <AntDesign
                      name={star <= rating ? 'star' : 'staro'}
                      size={24}
                      color="#FFC107"
                      style={{ marginRight: 2 }}
                    />
                  </TouchableOpacity>
                ))}
                <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : ''}</Text>
              </View>
              <Text style={styles.writeReviewLabel}>Write review</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Type here"
                placeholderTextColor="#E53935"
                multiline
                value={reviewText}
                onChangeText={setReviewText}
              />
              <TouchableOpacity style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        <TabLayout />
      </ImageBackground>
    </SafeAreaView>
  );
};

const NAV_HEIGHT = 90;
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Layout
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(80),
    paddingHorizontal: scale(18),
    marginTop: verticalScale(20),
    position: 'relative',
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

  // Order Info
  orderNumber: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
    marginVertical: 8,
    paddingHorizontal: scale(20),
  },
  orderSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'PoppinsRegular',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    fontFamily: 'PoppinsMedium',
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
  // Divider
  divider: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 10,
    width: '100%',
  },
  orderDate: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: moderateScale(12),
    fontFamily: 'Poppins',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  // Order Items
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingHorizontal: scale(20),
  },
  itemsHeaderText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Montserrat',
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
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'PoppinsMedium',
  },
  productPack: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsMedium',
  },
  productPrice: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsSemiBold',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontFamily: 'Poppins',
  },
  quantityText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'Poppins',
    opacity: 0.8,
  },

  // Timeline
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
    height: 32,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  timelineContent: {
    marginLeft: scale(10),
    flex: 1,
  },
  timelineLabel: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'Montserrat',
  },
  timelineLabelActive: {
    fontFamily: 'Montserrat',
  },
  timelineDate: {
    color: '#fff',
    fontSize: moderateScale(12),
    opacity: 0.8,
    marginTop: 2,
  },

  // Review Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  reviewModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
    minHeight: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewTitle: {
    fontSize: moderateScale(20),
    color: '#E53935',
    fontFamily: 'PoppinsSemiBold',
  },
  closeBtn: {
    marginLeft: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: moderateScale(15),
    color: '#444',
  },
  writeReviewLabel: {
    color: '#E53935',
    fontSize: moderateScale(16),
    marginTop: 10,
    marginBottom: 6,
    fontFamily: 'Montserrat',
  },
  reviewInput: {
    backgroundColor: '#FFF6E9',
    borderRadius: 10,
    minHeight: verticalScale(100),
    padding: 12,
    fontSize: moderateScale(14),
    color: '#E53935',
    marginBottom: 18,
    fontFamily: 'Montserrat',
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#E53935',
    borderRadius: scale(8),
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
  },
});

export default OrderReview;