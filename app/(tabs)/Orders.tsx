import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const TABS = ['All', 'Active', 'Completed', 'Cancelled'];
const ORDERS = [
  { id: '089638', price: '1,700', status: 'Track Order' },
  { id: '89753', price: '1,350', status: 'Track Order' },
  { id: '43256', price: '100', status: 'Re-Order' },
  { id: '76544', price: '350', status: 'Leave Review' },
  { id: '875367', price: '1,350', status: 'Leave Review' },
  { id: '875635', price: '1,350', status: 'Leave Review' },

];

export default function OrdersScreen() {
  useEffect(() => {
    // No-op, as fonts are now loaded globally
  }, [])
  const [activeTab, setActiveTab] = useState(0);
  const [date, setDate] = useState('');

  // Filter orders based on active tab
  let filteredOrders = ORDERS;
  if (activeTab === 1) filteredOrders = ORDERS.filter(o => o.status === 'Track Order');
  else if (activeTab === 2) filteredOrders = ORDERS.filter(o => o.status === 'Leave Review');
  else if (activeTab === 3) filteredOrders = ORDERS.filter(o => o.status === 'Re-Order');

  return (
    <ImageBackground
      source={require('../../assets/images/ss1.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={router.back}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="white" />
        </TouchableOpacity> 
          <Text style={styles.headerTitle}>Orders</Text>
      </View>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab, i) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(i)} style={styles.tabBtn}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.tabUnderline}>
        <View style={[styles.underline, { left: `${activeTab * 25}%` }]} />
      </View>
      {/* Date Filter */}
      <View style={styles.dateRow}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Date</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="mm/dd/yyyy"
            placeholderTextColor="black"
            value={date}
            onChangeText={setDate}
          />
        </View>
      </View>
      {/* Orders List */}
      <ScrollView contentContainerStyle={styles.ordersList} showsVerticalScrollIndicator={false}>
        {filteredOrders.map((order, idx) => (
          <View key={order.id + '-' + idx} style={styles.orderCard}>
            <View style={styles.imgPlaceholder}>
              <Image source={require('../../assets/images/partial-react-logo.png')} style={styles.img} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderNum}>Order#{order.id}</Text>
              <Text style={styles.orderPrice}>Pkr {order.price}</Text>
            </View>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => {
                if (order.status === 'Track Order') {
                  router.push({ pathname: '/OrderTracker', params: { id: order.id } });
                }
                else if (order.status === 'Leave Review') {
                  router.push({ pathname: '/OrderReview', params: { id: order.id } });
                }
              }}
            >
              <Text style={styles.actionBtnText}>{order.status}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: verticalScale(120),
    position: 'relative',
    paddingHorizontal: scale(16),
  },
  backBtn: {
    width: 40,
    height: 56,
    alignItems: 'center',
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
    lineHeight: 56,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7
  },
  tabTextActive: {
    fontWeight: 'bold',
    opacity: 1
  },
  tabUnderline: {
    height: 2,
    backgroundColor: 'transparent',
    position: 'relative'
  },
  underline: {
    position: 'absolute',
    width: '25%', height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    bottom: 0
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: moderateScale(6),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateLabel: {
    color: 'white',
    fontFamily: 'InterRegular',
    fontSize: moderateScale(12),
    backgroundColor: colors.primaryDark,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(6),
  },
  dateInput: {
    backgroundColor: 'transparent',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(4),
    fontSize: moderateScale(11),
    color: 'black',
    textAlign: 'center',
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingBottom: 58,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 18,
    padding: 12
  },
  imgPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  orderNum: {
    fontSize: 15,
    fontFamily: 'PoppinsMedium',
    color: colors.white,
    marginBottom: 2
  },
  orderPrice: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: colors.white
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderColor: '#E53935',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 10,
    width: 120,
  },
  actionBtnText: {
    color: colors.textPrimary,
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    textAlign: 'center'
  },
});