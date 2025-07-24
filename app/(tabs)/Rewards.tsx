import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const rewards = [
  {
    name: 'Dining Set',
    points: 460,
    image: require('../../assets/images/Dining.png'),
  },
  {
    name: 'Juicer',
    points: 560,
    image: require('../../assets/images/Jucier.png'),
  },
  {
    name: 'WASHING MACHINE',
    points: 1260,
    image: require('../../assets/images/Washing.png'),
  },
  {
    name: 'FRIDGE',
    points: 1560,
    image: require('../../assets/images/Fridge.png'),
  },
  {
    name: 'AC',
    points: 1860,
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
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mall</Text>
        </View>
        {/* Points Badge */}
        <View style={styles.pointsBadgeContainer}>
          {pointsBadges.map((badge, idx) => (
            <View style={styles.pointsBadgeOuter} key={idx}>
              <View style={styles.pointsBadgeInner}>
                <Text style={styles.pointsValue}>{badge.value}</Text>
                <Text style={styles.pointsLabel}>{badge.label}</Text>
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
              <TouchableOpacity style={styles.redeemBtn}>
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
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontFamily: 'Sigmar',
    flex: 1,
    marginLeft: "25%",
    marginTop: 2,
  },
  pointsBadgeContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  pointsBadgeOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFC4C6',
    borderWidth: 8,
    borderColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,

  },
  pointsBadgeInner: {
    width: 150,
    height: 120,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  pointsValue: {
    color: '#E82A2F',
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: 'RussoOne',
    textAlign: 'center',
  },
  pointsLabel: {
    color: '#E82A2F',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'RussoOne',
    textAlign: 'center',
    marginTop: -6,
  },
  pointsBadgeFooter: {
    backgroundColor: '#660101',
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 6,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pointsFooterText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'PoppinsSemi',
    letterSpacing: 1,
  },
  rewardsList: {
    paddingTop: 18,
    paddingBottom: 40,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    marginBottom: 22,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  rewardImage: {
    width: 70,
    height: 70,
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
    fontWeight: 'bold',
    fontFamily: 'PoppinsSemi',
    marginBottom: 2,
  },
  rewardPoints: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RussoOne',
  },
  pointsSub: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'PoppinsSemi',
    color: colors.white,
  },
  redeemBtn: {
    backgroundColor: colors.white,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  redeemText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PoppinsSemi',
  },
}); 