import { fetchTerms, TermsItem } from '@/services/terms'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale, scale, verticalScale } from 'react-native-size-matters'
import { RenderHTML } from 'react-native-render-html';
import { HTMLContentModel, HTMLElementModel } from 'react-native-render-html';
import { colors } from '@/theme/colors'
import MyHTMLRenderer from '@/components/RenderHtml'

const Terms = () => {
  const [terms, setTerms] = useState<TermsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const data = await fetchTerms();
        if (data && data.length > 0) {
          setTerms(data[0]);
        }
      } catch (error) {
        console.error('Failed to load terms:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTerms();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Keep all font-family and <font face=""> intact
  const cleanedHTML = terms?.t_text
    ?.replace(/!important/g, "")
    .replace(/font-variant-[^;]+;/g, "")
    .replace(/background-[^;]+;/g, "")
    .replace(/color:[^;]+;/g, "")
    || "";

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
          <Text style={styles.headerTitle}>Terms and Conditions</Text>
        </View>

        <ScrollView style={styles.contentContainer}>
          {terms ? (
            <View style={styles.termsContainer}>
             <MyHTMLRenderer html={cleanedHTML}/>
            </View>
          ) : (
            <Text style={styles.errorText}>Failed to load terms and conditions.</Text>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  )
}

export default Terms

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
    backgroundColor: colors.white
  },
  termsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: scale(16),
    marginBottom: verticalScale(20),
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
    backgroundColor: colors.primary,
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
