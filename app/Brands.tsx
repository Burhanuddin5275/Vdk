// Imports remain the same
import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Product } from '../constants/products';
import { fetchProducts } from '../services/products';
import { useWishlistStore } from './Wishlist';

const screenWidth = Dimensions.get('window').width;
const COLUMN_GAP = scale(12);
const CARD_WIDTH = (screenWidth - COLUMN_GAP * 3) / 2;
// ✅ Banner ads for top slider
const bannerAds = [
  {
    brand: "Josh",
    category: "Lubricant",
    image: require("../assets/images/lubricantSlider.png"),
  },
  {
    brand: "Josh",
    category: "Condoms",
    image: require("../assets/images/Pyasa.png"),
  },
  {
    brand: "Josh",
    category: "Condoms",
    image: require("../assets/images/Anam.png"),
  },
  {
    brand: "OK",
    category: "Condoms",
    image: require("../assets/images/okWanna.png"),
  },
  {
    brand: "Vidafem",
    category: "Medicine",
    image: require("../assets/images/Heer.png"),
  },
];

// ✅ Inline ads for between product cards
const inlineAds = [
  {
    brand: "Josh",
    category: "Lubricant",
    image: require("../assets/images/lubricant.png"),
  },
  {
    brand: "Josh",
    category: "Condoms",
    image: require("../assets/images/lahoriTikka.png"),
  },
  {
    brand: "OK",
    category: "Condoms",
    image: require("../assets/images/okBanner.png"),
  },
  {
    brand: "OK",
    category: "Condoms",
    image: require("../assets/images/wanna.png"),
  },
  {
    brand: "Vida",
    category: "Devices",
    image: require("../assets/images/Heer.png"),
  },

  {
    brand: "Vida",
    category: "Medicine",
    image: require("../assets/images/Vidafem1.png"),
  },
];

const Brands = () => {
  const router = useRouter();
  const { brand, category } = useLocalSearchParams();
  const selectedBrand = brand;
  const selectedCategory = category;
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);

  // Load products from API
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  useEffect(() => {
    (async () => {
      const data = await fetchProducts();
      setAllProducts(data);
    })();
  }, []);

  // Filter products by brand and category
  let filtered = allProducts;
  if (selectedCategory) {
    const cat = String(selectedCategory).toLowerCase();
    filtered = allProducts.filter(p => {
      if (!('Category' in p)) return false;
      const prodCat = String(p.Category).toLowerCase();
      return (
        prodCat === cat ||
        prodCat === cat + 's' ||
        prodCat + 's' === cat
      );
    });
  }

  const displayList = filtered.filter(
    (p): p is Product & { id: string; name: string; brand: string; price: number; img: any; rating: number; pts: number } =>
      'brand' in p &&
      'id' in p &&
      'name' in p &&
      'price' in p &&
      'img' in p &&
      'rating' in p &&
      'pts' in p &&
      (!brand || p.brand === brand)
  );

  const isVidaBrand = displayList.length > 0 && displayList.every(item => item.brand === "Vidafem");

  // 🔁 Auto-slide banner ads
  useEffect(() => {
    const filteredBannerAds = bannerAds.filter(ad =>
      displayList.some(product => product.brand === ad.brand)
    );

    if (filteredBannerAds.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex(prev => (prev === filteredBannerAds.length - 1 ? 0 : prev + 1));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [displayList]);

  // 🔁 Scroll to current banner
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentAdIndex * screenWidth,
        animated: true,
      });
    }
  }, [currentAdIndex]);

  // 🔁 Merge products + inline ads every 4 products
  const mergedData = useMemo(() => {
    const data: any[] = [];
    let adIndex = 0;
    for (let i = 0; i < displayList.length; i++) {
      const product = displayList[i];
      data.push({ type: "product", data: product });

      if ((i + 1) % 4 === 0) {
        const brandAds = inlineAds.filter(ad => ad.brand === product.brand);
        if (brandAds.length > 0) {
          const ad = brandAds[adIndex % brandAds.length];
          data.push({ type: "ad", data: ad });
          adIndex++;
        }
      }
    }
    return data;
  }, [displayList]);

  // 🔽 Start rendering
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
      <ImageBackground
        source={brand === 'Vidafem' ? require('../assets/images/ss2.png') : require('../assets/images/ss1.png')}
        style={styles.container}
        resizeMode="cover"
      >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: "20%" }}>
        {/* 🔙 Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={router.back}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{brand || 'Brands'}</Text>
        </View>

        {/* 🖼️ Top Banner Ad Slider */}
        <View style={styles.adSliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setCurrentAdIndex(index);
            }}
            ref={scrollViewRef}
          >
            {bannerAds
              .filter(ad => displayList.some(p => p.brand === ad.brand))
              .map((ad, index) => (
                <View key={index} style={styles.adSlide}>
                  <Image source={ad.image} style={styles.adSlideImage} resizeMode="contain" />
                </View>
              ))}
          </ScrollView>

          {/* 🔘 Indicators */}
          <View style={styles.adIndicators}>
            {bannerAds
              .filter(ad => displayList.some(p => p.brand === ad.brand))
              .map((_, index) => (
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

        {/* 🛒 Product Grid with inline ads */}
        <View style={styles.gridWrap}>
          {mergedData.map((item, idx) => {
            if (item.type === "product") {
              const prod = item.data;
              return (
                <TouchableOpacity
                  key={prod.id}
                  style={{
                    width: CARD_WIDTH,
                    marginBottom: verticalScale(32),
                  }}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/Products', params: { id: prod.id, data: JSON.stringify(prod) } })}
                >
                  <LinearGradient
                    colors={prod.brand === 'Vidafem' ? ['#C3FFFA', '#C3FFFA'] : ['#FFD600', '#FF9800']}
                    style={styles.productCard}
                  >
                    <TouchableOpacity
                      style={[styles.heartWrap, prod.brand === 'Vidafem' && { backgroundColor: '#006400' }]}
                      onPress={async () => {
                        if (!isAuthenticated) {
                          setWishlistMessage('Please log in to use wishlist.');
                          setTimeout(() => {
                            setWishlistMessage(null);
                            const params = new URLSearchParams();
                            if (brand) params.append('brand', brand as string);
                            if (category) params.append('category', category as string);
                            const currentRoute = `/Brands${params.toString() ? `?${params.toString()}` : ''}`;
                            router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`);
                          }, 1000);
                          return;
                        }

                        if (wishlistItems.some(w => w.id === prod.id)) {
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
                      <Ionicons name={wishlistItems.some(w => w.id === prod.id) ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                    </TouchableOpacity>
                    <Image source={prod.img} style={{ width: '100%', height: 150, borderRadius: 10, resizeMode: 'contain' }} />
                  </LinearGradient>
                  <View style={[
                    styles.cardFooter,
                    prod.brand === 'Josh' && { backgroundColor: '#FBF4E4' },
                    prod.brand === 'OK' && { backgroundColor: colors.secondary },
                    prod.brand === 'Vidafem' && { backgroundColor: '#C3FFFA' }
                  ]}>
                    <View style={styles.footerLeft}>
                      <Text style={[styles.cardTitle, prod.brand === 'Vidafem' && { color: '#006400' }]} numberOfLines={3}>
                        {prod.name}
                      </Text>
                      <Text style={styles.cardRating}>Ratings <Text style={{ color: '#FFD600' }}>{'★'.repeat(prod.rating)}</Text></Text>
                    </View>
                    <ImageBackground
                      source={
                        prod.brand === 'Vidafem'
                          ? require('../assets/images/VectorGreen.png')
                          : require('../assets/images/VectorRed.png')
                      }
                      style={[styles.ptsBadge, { justifyContent: 'center', alignItems: 'center' }]}
                    >
                      <Text style={styles.ptsText}>
                        {prod.pts}{'\n'}PTS
                      </Text>
                    </ImageBackground>
                  </View>
                </TouchableOpacity>
              );
            }

            // 🔽 Inline Ad Banner
            if (item.type === "ad") {
              return (
                <View key={`ad-${idx}`} style={styles.adBanner}>
                  <Image source={item.data.image} style={styles.adBannerImage} resizeMode="contain" />
                </View>
              );
            }

            return null;
          })}
        </View>
      </ScrollView>

      {/* 🔔 Wishlist Toast */}
      {wishlistMessage && (
        <View style={{ position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
          <View style={{ backgroundColor: '#E53935', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{wishlistMessage}</Text>
          </View>
        </View>
      )}
    </ImageBackground>
    </SafeAreaView>
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
  banner: {
    width: '100%',
    height: '10%',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10)
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
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(3),
    paddingVertical: verticalScale(2),
    marginTop: verticalScale(-8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(1) },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(2),
    height: verticalScale(42)
  },
  footerLeft: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: moderateScale(10),
    lineHeight: moderateScale(10),
    color: colors.textSecondary,
    marginBottom: 0,
  },
  cardRating: {
    fontSize: moderateScale(10),
    color: colors.black,
    fontFamily: 'InterRegular',
    marginBottom: 0,
  },
  ptsBadge: {
    width: moderateScale(50),
    height: moderateScale(50),
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
    height: screenWidth * 0.3, 
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(28),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adBannerImage: {
    width: '100%',
    height: '100%',
  },
});
export default Brands;
