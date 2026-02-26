import { ContactData, fetchContact } from '@/services/contactus'
import { colors } from '@/theme/colors'
import { Api_url } from '@/url/url'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    ImageBackground, Linking, SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity, View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale, scale, verticalScale } from 'react-native-size-matters'

const ContactUS = () => {
    const insets = useSafeAreaInsets();
    const [contactData, setContactData] = useState<ContactData | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Form fields
    const [first, setFirst] = useState<string>('');
    const [last, setLast] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    // Fetch contact info
    useEffect(() => {
        const loadContactData = async () => {
            const data = await fetchContact();
            if (data && data.length > 0) {
                setContactData(data[0]);
            }
        };
        loadContactData();
    }, []);

    // Form Submit
    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        if (!first.trim()) newErrors.first = 'First name is required';
        if (!last.trim()) newErrors.last = 'Last name is required';

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9+\-\s]+$/.test(phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!message.trim()) newErrors.message = 'Message is required';

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${Api_url}api/create-form/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: first,
                    last_name: last,
                    email,
                    phone,
                    message
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Your message has been sent successfully!');
                setFirst('');
                setLast('');
                setEmail('');
                setPhone('');
                setMessage('');
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send message. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground
                source={require('../assets/images/ss1.png')}
                resizeMode="cover"
                style={{ flex: 1 }}
            >
                <View style={styles.gradientOverlay} />

                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contact Us</Text>
                </View>

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* FORM */}
                    <View style={styles.formContainer}>
                        <View style={styles.nameContainer}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>First Name *</Text>
                                <TextInput
                                    style={[styles.input, errors.first && styles.inputError]}
                                    value={first}
                                    onChangeText={setFirst}
                                    placeholder="John"
                                    placeholderTextColor={'gray'}
                                />
                                {errors.first && <Text style={styles.errorText}>{errors.first}</Text>}
                            </View>

                            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Last Name *</Text>
                                <TextInput
                                    style={[styles.input, errors.last && styles.inputError]}
                                    value={last}
                                    onChangeText={setLast}
                                    placeholder="Doe"
                                    placeholderTextColor={'gray'}
                                />
                                {errors.last && <Text style={styles.errorText}>{errors.last}</Text>}
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="your.email@example.com"
                                placeholderTextColor={'gray'}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="03107088998"
                                placeholderTextColor={'gray'}
                                keyboardType="phone-pad"
                                maxLength={11}
                            />
                            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Your Message *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textArea,
                                    errors.message && styles.inputError
                                ]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Type your message here..."
                                placeholderTextColor={'gray'}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                            {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Send Message</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* CONTACT INFORMATION */}
                    <View style={styles.contactInfoContainer}>
                        <Text style={styles.sectionTitle}>{contactData?.title}</Text>

                        <View style={styles.contactItem}>
                            <Ionicons name="location-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                            <View>
                                <Text style={styles.contactLabel}>Mailing Address (Head Office)</Text>
                                <Text style={styles.contactText}>{contactData?.mailing_address}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => contactData?.helpline_number && Linking.openURL(`tel:${contactData.helpline_number}`)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="call-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                            <View>
                                <Text style={styles.contactLabel}>DKT Helpline Toll Free Number</Text>
                                <Text style={[styles.contactText, styles.contactLink]}>{contactData?.helpline_number}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => contactData?.corporate_contact && Linking.openURL(`tel:${contactData.corporate_contact}`)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                            <View>
                                <Text style={styles.contactLabel}>Corporate Contact Information</Text>
                                <Text style={[styles.contactText, styles.contactLink]}>{contactData?.corporate_contact}</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.contactItem}>
                            <Ionicons name="mail-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                            <View>
                                <Text style={styles.contactLabel}>E-mail</Text>
                                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${contactData?.email_generic}`)}>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.email_generic}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${contactData?.email_hr}`)}>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.email_hr}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL(`mailto:${contactData?.email_collaboration}`)}>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.email_collaboration}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
}

export default ContactUS


const styles = StyleSheet.create({
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    container: {
        flex: 1,
    },

    contentContainer: {
        padding: scale(18),
        paddingBottom: verticalScale(60),
    },

    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderRadius: 16,
        padding: scale(18),
        marginTop: verticalScale(15),
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },

    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(14),
    },

    inputContainer: {
        marginBottom: verticalScale(18),
    },

    label: {
        fontSize: moderateScale(14.5),
        fontWeight: '600',
        color: '#222',
        marginBottom: verticalScale(6),
    },

    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(12),
        backgroundColor: '#fafafa',
        fontSize: moderateScale(14),
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },

    inputError: {
        borderColor: colors.primary,
        backgroundColor: '#ffeaea',
    },

    textArea: {
        height: verticalScale(130),
    },

    errorText: {
        color: colors.primary,
        marginTop: 5,
        fontSize: moderateScale(12),
    },

    submitButton: {
        backgroundColor: colors.primary,
        paddingVertical: verticalScale(14),
        borderRadius: 12,
        alignItems: 'center',
        marginTop: verticalScale(10),
        shadowColor: colors.primary,
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    submitButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: moderateScale(16),
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(45),
        paddingBottom: verticalScale(20),
        backgroundColor: colors.primary,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },

    backBtn: {
        padding: scale(8),
        marginRight: scale(10),
    },

    headerTitle: {
        fontSize: moderateScale(22),
        fontWeight: '800',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginRight: scale(40),
    },

    // CONTACT CARD
    contactInfoContainer: {
        marginTop: verticalScale(25),
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderRadius: 16,
        padding: scale(18),
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },

    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: colors.primary,
        marginBottom: verticalScale(16),
    },

    contactItem: {
        flexDirection: 'row',
        marginBottom: verticalScale(18),
    },

    contactIcon: {
        marginRight: scale(14),
        marginTop: verticalScale(4),
    },

    contactLabel: {
        fontSize: moderateScale(14),
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },

    contactText: {
        width: scale(250),
        fontSize: moderateScale(13.5),
        color: '#555',
        lineHeight: verticalScale(20),
    },

    contactLink: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
});
