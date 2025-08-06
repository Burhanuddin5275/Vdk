import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-size-matters';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const imageMap: { [key: string]: any } = {
  'Dining.png': require('../assets/images/Dining.png'),
  'Jucier.png': require('../assets/images/Jucier.png'),
  'Washing.png': require('../assets/images/Washing.png'),
  'Fridge.png': require('../assets/images/Fridge.png'),
  'Ac.png': require('../assets/images/Ac.png'),
};

const Mall = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Get reward data from params
  const name = params.name || 'Ajwa-Dining Set';
  const points = params.points || 460;
  let imageKey = params.imageKey;
  if (Array.isArray(imageKey)) {
    imageKey = imageKey[0];
  }
  const imageSource = imageKey && typeof imageKey === 'string' && imageMap[imageKey] ? imageMap[imageKey] : undefined;

  return (
    <ImageBackground
      source={require('../assets/images/ss1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Product Image and Header */}
      <View style={styles.imageHeaderWrap}>
        {imageSource ? (
          <ImageBackground
            source={imageSource}
            style={styles.productImg}
            resizeMode="cover"
            imageStyle={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
          >
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.heartBtn}>
                <Ionicons name="heart-outline" size={28} color={colors.white} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={moderateScale(28)} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heartBtn}>
              <Ionicons name="heart-outline" size={moderateScale(28)} color={colors.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* Product Card */}
      <View style={styles.cardWrap}>
        <Text style={styles.category}>Crockery Dining Set</Text>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.sectionLabel}>Product Details</Text>
        <Text style={styles.details}>European Porcelain Dinner Set – 35 Pcs | Elegant Ceramic Tableware in Pakistan</Text>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Reviews</Text>
        <View style={styles.reviewRow}>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.rating}>4.5</Text>
        </View>
      </View>
      {/* Bottom Bar */}
      <View style={styles.footer}>
        <View style={styles.pointsWrap}>
          <Text style={styles.pointsLabel}>Total Points Required</Text>
          <Text style={styles.pointsValue}>{points} PTS</Text>
        </View>
        <TouchableOpacity style={styles.redeemBtn} onPress={() => { router.push('/Redeem') }}>
          <Text style={styles.redeemText}>Redeem</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageHeaderWrap: {
    width: scale(350),
    height: verticalScale(280),
    position: 'relative',
    justifyContent: 'flex-end',
  },
  productImg: {
    width: scale(350),
    height: verticalScale(280),
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(50),

    justifyContent: 'space-between',
    paddingHorizontal: scale(18),
    marginTop: verticalScale(20),
  },
  backBtn: {
    borderRadius: 20,
    padding: 6,
  },
  heartBtn: {
    borderRadius: 20,
    padding: 6,
  },
  cardWrap: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'flex-start',
  },
  category: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
    marginBottom: 4,
  },
  title: {
    color: colors.white,
    fontSize: moderateScale(38),
    lineHeight: moderateScale(40),
    fontFamily: 'Sigmar',
    marginBottom: 12,
  },
  sectionLabel: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
    marginTop: 10,
    marginBottom: 2,
  },
  details: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontFamily: 'PoppinsRegular',
    marginBottom: 10,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stars: {
    color: '#FFD600',
    fontSize: moderateScale(22),
    marginRight: 8,
    fontFamily: 'PoppinsBold',
  },
  rating: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsMedium',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.secondaryLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(100)
  },
  pointsWrap: {
    flex: 1,
  },
  pointsLabel: {
    color: colors.primary,
    fontSize: moderateScale(15),
    fontFamily: 'PoppinsMedium',
  },
  pointsValue: {
    color: colors.primary,
    fontSize: moderateScale(26),
    fontFamily: 'PoppinsBold',
    marginTop: 2,
  },
  redeemBtn: {
    backgroundColor: colors.primary,
    borderRadius: scale(26),
    paddingVertical: 8,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemText: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
  },
});

export default Mall;