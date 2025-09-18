import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
}

interface OrderDetailsProps {
  id: string;
  total: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetails() {
  const { order } = useLocalSearchParams();
  const orderData = order ? JSON.parse(order as string) as OrderDetailsProps : null;

  if (!orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Order not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.orderNumber}>Order #{orderData.id}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: orderData.status === 'completed' ? '#4CAF50' : '#FFC107' }
          ]}>
            <Text style={styles.statusText}>
              {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {orderData.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemImageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, { backgroundColor: '#f0f0f0' }]} />
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rs. {item.price} x {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>
                Rs. {(parseFloat(item.price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Total</Text>
            <Text style={styles.summaryValue}>Rs. {orderData.total}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Date</Text>
            <Text style={styles.summaryValue}>
              {new Date(orderData.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: moderateScale(12),
    fontWeight: '500',
  },
  section: {
    margin: scale(16),
    padding: scale(16),
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: verticalScale(12),
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
    alignItems: 'center',
  },
  itemImageContainer: {
    marginRight: scale(12),
  },
  itemImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: moderateScale(14),
    color: '#333',
    marginBottom: verticalScale(4),
  },
  itemPrice: {
    fontSize: moderateScale(12),
    color: '#666',
  },
  itemTotal: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  summaryLabel: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  summaryValue: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#333',
  },
});
