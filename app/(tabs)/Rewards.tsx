import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchRedeems, RedeemItem } from '@/services/redeem';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useAuth } from '@/hooks/useAuth';


// Points badge data structure
const getPointsBadge = (points: number) => ({
  value: points,
  label: 'PTS',
  footer: 'YOUR POINTS',
});

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { phone } = useAuth();
  const [redeems, setRedeems] = useState<RedeemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadRedeems = async () => {
      try {
        setLoading(true);
        const data = await fetchRedeems();
        setRedeems(data);
      } catch (err) {
        console.error('Failed to load redeems:', err);
        setError('Failed to load rewards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadRedeems();
  }, []);
  const userPoints = useSelector((state: RootState) => 
    phone && state.points.userPoints ? state.points.userPoints[phone] || 0 : 0
  );
  
  const pointsBadge = getPointsBadge(userPoints);
  return (
          <SafeAreaView style={{flex:1,paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
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
            <View style={styles.pointsBadgeOuter}>
              <View style={{
                width: verticalScale(140),
                height: verticalScale(140),
                borderRadius: verticalScale(140) / 2,
                backgroundColor: '#FFC4C6',
                borderWidth: scale(2),
                borderColor: '#660101', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 0,
              }}>
                <View style={styles.pointsBadgeInner}>
                  <Text style={styles.pointsValue}>{pointsBadge.value}</Text>
                  <Text style={styles.pointsLabel}>{pointsBadge.label}</Text>
                </View>
              </View>
              <View style={styles.pointsBadgeFooter}>
                <Text style={styles.pointsFooterText}>{pointsBadge.footer}</Text>
              </View>
            </View>
          </View>

          {/* Rewards List */}

          {redeems.map((item, idx) => (
            <View style={styles.rewardItem} key={idx}>
              <Image source={item.image} style={styles.rewardImage} resizeMode="cover" />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{item.title}</Text>
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={styles.rewardPoints}>{item.points_required}</Text>
                  <Text style={styles.pointsSub}>POINTS</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.redeemBtn} 
                onPress={() => router.push({ 
                  pathname: '/Mall', 
                  params: { 
                    userPoints:pointsBadge.value,
                    name: item.title, 
                    points: item.points_required, 
                    image: item.imageKey, // Pass the image key instead of the image object
                    subtitle: item.subtitle || '', // Make sure to include subtitle
                    description: item.description || ''
                  } 
                })}
              >
                <Text style={styles.redeemText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          ))}

        </View>
      </ScrollView>
    </ImageBackground>
          </SafeAreaView>
   
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
    borderRadius: scale(150),
    backgroundColor: '#FFC4C6',
    borderWidth: scale(3),
    padding:scale(2),
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