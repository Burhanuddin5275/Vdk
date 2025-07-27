import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, Image, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
const { width } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const [loaded]=useFonts({
    Sacramento:require("../assets/fonts/Sacramento-Regular.ttf"),
    Sigmar:require("../assets/fonts/Sigmar-Regular.ttf"),
    Poppins:require("../assets/fonts/Poppins-SemiBold.ttf"),
  })

  useEffect(()=>{
    if(loaded){
      return;
    }
  },[loaded])
  return (
    <ImageBackground
      source={require('../assets/images/ss1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Mandala background (placeholder with red and patterns) */}
        <View style={styles.mandalaBackground} />
        {/* Family illustration placeholder */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/images/family.png')} // Placeholder for family illustration
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.welcome}>Welcome!</Text>
          <Text style={styles.startJourney}>Start Your Journey</Text>
          <Button variant="primary" onPress={() => { router.push('/Home') }}>
            Get Started
          </Button>
        </View>
        <StatusBar style="light" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaBackground: {
    backgroundColor: 'transparent',
    // You can add SVG or ImageBackground for mandala pattern here
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: verticalScale(50),
    zIndex: 1,
  },
  illustration: {
    width: width,
    height: verticalScale(300),
    borderRadius: moderateScale(20),
    marginTop: verticalScale(20)
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(60),
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    zIndex: 2,
  },
  welcome: {
    fontSize: moderateScale(50),
    color: colors.white,
    fontFamily: 'Sacramento',
    height: verticalScale(50),
    textAlign: "center"
  },
  startJourney: {
    fontSize: moderateScale(30),
    color: colors.white,
    fontFamily: 'Sigmar',
    marginBottom: verticalScale(10),
    textAlign: "center"
  },
});