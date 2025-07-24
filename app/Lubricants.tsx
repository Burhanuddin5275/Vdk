import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWishlistStore } from './Wishlist';

const { width } = Dimensions.get('window');

const products = [
  {
    name: 'Josh Lube - Strawberry',
    brand: 'Josh',
    pts: 29,
    image: require('../assets/images/strawberryGel.png'),
    rating: 4.5,
    price: 350,
  },
  {
    name: 'Josh Lube - Fantasy',
    brand: 'Josh',
    pts: 25,
    image: require('../assets/images/fantasyGel.png'),
    rating: 4.5,
    price: 420,
  },
];

export default function Lubricants() {
   const [loaded] = useFonts({
      PoppinsSemi: require("../assets/fonts/Poppins-SemiBold.ttf"),
      PoppinsBold: require("../assets/fonts/Poppins-Bold.ttf"),
      InterRegular: require("../assets/fonts/Inter-Regular.ttf"),
      InterBold: require("../assets/fonts/Inter-Bold.ttf"),
      Sigmar: require("../assets/fonts/Sigmar-Regular.ttf"),
    })
    useEffect(() => {
      if (loaded) {
        return;
      }
    }, [loaded])
  const router = useRouter();
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    (async () => {
      const phone = await AsyncStorage.getItem('phone');
      setIsLoggedIn(!!phone);
    })();
  }, []);
  return (
    <ImageBackground
      source={require('../assets/images/ss.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lubricant</Text>
        </View>
        {/* Banner - only lubricantSlider image */}
        <View style={styles.bannerOnly}>
          <Image source={require('../assets/images/lubricantSlider.png')} style={styles.Lubricant} resizeMode="contain" />
        </View>
        {/* Product Cards */}
        <View style={styles.productsRow}>
          {products.map((p, i) => (
            <TouchableOpacity
              key={p.name}
              style={{ alignItems: 'center', width: (width - 18 * 2 - 12) / 2 }}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/Products', params: { data: JSON.stringify(p) } })}
            >
              <LinearGradient colors={['#FFD600', '#FF9800']} style={styles.productCard}>
                <TouchableOpacity
                  style={styles.heartWrap}
                  onPress={async () => {
                    if (!isLoggedIn) {
                      setWishlistMessage('Please log in to use wishlist.');
                      setTimeout(() => setWishlistMessage(null), 1000);
                      setTimeout(() => router.replace('/Login'), 1000);
                      return;
                    }
                    if (useWishlistStore.getState().items.some((w: { id: string }) => w.id === p.name)) {
                      await useWishlistStore.getState().removeFromWishlist(p.name);
                      setWishlistMessage('Removed from wishlist');
                    } else {
                      await useWishlistStore.getState().addToWishlist({
                        id: p.name,
                        name: p.name,
                        price: p.price,
                        image: p.image,
                        pack: '',
                      });
                      setWishlistMessage('Added to wishlist');
                    }
                    setTimeout(() => setWishlistMessage(null), 2000);
                  }}
                >
                  <Ionicons name={useWishlistStore.getState().items.some((w: { id: string }) => w.id === p.name) ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                </TouchableOpacity>
                <Image source={p.image} style={styles.productImg} resizeMode="contain" />
              </LinearGradient>
              <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                      <Text style={styles.cardTitle}>{p.name}</Text>
                    <Text style={styles.cardRating}>Ratings <Text style={{ color: '#FFD600' }}>{'★'.repeat(p.rating)}</Text></Text>
                  </View>
                  <ImageBackground source={require('../assets/images/pts.png')} style={styles.ptsBadge} resizeMode="contain" >
                 <Text style={styles.ptsText}>{p.pts}{'\n'}PTS</Text>
                 </ImageBackground>
                </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Shop Now Banner */}
      <ImageBackground style={styles.shopBanner} source={require('../assets/images/lubricant.png')} resizeMode="cover">
                  <Text style={styles.shopTextLeft}>Shop</Text>
             <Text style={styles.shopImg}></Text>
          <Text style={styles.shopTextRight}>Now!</Text>
      </ImageBackground>
      {/* Snackbar/Toast */}
      {wishlistMessage && (
        <View style={{ position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
          <View style={{ backgroundColor: '#E53935', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{wishlistMessage}</Text>
          </View>
        </View>
      )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 8,
    paddingHorizontal: 18,
    height: 60,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: 28,
    fontFamily: 'Sigmar',
    marginRight: 44,
    letterSpacing: 1,
  },
  bannerOnly: {
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  Lubricant: {
    width: "100%",
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 18,
    marginTop: 2,
  },
  productCard: {
    borderRadius: 18,
    width: "100%",
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
    backgroundColor: '#E53935',
    borderRadius: 16,
    padding: 4,
  },
  productImg: {
    width: "100%",
    height: 150,
    marginBottom: 8,
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
  },
  footerLeft: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 0,
  },
  cardRating: {
    fontSize: 9,
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
  shopBanner: {
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    position: 'relative',
  },
  shopBannerImg: {
    position: 'absolute',
    left: '50%',
    top: 10,
    width: 60,
    height: 40,
    marginLeft: -30,
    zIndex: 1,
    opacity: 0.7,
  },
  shopTextLeft: {
    color: '#fff',
    fontFamily: 'Sigmar',
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 10,
    zIndex: 2,
  },
  shopTextRight: {
    color: '#fff',
    fontFamily: 'Sigmar',
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 10,
    zIndex: 2,
  },
  shopImg: {
    width: 60,
    height: 80,
    marginHorizontal: 8,
    zIndex: 2,
  },
  productNameBg: {
     borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    marginBottom: 2,
    alignSelf: 'center',
    minWidth: 120,
  },
 
});