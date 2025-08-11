import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const { width } = Dimensions.get('window');

const Payment = () => {
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment</Text>
                </View>
                {/* Success Icon */}
                <View style={styles.iconWrap}>
                    <Image
                        source={require('../assets/images/Check.png')}
                        style={{ width: 150, height: 150, alignSelf: 'center' }}
                        resizeMode="contain"
                    />
                </View>
                {/* Success Text */}
                <Text style={styles.successText}>Payment Successful!</Text>
                <Text style={styles.thankText}>Thank you for your purchase</Text>
            </View>
            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.orderBtn} onPress={() => router.push('/Orders')}>
                    <Text style={styles.orderBtnText}>View Order</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.receiptText}>View E-Receipt</Text>
                </TouchableOpacity>
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
    iconWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(100),
        marginBottom: 10,
    },
    circle: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        borderWidth: 8,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    checkIcon: {
        marginLeft: 8,
        marginTop: 8,
    },
    successText: {
        color: colors.white,
        fontSize: 26,
        fontFamily: 'PoppinsSemi',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    thankText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: 'PoppinsMedium',
        marginBottom: 8,
        textAlign: 'center',
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
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(120),
    },
    orderBtn: {
        width: '100%',
        borderRadius: 14,
        paddingVertical: verticalScale(8),
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    orderBtnText: {
        color: colors.white,
        fontSize: 20,
        fontFamily: 'PoppinsSemi',
    },
    receiptText: {
        color: colors.primary,
        fontSize: 16,
        fontFamily: 'PoppinsSemi',
        marginTop: 8,
        marginBottom: 12,
        textAlign: 'center',
    },
});

export default Payment;