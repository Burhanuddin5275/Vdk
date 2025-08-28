import { selectIsAuthenticated, selectPhone } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
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
    console.log('Product data:', product); // Debug log
    const images = [product.img, product.img1, product.img2].filter(Boolean);
    const [selectedImg, setSelectedImg] = useState(images[0]);
    const [modalVisible, setModalVisible] = useState(false);
    // Define Variant type
    interface Variant {
        label: string;
        price: number;
        sale_price?: number;
        image?: any;
    }

    // Process variants from product data
    const processVariants = (): Variant[] => {
        const rawVariants = product.variant || product.variants || [];
        if (!Array.isArray(rawVariants)) return [];

        return rawVariants.flatMap((v: any) => {
            // Handle variants with attributes/options
            if (v?.attributes) {
                const attributes = Array.isArray(v.attributes) ? v.attributes : [v.attributes];
                return attributes.flatMap((attr: any) => {
                    const options = attr?.options || {};
                    const size = options.Size || options.size || Object.values(options)[0];
                    if (!size) return [];

                    return {
                        label: String(size),
                        price: Number(attr.regular_price || attr.price || v.price || 0),
                        ...(attr.sale_price ? { sale_price: Number(attr.sale_price) } : {}),
                        image: v.image || v.img || product.img
                    };
                });
            }

            // Handle simple variant objects
            const label = v?.label || v?.name || v?.pack || String(v?.size || v?.title || '');
            if (!label) return [];

            return {
                label,
                price: Number(v.regular_price || v.price || v.amount || 0),
                ...(v.sale_price ? { sale_price: Number(v.sale_price) } : {}),
                image: v.image || v.img || product.img
            };
        }).filter((v: any): v is Variant => v && v.label && !isNaN(v.price));
    };

    const variants = processVariants();

    let priceRange: { min: number; max: number } | null = null;
    if (variants.length > 1 && (!product.regular_price || product.regular_price === 0)) {
        const prices = variants.map(v => v.sale_price ?? v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice !== maxPrice) {
            priceRange = { min: minPrice, max: maxPrice };
        }
    }

    const [selectedSize, setSelectedSize] = useState(variants[0]?.label || '');
    const [qty, setQty] = useState(1);
    const addToCart = useCartStore((state: any) => state.addToCart);
    const [showSuccess, setShowSuccess] = useState(false);
    const wishlistItems = useWishlistStore(state => state.items);
    const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
    const [cartMessage, setCartMessage] = useState<string | null>(null);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const phone = useAppSelector(selectPhone);

    let bgKey: 'ss1' | 'ss2' | undefined;
    if (Array.isArray(backgroundImage)) {
        if (backgroundImage[0] === 'ss1' || backgroundImage[0] === 'ss2') bgKey = backgroundImage[0];
    } else if (backgroundImage === 'ss1' || backgroundImage === 'ss2') {
        bgKey = backgroundImage;
    }

    const mainColor = bgKey === 'ss2' ? '#0B3D0B' : '#E53935';


    const handleAddToCart = async () => {
        if (!isAuthenticated || !phone) {
            setCartMessage('Please log in to add items to your cart.');
            setTimeout(() => setCartMessage(null), 2000);
            const currentRoute = `/Products?id=${id}&data=${encodeURIComponent(data as string)}&category=${category}&backgroundImage=${backgroundImage}`;
            setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
            return;
        }
        const selectedVariant = variants.find((v: any) => v.label === selectedSize);
        const variantPrice = selectedVariant?.price ?? 0;
        const variantSalePrice = selectedVariant?.sale_price;
        const imageForCart = selectedVariant?.image || selectedImg; // Use variant image if available

        addToCart({
            id: product.id,
            name: product.name,
            pack: selectedSize,
            price: variantSalePrice || variantPrice || product.sale_price || product.regular_price || 0,
            sale_price: variantSalePrice || product.sale_price || undefined,
            points: product.pts,
            quantity: qty,
            image: imageForCart,
            user: phone,
            variant: selectedVariant ? {
                price: variantPrice,
                sale_price: variantSalePrice
            } : undefined
        });
        setModalVisible(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
            <ImageBackground source={bgKey ? backgroundImages[bgKey] : require('../assets/images/ss1.png')} style={{ flex: 1 }} resizeMode="cover">
                <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={28} color={mainColor} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={async () => {
                                if (!isAuthenticated) {
                                    setWishlistMessage('Please log in to use wishlist.');
                                    setTimeout(() => setWishlistMessage(null), 1000);
                                    const currentRoute = `/Products?id=${id}&data=${encodeURIComponent(data as string)}&category=${category}&backgroundImage=${backgroundImage}`;
                                    setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
                                    return;
                                }

                                const inWishlist = wishlistItems.some((w: { id: string }) => w.id === product.id);

                                if (inWishlist) {
                                    await useWishlistStore.getState().removeFromWishlist(product.id);
                                    setWishlistMessage('Removed from wishlist');
                                } else {
                                    // Find the selected variant based on the state
                                    const selectedVariant = variants.find(v => v.label === selectedSize) || variants[0];
                                    const selectedVariantLabel = (selectedVariant?.label || (selectedVariant as any)?.name || (selectedVariant as any)?.pack || selectedSize || variants[0]?.label || '').toString();

                                    await useWishlistStore.getState().addToWishlist({
                                        id: product.id,
                                        name: product.name,
                                        regular_price: selectedVariant?.price ?? product.regular_price,
                                        sale_price: selectedVariant?.sale_price ?? product.sale_price,
                                        image: product.img || product.image || selectedImg,
                                        pack: selectedVariantLabel,
                                        category: product.Category || (category as string),
                                        variant: selectedVariant ? {
                                            label: selectedVariantLabel,
                                            price: selectedVariant.price,
                                            sale_price: selectedVariant.sale_price
                                        } : undefined
                                    });
                                    setWishlistMessage('Added to wishlist');
                                }
                                setTimeout(() => setWishlistMessage(null), 2000);
                            }}
                        >
                            <Ionicons name={wishlistItems.some((w: { id: string }) => w.id === product.id) ? 'heart' : 'heart-outline'} size={24} color={mainColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageWrap}>
                        <Image source={typeof selectedImg === 'string' ? { uri: selectedImg } : selectedImg} style={styles.productImg} resizeMode="contain" />
                        {/* Thumbnails */}
                        <View style={styles.thumbnailRow}>
                            {images.map((img: any, idx: any) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSelectedImg(img)}
                                    style={[styles.thumbnailWrap, selectedImg === img && styles.thumbnailSelected]}
                                    activeOpacity={0.7}
                                >
                                    <Image source={typeof img === 'string' ? { uri: img } : img} style={styles.thumbnailImg} resizeMode="contain" />
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
                            <Text style={{ color: '#FFD600', fontSize: moderateScale(15), marginRight: 4 }}>
                                {typeof product.rating === 'number' ? Array(Math.max(0, Math.min(5, Math.round(product.rating)))).fill('★').join('') : '★★★★★'}
                            </Text>
                            <Text style={{ color: colors.white, fontSize: moderateScale(15) }}>
                                {typeof product.rating === 'number' ? product.rating.toFixed(1) : '5.0'}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
                {/* Price & Add to Cart */}
                <View style={styles.bottomBar}>
                    <View>
                        <Text style={[styles.priceLabel, { color: mainColor }]}>Total Price</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            {priceRange ? (
                                <Text style={[styles.price, { color: mainColor, fontSize: moderateScale(22) }]}>
                                    {`Pkr ${priceRange.min} - ${priceRange.max}`}
                                </Text>
                            ) : (
                                <>
                                    <Text style={[
                                        styles.price,
                                        {
                                            color: mainColor,
                                            textDecorationLine: product.sale_price ? 'line-through' : 'none',
                                            opacity: product.sale_price ? 0.7 : 1,
                                            fontSize: product.sale_price ? moderateScale(15) : moderateScale(25),
                                            fontFamily: product.sale_price ? 'PoppinsBold' : 'PoppinsBold'
                                        }
                                    ]}>
                                        {`Pkr ${product.regular_price || (variants[0]?.sale_price ?? variants[0]?.price) || 0}`}
                                    </Text>
                                    {product.sale_price ? (
                                        <Text style={[styles.price, {
                                            color: '#E53935',
                                            fontSize: moderateScale(25),
                                            fontFamily: 'PoppinsBold'
                                        }]}>
                                            {` ${product.sale_price}`}
                                        </Text>
                                    ) : null}
                                </>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.cartBtn, { backgroundColor: mainColor }]} onPress={() => setModalVisible(true)}>
                        <Ionicons name="cart" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.cartBtnText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            {/* Add to Cart Modal */}
            {modalVisible && (
                <View style={StyleSheet.absoluteFill}>
                    <TouchableOpacity 
                        style={styles.modalOverlay} 
                        activeOpacity={1} 
                        onPress={() => setModalVisible(false)}
                    />
                    <View style={{ 
                        position: 'absolute', 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        zIndex: 10,
                        paddingBottom: Math.max(insets.bottom, verticalScale(4)) 
                    }}>
                        <View style={{ 
                            backgroundColor: '#FBF4E4', 
                            borderTopLeftRadius: 24, 
                            borderTopRightRadius: 24, 
                            padding: 24, 
                            width: '100%', 
                            maxWidth: '100%' 
                        }}>
                        {variants.length > 0 && (
                            <Text style={{ color: mainColor, fontFamily: 'PoppinsRegular', fontSize: moderateScale(15), marginBottom: 10 }}>Variants</Text>
                        )}
                        <View style={{ flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' }}>
                            {variants.map((s: any, index: number) => (
                                <TouchableOpacity
                                    key={`${s.label}-${s.price}-${index}`}
                                    onPress={() => { setSelectedSize(s.label); setSelectedImg(s.image); }}
                                    style={{
                                        borderWidth: selectedSize === s.label ? 2 : 0,
                                        borderColor: mainColor,
                                        borderRadius: 12,
                                        marginRight: 16,
                                        marginBottom: 8,
                                        padding: 8,
                                        alignItems: 'center',
                                        width: scale(94),
                                        height: verticalScale(100)
                                    }}
                                >
                                    <Image source={typeof s.image === 'string' ? { uri: s.image } : s.image} style={{ width: scale(65), height: verticalScale(45), borderRadius: 12, marginBottom: 6, resizeMode: 'contain' }} />
                                    <Text style={{ color: selectedSize === s.label ? mainColor : '#1A1A1A', fontFamily: 'PoppinsBold', fontSize: moderateScale(12), marginBottom: 2 }}>
                                        {s.label}
                                    </Text>
                                    {s.sale_price ? (
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{
                                                color: '#E53935',
                                                fontFamily: 'PoppinsBold',
                                                fontSize: moderateScale(12),
                                            }}>
                                                Pkr {s.sale_price}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={{
                                            color: mainColor,
                                            fontFamily: 'PoppinsBold',
                                            fontSize: moderateScale(12)
                                        }}>
                                            Pkr {s.price}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                        {variants.length > 0 && <View style={{ height: 1, backgroundColor: '#E5E5E5', marginVertical: 10 }} />}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ color: mainColor, fontFamily: 'PoppinsRegular', fontSize: moderateScale(15) }}>Quantity</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                        </View>
                        <View style={{ height: 1, backgroundColor: '#E5E5E5', marginVertical: 10 }} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ color: mainColor, fontFamily: 'PoppinsMedium', fontSize: moderateScale(15) }}>Total Price</Text>
                                <View style={{ flexDirection: 'column' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {(() => {

                                            if (variants.length > 0) {
                                                const selectedVariant = variants.find((v: Variant) => v.label === selectedSize);
                                                if (!selectedVariant) return null;

                                                const variantPrice = Number(selectedVariant.price) || 0;
                                                const variantSalePrice = selectedVariant.sale_price ? Number(selectedVariant.sale_price) : null;
                                                const displayPrice = variantSalePrice !== null ? variantSalePrice : variantPrice;
                                                const isOnSale = variantSalePrice !== null && variantSalePrice < variantPrice;

                                                return (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        {isOnSale && (
                                                            <Text style={[{
                                                                color: mainColor,
                                                                fontSize: moderateScale(15),
                                                                textDecorationLine: 'line-through',
                                                                opacity: 0.7,
                                                                fontFamily: 'PoppinsBold',
                                                                marginRight: 8
                                                            }]}>
                                                                Pkr {Math.round(selectedVariant.price * qty)}
                                                            </Text>
                                                        )}
                                                        <Text style={[{
                                                            color: isOnSale ? '#E53935' : mainColor,
                                                            fontSize: moderateScale(25),
                                                            fontFamily: 'PoppinsBold'
                                                        }]}>
                                                            {Math.round(displayPrice * qty)}/-
                                                        </Text>
                                                    </View>
                                                );
                                            }

                                            // No variants, use product price
                                            const hasSalePrice = product?.sale_price > 0;
                                            const regularPrice = Number(product?.regular_price) || 0;
                                            const salePrice = Number(product?.sale_price) || 0;
                                            const displayPrice = hasSalePrice ? salePrice : regularPrice;
                                            const isOnSale = hasSalePrice && salePrice < regularPrice;

                                            return (
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    {isOnSale ? (
                                                        <>
                                                            <Text style={[{
                                                                color: mainColor,
                                                                fontSize: moderateScale(15),
                                                                textDecorationLine: 'line-through',
                                                                opacity: 0.7,
                                                                fontFamily: 'PoppinsBold',
                                                                marginRight: 8
                                                            }]}>
                                                                Pkr {Math.round(product.regular_price * qty)}
                                                            </Text>
                                                            <Text style={[{
                                                                color: '#E53935',
                                                                fontSize: moderateScale(25),
                                                                fontFamily: 'PoppinsBold'
                                                            }]}>
                                                                {Math.round(displayPrice * qty)}/-
                                                            </Text>
                                                        </>
                                                    ) : (
                                                        <Text style={[{
                                                            color: mainColor,
                                                            fontSize: moderateScale(25),
                                                            fontFamily: 'PoppinsBold'
                                                        }]}>
                                                            Pkr {Math.round(displayPrice * qty)}/-
                                                        </Text>
                                                    )}
                                                </View>
                                            );
                                        })()}
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={{ backgroundColor: mainColor, borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 }}
                                onPress={handleAddToCart}
                            >
                                <Ionicons name="cart" size={scale(20)} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={{ color: '#fff', fontFamily: 'PoppinsMedium', fontSize: moderateScale(15) }}>Add to Cart</Text>
                            </TouchableOpacity>
                        </View>
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 5,
    },
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
        width: scale(350),
        height: verticalScale(280),
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(40),
        backgroundColor: '#fff',
        borderBottomEndRadius: 32,
        borderBottomStartRadius: 32,
    },
    productImg: {
        width: scale(220),
        height: verticalScale(220),
    },
    thumbnailRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    thumbnailWrap: {
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
        padding: 2,
        backgroundColor: '#fff',
        marginHorizontal: 2,
        marginTop: verticalScale(30)
    },
    thumbnailSelected: {
        borderColor: colors.primaryDark,
    },
    thumbnailImg: {
        width: scale(15),
        height: verticalScale(15),
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
        fontSize: moderateScale(18),
        fontFamily: 'PoppinsSemi',
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
        fontFamily: 'PoppinsBold',
        fontSize: moderateScale(15),
        textAlign: 'center',
    },
    title: {
        color: '#fff',
        fontSize: moderateScale(38),
        lineHeight: verticalScale(34),
        fontFamily: 'Sigmar',
        marginTop: 8,
    },
    pcs: {
        color: '#fff',
        fontSize: moderateScale(38),
        fontFamily: 'Sigmar',
        lineHeight: verticalScale(36),
    },
    sectionTitle: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontFamily: 'PoppinsSemi',
        marginTop: 16,
        marginBottom: 4,
    },
    details: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontFamily: 'PoppinsRegular',
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
        height: verticalScale(85),
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
        fontSize: moderateScale(15),
        fontFamily: 'PoppinsRegular',
    },
    price: {
        color: colors.primaryDark,
        fontSize: moderateScale(25),
        fontFamily: 'PoppinsBold',
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
        fontFamily: 'PoppinsSemi',
        fontSize: moderateScale(15),
    },
});


export default Products;