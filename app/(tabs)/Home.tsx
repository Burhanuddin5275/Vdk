import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, ImageBackground, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useWishlistStore } from '../../app/Wishlist';
import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { fetchBrands, type BrandItem } from '../../services/brands';
import { fetchCategories, type CategoryItem } from '../../services/categories';
import { fetchProducts } from '../../services/products';
import { fetchAds, type AdsItem } from '../../services/ads';
import { fetchHeroes, type HeroItem } from '@/services/heroes';
type SalePopupProps = {
  visible: boolean;
  onClose: () => void;
};

const screenWidth = Dimensions.get('window').width;

const SalePopup = ({ visible, onClose }: SalePopupProps) => {
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
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [apiCategories, setApiCategories] = useState<CategoryItem[]>([]);
  const [apiBrands, setApiBrands] = useState<BrandItem[]>([]);
  const [ads, setAds] = useState<AdsItem[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [heroContent, setHeroContent] = useState<HeroItem[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const wishlistItems = useWishlistStore((state) => state.items);
  
  // Fetch hero content on component mount
  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        const heroes = await fetchHeroes();
        if (heroes.length > 0) {
          setHeroContent(heroes);
        }
      } catch (error) {
        console.error('Failed to load hero content:', error);
      }
    };

    loadHeroContent();
  }, []);

  const isInWishlist = (productId: string, variantLabel?: string) => {
    return wishlistItems.some(item => {
      if (item.id !== productId) return false;
      if (!variantLabel) return true; 
      return item.variant?.label === variantLabel;
    });
  };
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (true) {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const products = await fetchProducts();
      setApiProducts(products);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const categories = await fetchCategories();
      setApiCategories(categories);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const brands = await fetchBrands();
      setApiBrands(brands);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const adsData = await fetchAds();
      setAds(adsData);
    })();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev === ads.length - 1 ? 0 : prev + 1));
      }, 12000); 

      return () => clearInterval(interval);
    }
  }, [ads]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentBannerIndex * screenWidth,
        animated: true
      });
    }
  }, [currentBannerIndex]);

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


            <View style={styles.headerBg}>
              <View style={styles.headerRow}>
                <View style={{ width: scale(140), paddingLeft: scale(16) }}>
                  {heroContent.length > 0 ? (
                    <>
                      <Text style={styles.hello}>
                        {heroContent[0].title}
                      </Text>
                      <Text 
                        style={styles.subtext}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {heroContent[0].subtext}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.hello}>
                        Hello!{"\n"}Hussain
                      </Text>
                      <Text 
                        style={styles.subtext}
                        numberOfLines={5}
                        ellipsizeMode="tail"
                      >
                        What would you like to buy?
                      </Text>
                    </>
                  )}
                  <View style={styles.rewardBox}>
                    <Text style={styles.rewardLabel}>Reward</Text>
                    <Text style={styles.rewardPoints}>1273{''}
                    </Text><Text style={styles.rewardPts}>PTS</Text>
                  </View>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Image
                    source={heroContent.length > 0 ? heroContent[0].image : require('../../assets/images/family2.png')}
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
              {apiCategories.map((category, idx) => (
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
            <View style={styles.adSliderContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                  setCurrentBannerIndex(index);
                }}
                ref={scrollViewRef}
              >
                {ads.map((ad, index) => (
                  <View key={index} style={styles.adSlide}>
                    <Image
                      source={ad.image}
                      style={styles.adSlideImage}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>

              <View>
                {ads.map((_, index) => (
                  <View
                    key={index}
                    style={[
                  
                      index === currentBannerIndex && styles.adIndicatorActive
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Brands Section */}
            <Text style={styles.sectionTitle}>Our Brands</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandSlider}
            >
              {apiBrands.map((brand, idx) => (
                <TouchableOpacity key={idx} style={styles.brandCard} onPress={() => router.push({ pathname: '/Brands', params: { brand: brand.name, image: brand.image } })}>
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
     {/* Wishlist Snackbar */}
        {wishlistMessage && (
          <View style={{ position: "absolute", top: verticalScale(80), left: 0, right: 0, alignItems: "center", zIndex: 20 }}>
            <View style={{ backgroundColor: "#E53935", paddingHorizontal: scale(24), paddingVertical: verticalScale(12), borderRadius: moderateScale(24) }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: moderateScale(16) }}>{wishlistMessage}</Text>
            </View>
          </View>
        )} 
            {/* Best Seller Product Slider */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10, marginBottom: 24, height: verticalScale(260) }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {apiProducts.filter(p => 'rating' in p)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 4)
                .map((product, idx) => {
                  const firstVariant = (product.variants && product.variants.length > 0) ? product.variants[0] : null;
                  const variantLabel = firstVariant?.label || firstVariant?.name;

                  return (
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
                        <TouchableOpacity
                          style={bestSellerStyles.wishlistBtn}
                          onPress={async () => {
                            if (!isAuthenticated) {
                              setWishlistMessage("Please log in to use wishlist.");
                              setTimeout(() => setWishlistMessage(null), 1000);
                              const currentRoute = `/?category=${product.category || ''}`;
                              setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
                              return;
                            }

                            if (isInWishlist(product.id, variantLabel)) {
                              await removeFromWishlist(product.id, variantLabel);
                              setWishlistMessage('Removed from wishlist');
                            } else {
                              const processVariants = (): any[] => {
                                const rawVariants = product.variants || [];
                                if (!Array.isArray(rawVariants)) return [];

                                return rawVariants.flatMap((v: any) => {
                                  if (v?.attributes) {
                                    const attributes = Array.isArray(v.attributes) ? v.attributes : [v.attributes];
                                    return attributes.flatMap((attr: any) => {
                                      const options = attr?.options || {};
                                      const size = options.Size || options.size || Object.values(options)[0];
                                      if (!size) return [];

                                      return {
                                        label: String(size),
                                        price: Number(attr.regular_price || attr.price || v.price || 0),
                                        ...(attr.sale_price ? { sale_price: Number(attr.sale_price) } : {})
                                      };
                                    });
                                  }
                                  return {
                                    label: v.label || v.name || '',
                                    price: Number(v.price || 0),
                                    ...(v.sale_price ? { sale_price: Number(v.sale_price) } : {})
                                  };
                                });
                              };

                              const variants = processVariants();
                              const firstVariant = variants[0];

                              await addToWishlist({
                                id: product.id,
                                name: product.name,
                                regular_price: firstVariant?.price ?? product.regular_price,
                                sale_price: firstVariant?.sale_price ?? product.sale_price,
                                image: product.img,
                                pack: firstVariant?.label || '',
                                category: product.category,
                                variant: firstVariant ? {
                                  label: firstVariant.label,
                                  price: firstVariant.price,
                                  sale_price: firstVariant.sale_price
                                } : undefined
                              });
                              setWishlistMessage('Added to wishlist');
                            }
                            setTimeout(() => setWishlistMessage(null), 2000);
                          }}
                        >
                          <Ionicons
                            name={isInWishlist(product.id, variantLabel) ? "heart" : "heart-outline"}
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
                  );
                })}
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
    width: "100%",
    height: verticalScale(186),
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
    width: "100%",
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
    height:"auto"
  },
  headerRow: {
    marginTop: verticalScale(30),
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
    width: "100%",
    height: verticalScale(250),
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
    width: "100%",
    height: verticalScale(160),
  },
  categoryLabel: {
    color: 'white',
    fontSize: moderateScale(22),
    fontFamily: "Sigmar",
    lineHeight: moderateScale(36),
  },
  adSliderContainer: {
    width: '100%',
    height: verticalScale(140),
    marginVertical: verticalScale(18),
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
  adIndicatorActive: {
    backgroundColor: 'white',
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
    width: "100%",
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