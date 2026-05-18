import { selectIsAuthenticated } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { fetchAds, type AdsItem } from '../services/ads';
import { fetchProducts, Product } from '../services/products';
import { useWishlistStore } from './Wishlist';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - scale(48)) / 2;

const BestSeller = () => {
  const router = useRouter();
  const { brand } = useLocalSearchParams();
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const insets = useSafeAreaInsets();
  const [ads, setAds] = useState<AdsItem[]>([]);


  useEffect(() => {
    (async () => {
      const adsData = await fetchAds();
      setAds(adsData);
    })();
  }, []);

  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);

  const [displayList, setDisplayList] = useState<Product[]>([]);

useEffect(() => {
  (async () => {
    const products = await fetchProducts();

    const list = products
      .filter((p: any) => p.is_active === true)
      .sort((a: any, b: any) => (b.total_sold || 0) - (a.total_sold || 0))
      .slice(0, 20); // ✅ top 20 only

    setDisplayList(list);
  })();
}, []);
  const mergedData = useMemo(() => {
    const data: any[] = [];
    let adIndex = 0;

    for (let i = 0; i < displayList.length; i++) {
      const product = displayList[i];
      data.push({ type: "product", data: product });

      if ((i + 1) % 4 === 0 && ads.length > 0) {
        const ad = ads[adIndex % ads.length];
        data.push({ type: "ad", data: ad });
        adIndex++;
      }
    }

    return data;
  }, [displayList, ads]);


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

//   // ✅ CASE 1: Variants exist
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

//         const sale =
//           saleRaw !== "" && saleRaw != null ? Number(saleRaw) : 0;

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

//   // ✅ CASE 2: No variants
//   const regular = Number(product?.regular_price ?? 0);
//   const saleRaw = product?.sale_price;

//   const sale =
//     saleRaw !== "" && saleRaw != null ? Number(saleRaw) : 0;

//   if (regular > 0 && sale > 0 && sale < regular) {
//     return Math.round(((regular - sale) / regular) * 100);
//   }

//   return 0;
// };
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground
        source={brand === 'Vidafem' ? require('../assets/images/seller.png') : require('../assets/images/ss1.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: "20%" }}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={router.back}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Best Seller</Text>
            <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/(tabs)/Cart')}>
              <Ionicons name="cart-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Product Grid */}
          <View style={styles.gridWrap}>
            {mergedData.map((item, idx) => {
              if (item.type === "product") {
                const p = item.data;
                const prod = p as Exclude<Product, { banner: string }>;
                const minPrice = getPrice(prod);
                // const discount = getDiscountPercent(prod);
                return (
                  <TouchableOpacity
                    key={prod.id}
                    style={{ width: CARD_WIDTH, marginBottom: 32 }}
                    activeOpacity={0.8}
                    onPress={() => router.push({ pathname: '/Products', params: { id: prod.id, data: JSON.stringify(prod) } })}
                  >
                    <LinearGradient
                      colors={['#FFD600', '#FF9800']}
                      style={styles.productCard}
                    >
                      {/* {discount > 0 && (
                        <View style={styles.discountTag}>
                          <Text style={styles.discountText}>
                            {discount}% OFF
                          </Text>
                        </View>
                      )} */}
                      <TouchableOpacity
                        style={styles.heartWrap}
                        onPress={async () => {
                          if (!isAuthenticated) {
                            setWishlistMessage('Please log in to use wishlist.');
                            setTimeout(() => setWishlistMessage(null), 1000);
                            const currentRoute = `/BestSeller${brand ? `?brand=${brand}` : ''}`;
                            setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
                            return;
                          }
                          if (wishlistItems.some((w) => w.id === prod.id)) {
                            await useWishlistStore.getState().removeFromWishlist(prod.id);
                            setWishlistMessage('Removed from wishlist');
                          } else {
                            const processVariants = (): any[] => {
                              const rawVariants = prod.variants || [];
                              if (!Array.isArray(rawVariants)) return [];

                              return rawVariants.flatMap((v: any) => {
                                // Handle variants with attributes/options
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
                                // Handle simple variants
                                return {
                                  label: v.label || v.name || '',
                                  price: Number(v.price || 0),
                                  ...(v.sale_price ? { sale_price: Number(v.sale_price) } : {})
                                };
                              });
                            };

                            const variants = processVariants();
                            const firstVariant = variants[0];

                            await useWishlistStore.getState().addToWishlist({
                              id: prod.id,
                              name: prod.name,
                              regular_price: firstVariant?.price ?? prod.regular_price,
                              sale_price: firstVariant?.sale_price ?? prod.sale_price,
                              image: prod.img,
                              pack: firstVariant?.label || '',
                              category: prod.Category,
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
                        <Ionicons name={wishlistItems.some((w) => w.id === prod.id) ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                      </TouchableOpacity>
                      <Image source={prod.img} style={{ width: '100%', height: 150, marginBottom: 8, borderRadius: 10, resizeMode: 'contain' }} />
                      <View
                        style={styles.priceTag}>
                        <View style={[styles.priceLeft]}>
                          <Text style={styles.priceLeftText}>Starting from</Text>
                        </View>

                        <View
                          style={[
                            styles.priceRight,
                            {
                              backgroundColor: 'white',
                            },
                          ]}
                        >
                          <Text style={styles.priceRightText}>
                            Rs.{Math.round(minPrice || 0)}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                    <View style={styles.cardFooter}>
                      <View style={styles.footerLeft}>
                        <Text style={styles.cardTitle} numberOfLines={2}>{prod.name}</Text>
                        <Text style={styles.cardRating}>Ratings <Text style={{ color: '#FFD600' }}>{'★'.repeat(prod.rating)}</Text></Text>
                      </View>
                      <View>
                        <ImageBackground
                          source={require('../assets/images/VectorRed.png')}
                          style={[styles.ptsBadge, { justifyContent: 'center', alignItems: 'center' }]}
                          imageStyle={{ borderRadius: moderateScale(6) }}
                        >
                          <Text style={[styles.ptsText, { color: 'white' }]}>
                            {getProductPoints(prod)}{'\n'}PTS
                          </Text>
                        </ImageBackground>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item.type === "ad") {
                const ad = item.data;
                return (
                  <View key={`ad-${idx}`} style={styles.adBanner}>
                    <Image source={ad.image} style={styles.adBannerImage} resizeMode="contain" />
                  </View>
                );
              }

              return null;
            })}
          </View>
        </ScrollView>


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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(80),
    position: 'relative',
    paddingHorizontal: scale(18),
    marginTop: verticalScale(20),
  },

  cartBtn: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  backBtn: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    zIndex: 1,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: moderateScale(25),
    color: '#fff',
    fontFamily: 'Sigmar',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: scale(12),
    marginTop: verticalScale(8),
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
    backgroundColor: '#E53935',
    borderRadius: moderateScale(16),
    padding: scale(4),
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
    width: scale(75),
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
    width: scale(76),
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
    backgroundColor: colors.secondary,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(3),
    paddingVertical: verticalScale(2),
    marginTop: verticalScale(-8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(1) },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(2),
    height: verticalScale(42),
    width: scale(155),
  },
  footerLeft: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: moderateScale(10),
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
  adBanner: {
    width: '100%',
    height: screenWidth * 0.3,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(26),
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