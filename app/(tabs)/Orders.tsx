import { colors } from '@/theme/colors';
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [loaded] = useFonts({
    RussoOne: require("../../assets/fonts/RussoOne-Regular.ttf"),
    PoppinsMedium: require("../../assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemi: require("../../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../../assets/fonts/Poppins-Bold.ttf"),
    Sigmar: require("../../assets/fonts/Sigmar-Regular.ttf"),
  })

  useEffect(() => {
    if (loaded) {
      return;
    }
  }, [loaded])
  const [activeTab, setActiveTab] = useState(0);
  const [date, setDate] = useState('');

  // Filter orders based on active tab
  let filteredOrders = ORDERS;
  if (activeTab === 1) filteredOrders = ORDERS.filter(o => o.status === 'Track Order');
  else if (activeTab === 2) filteredOrders = ORDERS.filter(o => o.status === 'Leave Review');
  else if (activeTab === 3) filteredOrders = ORDERS.filter(o => o.status === 'Re-Order');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Text style={styles.backArrow}>{'<'}</Text>
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
        <Text style={styles.dateLabel}>Date</Text>
        <TextInput
          style={styles.dateInput}
          placeholder="mm/dd/yyyy"
          placeholderTextColor="#888"
          value={date}
          onChangeText={setDate}
        />
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
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>{order.status}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#E53935'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16
  },
  backBtn: {
    marginRight: 12,
    padding: 4
  },
  backArrow: {
    fontSize: 24,
    color: '#fff'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1
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
    margin: 16
  },
  dateLabel: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16
  },
  dateInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 110,
    fontSize: 15
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