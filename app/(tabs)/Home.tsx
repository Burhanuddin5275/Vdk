import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const brands = [
  { image: require('../../assets/images/josh.png') },
  { image: require('../../assets/images/ok.png') },
  { image: require('../../assets/images/vida.png') },
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
  const [loaded] = useFonts({
    RussoOne: require("../../assets/fonts/RussoOne-Regular.ttf"),
    PoppinsMedium: require("../../assets/fonts/Poppins-Medium.ttf"),
    PoppinsBold: require("../../assets/fonts/Poppins-Bold.ttf"),
    PoppinsSemi: require("../../assets/fonts/Poppins-SemiBold.ttf"),
    Sigmar: require("../../assets/fonts/Sigmar-Regular.ttf"),
  })

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (loaded) {
      // Show popup after 7 seconds
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  return (
    <>
      <SalePopup visible={showPopup} onClose={() => setShowPopup(false)} />
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
        <ImageBackground
          source={require('../../assets/images/home.jpg')}
          style={styles.background}
          resizeMode="cover"
        >
          {/* Header Section */}
          <View style={styles.headerBg}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hello}>Hello!{"\n"}Hussain</Text>
                <Text style={styles.subtext}>What would you like to buy?</Text>
                <View style={styles.rewardBox}>
                  <Text style={styles.rewardLabel}>Reward</Text>
                  <Text style={styles.rewardPoints}>1273{''}
                  </Text><Text style={styles.rewardPts}>PTS</Text>
                </View>
              </View>
              <Image
                source={require('../../assets/images/family2.png')}
                style={styles.familyImg}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Categories Section */}
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesSlider}
          >
            <TouchableOpacity onPress={() => router.push('/Condoms')}>
              <LinearGradient colors={['#FFFFFF', '#E82A2F']} style={styles.categoryCard}>
                <Image
                  source={require('../../assets/images/condom.png')}
                  style={styles.categoryImg}
                  resizeMode="contain"
                />
                <Text style={styles.categoryLabel}>Condoms</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Lubricants')}>
              <LinearGradient colors={['#FFFFFF', '#E82A2F']} style={styles.categoryCard}>
                <Image
                  source={require('../../assets/images/Lubricants.png')}
                  style={styles.categoryImg}
                  resizeMode="contain"
                />
                <Text style={styles.categoryLabel}>Lubricant</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Condoms')}>
              <LinearGradient colors={['#FFFFFF', '#E82A2F']} style={styles.categoryCard}>
                <Image
                  source={require('../../assets/images/Devices.png')}
                  style={styles.categoryImg}
                  resizeMode="contain"
                />
                <Text style={styles.categoryLabel}>Devices</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/Condoms')}>
              <LinearGradient colors={['#FFFFFF', '#E82A2F']} style={styles.categoryCard}>
                <Image
                  source={require('../../assets/images/medicine.png')}
                  style={styles.categoryImg}
                  resizeMode="contain"
                />
                <Text style={styles.categoryLabel}>Medicine</Text>
              </LinearGradient>
            </TouchableOpacity>
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
              <TouchableOpacity key={idx} style={styles.brandCard}>
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
            <Text style={styles.seeAll}>See All</Text>
          </View>
          <Text style={styles.bestSellerSubtext}>Find the top most popular items in DKT best sellers.</Text>
          {/* Add best seller cards here if needed */}
        </ImageBackground>
      </ScrollView>
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
    width: 320,
    backgroundColor: '#FFD6DE',
    borderRadius: 28,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 3,
  },
  closeText: {
    fontSize: 22,
    color: '#222',
    fontWeight: 'bold',
    marginTop: -2,
  },
  saleText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: 8,
    marginBottom: 8,
    fontFamily: 'Sigmar',
  },
  productImg: {
    width: 120,
    height: 120,
    marginVertical: 8,
    alignSelf: 'center',
  },
  discountText: {
    fontSize: 24,
    color: '#E53935',
    marginTop: 12,
    fontWeight: '500',
    fontFamily: 'PoppinsSemi',
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    padding: 20,
    paddingTop: 40,
    height: '30%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hello: {
    color: '#fff',
    fontSize: 22,
    fontFamily: "RussoOne",
    marginBottom: 4,
    marginTop: 40,
  },
  subtext: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  rewardBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  rewardLabel: {
    color: "red",
    fontFamily: 'RussoOne',
    fontSize: 12,
  },
  rewardPoints: {
    color: "red",
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    textAlign: 'center',
  },
  rewardPts: {
    fontSize: 10,
    color: "red",
    fontFamily: 'PoppinsBold',
  },
  familyImg: {
    width: '72%',
    height: '90%',
    left: 40,
  },
  sectionTitle: {
    color: "white",
    fontSize: 26,
    fontFamily: "Sigmar",
    marginLeft: 16,

  },
  categoriesSlider: {
    paddingHorizontal: 8,
    gap: 8,
    height: 250,
    marginTop: 25
  },
  categoryCard: {
    marginTop: 5,
    borderRadius: 18,
    width: 213,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  categoryImg: {
    width: "80%",
    height: "60%",
    marginBottom: 2,
  },
  categoryLabel: {
    color: 'white',
    fontSize: 22,
    fontFamily: "Sigmar"
  },
  bannerCard: {
    borderRadius: 26,
    alignItems: 'center',
    width: "96%",
    marginHorizontal: 5
  },

  brandCard: {
    backgroundColor: '#FBF4E4',
    borderRadius: 16,
    width: 120,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginTop: 5,
    marginHorizontal: 4,
  },
  brandSlider: {
    paddingHorizontal: 8,
    paddingVertical: 18,
    height: 150,
  },
  brandImg: {
    width: "100%",
    height: "100%",
    marginBottom: 2,
  },

  bestSellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  bestSellerTitle: {
    color: "white",
    fontSize: 28,
    fontFamily: "Sigmar"
  },
  seeAll: {
    color: "white",
    fontSize: 14,
    fontWeight: 'bold',
  },
  bestSellerSubtext: {
    color: 'white',
    fontSize: 14,
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 16,
  },
});