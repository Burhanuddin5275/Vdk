import { fetchAbout, AboutItem } from '@/services/about'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale, scale, verticalScale } from 'react-native-size-matters'
import RenderHTML from 'react-native-render-html';
import { colors } from '@/theme/colors'
import { HTMLContentModel, HTMLElementModel } from 'react-native-render-html';

const About = () => {
  const [about, setAbout] = useState<AboutItem | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();   // <-- Required for HTML width

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const data = await fetchAbout();
        if (data && data.length > 0) {
          setAbout(data[0]); 
        }
      } catch (error) {
        console.error('Failed to load terms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAbout();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

const cleanedHTML = about?.text
  ?.replace(/!important/g, "")
  .replace(/background-[^;]+;/g, "")
  .replace(/font-variant-[^;]+;/g, "")
  .replace(/font-family:[^;]+;/g, "") || "";

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
      <ImageBackground
        source={require('../assets/images/ss1.png')}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About Us</Text>
        </View>

        <ScrollView style={styles.contentContainer}>
          {about ? (
            <View style={styles.termsContainer}>
<RenderHTML
  contentWidth={width}
  source={{ html: cleanedHTML }}

  // Enable deprecated <font> tag support
  customHTMLElementModels={{
    font: HTMLElementModel.fromCustomModel({
      tagName: 'font',
      contentModel: HTMLContentModel.textual, // <font> contains text
    })
  }}

  tagsStyles={{
    font: {
      // default styles for <font> when attributes are missing
      color: 'black'
    },
    p: { fontSize: 16, lineHeight: 22, color: "#333" },
    h1: { fontSize: 28, fontWeight: "700", color: "#E03E2D" },
    h2: { fontSize: 24, fontWeight: "600" },
    h6: { fontSize: 16, fontWeight: "500" },
  }}
/>


            </View>
          ) : (
            <Text style={styles.errorText}>Failed to load content.</Text>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default About

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: scale(16),
    backgroundColor:colors.white
  },
  termsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: scale(5),
    marginBottom: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: 'bold',
    marginBottom: verticalScale(10),
    color: '#333',
    textAlign: 'left',
  },
  text: {
    fontSize: moderateScale(14),
    lineHeight: verticalScale(20),
    color: '#555',
    marginBottom: verticalScale(10),
  }, 
  errorText: {
    color: colors.white,
    textAlign: 'center',
    marginTop: verticalScale(20),
    fontSize: moderateScale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: verticalScale(80),
    position: 'relative',
    paddingHorizontal: scale(18),
    backgroundColor:colors.primary,
  },
  backBtn: {
    width: scale(30),
    height: scale(30),
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
    fontSize: moderateScale(20),
    color: '#fff',
    fontFamily: 'Sigmar',
    letterSpacing: 1,
    lineHeight: verticalScale(55),
  },
});