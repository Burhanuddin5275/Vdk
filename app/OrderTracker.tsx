import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import TabLayout from './(tabs)/_layout';

const bgImage = require('../assets/images/ss1.png');

// Interface for the order data
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
}

// Helper function to format date
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

const OrderTracker = () => {
  const { order: orderString } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // Parse the order data from the route params
  const order: OrderData = orderString ? JSON.parse(orderString as string) : null;
  
  // Get status steps based on order status
  const statusSteps = order ? getStatusSteps(order.status, order.created_at) : [];
  
  // Format the order date
  const orderDate = order ? new Date(order.created_at).toLocaleDateString() : '';
  
  // Calculate total items
  const totalItems = order?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  return (
    <SafeAreaView style={{flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={router.back}>
            <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracker</Text>
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
        {/* Order Items Header */}
        <View style={styles.itemsHeader}>
          <Text style={styles.itemsHeaderText}>Order items</Text>
          <Text style={styles.itemsHeaderText}>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Text>
        </View>
        {/* Product List */}
        <FlatList
          data={order?.items || []}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              {item.image ? (
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.productImage} 
                  
                />
              ) : (
                <View style={[styles.productImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={24} color="#999" />
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name || 'Product'}</Text>
               <Text style={styles.productPack}>{item.pts}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.productPrice}>Rs. {parseFloat(item.price || '0').toFixed(2)}</Text>
                  <Text style={styles.quantityText}>Qty: {item.quantity || 1}</Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View >
              <Text >No items found in this order</Text> 
            </View>
          }
          style={{ flexGrow: 0 }}
        />
      </View>
      <TabLayout />
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
    height: 32,
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
    fontFamily:"Montserrat"
  },
  timelineLabelActive: {
    fontFamily:"Montserrat"
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
    fontFamily:"Montserrat"
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
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily:"PoppinsMedium"
  },
  productPack: {
    color: '#fff',
    fontSize: moderateScale(14),
    opacity: 0.8,
    marginBottom: 2,
    fontFamily:"PoppinsMedium"
  },
  productPrice: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily:"PoppinsSemi",
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  quantityText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'Poppins',
    opacity: 0.8,
  },
});

export default OrderTracker;