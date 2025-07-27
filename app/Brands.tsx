import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product, PRODUCTS } from '../constants/products';
import { useWishlistStore } from './Wishlist';


const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - 48) / 2;

const Brands = () => {
  const router = useRouter();
  const { brand } = useLocalSearchParams();
  const selectedBrand = brand;
  const [loaded] = useFonts({
    Sigmar: require("../assets/fonts/Sigmar-Regular.ttf"),
    PoppinsMedium: require("../assets/fonts/Poppins-Medium.ttf"),
    PoppinsSemi: require("../assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
    InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
    InterBold: require("../assets/fonts/Inter-Bold.ttf"),
  })
  useEffect(() => {
    if (loaded) {
      return;
    }
  }, [loaded])
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
      'pts' in p &&
      (!brand || p.brand === brand)
  );

  // Auto-slide functionality
  useEffect(() => {
    const filteredAds = adsImages.filter(ad => 
      displayList.some(product => 'brand' in product && product.brand === ad.brand)
    );
    
    if (filteredAds.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex(prevIndex => 
          prevIndex === filteredAds.length - 1 ? 0 : prevIndex + 1
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

      if ('brand' in product && (i + 1) % 4 === 0) {
        const brandAds = adsImages.filter((ad) => ad.brand === product.brand);
        if (brandAds.length > 0) {
          const ad = brandAds[adIndex % brandAds.length]; // cycle ads
          data.push({ type: "ad", brand: product.brand, data: ad });
          adIndex++;
        }
      }
    }

    return data;
  }, [displayList, adsImages]);


  return (
    <ImageBackground
      source={brand === 'Vida' ? require('../assets/images/ss2.png') : require('../assets/images/ss1.png')}
      style={styles.container}
      resizeMode="cover"
    >
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: "100%" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{brand ? brand : 'Brands'}</Text>
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
          {adsImages
            .filter(ad => displayList.some(product => 'brand' in product && product.brand === ad.brand))
            .map((ad, index) => (
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
          {adsImages
            .filter(ad => displayList.some(product => 'brand' in product && product.brand === ad.brand))
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
                     <ImageBackground source={require('../assets/images/pts.png')} style={styles.ptsBadge} resizeMode="contain" >
                     <Text style={styles.ptsText}>{prod.pts}{'\n'}PTS</Text>
                     </ImageBackground>
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
      paddingTop: 48,
      paddingBottom: 12,
      paddingHorizontal: 16
    },
    backBtn: {
      marginRight: 12,
      padding: 4
    },
    backArrow: {
      fontSize: 24,
      color: '#fff'
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 28,
      color: '#fff',
      fontFamily: 'Sigmar',
      letterSpacing: 1
    },
    banner: {
      width: '100%',
      height: "10%",
      borderRadius: 12,
      marginBottom: 10
    },
    tabsWrap: {
      alignItems: 'center',
      marginVertical: 8
    },
    tabs: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 4
    },
    tabBtn: {
      paddingHorizontal: 24,
      paddingVertical: 8,
      borderRadius: 20
    },
    tabBtnActive: {
      borderBottomWidth: 8,
      borderBottomColor: colors.primaryDark,
      backgroundColor: 'transparent',
      borderRadius: 20
    },
    tabText: {
      color: colors.textSecondary,
      fontWeight: 'bold',
      fontSize: 16
    },
    tabTextActive: {
      fontSize: 18
    },
    gridWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      marginTop: 8
    },
    card: {
      borderRadius: 16,
      marginBottom: 16,
      paddingTop: 10,
      minHeight: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      justifyContent: 'center',

    },
    cardImg: {
      width: '90%',
      height: "50%",
      borderRadius: 10,
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 8,
      backgroundColor: '#fff',
    },
    heart: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#E53935',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.secondary,
      borderRadius: 12,
      paddingHorizontal: 3,
      paddingVertical: 2,
      marginTop: -8,
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
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 0,
    },
    cardRating: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'InterRegular',
      marginBottom: 0,
    },
    ptsBadge: {
      width: 50,
      height: 40,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',

    },
    ptsText: {
      color: '#fff',
      fontFamily: 'PoppinsSemi',
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 15,
    },
    banner2: {
      width: '100%',
    },
    productCard: {
      borderRadius: 18,
      width: '100%',
      paddingTop: 18,
      paddingBottom: 0,
      paddingHorizontal: 10,
      alignItems: 'center',
      marginHorizontal: 3,
      position: 'relative',
      marginBottom: 16,
    },
    heartWrap: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 2,
      backgroundColor: '#E53935', // revert to red
      borderRadius: 16,
      padding: 4,
    },
    adSliderContainer: {
      width: '100%',
      height: screenWidth * 0.5, // Adjust height as needed
      marginBottom: 10,
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
      marginTop: 10,
    },
    adIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      marginHorizontal: 4,
    },
    adIndicatorActive: {
      backgroundColor: 'white',
    },
    adBanner: {
      width: '100%',
      height: screenWidth * 0.3, // Adjust height as needed
      borderRadius: 16,
      marginBottom: 10,
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