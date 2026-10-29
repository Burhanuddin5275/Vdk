import { useAuth } from '@/hooks/useAuth';
import { fetchOrders, orders, type OrderStatus } from '@/services/orders';
import { colors } from '@/theme/colors';
import { Api_url, img_url } from '@/url/url';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const TABS = ['All', 'Active', 'Completed', 'Cancelled', 'History'];

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
  created_at: string;
  items: OrderItem[];
  type: string;
  points_discount?: number;
  total_amount?: number;
  discount_amount?: number;
}

export default function OrdersScreen() {
  const [ordersState, setOrdersState] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [userId, setUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const insets = useSafeAreaInsets();
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const { phone, token } = useAuth();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${Api_url}api/app-user/list/`);
        const users = response.data;
        const matchedUser = users.find((u: any) => u.number === phone);

        if (matchedUser) {
          setUserId(matchedUser.id.toString());
        } else {
          setUserId(token);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setUserId(token);
      }
    };

    if (phone) {
      fetchUserId();
    } else {
      setUserId(token);
    }
  }, [phone, token]);

  const mapToDisplayOrder = (order: orders): DisplayOrder => {
    const userDetailObj = typeof order.user_detail === 'object' && order.user_detail !== null 
      ? order.user_detail 
      : { number: typeof order.user_detail === 'string' ? order.user_detail : '', total_points: 0 };

    const totalPoints = (userDetailObj as any).points ?? (userDetailObj as any).total_points ?? 0;

    return {
      id: order.id.toString(),
      total: order.total_amount?.toString() || '0',
      user_detail: {
        number: userDetailObj.number || '',
        total_points: totalPoints,
      },
      status: order.status,
      type: order.type,
      created_at: order.created_at || new Date().toISOString(),
      items: order.items?.map((item: any) => ({
        id: item.id?.toString() || item._id?.toString(),
        name: item.name || 'Unknown Item',
        price: item.price?.toString() || '0',
        quantity: item.quantity || 1,
        image: item.image,
        pts: item.pts || (order as any).points_used || 0
      })) || []
    };
  };

  const loadOrders = useCallback(async (tabName: string, currentUserId: string | null, isRefreshing = false) => {
    if (!currentUserId) return;

    try {
      if (!isRefreshing) setLoading(true);
      
      let apiStatus = 'all';
      if (tabName === 'Active') apiStatus = 'Active';
      else if (tabName === 'Completed') apiStatus = 'completed';
      else if (tabName === 'Cancelled') apiStatus = 'cancelled';
      else if (tabName === 'History') apiStatus = 'History';

      const apiData = await fetchOrders(currentUserId, apiStatus);
      const userOrders = apiData.map(mapToDisplayOrder);

      setOrdersState(userOrders);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleTabPress = (tab: string, index: number) => {
    setActiveTab(tab);
    const layout = tabLayouts[index];
    if (layout && scrollViewRef.current) {
      const leftOffset = Math.max(0, layout.x - scale(20));
      scrollViewRef.current.scrollTo({ x: leftOffset, animated: true });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(activeTab, userId, true);
  }, [loadOrders, activeTab, userId]);

  useEffect(() => {
    if (userId) {
      loadOrders(activeTab, userId);
    }
  }, [loadOrders, activeTab, userId]);

  const filterOrdersByDate = (ordersList: DisplayOrder[]) => {
    if (!startDate && !endDate) return ordersList;

    return ordersList.filter(order => {
      const orderDate = new Date(order.created_at);
      orderDate.setHours(0, 0, 0, 0);

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start) start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 59, 999);

      if (start && end) {
        return orderDate >= start && orderDate <= end;
      } else if (start) {
        return orderDate >= start;
      } else if (end) {
        return orderDate <= end;
      }

      return true;
    });
  };

  const filteredOrders = filterOrdersByDate(ordersState);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground
        source={require('../../assets/images/ss1.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={router.back}>
            <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>

        {/* Tabs and Underline Container */}
        <View style={styles.tabsContainerWrapper}>
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tabsScrollContainer}
            style={styles.tabsWrapper}
          >
            <View style={styles.tabsInnerContent}>
              <View style={styles.tabs}>
                {TABS.map((tab, i) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => handleTabPress(tab, i)}
                    style={styles.tabBtn}
                    onLayout={(event) => {
                      const { x, width } = event.nativeEvent.layout;
                      setTabLayouts((prev) => {
                        const updated = [...prev];
                        updated[i] = { x, width };
                        return updated;
                      });
                    }}
                  >
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.tabUnderline}>
                {tabLayouts[TABS.indexOf(activeTab)] && (
                  <View
                    style={[
                      styles.underline,
                      {
                        left: tabLayouts[TABS.indexOf(activeTab)].x,
                        width: tabLayouts[TABS.indexOf(activeTab)].width,
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Date Filter */}
        <View style={styles.dateRow}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setSelectingStartDate(true);
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateText}>
                {startDate ? startDate.toLocaleDateString() : 'Select start date'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateSpacing} />

          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>To</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                setSelectingStartDate(false);
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateText}>
                {endDate ? endDate.toLocaleDateString() : 'Select end date'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(currentViewDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentViewDate(newDate);
                  }}
                >
                  <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>

                <View style={styles.calendarTitleContainer}>
                  <Text style={styles.calendarTitle}>
                    {currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.rangeIndicator}>
                    {selectingStartDate ? 'Select start date' : 'Select end date'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(currentViewDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentViewDate(newDate);
                  }}
                >
                  <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {(() => {
                  const currentDate = new Date(currentViewDate);
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();

                  const firstDay = new Date(year, month, 1);
                  const startCalendarDate = new Date(firstDay);
                  startCalendarDate.setDate(startCalendarDate.getDate() - firstDay.getDay());

                  const days = [];
                  const today = new Date();

                  for (let i = 0; i < 42; i++) {
                    const currentDay = new Date(startCalendarDate);
                    currentDay.setDate(startCalendarDate.getDate() + i);

                    const isCurrentMonth = currentDay.getMonth() === month;
                    const isToday = currentDay.toDateString() === today.toDateString();
                    const isStartDate = startDate && currentDay.toDateString() === startDate.toDateString();
                    const isEndDate = endDate && currentDay.toDateString() === endDate.toDateString();
                    const isInRange = startDate && endDate && currentDay >= startDate && currentDay <= endDate;

                    days.push(
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.calendarDay,
                          isToday && styles.todayDay,
                          (isStartDate || isEndDate) && styles.selectedDay,
                          isInRange && !isStartDate && !isEndDate && styles.rangeDay,
                          !isCurrentMonth && styles.otherMonthDay
                        ]}
                        onPress={() => {
                          const selectedDate = new Date(currentDay);
                          if (selectingStartDate) {
                            setStartDate(selectedDate);
                            setEndDate(null);
                            setSelectingStartDate(false);
                          } else {
                            if (startDate && selectedDate < startDate) {
                              setStartDate(selectedDate);
                              setEndDate(startDate);
                            } else {
                              setEndDate(selectedDate);
                            }
                            setSelectingStartDate(true);
                          }
                        }}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          isToday && styles.todayDayText,
                          (isStartDate || isEndDate) && styles.selectedDayText,
                          isInRange && !isStartDate && !isEndDate && styles.rangeDayText,
                          !isCurrentMonth && styles.otherMonthDayText
                        ]}>
                          {currentDay.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  }

                  return days;
                })()}
              </View>

              <View style={styles.calendarActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setSelectingStartDate(true);
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => {
                    const today = new Date();
                    setStartDate(today);
                    setEndDate(today);
                    setSelectingStartDate(true);
                  }}
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeCalendar}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.closeCalendarText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Orders List with RefreshControl */}
        <ScrollView
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={[colors.primary]}
            />
          }
        >
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const getButtonConfig = () => {
                switch (order.status) {
                  case 'delivered':
                    return {
                      text: 'Review Order',
                      onPress: () => {
                        router.push({
                          pathname: '/OrderReview',
                          params: { order: JSON.stringify(order) }
                        });
                      },
                      style: styles.reviewBtn
                    };
                  case 'cancelled':
                    return {
                      text: 'Reorder',
                      onPress: () => {
                        const itemsForCheckout = order.items.map(item => ({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          quantity: item.quantity.toString(),
                          image: item.image
                            ? item.image.startsWith('http')
                              ? item.image
                              : `${img_url}${item.image}`
                            : '',
                          points: item.pts?.toString() || '0'
                        }));

                        router.push({
                          pathname: '/Checkout',
                          params: {
                            items: JSON.stringify(itemsForCheckout),
                            fromOrder: 'true'
                          }
                        });
                      },
                      style: styles.reorderBtn
                    };
                  case 'process':
                  case 'on_the_way':
                  default:
                    return {
                      text: 'Track Order',
                      onPress: () => {
                        router.push({
                          pathname: '/OrderTracker',
                          params: { order: JSON.stringify(order) }
                        });
                      },
                      style: styles.trackBtn
                    };
                }
              };

              const buttonConfig = getButtonConfig();

              return (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.imgPlaceholder}>
                    <Image
                      source={order.items[0]?.image ? { uri: order.items[0].image } : require('../../assets/images/order.png')}
                      style={styles.img}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderNum}>Order #{order.id}</Text>
                    <Text style={styles.orderPrice}>Rs. {order.total}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.actionBtn, buttonConfig.style]}
                    onPress={buttonConfig.onPress}
                  >
                    <Text style={styles.actionBtnText}>
                      {buttonConfig.text}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color="#CCCCCC" />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'All'
                  ? "You haven't placed any orders yet."
                  : `No ${activeTab.toLowerCase()} orders found.`}
              </Text>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
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
  tabsContainerWrapper: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
  },
  tabsWrapper: {
    maxHeight: verticalScale(50),
  },
  tabsScrollContainer: {
    paddingRight: scale(60),
  },
  tabsInnerContent: {
    minWidth: '100%',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  tabBtn: {
    paddingHorizontal: scale(16),
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsSemi',
    opacity: 0.7
  },
  tabTextActive: {
    opacity: 1
  },
  tabUnderline: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    marginTop: 2,
  },
  underline: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#fff',
    bottom: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  dateSpacing: {
    width: scale(12),
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
  },
  dateText: {
    fontSize: moderateScale(11),
    color: 'black',
    textAlign: 'center',
  },
  ordersList: {
    paddingHorizontal: scale(9),
    paddingBottom: verticalScale(62),
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 18,
    padding: 16,
  },
  imgPlaceholder: {
    width: scale(60),
    height: scale(60),
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  img: {
    width: scale(40),
    height: scale(40),
    resizeMode: 'contain',
  },
  orderNum: {
    fontSize: moderateScale(14),
    fontFamily: 'Inter-SemiBold',
    color: colors.white,
    marginBottom: 2
  },
  orderPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: moderateScale(16),
    color: colors.white,
    marginBottom: 4
  },
  orderDate: {
    fontSize: moderateScale(11),
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  actionBtn: {
    backgroundColor: 'white',
    borderColor: '#E53935',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 10,
    width: scale(110),
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewBtn: {
    backgroundColor: 'white',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  reorderBtn: {
    backgroundColor: 'white',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  trackBtn: {
    backgroundColor: 'white',
  },
  actionBtnText: {
    color: colors.primary,
    fontFamily: 'PoppinsMedium',
    fontSize: moderateScale(12),
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: scale(20),
    margin: scale(20),
    minWidth: scale(280),
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  calendarTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  calendarTitle: {
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsMedium',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  rangeIndicator: {
    fontSize: moderateScale(12),
    fontFamily: 'PoppinsRegular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: verticalScale(2),
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  todayDay: {
    backgroundColor: colors.primary,
    borderRadius: moderateScale(20),
  },
  selectedDay: {
    backgroundColor: colors.primaryDark,
    borderRadius: moderateScale(20),
  },
  rangeDay: {
    backgroundColor: colors.primary + '30',
    borderRadius: 0,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  calendarDayText: {
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsRegular',
    color: colors.textPrimary,
  },
  todayDayText: {
    color: 'white',
  },
  selectedDayText: {
    color: 'white',
    fontFamily: 'PoppinsMedium',
  },
  rangeDayText: {
    color: colors.textPrimary,
    fontFamily: 'PoppinsRegular',
  },
  otherMonthDayText: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  clearButton: {
    backgroundColor: colors.textSecondary,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
  },
  clearButtonText: {
    color: 'white',
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsMedium',
  },
  todayButton: {
    backgroundColor: colors.primary,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  todayButtonText: {
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsMedium',
    color: 'white',
    textAlign: 'center',
  },
  closeCalendar: {
    backgroundColor: colors.primaryDark,
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
  },
  closeCalendarText: {
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsMedium',
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});