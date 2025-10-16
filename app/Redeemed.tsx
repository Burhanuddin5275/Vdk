import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { fetchOrders, orders, type OrderStatus } from '@/services/orders';
import { useAuth } from '@/hooks/useAuth';
import { Api_url, img_url } from '@/url/url';
const screenWidth = Dimensions.get('window').width;
const COLUMN_GAP = scale(12);
const CARD_WIDTH = (screenWidth - COLUMN_GAP * 3) / 2;
interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  pts?: number;
}

interface UserDetailObject {
  number: string;
  total_points: number;
}

type UserDetail = string | UserDetailObject;

interface DisplayOrder {
  id: string;
  total: string;
  user_detail: UserDetail;
  status: OrderStatus;
  type: string;
  created_at: string;
  items: OrderItem[];
}

const TABS = [{ id: 'process', label: 'In Progress' }, { id: 'delivered', label: 'Completed' }] as const;

const Redeemed = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { phone } = useAuth();
  const [activeTab, setActiveTab] = useState<OrderStatus>('process');

  useEffect(() => {
    const loadOrders = async () => {
      if (!phone) {
        console.log('No phone number found for user');
        setOrders([]);
        return;
      }

      try {
        setLoading(true);
        const userPhone = typeof phone === 'string' ? phone : phone;
        const fetchedOrders = await fetchOrders(userPhone);

        // Filter orders where user_detail matches logged-in user's phone and type is 'redeem'
        const userRedeemOrders = fetchedOrders
          .filter(order => {
            const orderUserDetail = typeof order.user_detail === 'string'
              ? order.user_detail
              : (order.user_detail as UserDetailObject)?.number;

            // Check if user_detail matches and type is 'redeem'
            return orderUserDetail === userPhone && order.type === 'redeem';
          })
          .map(mapToDisplayOrder);

        setOrders(userRedeemOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [phone]);

  const filteredOrders = orders.filter(order => {
    // First check if the order type is 'redeem'
    if (order.type !== 'redeem') return false;

    // Then check the status based on active tab
    if (activeTab === 'process') {  // Changed from 'In Progress' to 'process'
      return order.status === 'process' || order.status === 'on_the_way';
    }
    return order.status === 'delivered';
  });
  const mapToDisplayOrder = (order: orders): DisplayOrder => {
    const userDetail = typeof order.user_detail === 'string'
      ? { number: order.user_detail, total_points: 0 }  // Default value if it's a string
      : order.user_detail;
    return {
      id: order.id,
      total: order.payments?.[0]?.amount?.toString() || '0', // Assuming total comes from payments
      user_detail: userDetail,
      status: order.status,
      type: order.type,
      created_at: order.created_at || new Date().toISOString(),
      items: order.items?.map((item: any) => ({
        id: item.id || item._id,
        name: item.name || 'Unknown Item',
        price: item.price?.toString() || '0',
        quantity: item.quantity || 1,
        image: item.image,
        pts: item.pts || 0

      })) || []
    };
  };
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground
        source={require('../assets/images/ss1.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={moderateScale(28)} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Redeemed</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content based on active tab */}
          <ScrollView contentContainerStyle={styles.contentContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const firstItem = order.items[0];
                const orderDate = new Date(order.created_at).toLocaleDateString();
                const statusText = order.status === 'process' ? 'In Progress' :
                  order.status === 'delivered' ? 'Completed' :
                    order.status.charAt(0).toUpperCase() + order.status.slice(1);

                return (
                  <View key={order.id} style={styles.card}>
                    {firstItem?.image ? (
                      <Image
                        source={{ uri: `${img_url}${firstItem?.image}` }}
                        style={styles.cardImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.cardImage, styles.imagePlaceholder]}>
                        <Ionicons name="gift" size={40} color={colors.primary} />
                      </View>
                    )}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardName} numberOfLines={1}>
                        {firstItem?.name || 'Redeemed Item'}
                      </Text>

                      <View>
                        <Text style={styles.cardPoints}>
                          Pts: {order.items[0]?.pts || 0}
                        </Text>

                        <Text style={styles.cardTotalPoints}>
                          Total: {typeof order.user_detail !== 'string' ? (order.user_detail.total_points) : '0'}
                        </Text>
                        {activeTab === 'process' && (
                          <Text style={styles.cardTotalPoints}>
                            Available PTS: {typeof order.user_detail !== 'string' ? (order.user_detail.total_points - (order.items[0]?.pts || 0)) : '0'}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={48} color={colors.white} />
                <Text style={styles.emptyText}>No {activeTab === 'process' ? 'active' : 'completed'} orders found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#A01D20',
    borderRadius: moderateScale(25),
    marginHorizontal: scale(20),
    marginVertical: verticalScale(10),
    padding: moderateScale(5),
    borderWidth: 1,
    borderColor: colors.primary,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(20),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.white,
    fontSize: moderateScale(14),
    textTransform: 'capitalize',
    fontFamily: 'Poppins',
  },
  activeTabText: {
    fontFamily: 'PoppinsSemi',
  },
  contentContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
  },
  card: {
    padding: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: moderateScale(8),
    backgroundColor: '#f5f5f5',
    marginRight: scale(12),
  },
  cardContent: {
    flex: 1,
    padding: 0,
  },
  cardName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.white,
  },
  cardPoints: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: 'Poppins',
  },
  orderDate: {
    fontSize: moderateScale(14),
    color: colors.black,
    marginBottom: verticalScale(4),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: scale(8),
  },
  statusCompletedDot: {
    backgroundColor: colors.primaryDark,
  },
  statusInProgressDot: {
    backgroundColor: colors.primary,
  },
  cardStatus: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins',
  },
  statusCompleted: {
    color: colors.primaryDark,
  },
  statusInProgress: {
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  loadingText: {
    fontSize: moderateScale(16),
    color: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  errorText: {
    fontSize: moderateScale(16),
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: colors.white,
    marginTop: verticalScale(12),
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTotalPoints: {
    color: colors.white,
    fontSize: moderateScale(12),
    fontFamily: 'Poppins',
    opacity: 0.8,
    marginTop: verticalScale(2),
  },
});

export default Redeemed;