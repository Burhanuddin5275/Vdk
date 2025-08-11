import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const screenWidth = Dimensions.get('window').width;
const COLUMN_GAP = scale(12);
const CARD_WIDTH = (screenWidth - COLUMN_GAP * 3) / 2;
const redeemed = [
  {
    name: 'Dining Set',
    points: 460,
    imageKey: 'Dining.png',
    image: require('../assets/images/Dining.png'),
    Status: 'In Progress',
  },
  {
    name: 'Juicer',
    points: 560,
    imageKey: 'Jucier.png',
    image: require('../assets/images/Jucier.png'),
    Status: 'Completed',
  },
  {
    name: 'WASHING MACHINE',
    points: 1260,
    imageKey: 'Washing.png',
    image: require('../assets/images/Washing.png'),
    Status: 'In Progress',
  },
  {
    name: 'FRIDGE',
    points: 1560,
    imageKey: 'Fridge.png',
    image: require('../assets/images/Fridge.png'),
    Status: 'Completed',
  },
  {
    name: 'AC',
    points: 1860,
    imageKey: 'Ac.png',
    image: require('../assets/images/Ac.png'),
    Status: 'In Progress',
  },
];
const TABS = ['In Progress', 'Completed'];

const Redeemed = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const filteredData = redeemed.filter((item) => item.Status === activeTab);

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
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content based on active tab */}
        <ScrollView contentContainerStyle={styles.contentContainer}>
            {filteredData.map((item, index) => (
              <View key={index} style={styles.card}>
                <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardPoints}>{item.points} Points</Text>
                  <Text style={[
                    styles.cardStatus,
                    item.Status === 'In Progress' ? styles.statusInProgress : styles.statusCompleted
                  ]}>
                    {item.Status}
                  </Text>
                </View>
              </View>
            ))}
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
    borderColor: colors.primary
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
    fontSize: moderateScale(16),
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
    width: scale(60),
    height: verticalScale(60),
    marginRight: scale(15),
    borderRadius: moderateScale(10),
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    color: colors.white,
    fontSize: moderateScale(18), 
    fontFamily: 'PoppinsSemi',
  },
  cardStatus: {
    fontSize: moderateScale(14),
    fontFamily: 'Poppins',
    marginBottom: verticalScale(2),
  },
  statusInProgress: {
    color: '#FFD700',
  },
  statusCompleted: {
    color: '#00FF00', 
  },
  cardPoints: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: 'Poppins',
  },
});

export default Redeemed;