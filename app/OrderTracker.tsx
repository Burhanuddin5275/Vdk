import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import TabLayout from './(tabs)/_layout';

const bgImage = require('../assets/images/ss1.png');
const products = [
  {
    id: '1',
    name: 'Josh Delay',
    pack: 'Pack of 3',
    price: 'Pkr 1,700',
    image: require('../assets/images/joshDelay.png'),
  },
  {
    id: '2',
    name: 'Ok Silk',
    pack: 'Pack of 3',
    price: 'Pkr 1,350',
    image: require('../assets/images/okSilk.png'),
  },
  {
    id: '3',
    name: 'E-PILL',
    pack: '',
    price: 'Pkr 100',
    image: require('../assets/images/E-Pill.png'),
  },
];

const statusSteps = [
  { label: 'Order placed!', date: '04/20/2025, 11:00 AM', done: true },
  { label: 'Preparing for dispatch', date: '04/20/2025, 03:23 PM', done: true },
  { label: 'Out for delivery', date: '', done: false },
  { label: 'Order delivered', date: '', done: false },
];

const OrderTracker = () => {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
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
        <Text style={styles.orderNumber}>Order # {id}</Text>
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
          <Text style={styles.itemsHeaderText}>3 products</Text>
        </View>
        {/* Product List */}
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <Image source={item.image} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                {!!item.pack && <Text style={styles.productPack}>{item.pack}</Text>}
                <Text style={styles.productPrice}>{item.price}</Text>
              </View>
            </View>
          )}
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
  fontFamily:"PoppinsSemi",
    marginBottom: 8,
    marginTop: 8,
      paddingHorizontal: 20,
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
    width: scale(70),
    height: scale(70),
    borderRadius: scale(12),
    marginRight: scale(14),
    backgroundColor: '#fff',
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

});

export default OrderTracker;