import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Product, PRODUCTS } from "../constants/products";
import { useWishlistStore } from './Wishlist';

const TABS = ['All'];

const screenWidth = Dimensions.get('window').width;
const COLUMN_GAP = scale(12);
const CARD_WIDTH = (screenWidth - COLUMN_GAP * 3) / 2;




const categoryImageMap = {
  'Condoms': require('../assets/images/condom.png'),
  'Lubricant': require('../assets/images/Lubricants.png'),
  'Devices': require('../assets/images/Devices.png'),
  'Medicine': require('../assets/images/medicine.png'),
};

const Categories = () => {

  const router = useRouter();
  const { category } = useLocalSearchParams();
  const selectedCategory = category;

// Slider banner ads
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
    brand: "Vida",
    category: "Medicine",
    image: require("../assets/images/Heer.png"),
  },
];

// Inter-product brand ads
const adsImages = [
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


  const [activeTab, setActiveTab] = useState(0);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Only declare wishlistItems once, with explicit types
  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);

  // Helper to determine if a product is in the wishlist
  const isInWishlist = (id: string) => wishlistItems.some((w: { id: string }) => w.id === id);

  let filtered = PRODUCTS;
  if (selectedCategory) {
    const cat = String(selectedCategory).toLowerCase();
    filtered = PRODUCTS.filter(p => {
      if (!('Category' in p)) return false;
      const prodCat = String(p.Category).toLowerCase();
      // Match exact, or singular/plural
      return (
        prodCat === cat ||
        prodCat === cat + 's' ||
        prodCat + 's' === cat
      );
    });
  }

  // If in category mode, check for multiple brands
  let categoryBrands: string[] = [];
  if (selectedCategory) {
    categoryBrands = Array.from(new Set(filtered.map(p => ('brand' in p && p.brand ? p.brand : undefined)).filter((b): b is string => Boolean(b))));
  }
  const [brandTab, setBrandTab] = useState('All');
  let displayList = filtered;
  if (selectedCategory && categoryBrands.length > 1 && brandTab !== 'All') {
    displayList = filtered.filter(p => 'brand' in p && p.brand === brandTab);
  } else if (!selectedCategory) {
    // Insert banner ad after 6th product or alternate banners for non-category mode
    displayList = [...filtered];
  }

useEffect(() => {
  const filteredBanners = bannerAds.filter(ad =>
    displayList.some(product =>
      'brand' in product &&
      'Category' in product &&
      product.brand === ad.brand &&
      ad.category.toLowerCase() === String(selectedCategory).toLowerCase()
    )
  );

  if (filteredBanners.length > 1) {
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev === filteredBanners.length - 1 ? 0 : prev + 1));
    }, 10000);

    return () => clearInterval(interval);
  }
}, [displayList, bannerAds, selectedCategory]);


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

      if ('brand' in product && 'Category' in product && (i + 1) % 4 === 0) {
        const brandAds = adsImages.filter((ad) =>
          ad.brand === product.brand &&
          ad.category.toLowerCase() === String(selectedCategory).toLowerCase()
        );
        if (brandAds.length > 0) {
          const ad = brandAds[adIndex % brandAds.length]; // cycle ads
          data.push({ type: "ad", brand: product.brand, data: ad });
          adIndex++;
        }
      }
    }

    return data;
  }, [displayList, adsImages, selectedCategory]);

  // --- Background based on brand (example logic from your code) ---
  const isVidaBrand =
    filtered.length > 0 &&
    filtered.every((item) => "brand" in item && item.brand === "Vida");

  const backgroundImage = isVidaBrand
    ? require("../assets/images/ss2.png")
    : require("../assets/images/ss.png");

  const vidaColors = {
    background: "#C3FFFA",
    text: "#0B3D0B",
    card: "#C3FFFA",
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.container} resizeMode="cover">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: "10%" }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={router.back}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCategory ? selectedCategory : 'Condom'}</Text>
        </View>
 
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
    {bannerAds
      .filter(ad => displayList.some(product =>
        'brand' in product &&
        'Category' in product &&
        product.brand === ad.brand &&
        ad.category.toLowerCase() === String(selectedCategory).toLowerCase()
      ))
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

  <View style={styles.adIndicators}>
    {bannerAds
      .filter(ad => displayList.some(product =>
        'brand' in product &&
        'Category' in product &&
        product.brand === ad.brand &&
        ad.category.toLowerCase() === String(selectedCategory).toLowerCase()
      ))
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


        {/* Banner and Tabs logic */}
        {!selectedCategory ? (
          <>
            <View style={styles.tabsWrap}>
              <View style={styles.tabs}>
                {TABS.map((tab, i) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabBtn, activeTab === i && styles.tabBtnActive]}
                    onPress={() => setActiveTab(i)}>
                    <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          categoryBrands.length > 1 && (
            <View style={styles.tabsWrap}>
              <View style={styles.tabs}>
                {['All', ...categoryBrands].map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    style={[styles.tabBtn, brandTab === brand && styles.tabBtnActive]}
                    onPress={() => setBrandTab(brand)}>
                    <Text style={[styles.tabText, brandTab === brand && styles.tabTextActive]}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )
        )}

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
                    style={{
                      width: CARD_WIDTH,
                      marginBottom: verticalScale(32),
                    }}
                    activeOpacity={0.8}
                    onPress={() =>
                      router.push({
                        pathname: "/Products",
                        params: {
                          id: prod.id,
                          data: JSON.stringify(prod),
                          category: selectedCategory,
                          backgroundImage: isVidaBrand ? 'ss2' : 'ss',
                        },
                      })
                    }
                  >
                    <LinearGradient
                      colors={
                        isVidaBrand
                          ? [vidaColors.card, vidaColors.background]
                          : ["#FFD600", "#FF9800"]
                      }
                      style={styles.productCard}
                    >
                      {/* Wishlist Button */}
                      <TouchableOpacity
                        style={[
                          styles.heartWrap,
                          isVidaBrand && { backgroundColor: "#0B3D0B" },
                        ]}
                        onPress={async () => {
                          if (!isAuthenticated) {
                            setWishlistMessage("Please log in to use wishlist.");
                            setTimeout(() => setWishlistMessage(null), 1000);
                            const currentRoute = `/Categories${category ? `?category=${category}` : ''}`;
                            setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
                            return;
                          }
                          if (isInWishlist(prod.id)) {
                            await useWishlistStore.getState().removeFromWishlist(prod.id);
                            setWishlistMessage("Removed from wishlist");
                          } else {
                            await useWishlistStore.getState().addToWishlist({
                              id: prod.id,
                              name: prod.name,
                              price: prod.price,
                              image: prod.img,
                              pack: "",
                            });
                            setWishlistMessage("Added to wishlist");
                          }
                          setTimeout(() => setWishlistMessage(null), 2000);
                        }}
                      >
                        <Ionicons
                          name={isInWishlist(prod.id) ? "heart" : "heart-outline"}
                          size={moderateScale(20)}
                          color="#fff"
                        />
                      </TouchableOpacity>

                      <Image
                        source={prod.img}
                        style={{
                          width: "80%",
                          height: verticalScale(150),
                          marginBottom: verticalScale(8),
                          borderRadius: moderateScale(10),
                          resizeMode: "contain",
                        }}
                      />
                    </LinearGradient>

                    {/* Footer */}
                    <View
                      style={[
                        styles.cardFooter,
                        isVidaBrand
                          ? { backgroundColor: vidaColors.background }
                          : prod.brand === "Josh"
                            ? { backgroundColor: "#FBF4E4" }
                            : prod.brand === "OK"
                              ? { backgroundColor: colors.secondary }
                              : null,
                      ]}
                    >
                      <View style={styles.footerLeft}>
                        <Text
                          style={[styles.cardTitle, isVidaBrand && { color: vidaColors.text }]} numberOfLines={3}
                        >
                          {prod.name}
                        </Text>
                        <Text style={{fontSize:scale(10), fontFamily: 'InterRegular'}}>
                          Ratings
                          <Text style={{ color: "#FFD600", }}>
                            {"★".repeat(prod.rating)}
                          </Text>
                        </Text>
                      </View>
                      <View>
                        {isVidaBrand ? (
                          <ImageBackground
                            source={require('../assets/images/VectorGreen.png')}
                            style={[styles.ptsBadge, { justifyContent: 'center', alignItems: 'center' }]}
                            imageStyle={{ borderRadius: moderateScale(6) }}
                          >
                            <Text
                              style={[
                                styles.ptsText,
                                { color: 'white' },
                              ]}
                            >
                              {prod.pts}
                              {'\n'}PTS
                            </Text>
                          </ImageBackground>
                        ) : (
                             <ImageBackground
                            source={require('../assets/images/VectorRed.png')}
                            style={[styles.ptsBadge, { justifyContent: 'center', alignItems: 'center' }]}
                            imageStyle={{ borderRadius: moderateScale(6) }}
                          >
                          <Text
                            style={[
                              styles.ptsText,
                              { color: 'white' },
                            ]}
                          >
                            {prod.pts}
                            {'\n'}PTS
                          </Text>
                          </ImageBackground>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
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
      {/* Wishlist Snackbar */}
      {wishlistMessage && (
        <View style={{ position: "absolute", top: verticalScale(80), left: 0, right: 0, alignItems: "center", zIndex: 20 }}>
          <View style={{ backgroundColor: "#E53935", paddingHorizontal: scale(24), paddingVertical: verticalScale(12), borderRadius: moderateScale(24) }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: moderateScale(16) }}>{wishlistMessage}</Text>
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
  tabsWrap: {
    alignItems: 'center',
    marginVertical: verticalScale(8)
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: moderateScale(24),
    padding: moderateScale(4)
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
    height: verticalScale(40)
  },
  footerLeft: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: moderateScale(10),
    lineHeight: moderateScale(12),
    color: colors.textSecondary,
    marginBottom: 0,
  },
  // cardRating: {
  //   fontSize: moderateScale(12),
  //   lineHeight: moderateScale(5),
  //   color: colors.textSecondary,
  //   fontFamily: 'InterRegular',
  //   marginBottom: 0,
  // },
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
    fontSize: moderateScale(12),
    textAlign: 'center',
    lineHeight: moderateScale(15),
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
    backgroundColor: '#E53935', 
    borderRadius: moderateScale(16),
    padding: scale(4),
  },
  adBanner: {
    width: '100%',
    height: verticalScale(90),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    marginBottom: verticalScale(30),
    position: 'relative',
  },

  adBannerProduct: {
    width: '100%',
    height: '100%',
  },
  adBannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(16),
  },
  adSliderContainer: {
    width: '100%',
    height: verticalScale(140),
    marginBottom: verticalScale(10),
    position: 'relative',
  },
  adSlide: {
    width: screenWidth,
    height: '100%',
  },
  adSlideImage: {
    width: '100%',
    height: '100%',
  },
  adIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: verticalScale(20),
    alignSelf: 'center',
  },
  adIndicator: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: moderateScale(4),
  },
  adIndicatorActive: {
    backgroundColor: 'white',
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(15),
    marginHorizontal: moderateScale(4),
  },
});


export default Categories;