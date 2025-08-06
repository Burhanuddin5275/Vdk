import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());


  // Filter orders based on active tab
  let filteredOrders = ORDERS;
  if (activeTab === 1) filteredOrders = ORDERS.filter(o => o.status === 'Track Order');
  else if (activeTab === 2) filteredOrders = ORDERS.filter(o => o.status === 'Leave Review');
  else if (activeTab === 3) filteredOrders = ORDERS.filter(o => o.status === 'Re-Order');
const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);

  return (
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
  onPress={() => setActiveTab(i)}
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
  <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
    {tab}
  </Text>
</TouchableOpacity>

        ))}
      </View>
    <View style={styles.tabUnderline}>
  {tabLayouts[activeTab] && (
    <View
      style={[
        styles.underline,
        {
          left: tabLayouts[activeTab].x,
          width: tabLayouts[activeTab].width,
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

            {/* Days of week header */}
            <View style={styles.daysHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.dayHeaderText}>{day}</Text>
              ))}
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
  paddingHorizontal: scale(12),
  paddingVertical: verticalScale(4),
  borderRadius: moderateScale(12),
},

  tabText: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontFamily:"PoppinsSemi",
    opacity: 0.7
  },
  tabTextActive: {
   fontFamily:"PoppinsSemi",
    opacity: 1
  },
tabUnderline: {
  height: 2,
  position: 'relative',
  marginBottom: verticalScale(8),
},

underline: {
  position: 'absolute',
  height: 3,
  backgroundColor: '#fff',
  borderRadius: 2,
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
    paddingBottom: verticalScale(58),
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 18,
    padding: 12
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
    fontFamily: 'PoppinsMedium',
    color: colors.white,
    marginBottom: 2
  },
  orderPrice: {
    fontFamily: 'PoppinsBold',
    fontSize: moderateScale(16),
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
    width: scale(110),
  },
  actionBtnText: {
    color: colors.textPrimary,
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
});