import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { Button } from '@/components/Button';
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
    marginTop: 80,
    zIndex: 1,
  },
  illustration: {
    width: width * 20,
    height: 350,
    borderRadius: 20,
    marginTop:20
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 2,
  },
  welcome: {
    fontSize: 50,
    color: colors.white,
    fontFamily: 'Sacramento',
    height:50,
    textAlign:"center"
  },
  startJourney: {
    fontSize: 30,
    color: colors.white,
    textShadowColor: '#B71C1C',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontFamily: "Sigmar",
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 25,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: '#B71C1C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#E53935',
    fontSize: 18,
    fontFamily: 'Poppins',
  },
});