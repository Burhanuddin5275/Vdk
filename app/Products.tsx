import { selectIsAuthenticated, selectPhone } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from './Wishlist';

const backgroundImages = {
  ss1: require('../assets/images/ss1.png'),
  ss2: require('../assets/images/ss2.png'),
};

const Products = () => {
    const router = useRouter();
    const { id, data, category, backgroundImage } = useLocalSearchParams();
    const product = data ? JSON.parse(data as string) : {};
    // Use both img and img1 if available
    const images = [product.img, product.img1, product.img2].filter(Boolean);
    const [selectedImg, setSelectedImg] = useState(images[0]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSize, setSelectedSize] = useState('Pack of 3');
    const [qty, setQty] = useState(1);
    const sizes = [
        { label: 'Pack of 3', price: 200 },
        { label: 'Pack of 7x4', price: 400 },
        { label: 'Pack of 3x12', price: 600 },
    ];
    const addToCart = useCartStore((state: any) => state.addToCart);
    const [showSuccess, setShowSuccess] = useState(false);
    const wishlistItems = useWishlistStore(state => state.items);
    const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
    const [cartMessage, setCartMessage] = useState<string | null>(null);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const phone = useAppSelector(selectPhone);

    // Ensure backgroundImage is a string (not string[])
    let bgKey: 'ss1' | 'ss2' | undefined;
    if (Array.isArray(backgroundImage)) {
      if (backgroundImage[0] === 'ss1' || backgroundImage[0] === 'ss2') bgKey = backgroundImage[0];
    } else if (backgroundImage === 'ss1' || backgroundImage === 'ss2') {
      bgKey = backgroundImage;
    }

    // Determine main color based on background
    const mainColor = bgKey === 'ss2' ? '#0B3D0B' : '#E53935';


    const handleAddToCart = async () => {
        if (!isAuthenticated || !phone) {
            setCartMessage('Please log in to add items to your cart.');
            setTimeout(() => setCartMessage(null), 2000);
            setTimeout(() => router.replace('/Login'), 1000);
            return;
        }
        addToCart({
            id: product.id,
            name: product.name,
            pack: selectedSize,
            price: sizes.find(s => s.label === selectedSize)?.price ?? 0,
            points: product.pts,
            quantity: qty,
            image: selectedImg,
            user: phone, // Add user field
        });
        setModalVisible(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    return (
        <>
            <ImageBackground source={bgKey ? backgroundImages[bgKey] : require('../assets/images/ss1.png')} style={{ flex: 1 }} resizeMode="cover">
                <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={mainColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={async () => {
                                if (!isAuthenticated) {
                                    setWishlistMessage('Please log in to use wishlist.');
                                    setTimeout(() => setWishlistMessage(null), 1000);
                                    setTimeout(() => router.replace('/Login'), 1000);
                                    return;
                                }
                                if (wishlistItems.some((w: { id: string }) => w.id === product.id)) {
                                    await useWishlistStore.getState().removeFromWishlist(product.id);
                                    setWishlistMessage('Removed from wishlist');
                                } else {
                                    await useWishlistStore.getState().addToWishlist({
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.img || product.image || selectedImg,
                                        pack: '',
                                    });
                                    setWishlistMessage('Added to wishlist');
                                }
                                setTimeout(() => setWishlistMessage(null), 2000);
                            }}
                        >
                            <Ionicons name={wishlistItems.some((w: { id: string }) => w.id === product.id) ? 'heart' : 'heart-outline'} size={24} color={mainColor} />
                        </TouchableOpacity>
                    </View>
                    {/* Product Image */}
                    <View style={styles.imageWrap}>
                        <Image source={selectedImg} style={styles.productImg} resizeMode="contain" />
                        {/* Thumbnails */}
                        <View style={styles.thumbnailRow}>
                            {images.map((img: any, idx: any) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSelectedImg(img)}
                                    style={[styles.thumbnailWrap, selectedImg === img && styles.thumbnailSelected]}
                                    activeOpacity={0.7}
                                >
                                    <Image source={img} style={styles.thumbnailImg} resizeMode="contain" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    {/* Card Section */}
                    <View style={styles.cardSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
                            <View style={styles.ptsBadge}><Text style={[styles.ptsText, { color: mainColor }]}>{product.pts} PTS</Text></View>
                        </View>
                        <Text style={styles.title}>{product.name}</Text>
                        <Text style={styles.pcs}>36 pcs</Text>
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <Text style={styles.details}>{product.description}</Text>
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={{ color: '#FFD600', fontSize: 18, marginRight: 4 }}>
                                {'★'.repeat(product.rating || 0)}
                            </Text>
                            <Text style={{ color: colors.white, fontSize: 15 }}>{product.rating}</Text>
                        </View>
                    </View>
                </ScrollView>
                {/* Price & Add to Cart */}
                <View style={styles.bottomBar}>
                    <View>
                        <Text style={[styles.priceLabel, { color: mainColor }]}>Total Price</Text>
                        <Text style={[styles.price, { color: mainColor }]}>Pkr {product.price ? product.price : 0}</Text>
                    </View>
                    <TouchableOpacity style={[styles.cartBtn, { backgroundColor: mainColor }]} onPress={() => setModalVisible(true)}>
                        <Ionicons name="cart" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.cartBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            {/* Add to Cart Modal */}
            {modalVisible && (
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 10 }}>
                    <View style={{ backgroundColor: '#FBF4E4', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, width: '100%', maxWidth: '100%' }}>
                        <Text style={{ color: mainColor, fontFamily: 'PoppinsBold', fontSize: 18, marginBottom: 10 }}>Sizes</Text>
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            {sizes.map((s, i) => (
                                <TouchableOpacity
                                    key={s.label}
                                    onPress={() => setSelectedSize(s.label)}
                                    style={{
                                        borderWidth: selectedSize === s.label ? 2 : 0,
                                        borderColor: mainColor,
                                        borderRadius: 12,
                                        backgroundColor: '#fff',
                                        marginRight: 16,
                                        padding: 8,
                                        alignItems: 'center',
                                        width: 90,
                                    }}
                                >
                                    <View style={{ width: 48, height: 32, backgroundColor: '#F2F2F2', borderRadius: 8, marginBottom: 6 }} />
                                    <Text style={{ color: selectedSize === s.label ? mainColor : '#1A1A1A', fontFamily: 'PoppinsBold', fontSize: 14 }}>{s.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginVertical: 10 }} />
                        <Text style={{ color: mainColor, fontFamily: 'PoppinsBold', fontSize: 16, marginBottom: 8 }}>Quantity</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <TouchableOpacity
                                style={{ backgroundColor: '#E5E5E5', borderRadius: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
                                onPress={() => setQty(q => Math.max(1, q - 1))}
                            >
                                <Ionicons name="remove" size={20} color={mainColor} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 18, fontFamily: 'PoppinsBold', color: mainColor, marginHorizontal: 8 }}>{qty}</Text>
                            <TouchableOpacity
                                style={{ backgroundColor: '#E5E5E5', borderRadius: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
                                onPress={() => setQty(q => q + 1)}
                            >
                                <Ionicons name="add" size={20} color={mainColor} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginVertical: 10 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ color: mainColor, fontFamily: 'PoppinsMedium', fontSize: 15 }}>Total Price</Text>
                                <Text style={{ color: mainColor, fontFamily: 'PoppinsBold', fontSize: 24 }}>
                                    Pkr {(product.price ? product.price : (sizes.find(s => s.label === selectedSize)?.price ?? 0)) * qty}/-
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{ backgroundColor: mainColor, borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}
                                onPress={handleAddToCart}
                            >
                                <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#fff', fontFamily: 'PoppinsBold', fontSize: 16 }}>Add to Cart</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
            {/* Success Message */}
            {showSuccess && (
                <View style={{ position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                    <View style={{ backgroundColor: mainColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                        <Text style={{ color: '#fff', fontFamily: 'PoppinsBold', fontSize: 16 }}>Product added to cart!</Text>
                    </View>
                </View>
            )}
            {/* Snackbar/Toast */}
            {wishlistMessage && (
                <View style={{ position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                    <View style={{ backgroundColor: mainColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{wishlistMessage}</Text>
                    </View>
                </View>
            )}
            {cartMessage && (
                <View style={{ position: 'absolute', top: 120, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                    <View style={{ backgroundColor: mainColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{cartMessage}</Text>
                    </View>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 48,
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: '#fff',
    },
    backBtn: {
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    imageWrap: {

        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 16,
        paddingBottom: 60,
        backgroundColor: '#fff',
        borderBottomEndRadius: 32,
        borderBottomStartRadius: 32,
    },
    productImg: {
        width: 180,
        height: 180,
    },
    thumbnailRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 8,
    },
    thumbnailWrap: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: 2,
        backgroundColor: '#fff',
        marginHorizontal: 2,
    },
    thumbnailSelected: {
        borderColor: colors.primaryDark,
    },
    thumbnailImg: {
        width: 40,
        height: 40,
        borderRadius: 6,
    },
    cardSection: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 20,
        marginTop: 10,
    },
    brand: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'InterBold',
    },
    ptsBadge: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 36,
    },
    ptsText: {
        color: colors.primaryDark,
        fontFamily: 'InterBold',
        fontSize: 13,
        textAlign: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontFamily: 'Sigmar',
        marginTop: 8,
    },
    pcs: {
        color: '#fff',
        fontSize: 32,
        fontFamily: 'Sigmar',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'InterBold',
        marginTop: 16,
        marginBottom: 4,
    },
    details: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'InterRegular',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 12,
    },
    bottomBar: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    priceLabel: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: 'InterRegular',
    },
    price: {
        color: colors.primaryDark,
        fontSize: 22,
        fontFamily: 'Sigmar',
        marginTop: 2,
    },
    cartBtn: {
        backgroundColor: colors.primaryDark,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    cartBtnText: {
        color: '#fff',
        fontFamily: 'InterBold',
        fontSize: 15,
    },
});

export default Products;