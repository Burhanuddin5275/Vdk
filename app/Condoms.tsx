import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useWishlistStore } from './Wishlist';

const TABS = ['All', 'Josh', 'OK'];

type Product =
  | {
    id: string;
    name: string;
    brand: string;
    img: any;
    img1: any;
    img2?: any;
    img3?: any;
    img4?: any;
    img5?: any;
    pts: number;
    rating: number;
    bg: string;
    price: number;
  }
  | { banner: string };

const PRODUCTS: Product[] = [
  { id: '1', name: 'Josh Fair', brand: 'Josh', img: require('../assets/images/joshFair.png'), img1: require('../assets/images/joshSalajeet.png'), img2: require('../assets/images/joshSalajeet.png'), pts: 29, rating: 5, bg: '#FFD600', price: 350 },
  { id: '2', name: 'Josh Salajeet', brand: 'Josh', img: require('../assets/images/joshSalajeet.png'), img1: require('../assets/images/joshFair.png'), img2: require('../assets/images/joshDelay1.png'), pts: 25, rating: 5, bg: '#FFD600', price: 420 },
  { id: '3', name: 'Josh Delay', brand: 'Josh', img: require('../assets/images/joshDelay1.png'), img1: require('../assets/images/joshDelay1.png'), img2: require('../assets/images/joshSalajeet.png'), pts: 29, rating: 5, bg: '#FFD600', price: 290 },
  { id: '4', name: 'Josh Chaunsa', brand: 'Josh', img: require('../assets/images/joshChaunsa.png'), img1: require('../assets/images/joshChaunsa.png'), img2: require('../assets/images/joshChaunsa.png'), pts: 25, rating: 5, bg: '#FFD600', price: 510 },
  { id: '5', name: 'Josh Strawberry', brand: 'Josh', img: require('../assets/images/joshStrawberry.png'), img1: require('../assets/images/joshStrawberry.png'), img2: require('../assets/images/joshStrawberry.png'), pts: 29, rating: 5, bg: '#FFD600', price: 600 },
  { id: '6', name: 'Lahori Tikka', brand: 'Josh', img: require('../assets/images/joshTikka.png'), img1: require('../assets/images/joshTikkaProduct.png'), img2: require('../assets/images/joshTikka3Product.png'), pts: 25, rating: 5, bg: '#FFD600', price: 800 },
  { id: '7', name: 'Ok Silk', brand: 'OK', img: require('../assets/images/okSilk.png'), img1: require('../assets/images/okSilk.png'), img2: require('../assets/images/okSilk.png'), pts: 29, rating: 5, bg: '#ad29a6ff', price: 900 },
  { id: '8', name: 'Ok Grape', brand: 'OK', img: require('../assets/images/okGrape.png'), img1: require('../assets/images/okGrape.png'), img2: require('../assets/images/okGrape.png'), pts: 25, rating: 5, bg: '#2B1B17', price: 750 },
  { id: '9', name: 'Ok Strawberry', brand: 'OK', img: require('../assets/images/okStrawberry.png'), img1: require('../assets/images/okStrawberry.png'), img2: require('../assets/images/okStrawberry.png'), pts: 29, rating: 5, bg: '#2B1B17', price: 670 },
  { id: '10', name: 'Ok Dotted', brand: 'OK', img: require('../assets/images/okDotted.png'), img1: require('../assets/images/okDotted.png'), img2: require('../assets/images/okDotted.png'), pts: 25, rating: 5, bg: '#2B1B17', price: 220 },
  { id: '11', name: 'Ok Delay', brand: 'OK', img: require('../assets/images/okDelay.png'), img1: require('../assets/images/okDelay.png'), img2: require('../assets/images/okDelay.png'), pts: 29, rating: 5, bg: '#2B1B17', price: 990 },
];

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - 48) / 2;

const Condoms = () => {
  const router = useRouter();
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
  const [activeTab, setActiveTab] = useState(0);
  const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const phone = await AsyncStorage.getItem('phone');
      setIsLoggedIn(!!phone);
    })();
  }, []);

  // Only declare wishlistItems once, with explicit types
  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);

  let filtered = PRODUCTS;
  if (activeTab === 1) filtered = PRODUCTS.filter(p => 'brand' in p && p.brand === 'Josh');
  if (activeTab === 2) filtered = PRODUCTS.filter(p => 'brand' in p && p.brand === 'OK');

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
  });

  // Insert banner ad after 6th product
  let displayList = [...filtered];
  if (activeTab === 1) {
    // Josh tab: insert lahoriTikka after 4th product
    if (displayList.length > 4) {
      displayList.splice(4, 0, { banner: 'lahoriTikka', });
    }
  } else if (activeTab === 2) {
    // OK tab: insert okBanner after 4th product
    if (displayList.length > 4) {
      displayList.splice(4, 0, { banner: 'okBanner' });
    }
  } else if (activeTab === 0) {
    // All tab: alternate banners after every 4 products
    let insertIdx = 4;
    let bannerToggle = true;
    while (insertIdx < displayList.length) {
      displayList.splice(insertIdx, 0, { banner: bannerToggle ? 'lahoriTikka' : 'okBanner' });
      insertIdx += 5; // 4 products + 1 banner
      bannerToggle = !bannerToggle;
    }
  }

  return (
    <ImageBackground source={require('../assets/images/ss.png')} style={styles.container} resizeMode="cover">
         <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: "100%" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Condom</Text>
      </View>
   
        {/* Banner */}
        {activeTab === 0 && (
          <Image source={require('../assets/images/Anam.png')} style={styles.banner} resizeMode="contain" />
        )}
        {activeTab === 1 && (
          <Image source={require('../assets/images/Pyasa.png')} style={[styles.banner, { width: "100%", height: "20%" }]} resizeMode="contain" />
        )}
        {activeTab === 2 && (
          <Image source={require('../assets/images/okWanna.png')} style={[styles.banner, { width: "100%", height: "20%" }]} resizeMode="contain" />
        )}
        {/* Tabs */}
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
        {/* Product Grid */}
        <View style={styles.gridWrap}>
          {displayList.map((item, idx) =>
            'banner' in item ? (
              item.banner === 'lahoriTikka' ? (
                <Image
                  key={"banner-lahoriTikka-" + idx}
                  source={require('../assets/images/lahoriTikka.png')}
                  style={[styles.banner2, { width: '100%' }]}
                  resizeMode="contain"
                />
              ) : item.banner === 'okBanner' ? (
                <Image
                  key={"banner-okBanner-" + idx}
                  source={require('../assets/images/okBanner.png')}
                  style={[styles.banner2, { width: '100%' }]}
                  resizeMode="contain"
                />
              ) : null
            ) : (
              <TouchableOpacity
                key={item.id}
                style={{ width: CARD_WIDTH, marginBottom: 32 }}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/Products', params: { id: item.id, data: JSON.stringify(item) } })}
              >
                <LinearGradient colors={['#FFD600', '#FF9800']} style={styles.productCard}>
                  {/* Check if the product is already in the wishlist */}
                  <TouchableOpacity
                    style={styles.heartWrap}
                    onPress={async () => {
                      if (!isLoggedIn) {
                        setWishlistMessage('Please log in to use wishlist.');
                        setTimeout(() => setWishlistMessage(null), 1000);
                        setTimeout(() => router.replace('/Login'), 1000);
                        return;
                      }
                      if (wishlistItems.some((w: { id: string }) => w.id === item.id)) {
                        await useWishlistStore.getState().removeFromWishlist(item.id);
                        setWishlistMessage('Removed from wishlist');
                      } else {
                        await useWishlistStore.getState().addToWishlist({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.img,
                          pack: '',
                        });
                        setWishlistMessage('Added to wishlist');
                      }
                      setTimeout(() => setWishlistMessage(null), 2000);
                    }}
                  >
                    <Ionicons name={wishlistItems.some((w: { id: string }) => w.id === item.id) ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                  </TouchableOpacity>
                  <Image source={item.img} style={{ width: '100%', height: 150, marginBottom: 8, borderRadius: 10, resizeMode: 'contain' }} />
                </LinearGradient>
                <View style={[
                  styles.cardFooter,
                  item.brand === 'Josh' && { backgroundColor: '#FBF4E4' },
                  item.brand === 'OK' && { backgroundColor: colors.secondary }
                ]}>
                  <View style={styles.footerLeft}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardRating}>Ratings <Text style={{ color: '#FFD600' }}>{'★'.repeat(item.rating)}</Text></Text>
                  </View>
                 <ImageBackground source={require('../assets/images/pts.png')} style={styles.ptsBadge} resizeMode="contain" >
                 <Text style={styles.ptsText}>{item.pts}{'\n'}PTS</Text>
                 </ImageBackground>
                </View>
              </TouchableOpacity>
            )
          )}
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

export default Condoms;