import { useAuth } from '@/hooks/useAuth';
import { fetchOrders, type OrderStatus } from '@/services/orders';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const TABS = ['All', 'Active', 'Completed', 'Cancelled'];

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
  // Add other user detail properties here if they exist
}

type UserDetail = string | UserDetailObject;

interface DisplayOrder {
  id: string;
  total: string;
  user_detail: UserDetail;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const insets = useSafeAreaInsets();
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const { phone } = useAuth();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        // Pass the logged-in user's phone number to fetch only their orders
        const apiData = await fetchOrders(phone || undefined);
        console.log('Raw orders data:', apiData);
        
        // Map API data to DisplayOrder type and filter by current user
        const userOrders: DisplayOrder[] = [];
        
        apiData.forEach(order => {
          // Get the user detail from the order
          const userDetail = typeof order.user_detail === 'string' 
            ? order.user_detail 
            : (order.user_detail as UserDetailObject)?.number || '';
            
          // Check if this order belongs to the current user
          const isCurrentUser = userDetail === phone;
          
          if (isCurrentUser) {
            console.log('Including order for current user:', {
              orderId: order.id,
              status: order.status,
              orderUserPhone: userDetail
            });
            
            const total = order.items?.reduce((sum: number, item: any) => {
              const price = parseFloat(item.price || '0');
              const quantity = item.quantity || 1;
              return sum + (price * quantity);
            }, 0) || 0;
            
            // Map the API order to DisplayOrder type
            const displayOrder: DisplayOrder = {
              id: order.id.toString(),
              total: total.toString(),
              user_detail: userDetail,
              status: order.status,
              created_at: order.created_at || new Date().toISOString(),
              items: Array.isArray(order.items) ? order.items.map((item: any) => ({
                id: item.id?.toString() || '',
                name: item.name || 'Unknown Item',
                price: item.price?.toString() || '0',
                quantity: item.quantity || 1,
                image: item.image,
                pts: item.pts,
              })) : []
            };
            
            userOrders.push(displayOrder);
          }
        });
        
        setOrders(userOrders);
        
        // Log all unique status values for debugging
        const statuses = [...new Set(apiData.map((order: any) => order.status))];
        console.log('Unique status values in data:', statuses);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);



  const filteredOrders = activeTab === 'All' 
    ? orders // Show all orders
    : activeTab === 'Active' 
      ? orders.filter(o => o.status === 'process' ) // Show Processing or Pending orders
      : activeTab === 'Completed' 
        ? orders.filter(o => o.status === 'delivered' ) // Show Delivered or Shipped orders
        : orders.filter(o => o.status === 'cancelled'); // Show only Cancelled orders

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex:1,paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
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
        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab, i) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
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
                  
                  // Get first day of month and number of days
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startCalendarDate = new Date(firstDay);
                  startCalendarDate.setDate(startCalendarDate.getDate() - firstDay.getDay());
                  
                  const days = [];
                  const today = new Date();
                  
                  for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
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
        {/* Orders List */}
        <ScrollView contentContainerStyle={styles.ordersList} showsVerticalScrollIndicator={false}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                  <View style={styles.imgPlaceholder}>
                    {order.items[0]?.image ? (
                      <Image 
                        source={{ uri: order.items[0].image }} 
                        style={styles.img} 
                        resizeMode="contain"
                      />
                    ) : (
                      <Image 
                        source={require('../../assets/Icon/order.png')} 
                        style={styles.img} 
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderNum}>Order #{order.id}</Text>
                    <Text style={styles.orderPrice}>Rs. {order.total}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                <TouchableOpacity 
                  style={[
                    styles.actionBtn,
                  ]}
                  onPress={() => {
                    if (activeTab === 'Completed') {
                      // Navigate to review page for completed orders
                      router.push({ 
                        pathname: '/OrderReview', 
                        params: { 
                          order: JSON.stringify(order) 
                        } 
                      });
                    } else if (activeTab === 'Cancelled') {
                      // Show order details for cancelled orders
                      router.push({ 
                        pathname: '/OrderDetails', 
                        params: { 
                          order: JSON.stringify(order) 
                        } 
                      });
                    } else {
                      
                      router.push({ 
                        pathname: '/OrderTracker', 
                        params: { 
                          order: JSON.stringify(order) 
                        } 
                      });
                    }
                  }}
                >
                  <Text style={styles.actionBtnText}>
                    {activeTab === 'Completed' 
                      ? 'Review Order' 
                      : activeTab === 'Cancelled' 
                        ? 'View Details' 
                        : 'Track Order'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
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
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  tabBtn: {
    paddingHorizontal: scale(16),
    paddingVertical: 12,
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
    marginBottom: 12,
  },
  underline: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#fff',
    bottom: -2,
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
  actionBtnText: {
    color: colors.textPrimary,
    fontFamily: 'PoppinsMedium',
    fontSize: moderateScale(12),
    textAlign: 'center'
  },
  trackOrderBtn: {
    backgroundColor: 'transparent',
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
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(8),
  },
  dayHeaderText: {
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsRegular',
    color: colors.textSecondary,
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
    backgroundColor: colors.primary + '30', // 30% opacity
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