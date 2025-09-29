import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Api_url } from '../url/url';
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
  user_id?: string;  // Add user_id to the interface
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
  const now = new Date();
  
  // Calculate time differences for each step
  const pendingTime = new Date(baseDate);
  const processingTime = new Date(pendingTime.getTime() + (status !== 'pending' ? 0 : 0));
  const onTheWayTime = new Date(processingTime.getTime() + (['on_the_way', 'delivered', 'cancelled'].includes(status) ? 2 * 60 * 60 * 1000 : 0));
  const deliveredTime = new Date(onTheWayTime.getTime() + (['delivered', 'cancelled'].includes(status) ? 2 * 60 * 60 * 1000 : 0));

  const steps = [
    { 
      label: 'Order placed!', 
      date: formatDate(pendingTime.toISOString()),
      done: true,
      active: status === 'pending'
    },
    { 
      label: 'Preparing for dispatch',
      date: status !== 'pending' ? formatDate(processingTime.toISOString()) : '',
      done: ['process', 'on_the_way', 'delivered', 'cancelled'].includes(status),
      active: status === 'process'
    },
    {  
      label: 'Out for delivery',
      date: ['on_the_way', 'delivered', 'cancelled'].includes(status) ? formatDate(onTheWayTime.toISOString()) : '',
      done: ['on_the_way', 'delivered', 'cancelled'].includes(status),
      active: status === 'on_the_way'
    },
    { 
      label: status === 'cancelled' ? 'Order cancelled' : 'Order delivered',
      date: ['delivered', 'cancelled'].includes(status) ? formatDate(deliveredTime.toISOString()) : '',
      done: ['delivered', 'cancelled'].includes(status),
      active: ['delivered', 'cancelled'].includes(status)
    },
  ];
  
  return steps;
};

const OrderTracker = () => {
  const { order: orderString } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  // Parse the order data from the route params
  const [order, setOrder] = useState<OrderData | null>(orderString ? JSON.parse(orderString as string) : null);
  const [isCancelling, setIsCancelling] = useState(false);
  const handleCancelOrder = async () => {
    if (!order) return;
    
    try {
      setIsCancelling(true);
      // Using the original endpoint that was working before
      const url = `${Api_url}api/create-order/`;
      console.log('Attempting to cancel order at URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: order.id,
          status: 'cancelled'
        })
      });
  
      const responseText = await response.text();
      console.log('Raw response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });
  
      // Define the expected response shape
      interface ApiResponse {
        message?: string;
        detail?: string;
        [key: string]: any;  // Allow other properties
      }
      
      // Try to parse JSON, but don't fail if it's not JSON
      let data: ApiResponse = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.warn('Response is not JSON, but that might be okay');
      }
  
      if (!response.ok) {
        throw new Error(
          data.message || 
          data.detail || 
          `Request failed with status ${response.status}`
        );
      }
  
      // If we get here, the request was successful
      setOrder(prev => ({
        ...prev!,
        status: 'cancelled'
      }));
      Alert.alert('Success', 'Your order has been cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'Failed to cancel order. Please try again.'
      );
    } finally {
      setIsCancelling(false);
    }
  };
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
        {/* Order Number with Action Icons */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Order # {order?.id || 'N/A'}</Text>
            <Text style={styles.orderDate}>Placed on: {orderDate}</Text>
          </View>
           <View style={{flexDirection:'row', gap:8, marginLeft:verticalScale(90)}}>
           <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push({
                pathname: '/Chat',
                params: { orderId: order?.id }
              })}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="red" />
            </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleCancelOrder}
              >
                <Ionicons name="close-circle-outline" size={24} color="#ff4444" />
              </TouchableOpacity>

           </View>
        </View> 
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
                  source={{ 
                    uri: item.image && !item.image.startsWith('http') 
                      ? `${Api_url}${item.image.startsWith('/') ? '' : '/'}${item.image}`
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
            <View >
              <Text >No items found in this order</Text> 
            </View>
          }
          style={{ flexGrow: 0 }}
        />
        
        {/* Order Total */}
        {order?.items && order.items.length > 0 ? (
  <View style={styles.totalContainer}>
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Order Total:</Text>
      <Text style={styles.totalAmount}>
        Rs. {order.items.reduce((sum, item) => sum + (parseFloat(item.price)), 0).toFixed(2)}
      </Text>
    </View>
  </View>
) : null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily:"PoppinsMedium"
  },
  productPack: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily:"PoppinsMedium"
  },
  productPrice: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily:"PoppinsSemiBold",
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