import AlertModal from '@/components/Alert';
import SuccessModal from '@/components/SuccessModal';
import { useAuth } from '@/hooks/useAuth';
import { createRedeemOrder } from "@/services/redeem";
import { useAddressStore } from '@/store/addressStore';
import { useShippingStore } from '@/store/shippingStore';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Api_url } from '../url/url';

const { width } = Dimensions.get('window');

// Define the expected params type
type MallParams = {
  name?: string;
  subtitle?: string;
  description?: string;
  points?: string;
  image?: string;
} & Record<string, string | string[]>;

const Mall = () => {
  const router = useRouter();
  const params = useLocalSearchParams<MallParams>();
  const insets = useSafeAreaInsets();
  const { selectedAddress } = useAddressStore();
  const { selectedShipping } = useShippingStore();
  const userpoint = params?.userPoints ? Number(params.userPoints) : 0;
  const name = params?.name;
  const subtitle = params?.subtitle;
  const description = params?.description;
  const points = params?.points ? Number(params.points) : 0;
  const image = params?.image ? `${Api_url}media/redeem/${params.image}` : '';
  const { isAuthenticated, phone, token, user } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [AddressModal, setAddressModal] = useState(false);
  const [ShippingModal, setShippingModal] = useState(false);
const handleAddressModalClose = () => {
  setAddressModal(false);
  router.push('/ShippingAddress'); 
};

const handleShippingModalClose = () => {
  setShippingModal(false);
  router.push('/ChooseShipping'); 
};
    const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.replace({ 
      pathname: '/Redeemed', 
      params: {
        showSuccess: 'true',
        orderSuccess: 'true'
      }
    });
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${Api_url}api/app-user/list/`);
        const users = response.data;
        const matchedUser = users.find((u: any) => u.number === phone);

        if (matchedUser) {
          setUserId(matchedUser.id);
          console.log('Matched user ID:', matchedUser.id);
        } else {
          console.log('No user found with phone:', phone);
          setUserId(token);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserId(token);
      }
    };

    if (phone) {
      fetchUserData();
    } else {
      setUserId(token);
    }
  }, [phone, token]);

const CreateRedeem = async () => {
  if (userpoint < points) {
    Alert.alert("Insufficient Points", "You do not have enough points.");
    return;
  }

  if (!selectedAddress) {
    setAddressModal(true);
    return;
  }

  if (!selectedShipping) {
    setShippingModal(true);
    return;
  }


  try {
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const orderData = {
      user_id: userId,
      applied_points: points,
      user_detail: { number: phone },
      address: selectedAddress,
      shipping: selectedShipping,
      status: "pending",
      product: [
        {
          name,
          image,
          description,
          pts: points,
        },
      ],
      created_at: new Date().toISOString(),
    };

   const result = await createRedeemOrder(token, orderData);
    console.log("Redeem success:", result);
    setShowSuccessModal(true);
    setOrderSuccess(true);

  } catch (error: any) {
    Alert.alert("Error", error.message);
    setOrderSuccess(false);
    setShowSuccessModal(true);
  }
};

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
            <AlertModal
        visible={AddressModal}
        message="Address Required"
        subtitle="Please add an address before redeeming."
        autoCloseDelay={1000}
        onClose={handleAddressModalClose}
      />
          <AlertModal
        visible={ShippingModal}
        message="Shipping Required"
        subtitle="Please add a shipping method before redeeming."
        autoCloseDelay={1000}
        onClose={handleShippingModalClose}
      />
      <ImageBackground
        source={require('../assets/images/ss1.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Product Image and Header */}
        <View style={styles.imageHeaderWrap}>
               <View style={styles.headerRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color={colors.white} />
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.heartBtn}>
                <Ionicons name="heart-outline" size={28} color={colors.white} />
              </TouchableOpacity> */}
            </View>
          <ImageBackground
            source={{ uri: image }}
            style={styles.productImg}
            resizeMode={image ? 'contain' : 'cover'}
            imageStyle={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
          >
            {!image && (
              <View style={styles.placeholderContainer}>
                <Ionicons name="image-outline" size={48} color="white" />
                <Text style={styles.placeholderText}>No Image Available</Text>
              </View>
            )}
          </ImageBackground>
        </View>
        <ScrollView >
          {/* Product Card */}
          <View style={styles.cardWrap}>
            <Text style={styles.category}>{subtitle}</Text>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.sectionLabel}>Product Details</Text>
            <Text style={styles.details}>{description}</Text>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Reviews</Text>
            <View style={styles.reviewRow}>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={styles.rating}>4.5</Text>
            </View>
          </View>
        </ScrollView>
        {/* Bottom Bar */}
        <View style={styles.footer}>
          <View style={styles.pointsWrap}>
            <Text style={styles.pointsLabel}>Total Points Required</Text>
            <Text style={styles.pointsValue}>{points.toLocaleString()} PTS</Text>
          </View>
          <TouchableOpacity
            style={[styles.redeemBtn, { opacity: userpoint >= points ? 1 : 0.6 }]}
            onPress={CreateRedeem}
            disabled={userpoint < points}
          >
            <Text style={styles.redeemText}>
              {userpoint >= points
                ? `Redeem `
                : `Insufficient 
      Points`}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      <SuccessModal
        visible={showSuccessModal}
        message={orderSuccess ? "Redeemed Successfully!" : "Redeemed Failed"}
        subtitle={orderSuccess
          ? "Your order has been redeemed successfully"
          : "There was an error processing your order. Please try again."}
        autoCloseDelay={orderSuccess ? 1000 : 2000}
        onClose={handleSuccessModalClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  imageHeaderWrap: {
    width: scale(350),
    height: verticalScale(280),
    position: 'relative',
    justifyContent: 'flex-end',
  },
  productImg: {
    width: scale(350),
    height: verticalScale(180),
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(50),

    justifyContent: 'space-between',
    paddingHorizontal: scale(18),
    marginTop: verticalScale(20),
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  backBtn: {
    borderRadius: 20,
    padding: 6,
  },
  heartBtn: {
    borderRadius: 20,
    padding: 6,
  },
  cardWrap: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 12,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'flex-start',
  },
  category: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
    marginBottom: 4,
  },
  title: {
    color: colors.white,
    fontSize: moderateScale(38),
    lineHeight: moderateScale(40),
    fontFamily: 'Sigmar',
    marginBottom: 12,
  },
  sectionLabel: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
    marginTop: 10,
    marginBottom: 2,
  },
  details: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontFamily: 'PoppinsRegular',
    marginBottom: 10,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 10,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: verticalScale(100),
  },
  stars: {
    color: '#FFD600',
    fontSize: moderateScale(22),
    marginRight: 8,
    fontFamily: 'PoppinsBold',
  },
  rating: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: 'PoppinsMedium',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.secondaryLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: verticalScale(100)
  },
  pointsWrap: {
    flex: 1,
  },
  pointsLabel: {
    color: colors.primary,
    fontSize: moderateScale(15),
    fontFamily: 'PoppinsMedium',
  },
  pointsValue: {
    color: colors.primary,
    fontSize: moderateScale(26),
    fontFamily: 'PoppinsBold',
  },
  redeemBtn: {
    backgroundColor: colors.primary,
    borderRadius: scale(26),
    paddingVertical: 6,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redeemText: {
    color: colors.white,
    fontSize: moderateScale(18),
    fontFamily: 'PoppinsSemi',
  },
});

export default Mall;


