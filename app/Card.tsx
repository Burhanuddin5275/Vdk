import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const Card = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [holder, setHolder] = useState('Hussain');
    const [number, setNumber] = useState('4000 1234 5678 9010');
    const [expiry, setExpiry] = useState('12/30');
    const [cvv, setCvv] = useState('000');
    const [save, setSave] = useState(true);

    return (
        <SafeAreaView style={{flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4))}}>
            <ImageBackground
                source={require('../assets/images/ss1.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Card</Text>
                </View>
                {/* Card Image */}
                <View style={styles.cardImageWrap}>
                    <Image
                        source={require('../assets/images/card.png')} // Replace with your card image asset
                        style={styles.cardImage}
                        resizeMode="contain"
                    />
                </View>
                {/* Form */}
                  <ScrollView style={styles.Card} contentContainerStyle={{ paddingBottom: verticalScale(100) } } showsVerticalScrollIndicator={false}>

                    <View style={styles.form}>  
                    <Text style={styles.label}>Card Holder Name*</Text>
                    <TextInput
                        style={styles.input}
                        value={holder}
                        onChangeText={setHolder}
                        placeholder="Card Holder Name"
                        placeholderTextColor={colors.white}
                    />
                    <Text style={styles.label}>Card Number*</Text>
                    <TextInput
                        style={styles.input}
                        value={number}
                        onChangeText={setNumber}
                        placeholder="Card Number"
                        placeholderTextColor={colors.white}
                        keyboardType="numeric"
                        maxLength={19}
                    />
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Expiry Date*</Text>
                            <TextInput
                                style={styles.input}
                                value={expiry}
                                onChangeText={setExpiry}
                                placeholder="MM/YY"
                                placeholderTextColor={colors.white}
                                maxLength={5}
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>CVV*</Text>
                            <TextInput
                                style={styles.input}
                                value={cvv}
                                onChangeText={setCvv}
                                placeholder="CVV"
                                placeholderTextColor={colors.white}
                                maxLength={4}
                                secureTextEntry
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View style={styles.saveRow}>
                        <TouchableOpacity onPress={() => setSave(!save)} style={[styles.checkboxWrap, save && styles.checkboxChecked]}>
                            {save && <Ionicons name="checkmark" size={20} color={colors.primaryDark} />}
                        </TouchableOpacity>
                        <Text style={styles.saveLabel}>Save Card</Text>
                    </View>
                </View>
                  </ScrollView>
            
                {/* Add Card Button Footer */}
                <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
                    <TouchableOpacity style={styles.addBtn}>
                        <Text style={styles.addBtnText}>Add Card</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
    },
    header: {
      flexDirection: 'row',
       alignItems: 'center',
       justifyContent: 'flex-start',
       height: verticalScale(80),
       position: 'relative',
       paddingHorizontal: scale(18),
       marginTop: verticalScale(20),
    },
    backBtn: {
        width: scale(40),
    height: scale(40),
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
    fontSize: moderateScale(28),
    color: '#fff',
    fontFamily: 'Sigmar',
    letterSpacing: 1,
    lineHeight: verticalScale(55),
    },
    cardImageWrap: {
        alignItems: 'center',
    },
    cardImage: {
        width: "100%",
        borderRadius: 16,
    },
      Card: {
    flex: 1,
    paddingHorizontal: scale(20),
    height: verticalScale(2022),
  },
    form: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(20)
    },
    label: {
        color: colors.white,
        fontSize: 15,
        fontFamily: 'PoppinsSemi',
        marginBottom: 4,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.white,
        borderRadius: 8,
        color: colors.white,
        fontSize: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
        fontFamily: 'PoppinsMedium',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    saveRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    checkboxWrap: {
        marginRight: 8,
        backgroundColor: 'white',
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: colors.primaryDark,
    },
    checkboxChecked: {
        backgroundColor: 'white',
    },
    saveLabel: {
        color: colors.white,
        fontSize: 16,
        fontFamily: 'PoppinsMedium',
    },
    footer: {
    backgroundColor: colors.secondaryLight,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
    marginTop: 8,
    height: verticalScale(85),
    },
    addBtn: {
        width: '100%',
        height: verticalScale(50),
        borderRadius: 16,
        paddingVertical: verticalScale(12),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        color: colors.white,
        fontSize: 20,
        fontFamily: 'PoppinsSemi',
    },
});

export default Card;