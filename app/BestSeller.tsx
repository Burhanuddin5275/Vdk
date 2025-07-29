import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Product, PRODUCTS } from '../constants/products';
import { useWishlistStore } from './Wishlist';


const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - scale(48)) / 2;

const BestSeller = () => {
  const router = useRouter();
  const { brand } = useLocalSearchParams();
  const selectedBrand = brand;
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Create ads array with images
  const adsImages = [
    {
      brand: "Josh",
      image: require("../assets/images/lahoriTikka.png"),
    },
    {
      brand: "OK",
      image: require("../assets/images/okBanner.png"),
    },
    {
      brand: "Vida",
      image: require("../assets/images/Vidafem1.png"),
    },
    {
      brand: "Josh",
      image: require("../assets/images/lubricant.png"),
    },
    {
      brand: "OK",
      image: require("../assets/images/okWanna.png"),
    },
    {
      brand: "Vida",
      image: require("../assets/images/Heer.png"),
    },
    {
      brand: "Josh",
      image: require("../assets/images/Pyasa.png"),
    },
    {
      brand: "Josh",
      image: require("../assets/images/lubricantSlider.png"),
    },
    {
      brand: "Vida",
      image: require("../assets/images/vida.png"),
    },
  ];

  // Only declare wishlistItems once, with explicit types
  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);

  // Remove isRealProduct and filtered logic
  // Instead, filter PRODUCTS directly for displayList:
  let displayList = PRODUCTS.filter(
    (p): p is Product & { id: string; name: string; brand: string; price: number; img: any; rating: number; pts: number } =>
      'brand' in p &&
      'id' in p &&
      'name' in p &&
      'price' in p &&
      'img' in p &&
      'rating' in p &&
      'pts' in p
  );

  // Auto-slide functionality
  useEffect(() => {
    if (adsImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex(prevIndex =>
          prevIndex === adsImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000); // Change slide every 10 seconds

      return () => clearInterval(interval);
    }
  }, [displayList, adsImages]);

  // Auto-scroll to current index
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentAdIndex * screenWidth,
        animated: true
      });
    }
  }, [currentAdIndex]);

  // --- Merge Products + Brand Ads ---
  const mergedData = useMemo(() => {
    const data: any[] = [];
    let adIndex = 0;

    for (let i = 0; i < displayList.length; i++) {
      const product = displayList[i];
      data.push({ type: "product", data: product });

      if ((i + 1) % 4 === 0 && adsImages.length > 0) {
        const ad = adsImages[adIndex % adsImages.length]; // cycle ads
        data.push({ type: "ad", data: ad });
        adIndex++;
      }
    }

    return data;
  }, [displayList, adsImages]);


  return (
    <ImageBackground
      source={brand === 'Vida' ? require('../assets/images/seller.png') : require('../assets/images/ss1.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: "20%" }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={router.back}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Best Seller</Text>
        </View>

        {/* Ad Image Slider */}
        <View style={styles.adSliderContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentAdIndex(index);
            }}
            ref={scrollViewRef}
          >
            {adsImages.map((ad, index) => (
              <View key={index} style={styles.adSlide}>
                <Image
                  source={ad.image}
                  style={styles.adSlideImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>
          {/* Ad Indicators */}
          <View style={styles.adIndicators}>
            {adsImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.adIndicator,
                  index === currentAdIndex && styles.adIndicatorActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* Tabs removed */}
        {/* Product Grid */}
        <View style={styles.gridWrap}>
          {mergedData.map((item, idx) => {
            if (item.type === "product") {
              const p = item.data;
              if ('id' in p && 'name' in p && 'price' in p && 'img' in p) {
                const prod = p as Exclude<Product, { banner: string }>;
                return (
                  <TouchableOpacity
                    key={prod.id}
                    style={{ width: CARD_WIDTH, marginBottom: 32 }}
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/Products', params: { id: prod.id, data: JSON.stringify(prod) } })}
                  >
                    <LinearGradient
                      colors={prod.brand === 'Vida' ? ['#C3FFFA', '#C3FFFA'] : ['#FFD600', '#FF9800']}
                      style={styles.productCard}
                    >

                      <TouchableOpacity
                        style={[
                          styles.heartWrap,
                          prod.brand === 'Vida' && { backgroundColor: '#006400' }
                        ]}
                        onPress={async () => {
                          if (!isAuthenticated) {
                            setWishlistMessage('Please log in to use wishlist.');
                            setTimeout(() => setWishlistMessage(null), 1000);
                            setTimeout(() => router.replace('/Login'), 1000);
                            return;
                          }
                          if (wishlistItems.some((w: { id: string }) => w.id === prod.id)) {
                            await useWishlistStore.getState().removeFromWishlist(prod.id);
                            setWishlistMessage('Removed from wishlist');
                          } else {
                            await useWishlistStore.getState().addToWishlist({
                              id: prod.id,
                              name: prod.name,
                              price: prod.price,
                              image: prod.img,
                              pack: '',
                            });
                            setWishlistMessage('Added to wishlist');
                          }
                          setTimeout(() => setWishlistMessage(null), 2000);
                        }}
                      >
                        <Ionicons name={wishlistItems.some((w: { id: string }) => w.id === prod.id) ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                      </TouchableOpacity>
                      <Image source={prod.img} style={{ width: '100%', height: 150, marginBottom: 8, borderRadius: 10, resizeMode: 'contain' }} />
                    </LinearGradient>
                    <View style={[
                      styles.cardFooter,
                      prod.brand === 'Josh' && { backgroundColor: '#FBF4E4' },
                      prod.brand === 'OK' && { backgroundColor: colors.secondary },
                      prod.brand === 'Vida' && { backgroundColor: '#C3FFFA' }
                    ]}>
                      <View style={styles.footerLeft}>
                        <Text style={[
                          styles.cardTitle,
                          prod.brand === 'Vida' && { color: '#006400' }
                        ]}>{prod.name}</Text>
                        <Text style={styles.cardRating}>Ratings <Text style={{ color: '#FFD600' }}>{'★'.repeat(prod.rating)}</Text></Text>
                      </View>
                      <View style={[
                        styles.ptsBadge,
                        prod.brand === 'Vida'
                          ? { backgroundColor: '#0B3D0B' }
                          : { backgroundColor: '#AE2125' },
                      ]}>
                        <Text style={styles.ptsText}>{prod.pts}{'\n'}PTS</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
              return null;
            }

            if (item.type === "ad") {
              const ad = item.data;
              return (
                <View key={`ad-${idx}`} style={styles.adBanner}>
                  <Image
                    source={ad.image}
                    style={styles.adBannerImage}
                    resizeMode="contain"
                  />
                </View>
              );
            }

            return null;
          })}
        </View>
      </ScrollView>
      {/* Snackbar/Toast */}
      {wishlistMessage && (
        <View style={{ position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
          <View style={{ backgroundColor: '#E53935', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{wishlistMessage}</Text>
          </View>
        </View>
      )}
    </ImageBackground>
  );
};
// styles must be defined before use
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: verticalScale(120),
    position: 'relative',
    paddingHorizontal: scale(16),
  },
  backBtn: {
    width: 40,
    height: 56,
    alignItems: 'center',
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
    lineHeight: 56,
  },
  banner: {
    width: '100%',
    height: '10%',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10)
  },
  tabsWrap: {
    alignItems: 'center',
    marginVertical: verticalScale(8)
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: moderateScale(24),
    padding: scale(4)
  },
  tabBtn: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20)
  },
  tabBtnActive: {
    borderBottomWidth: moderateScale(8),
    borderBottomColor: colors.primaryDark,
    backgroundColor: 'transparent',
    borderRadius: moderateScale(20)
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
    fontSize: moderateScale(16)
  },
  tabTextActive: {
    fontSize: moderateScale(18)
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scale(12),
    marginTop: verticalScale(8)
  },
  card: {
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    paddingTop: verticalScale(10),
    minHeight: verticalScale(200),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    justifyContent: 'center',

  },
  cardImg: {
    width: '90%',
    height: '50%',
    borderRadius: moderateScale(10),
    alignSelf: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(8),
    backgroundColor: '#fff',
  },
  heart: {
    position: 'absolute',
    top: verticalScale(10),
    right: scale(10),
    backgroundColor: '#E53935',
    borderRadius: moderateScale(12),
    width: scale(24),
    height: verticalScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(3),
    paddingVertical: verticalScale(2),
    height: verticalScale(70),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  footerLeft: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: moderateScale(13),
    color: colors.textSecondary,
    marginBottom: 0,
  },
  cardRating: {
    fontSize: moderateScale(12),
    color: colors.black,
    fontFamily: 'InterRegular',
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
    color: '#fff',
    fontFamily: 'PoppinsSemi',
    fontSize: moderateScale(13),
    textAlign: 'center',
    lineHeight: moderateScale(15),
  },
  banner2: {
    width: '100%',
  },
  productCard: {
    borderRadius: moderateScale(18),
    width: '100%',
    paddingTop: verticalScale(18),
    paddingBottom: 0,
    paddingHorizontal: scale(10),
    alignItems: 'center',
    marginHorizontal: scale(3),
    position: 'relative',
    marginBottom: verticalScale(16),
  },
  heartWrap: {
    position: 'absolute',
    top: verticalScale(10),
    right: scale(10),
    zIndex: 2,
    backgroundColor: '#E53935', // revert to red
    borderRadius: moderateScale(16),
    padding: scale(4),
  },
  adSliderContainer: {
    width: '100%',
    height: screenWidth * 0.5, // This is already responsive
    marginBottom: verticalScale(10),
    position: 'relative',
  },
  adSlide: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adSlideImage: {
    width: '100%',
    height: '100%',
  },
  adIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(10),
  },
  adIndicator: {
    width: scale(8),
    height: scale(8),
    borderRadius: moderateScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: scale(4),
  },
  adIndicatorActive: {
    backgroundColor: 'white',
  },
  adBanner: {
    width: '100%',
    height: screenWidth * 0.3, // This is already responsive
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(10),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adBannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default BestSeller;