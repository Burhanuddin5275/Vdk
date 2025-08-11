import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    moderateScale,
    verticalScale
} from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
      <ImageBackground
        source={require('../assets/images/ss1.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.container}>
        <View style={styles.mandalaBackground} />

        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/images/family.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcome}>Welcome!</Text>
          <Text style={styles.startJourney}>Start Your Journey</Text>
          <Button variant="primary" onPress={() => router.push('/Home')}>
            Get Started
          </Button>
        </View>
      </View>
    </ImageBackground>
    </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingVertical: verticalScale(20),
  },
  mandalaBackground: {
    backgroundColor: 'transparent',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
    zIndex: 1,
  },
  illustration: {
    width: width * 0.85,
    height: verticalScale(280),
    borderRadius: moderateScale(20),
    marginTop: verticalScale(20),
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(80),
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    zIndex: 2,
    // Remove margin or spacing between texts
    gap: 0, // Ensure no gap if using React Native 0.71+
  },
  welcome: {
    fontSize: moderateScale(52),
    color: colors.white,
    fontFamily: 'Sacramento',
    textAlign: 'center',
    marginBottom: 0, // Remove any margin below welcome
    lineHeight: moderateScale(53), // Set lineHeight to match fontSize
    padding: 0, // Remove any padding
  },
  startJourney: {
    fontSize: moderateScale(32),
    color: colors.white,
    fontFamily: 'Sigmar',
    textAlign: 'center',
    marginBottom: 0, // Remove margin below startJourney
    marginTop: 0, // Remove margin above startJourney
    lineHeight: moderateScale(34), // Set lineHeight to match fontSize
    padding: 0, // Remove any padding
  },
});
