import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const rewards = [
  {
    name: 'Dining Set',
    points: 460,
    imageKey: 'Dining.png',
    image: require('../../assets/images/Dining.png'),
  },
  {
    name: 'Juicer',
    points: 560,
    imageKey: 'Jucier.png',
    image: require('../../assets/images/Jucier.png'),
  },
  {
    name: 'WASHING MACHINE',
    points: 1260,
    imageKey: 'Washing.png',
    image: require('../../assets/images/Washing.png'),
  },
  {
    name: 'FRIDGE',
    points: 1560,
    imageKey: 'Fridge.png',
    image: require('../../assets/images/Fridge.png'),
  },
  {
    name: 'AC',
    points: 1860,
    imageKey: 'Ac.png',
    image: require('../../assets/images/Ac.png'),
  },
];

const pointsBadges = [
  {
    value: 5678,
    label: 'PTS',
    footer: 'YOUR POINTS',
  },
  // Add more badges here if needed
];

export default function RewardsScreen() {
  const router = useRouter();
  return (
    <ImageBackground
      source={require('../../assets/images/ss1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.rewardsList} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={moderateScale(28)} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mall</Text>
          </View>
          {/* Points Badge */}

          <View style={styles.pointsBadgeContainer}>
            {pointsBadges.map((badge, idx) => (
              <View style={styles.pointsBadgeOuter} key={idx}>
                <View style={{
                  width: "98%",
                  height: verticalScale(147),
                  borderRadius: scale(150),
                  backgroundColor: '#FFC4C6',
                  borderWidth: scale(2),
                  borderColor: '#660101', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: 0,
                }} >
                  <View style={styles.pointsBadgeInner}>
                    <Text style={styles.pointsValue}>{badge.value}</Text>
                    <Text style={styles.pointsLabel}>{badge.label}</Text>
                  </View>

                </View>
                <View style={styles.pointsBadgeFooter}>
                  <Text style={styles.pointsFooterText}>{badge.footer}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Rewards List */}

          {rewards.map((item, idx) => (
            <View style={styles.rewardItem} key={item.name}>
              <Image source={item.image} style={styles.rewardImage} resizeMode="cover" />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{item.name}</Text>
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={styles.rewardPoints}>{item.points}</Text>
                  <Text style={styles.pointsSub}>POINTS</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.redeemBtn} onPress={() => router.push({ pathname: '/Mall', params: { name: item.name, points: item.points, imageKey: item.imageKey } })}>
                <Text style={styles.redeemText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          ))}

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

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
  pointsBadgeContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  pointsBadgeOuter: {
    width: "50%",
    height: verticalScale(155),
    borderRadius: scale(150),
    backgroundColor: '#FFC4C6',
    borderWidth: scale(3),
    borderColor: '#660101',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,

  },
  pointsBadgeInner: {
    width: scale(150),
    height: verticalScale(120),
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsValue: {
    color: '#E82A2F',
    fontSize: moderateScale(36),
    fontFamily: 'RussoOne',
    textAlign: 'center',
  },
  pointsLabel: {
    color: '#E82A2F',
    fontSize: moderateScale(30),
    fontFamily: 'RussoOne',
    textAlign: 'center',
    marginTop: -6,
  },
  pointsBadgeFooter: {
    backgroundColor: '#660101',
    borderRadius: 15,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    position: 'absolute',
    bottom: scale(-8),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pointsFooterText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsSemi',
    letterSpacing: 1,
  },
  rewardsList: {
    paddingBottom: 80,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: scale(22),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  rewardImage: {
    width: scale(70),
    height: verticalScale(65),
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#fff',
  },
  rewardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rewardName: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'PoppinsSemi',
    marginBottom: 2,
  },
  rewardPoints: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'RussoOne',
  },
  pointsSub: {
    fontSize: 12,
    fontFamily: 'PoppinsSemi',
    color: colors.white,
  },
  redeemBtn: {
    backgroundColor: colors.white,
    borderRadius: scale(16),
    paddingHorizontal: 18,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  redeemText: {
    color: colors.primary,
    fontSize: moderateScale(14),
    fontFamily: 'PoppinsSemi',
  },
}); 