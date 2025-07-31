import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useWishlistStore } from '../../app/Wishlist';
import { PRODUCTS } from '../../constants/products';

const brands = [
  { name: 'Josh', image: require('../../assets/images/josh.png') },
  { name: 'OK', image: require('../../assets/images/ok.png') },
  { name: 'Vida', image: require('../../assets/images/vida.png') },
  // Add more brands as needed
];


type SalePopupProps = {
  visible: boolean;
  onClose: () => void;
};
function SalePopup({ visible, onClose }: SalePopupProps) {
  const { width } = Dimensions.get('window');
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={popupStyles.overlay}>
        <View style={popupStyles.popupBox}>
          {/* Close button */}
          <TouchableOpacity style={popupStyles.closeBtn} onPress={onClose}>
            <Text style={popupStyles.closeText}>×</Text>
          </TouchableOpacity>
          {/* Sale text */}
          <Text style={popupStyles.saleText}>Sale</Text>
          {/* Product image */}
          <Image
            source={require('../../assets/images/Lubricants.png')}
            style={popupStyles.productImg}
            resizeMode="contain"
          />
          {/* Discount text */}
          <Text style={popupStyles.discountText}>Get upto 50% Off</Text>
        </View>
      </View>
    </Modal>
  );
}

export default function HomeScreen() {
  const [showPopup, setShowPopup] = useState(false);
  const wishlistItems = useWishlistStore((state: { items: { id: string }[] }) => state.items);
  const isInWishlist = (id: string) => wishlistItems.some((w: { id: string }) => w.id === id);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  useEffect(() => {
    if (true) { // Always true as fonts are loaded globally
      // Show popup after 7 seconds
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const categories = [
    {
      label: 'Condoms',
      image: require('../../assets/images/condom.png'),
    },
    {
      label: 'Lubricant',
      image: require('../../assets/images/Lubricants.png'),
    },
    {
      label: 'Devices',
      image: require('../../assets/images/Devices.png'),
    },
    {
      label: 'Medicine',
      image: require('../../assets/images/medicine.png'),
    },
  ];

  return (
    <>
      <SalePopup visible={showPopup} onClose={() => setShowPopup(false)} />
           <ImageBackground
          source={require('../../assets/images/home.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
      <ScrollView contentContainerStyle={{ paddingBottom:"10%" }}>
     
          {/* Header Section */}
          <View style={styles.headerBg}>
            <View style={styles.headerRow}>
              <View style={{width:"40%"}}>
                <Text style={styles.hello}>Hello!{"\n"}Hussain</Text>
                <Text style={styles.subtext}>What would you like to buy?</Text>
                <View style={styles.rewardBox}>
                  <Text style={styles.rewardLabel}>Reward</Text>
                  <Text style={styles.rewardPoints}>1273{''}
                  </Text><Text style={styles.rewardPts}>PTS</Text>
                </View>
              </View>
            <View style={{flex:1}}>
                <Image
                source={require('../../assets/images/family2.png')}
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
            {categories.map((category, idx) => (
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
          <View style={styles.bannerCard}>
            <Image
              source={require('../../assets/images/wanna.png')}
              style={styles.bannerCard}
              resizeMode="cover"
            />
          </View>

          {/* Brands Section */}
          <Text style={styles.sectionTitle}>Our Brands</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandSlider}
          >
            {brands.map((brand, idx) => (
              <TouchableOpacity key={idx} style={styles.brandCard} onPress={() => router.push({ pathname: '/Brands', params: { brand: brand.name } })}>
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
            <Text style={styles.bestSellerTitle}>Best Seller</Text>
            <Text style={styles.seeAll} onPress={()=>{router.push('/BestSeller')}}>See All</Text>
          </View>
          <Text style={styles.bestSellerSubtext}>Find the top most popular items in DKT best sellers.</Text>

          {/* Best Seller Product Slider */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 10, marginBottom: 24, height:verticalScale(260) }}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {PRODUCTS.filter(p => 'rating' in p)
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 4)
              .map((product, idx) => (
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
                    {/* Wishlist Button */}
                    <TouchableOpacity
                      style={bestSellerStyles.wishlistBtn}
                      onPress={async () => {
                        if (isInWishlist(product.id)) {
                          await removeFromWishlist(product.id);
                        } else {
                          await addToWishlist({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.img,
                          });
                        }
                      }}
                    >
                      <Ionicons
                        name={isInWishlist(product.id) ? "heart" : "heart-outline"}
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
                      <Text>
                        Ratings <Text style={bestSellerStyles.rating}>{"★".repeat(Math.round(product.rating || 0))}</Text>
                      </Text>
                    </View>
                    <View style={bestSellerStyles.ptsBadge}>
                      <Text style={bestSellerStyles.ptsText}>
                        {product.pts}
                        {'\n'}PTS
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
       
      </ScrollView>
       </ImageBackground>
    </>
  );
}

const popupStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupBox: {
    width: scale(320),
    backgroundColor: '#FFD6DE',
    borderRadius: moderateScale(28),
    alignItems: 'center',
    paddingVertical: verticalScale(28),
    paddingHorizontal: scale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.18,
    shadowRadius: moderateScale(16),
    elevation: 8,
    zIndex: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: verticalScale(12),
    right: scale(12),
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(1) },
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(2),
    elevation: 2,
    zIndex: 3,
  },
  closeText: {
    fontSize: moderateScale(22),
    color: '#222',
    fontWeight: 'bold',
    marginTop: verticalScale(-2),
  },
  saleText: {
    fontSize: moderateScale(44),
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(8),
    fontFamily: 'Sigmar',
  },
  productImg: {
    width: moderateScale(120),
    height: moderateScale(120),
    marginVertical: verticalScale(8),
    alignSelf: 'center',
  },
  discountText: {
    fontSize: moderateScale(24),
    color: '#E53935',
    marginTop: verticalScale(12),
    fontWeight: '500',
    fontFamily: 'PoppinsSemi',
  },
});

const bestSellerStyles = StyleSheet.create({
  productCard: {
    width: 200,
    marginRight: 16,
  },
  gradient: {
    borderRadius: moderateScale(18),
    width: '100%',
    height:"60%",
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
    width: '80%',
    height: verticalScale(100),
    borderRadius: moderateScale(10),
    resizeMode: 'contain',
    marginTop:verticalScale(10)
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
    height: verticalScale(50),
  },
  cardTitle: {
    fontFamily: 'InterBold',
    fontSize: moderateScale(13),
    color: colors.textSecondary,
    marginBottom: 0,
  },
  ptsBadge: {
    width: moderateScale(50),
    height: moderateScale(40),
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AE2125',
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
    fontSize: 16,
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
    paddingLeft: scale(12),
    paddingVertical: verticalScale(10),
    paddingTop: verticalScale(20),
    height: verticalScale(260)
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: "hidden",
    justifyContent: "space-between"
  },
  hello: {
    color: '#fff',
    fontSize: moderateScale(22),
    fontFamily: "RussoOne",
    marginBottom: verticalScale(4),
    marginTop: verticalScale(40),
  },
  subtext: {
    color: '#fff',
    fontSize: moderateScale(14),
    marginBottom: verticalScale(12),
  },
  rewardBox: {
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
    fontSize: moderateScale(12),
  },
  rewardPoints: {
    color: "red",
    fontFamily: 'PoppinsBold',
    fontSize: moderateScale(18),
    textAlign: 'center',
  },
  rewardPts: {
    fontSize: moderateScale(10),
    color: "red",
    fontFamily: 'PoppinsBold',
  },
  familyImg: {
    width: scale(210),
    resizeMode: "contain"
  },
  sectionTitle: {
    color: "white",
    fontSize: moderateScale(26),
    fontFamily: "Sigmar",
    marginLeft: scale(15),
   marginTop: verticalScale(20)
  },
  categoriesSlider: {
    paddingHorizontal: scale(8),
    gap: scale(8),
    height: verticalScale(250),
    marginTop: verticalScale(2)
  },
  categoryCard: {
    marginTop: verticalScale(5),
    borderRadius: moderateScale(18),
    width: scale(218),
    height: verticalScale(200),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(4),
    elevation: 4
  },
  categoryImg: {
    width: "80%",
    height: "80%",
  },
  categoryLabel: {
    color: 'white',
    fontSize: moderateScale(22),
    fontFamily: "Sigmar"
  },
  bannerCard: {
    borderRadius: moderateScale(26),
    alignItems: 'center',
    width: "96%",
    marginHorizontal: scale(5)
  },
  brandCard: {
    backgroundColor: '#FBF4E4',
    borderRadius: moderateScale(16),
    width: scale(140),
    height: verticalScale(120),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(2),
    marginHorizontal: scale(4),
  },
  brandSlider: {
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(18),
    height: verticalScale(165),
  },
  brandImg: {
    width: "60%",
    height: "60%",
  },
  bestSellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: scale(16),
  },
  bestSellerTitle: {
    color: "white",
    fontSize: moderateScale(26),
    fontFamily: "Sigmar"
  },
  seeAll: {
    color: "white",
    fontSize: moderateScale(14),
    fontWeight: 'bold',
  },
  bestSellerSubtext: {
    color: 'white',
    fontSize: moderateScale(14),
    marginLeft: scale(16),
    marginTop: verticalScale(4),
    marginBottom: verticalScale(16),
  },
});