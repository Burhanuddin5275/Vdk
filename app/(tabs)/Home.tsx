import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, ImageBackground, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useWishlistStore } from '../../app/Wishlist';
import { PRODUCTS } from '../../constants/products';


const brands = [
  { name: 'Josh', image: require('../../assets/images/josh.png') },
  { name: 'OK', image: require('../../assets/images/ok.png') },
  { name: 'Vidafem', image: require('../../assets/images/vidafem.png') },

];


type SalePopupProps = {
  visible: boolean;
  onClose: () => void;
};

const SalePopup = ({ visible, onClose }: SalePopupProps) => {
  const lottieRef = useRef<LottieView>(null);
  const [showGiftAnimation, setShowGiftAnimation] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowGiftAnimation(true);

      // Start zoom-in animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }).start();

      const timer = setTimeout(() => {
        setShowGiftAnimation(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(0); // reset scale when hidden
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={popupStyles.overlay}>
        {/* 🎉 Confetti Background */}
        {visible && showGiftAnimation && (
          <Image
            source={require('../../assets/animations/confetti.gif')}
            style={popupStyles.giftBackground}
            resizeMode="cover"
          />
        )}
        <Animated.View
          style={[
            popupStyles.popupBox,
            {
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={popupStyles.saleText}>Sale</Text>
          <TouchableOpacity style={popupStyles.closeBtn} onPress={onClose}>
            <Text style={popupStyles.closeText}>×</Text>
          </TouchableOpacity>

          <Image
            source={require('../../assets/images/Lubricants.png')}
            style={popupStyles.productImg}
            resizeMode="contain"
          />
          <Text style={popupStyles.discountText}>Get upto 50% Off</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default function HomeScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);
  const isInWishlist = (id: string) => wishlistItems.some((w: { id: string }) => w.id === id);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (true) {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const categories = [
    {
      label: 'Condoms',
      image: require('../../assets/images/condom.png'),
    },
    {
      label: 'Lubricant',
      image: require('../../assets/images/Lubricants.png'),
    },
    {
      label: 'Devices',
      image: require('../../assets/images/Devices.png'),
    },
    {
      label: 'Medicine',
      image: require('../../assets/images/medicine.png'),
    },
  ];

  return (
    <>
      <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
        <SalePopup visible={showPopup} onClose={() => setShowPopup(false)} />
        <ImageBackground
          source={require('../../assets/images/home.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView contentContainerStyle={{ paddingBottom: "20%" }}>

            {/* Header Section */}
            <View style={styles.headerBg}>
              <View style={styles.headerRow}>
                <View style={{ width: scale(140), paddingLeft: scale(16) }}>
                  <Text style={styles.hello}>Hello!{"\n"}Hussain</Text>
                  <Text style={styles.subtext}>What would you like to buy?</Text>
                  <View style={styles.rewardBox}>
                    <Text style={styles.rewardLabel}>Reward</Text>
                    <Text style={styles.rewardPoints}>1273{''}
                    </Text><Text style={styles.rewardPts}>PTS</Text>
                  </View>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end', }}>
                  <Image
                    source={require('../../assets/images/family2.png')}
                    style={styles.familyImg}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>

            {/* Categories Section */}
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesSlider}
            >
              {categories.map((category, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => router.push({ pathname: '/Categories', params: { category: category.label } })}
                  style={styles.categoryCard}
                >
                  <LinearGradient colors={['#FFFFFF', '#E82A2F']} style={styles.categoryCard}>
                    <Image
                      source={category.image}
                      style={styles.categoryImg}
                      resizeMode="contain"
                    />
                    <Text style={styles.categoryLabel}>{category.label}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Banner Section */}
            <View style={styles.bannerCard}>
              <Image
                source={require('../../assets/images/wanna.png')}
                style={styles.bannerCard}
                resizeMode="cover"
              />
            </View>

            {/* Brands Section */}
            <Text style={styles.sectionTitle}>Our Brands</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandSlider}
            >
              {brands.map((brand, idx) => (
                <TouchableOpacity key={idx} style={styles.brandCard} onPress={() => router.push({ pathname: '/Brands', params: { brand: brand.name } })}>
                  <Image
                    source={brand.image}
                    style={styles.brandImg}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Best Seller Section */}
            <View style={styles.bestSellerRow}>
              <Text style={styles.sectionTitle}>Best Seller</Text>
              <Text style={styles.seeAll} onPress={() => { router.push('/BestSeller') }}>See All</Text>
            </View>
            <Text style={styles.bestSellerSubtext}>Find the top most popular items in DKT best sellers.</Text>

            {/* Best Seller Product Slider */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10, marginBottom: 24, height: verticalScale(260) }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {PRODUCTS.filter(p => 'rating' in p)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 4)
                .map((product, idx) => (
                  <TouchableOpacity
                    key={product.id}
                    style={[bestSellerStyles.productCard, idx === 3 && { marginRight: 0 }]}
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/Products', params: { id: product.id, data: JSON.stringify(product) } })}
                  >
                    <LinearGradient
                      colors={["#FFD600", "#FF9800"]}
                      style={bestSellerStyles.gradient}
                    >
                      {/* Wishlist Button */}
                      <TouchableOpacity
                        style={bestSellerStyles.wishlistBtn}
                        onPress={async () => {
                          if (isInWishlist(product.id)) {
                            await removeFromWishlist(product.id);
                          } else {
                            await addToWishlist({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.img,
                            });
                          }
                        }}
                      >
                        <Ionicons
                          name={isInWishlist(product.id) ? "heart" : "heart-outline"}
                          size={moderateScale(20)}
                          color="#fff"
                        />
                      </TouchableOpacity>
                      <Image
                        source={product.img}
                        style={bestSellerStyles.productImg}
                      />
                    </LinearGradient>
                    {/* Footer */}
                    <View style={bestSellerStyles.cardFooter}>
                      <View style={{ flex: 1 }}>
                        <Text style={bestSellerStyles.cardTitle}>{product.name}</Text>
                        <Text style={{ fontSize: moderateScale(10) }}>
                          Ratings <Text style={bestSellerStyles.rating}>{"★".repeat(Math.round(product.rating || 0))}</Text>
                        </Text>
                      </View>
                      <ImageBackground
                        source={require('../../assets/images/VectorRed.png')}
                        style={[bestSellerStyles.ptsBadge, { justifyContent: 'center', alignItems: 'center' }]}
                      >
                        <Text
                          style={[
                            bestSellerStyles.ptsText,
                            { color: 'white' },
                          ]}
                        >
                          {product.pts}
                          {'\n'}PTS
                        </Text>
                      </ImageBackground>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </ScrollView>
        </ImageBackground>
      </SafeAreaView>
    </>
  );
}

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftBackground: {
    position: 'absolute',
    top: '5%',
    width: scale(320),
    height: verticalScale(320),
    zIndex: -1,
    opacity: 0.6,
  },

  popupBox: {
    width: "90%",
    height: "auto",
    backgroundColor: '#FFE2E2',
    borderRadius: moderateScale(24),
    alignItems: 'center',
    paddingVertical: verticalScale(18),
    paddingHorizontal: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.18,
    shadowRadius: moderateScale(16),
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: verticalScale(12),
    right: scale(12),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    borderColor: 'red',
    borderWidth: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  closeText: {
    fontSize: moderateScale(22),
    color: '#222',
    fontWeight: 'bold',
    marginTop: verticalScale(-2),
  },
  saleText: {
    fontSize: moderateScale(46),
    lineHeight: moderateScale(35),
    color: '#E53935',
    fontFamily: 'Sigmar',
  },
  productImg: {
    width: moderateScale(186),
    height: moderateScale(186),
    marginVertical: verticalScale(20),
    alignSelf: 'center',
  },
  discountText: {
    fontSize: moderateScale(28),
    lineHeight: moderateScale(22),
    color: '#E53935',
    fontFamily: 'PoppinsRegular',
  },
});

const bestSellerStyles = StyleSheet.create({
  productCard: {
    width: scale(200),
    marginRight: scale(10),
  },
  gradient: {
    borderRadius: moderateScale(18),
    width: scale(194),
    height: verticalScale(184),
    paddingTop: verticalScale(18),
    paddingBottom: 0,
    paddingHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
    marginBottom: verticalScale(16),
  },
  wishlistBtn: {
    position: 'absolute',
    top: verticalScale(10),
    right: 10,
    zIndex: 2,
    backgroundColor: '#E53935',
    borderRadius: moderateScale(16),
    padding: moderateScale(4),
  },
  productImg: {
    width: scale(78),
    height: verticalScale(130),
    borderRadius: moderateScale(10),
    resizeMode: 'contain',
    marginTop: verticalScale(10)
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBF4E4',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(3),
    paddingVertical: verticalScale(2),
    marginTop: verticalScale(-8),
    height: verticalScale(40),
    width: scale(195)
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: moderateScale(12),
    color: colors.textSecondary,
    marginBottom: 0,
  },
  ptsBadge: {
    width: moderateScale(50),
    height: moderateScale(40),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptsText: {
    color: 'white',
    fontFamily: 'PoppinsSemi',
    fontSize: moderateScale(13),
    textAlign: 'center',
    lineHeight: moderateScale(15),
  },
  rating: {
    color: '#FFD600',
    fontSize: moderateScale(10),
  },
});


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerBg: {
    backgroundColor: "#733326",
    borderBottomLeftRadius: moderateScale(32),
    borderBottomRightRadius: moderateScale(32),
    paddingVertical: verticalScale(10),
    paddingTop: verticalScale(10),
    height: verticalScale(280)
  },
  headerRow: {
    marginTop: verticalScale(40),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: "hidden",
    justifyContent: "space-between"
  },
  hello: {
    color: '#fff',
    fontSize: moderateScale(28),
    fontFamily: "RussoOne",

  },
  subtext: {
    color: '#fff',
    fontSize: moderateScale(16),
    marginBottom: verticalScale(12),
  },
  rewardBox: {
    width: scale(85),
    height: verticalScale(80),
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(12),
    alignSelf: 'flex-start',
    marginTop: verticalScale(4),
    marginBottom: verticalScale(8),
    alignItems: 'center',
  },
  rewardLabel: {
    color: "red",
    fontFamily: 'RussoOne',
    fontSize: moderateScale(15),
  },
  rewardPoints: {
    color: "red",
    fontFamily: 'PoppinsBold',
    fontSize: moderateScale(24),
    lineHeight: moderateScale(28),
    textAlign: 'center',
  },
  rewardPts: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(12),
    color: "red",
    fontFamily: 'PoppinsBold',
  },
  familyImg: {
    width: scale(225),
    height: verticalScale(232),
    resizeMode: "contain",
  },
  sectionTitle: {
    color: "white",
    fontSize: moderateScale(32),
    lineHeight: moderateScale(37),
    fontFamily: "Sigmar",
    marginLeft: scale(15),
    marginTop: verticalScale(30)
  },
  categoriesSlider: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(10),
    gap: scale(8),
    height: verticalScale(240),
  },
  categoryCard: {
    marginTop: verticalScale(5),
    borderRadius: moderateScale(18),
    width: scale(223),
    height: verticalScale(220),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(4),
    elevation: 4
  },
  categoryImg: {
    width: scale(280),
    height: verticalScale(160),
  },
  categoryLabel: {
    color: 'white',
    fontSize: moderateScale(22),
    fontFamily: "Sigmar",
    lineHeight: moderateScale(36),
  },
  bannerCard: {
    marginTop: verticalScale(18),
    borderRadius: moderateScale(26),
    alignItems: 'center',
    width: scale(340),
    marginHorizontal: scale(4)
  },
  brandCard: {
    backgroundColor: '#FBF4E4',
    borderRadius: moderateScale(16),
    width: scale(140),
    height: verticalScale(120),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(4),
  },
  brandSlider: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(18),
    height: verticalScale(150),
  },
  brandImg: {
    width: scale(98),
    height: verticalScale(46),
  },
  bestSellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    color: "white",
    fontSize: moderateScale(14),
    fontFamily: "PoppinsMedium",
    marginTop: scale(35),
    marginRight: scale(20)
  },
  bestSellerSubtext: {
    color: 'white',
    width: scale(250),
    fontSize: moderateScale(14),
    marginLeft: scale(16),
    marginTop: verticalScale(4),
    marginBottom: verticalScale(16),
  },
});