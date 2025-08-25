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
import { Product } from '../constants/products';
import { fetchProducts } from '../services/products';
import { useWishlistStore } from './Wishlist';


const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - scale(48)) / 2;
// ...imports remain the same

const BestSeller = () => {
  const router = useRouter();
  const { brand } = useLocalSearchParams();
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
 const insets = useSafeAreaInsets();
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
    brand: "Vidafem",
    category: "Devices",
    image: require("../assets/images/Heer.png"),
  },

  {
    brand: "Vidafem",
    category: "Medicine",
    image: require("../assets/images/Vidafem1.png"),
  },
];


  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);

  const [displayList, setDisplayList] = useState<(
    Product & { id: string; name: string; brand: string; price: number; img: any; rating: number; pts: number }
  )[]>([]);

  useEffect(() => {
    (async () => {
      const products = await fetchProducts();
      const list = products.filter(
        (p): p is Product & { id: string; name: string; brand: string; price: number; img: any; rating: number; pts: number } =>
          'brand' in p &&
          'id' in p &&
          'name' in p &&
          'price' in p &&
          'img' in p &&
          'rating' in p &&
          'pts' in p
      );
      setDisplayList(list);
    })();
  }, []);

  const mergedData = useMemo(() => {
    const data: any[] = [];
    let adIndex = 0;

    for (let i = 0; i < displayList.length; i++) {
      const product = displayList[i];
      data.push({ type: "product", data: product });

      if ((i + 1) % 4 === 0 && adsImages.length > 0) {
        const ad = adsImages[adIndex % adsImages.length];
        data.push({ type: "ad", data: ad });
        adIndex++;
      }
    }

    return data;
  }, [displayList, adsImages]);

  return (
    <SafeAreaView style={{ flex: 1,paddingBottom: Math.max(insets.bottom, verticalScale(4))  }}>
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
        </View>

        {/* Product Grid */}
        <View style={styles.gridWrap}>
          {mergedData.map((item, idx) => {
            if (item.type === "product") {
              const p = item.data;
              const prod = p as Exclude<Product, { banner: string }>;
              return (
                <TouchableOpacity
                  key={prod.id}
                  style={{ width: CARD_WIDTH, marginBottom: 32 }}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/Products', params: { id: prod.id, data: JSON.stringify(prod) } })}
                >
                  <LinearGradient
                    colors={prod.brand === 'Vidafem' ? ['#C3FFFA', '#C3FFFA'] : ['#FFD600', '#FF9800']}
                    style={styles.productCard}
                  >
                    <TouchableOpacity
                      style={[
                        styles.heartWrap,
                        prod.brand === 'Vidafem' && { backgroundColor: '#006400' }
                      ]}
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
                      <Ionicons name={wishlistItems.some((w) => w.id === prod.id) ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                    </TouchableOpacity>
                    <Image source={prod.img} style={{ width: '100%', height: 150, marginBottom: 8, borderRadius: 10, resizeMode: 'contain' }} />
                  </LinearGradient>
                  <View style={[
                    styles.cardFooter,
                    prod.brand === 'Josh' && { backgroundColor: '#FBF4E4' },
                    prod.brand === 'OK' && { backgroundColor: colors.secondary },
                    prod.brand === 'Vidafem' && { backgroundColor: '#C3FFFA' }
                  ]}>
                    <View style={styles.footerLeft}>
                      <Text style={[
                        styles.cardTitle,
                        prod.brand === 'Vidafem' && { color: '#006400' }
                      ]} numberOfLines={3}>{prod.name}</Text>
                      <Text style={styles.cardRating}>Ratings <Text style={{ color: '#FFD600' }}>{'★'.repeat(prod.rating)}</Text></Text>
                    </View>
                    <View>
                      <ImageBackground
                        source={prod.brand === 'Vidafem'
                          ? require('../assets/images/VectorGreen.png')
                          : require('../assets/images/VectorRed.png')}
                        style={[styles.ptsBadge, { justifyContent: 'center', alignItems: 'center' }]}
                        imageStyle={{ borderRadius: moderateScale(6) }}
                      >
                        <Text style={[styles.ptsText, { color: 'white' }]}>
                          {prod.pts}{'\n'}PTS
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