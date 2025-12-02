import { ContactData, fetchContact } from '@/services/contactus'
import { colors } from '@/theme/colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale, scale, verticalScale } from 'react-native-size-matters'

const ContactUS = () => {
    const insets = useSafeAreaInsets();
const [contactData, setContactData] = useState<ContactData | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [first, setFirst] = useState<string>('');
    const [last, setLast] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [message, setMessage] = useState<string>('');
useEffect(() => {
  const loadContactData = async () => {
    const data = await fetchContact();
    if (data && data.length > 0) {
      setContactData(data[0]); 
    }
  };
  loadContactData();
}, []);
    const handleSubmit = async () => {
        // Basic validation
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
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://192.168.0.138:8000/api/create-form/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: first,
                    last_name: last,
                    email: email,
                    phone: phone,
                    message: message
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Your message has been sent successfully!');
                console.log(response)

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
        <SafeAreaView style={{ flex: 1}}>
            <ImageBackground
                source={require('../assets/images/ss1.png')}
                resizeMode="cover"
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contact US</Text>
                </View>

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        <View style={styles.nameContainer}>
                            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>First Name *</Text>
                                <TextInput
                                    style={[styles.input, errors.first_name && styles.inputError]}
                                    value={first}
                                    onChangeText={setFirst}
                                    placeholder="John"
                                    placeholderTextColor={'gray'}
                                />
                                {errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}
                            </View>

                            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Last Name *</Text>
                                <TextInput
                                    style={[styles.input, errors.last_name && styles.inputError]}
                                    value={last}
                                    onChangeText={setLast}
                                    placeholder="Doe"
                                 placeholderTextColor={'gray'}
                                />
                                {errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}
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
                    
                        {/* Contact Information Section */}
                        <View style={styles.contactInfoContainer}>
                            <Text style={styles.sectionTitle}>{contactData?.title}</Text>

                            <View style={styles.contactItem}>
                                <Ionicons name="location-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                                <View>
                                    <Text style={styles.contactLabel}>Mailing Address (Head Office)</Text>
                                    <Text style={styles.contactText}>{contactData?.mailing_address}</Text>
                                </View>
                            </View>

                            <View style={styles.contactItem}>
                                <Ionicons name="call-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                                <View>
                                    <Text style={styles.contactLabel}>DKT Helpline Toll Free Number</Text>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.helpline_number}</Text>
                                </View>
                            </View>

                            <View style={styles.contactItem}>
                                <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                                <View>
                                    <Text style={styles.contactLabel}>Corporate Contact Information</Text>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.corporate_contact}</Text>
                                </View>
                            </View>

                            <View style={styles.contactItem}>
                                <Ionicons name="mail-outline" size={24} color={colors.primary} style={styles.contactIcon} />
                                <View>
                                    <Text style={styles.contactLabel}>E-mail</Text>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.email_generic}</Text>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.email_hr}</Text>
                                    <Text style={[styles.contactText, styles.contactLink]}>{contactData?.email_collaboration}</Text>
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
    container: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    contentContainer: {
        padding: scale(16),
        paddingBottom: verticalScale(32),
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    inputContainer: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: moderateScale(14),
        color: '#333',
        marginBottom: verticalScale(6),
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: scale(12),
        fontSize: moderateScale(14),
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: 'red',
    },
    textArea: {
        height: verticalScale(120),
        textAlignVertical: 'top',
    },
    errorText: {
        color: 'red',
        fontSize: moderateScale(12),
        marginTop: verticalScale(4),
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        padding: verticalScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(8),
    },
    submitButtonText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: '600',
    },
    text: {
        fontSize: moderateScale(14),
        lineHeight: verticalScale(20),
        color: '#555',
        marginBottom: verticalScale(10),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(16),
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingTop: verticalScale(40),
        paddingBottom: verticalScale(20)
    },
    backBtn: {
        padding: scale(8),
        marginRight: scale(10),
        zIndex: 1
    },
    headerTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1,
        marginRight: scale(40)
    },
    contactInfoContainer: {
        marginTop: verticalScale(24),
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        color: colors.primary,
        marginBottom: verticalScale(16),
    },
    contactItem: {
        flexDirection: 'row',
        marginBottom: verticalScale(20),
    },
    contactIcon: {
        marginRight: scale(12),
        marginTop: scale(4),
    },
    contactLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: '#333',
        marginBottom: verticalScale(4),
    },
    contactText: {
        fontSize: moderateScale(13),
        color: '#555',
        lineHeight: verticalScale(20),
    },
    contactLink: {
        color: colors.primary,
    },
})