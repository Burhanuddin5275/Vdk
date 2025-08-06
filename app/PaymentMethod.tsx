import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

const PAYMENT_METHODS = [
    {
        id: 'card',
        label: 'Add Card',
        icon: <Ionicons name="card-outline" size={moderateScale(25)}color={colors.primary} />, // Placeholder icon
        type: 'card',
    },
];

const MORE_OPTIONS = [
    {
        id: 'easypaisa',
        label: 'Easypaisa',
        icon: require('../assets/images/easypaisa.png'), // Placeholder, replace with actual
    },
    {
        id: 'jazzcash',
        label: 'Jazzcash',
        icon: require('../assets/images/jazzcash.png'), // Placeholder, replace with actual
    },
    {
        id: 'cod',
        label: 'Cash on Delivery',
        icon: require('../assets/images/cash.png'), // Placeholder, replace with actual
    },
];

const Payment = () => {
    const router = useRouter();
    const [selected, setSelected] = useState('card');

    return (
        <ImageBackground
            source={require('../assets/images/ss1.png')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={moderateScale(28)} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Method</Text>
                </View>
                <ScrollView contentContainerStyle={{ flexGrow:1, paddingHorizontal: 16, justifyContent: 'flex-start', }} showsVerticalScrollIndicator={false}>
                    {/* Credit & Debit Card */}
                    <Text style={styles.sectionTitle}>Credit & Debit Card</Text>
                    <TouchableOpacity
                        style={[
                            styles.cardRow,
                            selected === 'card' && styles.selectedRow,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => { setSelected('card'); router.push('/Card'); }}
                    >
                        <View style={styles.iconBox}>{PAYMENT_METHODS[0].icon}</View>
                        <Text style={styles.cardLabel}>{PAYMENT_METHODS[0].label}</Text>
                    </TouchableOpacity>

                    {/* More Payment Options */}
                    <Text style={styles.sectionTitle}>More Payment Options</Text>
                    {MORE_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionRow,
                                selected === option.id && styles.selectedRow,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setSelected(option.id)}
                        >
                            <Image source={option.icon} style={styles.optionIcon} resizeMode="contain" />
                            <Text style={styles.optionLabel}>{option.label}</Text>

                        </TouchableOpacity>
                    ))}
                </ScrollView>
                {/* Confirm Payment Button */}
                <View style={styles.footer}>
                    <Button
                        variant="secondary"
                        style={styles.confirmBtn}
                        onPress={() => {router.push('/Payment')}}
                    >
                        Confirm Payment
                    </Button>
                </View>
            </View>
        </ImageBackground>
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
    sectionTitle: {
        color: colors.white,
        fontSize: moderateScale(18),
        fontFamily: 'PoppinsSemi',
        marginTop: 8,
        marginBottom: 8,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(14),
        marginBottom: verticalScale(12),
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    selectedRow: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    iconBox: {
        width: scale(26),
        height: verticalScale(26),
        justifyContent: 'center',
        marginRight: 12,
    },
    cardLabel: {
        color: colors.primary,
        fontSize: moderateScale(14),
        fontFamily: 'PoppinsSemi',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    optionIcon: {
        width: scale(32),
        height: verticalScale(32),
        marginRight: 12,
    },
    optionLabel: {
        color: colors.primary,
        fontSize: moderateScale(14),
        fontFamily: 'PoppinsSemi',
    },
    footer: {
        backgroundColor: colors.secondaryLight,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        height: verticalScale(100),
    },
    confirmBtn: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 16,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Payment;