import { useAuth } from '@/hooks/useAuth';
import { fetchHeroes, type HeroItem } from '@/services/heroes';
import { fetchUsers, UserItem } from '@/services/user';
import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Dimensions, Image, ImageBackground, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useWishlistStore } from '../../app/Wishlist';
import { fetchAds, type AdsItem } from '../../services/ads';
import { fetchBrands, type BrandItem } from '../../services/brands';
import { fetchCategories, type CategoryItem } from '../../services/categories';
import { fetchProducts } from '../../services/products';
import { useFocusEffect } from '@react-navigation/native';
import { Api_url, img_url } from '@/url/url';
import { DiscountPopupItem, fetchDiscountPopup } from '@/services/popup';
import { Animated, Easing } from 'react-native';


type SalePopupProps = {
  visible: boolean;
  onClose: () => void;
  data?: DiscountPopupItem | null;
  onNavigate?: (data: DiscountPopupItem) => void;
};
const screenWidth = Dimensions.get('window').width;

const SalePopup = ({ visible, onClose, data, onNavigate }: SalePopupProps) => {
  const [showGiftAnimation, setShowGiftAnimation] = useState(true);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowGiftAnimation(true);

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
      scaleAnim.setValue(0);
    }
  }, [visible]);

  // ✅ SAFE IMAGE HANDLING
  const imageUri = data?.banner
    ? data.banner.startsWith("http")
      ? data.banner
      : `${img_url}${data.banner}`
    : null;

  return (
    <Modal visible={visible && !!data} transparent animationType="fade">
      <View style={popupStyles.overlay}>
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
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (data) {
                console.log("Popup clicked:", data);
                onNavigate?.(data);
              }
            }}
            style={{ width: "100%" }}
          >
            <Image
              source={
                data?.banner
                  ? { uri: `${Api_url}${data.banner}` }
                  : require('../../assets/images/Lubricants.png')
              }
              style={popupStyles.productImg}
              resizeMode="contain"
            />
          </TouchableOpacity>
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
  const { phone, token } = useAuth();
  const [popupData, setPopupData] = useState<DiscountPopupItem | null>(null);
  const loadWishlist = useWishlistStore(state => state.loadWishlist);
  const [user, setUser] = useState<UserItem | string | null | undefined>(undefined);
  const { logout } = useAuth();
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const loadPopup = async () => {
      try {
        const data = await fetchDiscountPopup();
        console.log("API popup response:", data);

        // ✅ Handle BOTH array and object response
        const popupItem = Array.isArray(data) ? data[0] : data;

        if (popupItem && popupItem.is_active) {
          setPopupData(popupItem);

          // ✅ SHOW popup AFTER data is ready
          setTimeout(() => {
            setShowPopup(true);
          }, 1500);
        }
      } catch (error) {
        console.log("Popup error:", error);
      }
    };

    loadPopup();
  }, []);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        setLoading(true); // 👈 start loader

        try {
          const [products, categories, brands, adsData] = await Promise.all([
            fetchProducts(),
            fetchCategories(),
            fetchBrands(),
            fetchAds(),
          ]);
          console.log("API URL", Api_url);

          if (!isActive) return;

          setApiProducts(products);
          setApiCategories(categories);
          setApiBrands(brands);
          setAds(adsData);
        } catch (e) {
          console.log('refresh error:', e);
        } finally {
          if (isActive) setLoading(false); // 👈 stop loader
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchUsers();
        const matchedUser = users.find((u) => u.number === phone);

        if (matchedUser) {
          setUser(matchedUser);

        } else {
          console.log('No user found with phone:', phone);
          // If no matching user found, log them out
          if (phone) {
            console.log('Logging out user due to phone number mismatch');
            logout();
            // Optionally redirect to login screen
            router.replace('/(tabs)/Home');
          }
          setUser(token);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // On error, we'll keep the user logged in but log the error
        setUser(token);
      }
    };

    if (phone) {
      loadUsers();
    } else {
      // If no phone number is available, log out the user
      if (token) {
        console.log('No phone number available, logging out user');
        logout();
        router.replace('/(tabs)/Home');
      }
      setUser(token);
    }
  }, [phone, token, logout]);

  useEffect(() => {
    const initWishlistAndUser = async () => {
      try {
        if (phone) {
          // 2. Use the setPhone from useWishlistStore
          const { setPhone } = useWishlistStore.getState();
          setPhone(phone);
          await loadWishlist();
        } else {
          setUser(token);
        }
      } catch (error) {
        console.error('Error initializing wishlist or user:', error);
      }
    };

    initWishlistAndUser();
  }, [phone, token, loadWishlist]);
  useFocusEffect(
    useCallback(() => {
      const loadHeroContent = async () => {
        const heroes = await fetchHeroes();
        setHeroContent(heroes);
      };

      loadHeroContent();
    }, [])
  );

  const isInWishlist = (productId: string, variantLabel?: string) => {
    return wishlistItems.some(item => {
      if (item.id !== productId) return false;
      if (!variantLabel) return true;
      return item.variant?.label === variantLabel;
    });
  };
  useEffect(() => {
    if (true) {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);


  useEffect(() => {
    if (!ads.length) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const nextIndex = prev + 1 >= ads.length ? 0 : prev + 1;

        scrollViewRef.current?.scrollTo({
          x: nextIndex * screenWidth,
          animated: true,
        });

        return nextIndex;
      });
    }, 6000); // ⏱ 6 seconds

    return () => clearInterval(interval);
  }, [ads]);
  const handlePopupNavigate = (data: DiscountPopupItem) => {
    const matchedCategory = apiCategories.find(
      (c: any) => Number(c.id) === Number(data.category)
    );
    console.log("popup category:", data.category);
    console.log("categories:", apiCategories.map((c: any) => c.id));
    console.log('match', matchedCategory)
    if (matchedCategory) {
      router.push({
        pathname: '/Categories',
        params: {
          category: matchedCategory.label,
        },
      });
      return;
    }

    // 🔁 fallback to brand
    const matchedBrand = apiBrands.find(
      (b: any) => b.id === data.brand
    );

    if (matchedBrand) {
      router.push({
        pathname: '/Brands',
        params: {
          brand: matchedBrand.name,
        },
      });
      return;
    }
    // 3️⃣ PRODUCT FALLBACK (NEW LOGIC) ⭐
    const matchedProduct = apiProducts.find(
      (p: any) => Number(p.id) === Number(data.products)
    );

    console.log("matched product:", matchedProduct);

    if (matchedProduct) {
      router.push({
        pathname: '/Products',
        params: {
          id: matchedProduct.id,
          data: JSON.stringify(matchedProduct),
        },
      });
      return;
    }
  };
  const getProductPoints = (product: any) => {
    const variants = product?.variants;

    if (Array.isArray(variants) && variants.length > 0) {
      return variants.reduce((max: number, v: any) => {
        const p = Number(v?.attributes?.points ?? 0);
        return !isNaN(p) && p > max ? p : max;
      }, 0);
    }

    return Number(product?.points ?? product?.pts ?? 0);
  };
  const getPrice = (product: any) => {
    // 1. If variants exist
    const variants = product?.variants;

    if (Array.isArray(variants) && variants.length > 0) {
      const firstVariant = variants[0];

      if (firstVariant?.attributes) {
        const attrs = Array.isArray(firstVariant.attributes)
          ? firstVariant.attributes
          : [firstVariant.attributes];

        const firstAttr = attrs[0];

        const price =
          firstAttr?.sale_price != null && firstAttr?.sale_price !== ''
            ? firstAttr.sale_price
            : firstAttr?.regular_price ?? firstVariant?.price;

        return Number(price || 0);
      }

      return Number(
        firstVariant?.sale_price ??
        firstVariant?.price ??
        0
      );
    }

    // 2. If no variants → product level
    return Number(
      product?.regular_price ??
      product?.sale_price ??
      0
    );
  };
  // const getDiscountPercent = (product: any) => {
  //   const variants = product?.variants;

  //   let maxDiscount = 0;

  //   // CASE 1: Variants exist
  //   if (Array.isArray(variants) && variants.length > 0) {
  //     variants.forEach((v: any) => {
  //       const attrs = Array.isArray(v?.attributes)
  //         ? v.attributes
  //         : [v?.attributes];

  //       attrs.forEach((attr: any) => {
  //         const regular = Number(
  //           attr?.regular_price ?? v?.price ?? product?.regular_price ?? 0
  //         );

  //         const saleRaw =
  //           attr?.sale_price ?? v?.sale_price ?? product?.sale_price;

  //         const sale = saleRaw !== "" && saleRaw != null ? Number(saleRaw) : 0;

  //         if (regular > 0 && sale > 0 && sale < regular) {
  //           const discount = Math.round(((regular - sale) / regular) * 100);
  //           if (discount > maxDiscount) {
  //             maxDiscount = discount;
  //           }
  //         }
  //       });
  //     });

  //     return maxDiscount;
  //   }

  //   // CASE 2: No variants
  //   const regular = Number(product?.regular_price ?? 0);
  //   const saleRaw = product?.sale_price;
  //   const sale = saleRaw !== "" && saleRaw != null ? Number(saleRaw) : 0;

  //   if (regular > 0 && sale > 0 && sale < regular) {
  //     return Math.round(((regular - sale) / regular) * 100);
  //   }

  //   return 0;
  // };
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: '#000' }}>Loading...</Text>
      </SafeAreaView>
    );
  }
  return (
    <>
      <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
        <SalePopup
          visible={showPopup}
          onClose={() => setShowPopup(false)}
          data={popupData}
          onNavigate={handlePopupNavigate}
        />
        <ImageBackground
          source={require('../../assets/images/home.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          <ScrollView contentContainerStyle={{ paddingBottom: "20%" }}>
            <View style={styles.headerBg}>
              <View style={styles.headerRow}>
                <View style={{ width: scale(165), paddingLeft: scale(16) }}>
                  {heroContent.length > 0 ? (
                    <>
                      <Text style={styles.hello}
                        ellipsizeMode="tail"
                      > Welcome
                      </Text>
                      <Text
                        style={styles.subtext}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {typeof user === 'object' && user !== null && 'name' in user
                          ? (user as UserItem).name
                          : 'Guest'}
                      </Text>
                    </>
                  ) : (
                    null
                  )}

                  {isAuthenticated ? (
                    <>
                      <View style={styles.rewardBox}>
                        <Text style={styles.rewardLabel}>Reward</Text>
                        <Text style={styles.rewardPoints}>
                          {typeof user === 'object' && user !== null && 'total_points' in user
                            ? (user as UserItem).total_points
                            : '0'
                          }
                        </Text>
                        <Text style={styles.rewardPts}>PTS</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => router.push('/Login')}
                        style={styles.loginButton}
                      >
                        <Text style={styles.loginButtonText}>Login to see Points</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Image
                    source={heroContent.length > 0 ? heroContent[0].image : null}
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
              {apiCategories
                .filter(category => category.is_active)
                .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
                .map((category, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => router.push({ pathname: '/Categories', params: { category: category.label, bgColorType: 'Green' } })}
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
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
                  {ads.map((_, index) => (
                    <View
                      key={index}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        marginHorizontal: 4,
                        backgroundColor: index === currentBannerIndex ? 'white' : 'rgba(255,255,255,0.4)'
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Brands Section */}
            <Text style={{
              color: "white",
              fontSize: moderateScale(32),
              fontFamily: "Sigmar",
              marginLeft: scale(15),
            }}>Our Brands</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.brandSlider}
            >
              {apiBrands
                .filter(brand => brand.is_active)
                .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
                .map((brand, idx) => (
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
              <View style={{ position: 'absolute', top: verticalScale(800), left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                <View style={{ backgroundColor: colors.primaryDark, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{wishlistMessage}</Text>
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
              {apiProducts.filter(p => p.is_active)
                .sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))
                .slice(0, 5)
                .map((product, idx) => {
                  const firstVariant = (product.variants && product.variants.length > 0) ? product.variants[0] : null;
                  const variantLabel = firstVariant?.label || firstVariant?.name;
                  const minPrice = getPrice(product);
                  // const discount = getDiscountPercent(product);
                  return (
                    <TouchableOpacity
                      key={product.id}
                      style={bestSellerStyles.productCard}
                      activeOpacity={0.8}
                      onPress={() => router.push({ pathname: '/Products', params: { id: product.id, data: JSON.stringify(product) } })}
                    >
                      <LinearGradient
                        colors={["#FFD600", "#FF9800"]}
                        style={bestSellerStyles.gradient}
                      >
                        {/* {discount > 0 && (
                          <View style={bestSellerStyles.discountTag}>
                            <Text style={bestSellerStyles.discountText}>
                              {discount}% OFF
                            </Text>
                          </View>
                        )} */}
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
                        <View
                          style={bestSellerStyles.priceTag}>
                          <View style={[bestSellerStyles.priceLeft]}>
                            <Text style={bestSellerStyles.priceLeftText}>Starting from</Text>
                          </View>

                          <View
                            style={[
                              bestSellerStyles.priceRight,
                              {
                                backgroundColor: 'white',
                              },
                            ]}
                          >
                            <Text style={bestSellerStyles.priceRightText}>
                              Rs.{Math.round(minPrice || 0)}
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                      {/* Footer */}
                      <View style={bestSellerStyles.cardFooter}>
                        <View style={{ flex: 1 }}>
                          <Text style={bestSellerStyles.cardTitle} numberOfLines={2}>{product.name}</Text>
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
                            {getProductPoints(product)}{'\n'}PTS
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
    lineHeight: moderateScale(40),
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
    width: "95%",
    height: verticalScale(120),
    borderRadius: moderateScale(10),
    resizeMode: 'contain',
    marginTop: verticalScale(10)
  },
  discountTag: {
    position: 'absolute',
    top: verticalScale(10),
    left: scale(10),
    backgroundColor: '#E53935',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
    zIndex: 3,
  },

  discountText: {
    color: '#fff',
    fontSize: scale(10),
    fontFamily: 'InterBold',
  },
  priceTag: {
    position: 'absolute',
    bottom: verticalScale(0),
    flexDirection: 'row',
    borderBottomEndRadius: moderateScale(18),
    borderBottomStartRadius: moderateScale(18),
    overflow: 'hidden',
    elevation: 4,
  },

  priceLeft: {
    backgroundColor: '#E53935',
    width: scale(97),
    paddingVertical: verticalScale(4),
    justifyContent: 'center',
  },

  priceLeftText: {
    color: '#fff',
    fontSize: scale(10),
    textAlign: 'center',
    fontFamily: 'InterBold',
  },

  priceRight: {
    backgroundColor: '#fff',
    width: scale(97),
    justifyContent: 'center',
  },

  priceRightText: {
    color: '#E53935',
    fontSize: scale(12),
    textAlign: 'center',
    fontFamily: 'InterBold',
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
    height: verticalScale(48),
    width: scale(195)
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: moderateScale(11),
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
    height: "auto"
  },
  headerRow: {
    marginTop: verticalScale(30),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: "hidden",
    justifyContent: "space-between"
  },
  hello: {
    color: colors.primary,
    fontSize: moderateScale(22),
    fontFamily: "RussoOne",

  },
  subtext: {
    color: '#fff',
    fontFamily: "RussoOne",
    fontSize: moderateScale(22),
    marginLeft: scale(8),
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
    marginTop: verticalScale(14),
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
  loginButton: {
    backgroundColor: '#E82A2F',
    width: scale(100),
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(12),
    alignSelf: 'flex-start',
    marginTop: verticalScale(45),
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontFamily: 'PoppinsBold',
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
  familyImg: {
    width: "100%",
    height: verticalScale(205),
    resizeMode: "contain",
  },
  sectionTitle: {
    color: "white",
    fontSize: moderateScale(32),
    fontFamily: "Sigmar",
    marginLeft: scale(15),
    marginTop: verticalScale(25)
  },
  categoriesSlider: {
    gap: scale(8),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(18),
    height: verticalScale(150),
  },
  categoryCard: {
    borderRadius: moderateScale(16),
    width: scale(140),
    height: verticalScale(120),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(4),
    marginTop: verticalScale(5),
    elevation: 4,
  },
  categoryImg: {
    width: "80%",
    height: verticalScale(75),
  },
  categoryLabel: {
    color: 'white',
    fontSize: moderateScale(12),
    fontFamily: "Sigmar",
    lineHeight: moderateScale(12),
    textAlign: 'center',
  },
  adSliderContainer: {
    width: '100%',
    height: verticalScale(140),
    marginVertical: verticalScale(18),
    position: 'relative',
  },
  adSlide: {
    width: screenWidth,
  },
  adSlideImage: {
    width: '100%',
    height: verticalScale(140),
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
    width: "80%",
    height: verticalScale(100),
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


