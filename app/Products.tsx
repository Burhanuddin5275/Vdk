import RenderHtml from '@/components/RenderHtml';
import { selectIsAuthenticated, selectPhone } from '@/store/authSlice';
import { useAppSelector } from '@/store/hooks';
import { colors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from './Wishlist';
import { useMemo } from 'react';
import RenderHTML from 'react-native-render-html';
import { fetchUsers, UserItem } from '@/services/user';
const backgroundImages = {
    ss1: require('../assets/images/ss1.png'),
    ss2: require('../assets/images/ss2.png'),
};
interface Product {
    id: string;
    name: string;
    img?: string;
    img1?: string;
    img2?: string;
    brand?: string;
    pts?: number;
    stock_status?: string;
    regular_price?: number;
    cost_price?: number;
    quantity?: number;
    sale_price?: number;
    description?: string;
    is_active: boolean;
    rating?: number;
    gallery_images?: Array<{
        id: number;
        image: string;
    }>;
    gallery_image?: any[];
    variants?: Array<{
        id?: number;
        stock?: number;
        price: string | number;
        sale_price?: string | number;
        image?: string;
        is_active?:boolean;
        attributes?: any;
        [key: string]: any;
    }>;
    variant?: any[];
    [key: string]: any;
}

const Products = () => {
    const router = useRouter();
    const { id, data, category, backgroundImage } = useLocalSearchParams();
    const [product, setProduct] = useState(data ? JSON.parse(data as string) : {});
    // Get all possible image sources, prioritizing gallery_images if available
    const getImageSources = () => {
        const galleryImages = product.gallery_images?.map((img: any) => img.image) || [];
        const fallbackImages = [product.img, product.img1, product.img2].filter(Boolean);
        return [...galleryImages, ...fallbackImages].filter(Boolean);
    };

    const images = getImageSources();
    const [selectedImg, setSelectedImg] = useState(images[0] || '');
    const [modalVisible, setModalVisible] = useState(false);
    interface Variant {
        id?: number;
        label: string;
        price: number;
        sale_price?: number;
        image?: any;
        stock?: number;
    }
    interface gallery_image {
        id?: number;
        image?: any;
    }
    const processVariants = () => {
        const rawVariants = product.variant || product.variants || [];
        if (!Array.isArray(rawVariants)) return [];

        const variantMap = new Map();
        let uniqueIdCounter = 1;

        rawVariants.forEach((v: any, index: number) => {
            if (v?.attributes) {
                const attrObj = v.attributes;

                // Remove non-display fields
                const { points, description, ...rest } = attrObj;

                const optionValues = Object.values(rest).map(String).filter(Boolean);
                const entries = Object.entries(rest).filter(([_, v]) => v);
                const label = optionValues.join(' - ') || 'Default';

                const variantId = v.id || `variant-${uniqueIdCounter++}`;
                const variantKey = `${variantId}-${label}`;

                variantMap.set(variantKey, {
                    id: variantId,
                    label, // keep for fallback
                    attributes: entries, // 👈 ADD THIS
                    price: Number(v.price || 0),
                    ...(v.sale_price ? { sale_price: Number(v.sale_price) } : {}),
                    description: attrObj.description || '',
                    points: Number(attrObj.points) || 0,
                    image: v.image || v.img || product.img,
                    is_active: v.is_active ?? true,
                    stock: v.stock !== undefined ? Number(v.stock) : undefined
                });

            } else {
                const label = v?.label || v?.name || v?.pack || String(v?.size || v?.title || '');
                if (!label) return;

                const variantId = v.id || `variant-${uniqueIdCounter++}`;
                const variantKey = `${variantId}-${label}`;
                if (!variantMap.has(variantKey)) {
                    variantMap.set(variantKey, {
                        id: variantId,
                        label,
                        price: Number(v.regular_price || v.price || v.amount || 0),
                        ...(v.sale_price ? { sale_price: Number(v.sale_price) } : {}),
                        description: v.description || '',
                        points: v.points || 0,
                        image: v.image || v.img || product.img,
                        is_active: v.is_active ?? true,
                        stock: v.stock !== undefined ? Number(v.stock) : undefined
                    });
                }
            }
        });

        return Array.from(variantMap.values());
    };
    const variants = processVariants();

    let priceRange = null;
    if (variants.length > 1 && (!product.regular_price || product.regular_price === 0)) {
        const prices = variants.map(v => v.sale_price ?? v.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice !== maxPrice) {
            priceRange = { min: minPrice, max: maxPrice };
        }
    }
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id?.toString() || '');
    const [selectedSize, setSelectedSize] = useState(variants[0]?.label || '');
    const [qty, setQty] = useState(1);
    const [users, setUsers] = useState<UserItem[]>([]);
    const [userId, setUserId] = useState<string | number | null>(null);
    const addToCart = useCartStore((state: any) => state.addToCart);
    const selectedVariant = variants.find(
        (v: any) => v.id?.toString() === selectedVariantId
    );
    const isVariantInactive = selectedVariant?.is_active === false;
    const [showSuccess, setShowSuccess] = useState(false);
    const wishlistItems = useWishlistStore(state => state.items);
    const [wishlistMessage, setWishlistMessage] = useState<string | null>(null);
    const [cartMessage, setCartMessage] = useState<string | null>(null);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const phone = useAppSelector(selectPhone);
    const cartItems = useCartStore(state => state.cartItems);



    // Calculate if product is out of stock
    const isOutOfStock =  product?.stock_status === 'outofstock';

    let bgKey;
    if (Array.isArray(backgroundImage)) {
        if (backgroundImage[0] === 'ss1' || backgroundImage[0] === 'ss2') bgKey = backgroundImage[0];
    } else if (backgroundImage === 'ss1' || backgroundImage === 'ss2') {
        bgKey = backgroundImage;
    }

    const mainColor = bgKey === 'ss2' ? '#0B3D0B' : '#E53935';

    const { width } = useWindowDimensions();
    const cleanedHTML = product?.description
        ?.replace(/!important/g, "")
        .replace(/background-[^;]+;/g, "")
        .replace(/font-variant-[^;]+;/g, "")
        .replace(/font-family:[^;]+;/g, "") || "";



    const handleAddToCart = async () => {
        if (!isAuthenticated || !phone) {
            setCartMessage('Please log in to add items to your cart.');
            const currentRoute = `/Products?id=${id}&data=${encodeURIComponent(data as any)}&category=${category}&backgroundImage=${backgroundImage}`;
            setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
            return;
        }

        if (selectedVariant?.stock !== undefined) {
            if (selectedVariant.stock <= 0) {
                setCartMessage('This variant is out of stock.');
                setTimeout(() => setCartMessage(null), 2000);
                return;
            } else if (qty > selectedVariant.stock) {
                const available = selectedVariant.stock;
                setCartMessage(`Only ${available} item${available === 1 ? '' : 's'} available in stock.`);
                setTimeout(() => setCartMessage(null), 2000);
                return;
            }
        } else if (product?.stock_status === 'outofstock') {
            setCartMessage('Product is out of stock.');
            setTimeout(() => setCartMessage(null), 2000);
            return;
        }

        const variantPrice = selectedVariant?.price ?? 0;
        const variantSalePrice = selectedVariant?.sale_price;
        const imageForCart = selectedVariant?.image || selectedImg;

        const cartItem = {
            id: product.id,
            name: product.name,
            pack: selectedVariant?.label || '',
            cost_price: product.cost_price,
            price: variantSalePrice || variantPrice || product.sale_price || product.regular_price || 0,
            sale_price: variantSalePrice || product.sale_price || undefined,
            points: selectedVariant?.points !== undefined ? selectedVariant.points : product.pts,
            stock: selectedVariant?.stock !== undefined ? selectedVariant.stock : product.quantity,
            image: imageForCart,
            user: phone,
            variant: selectedVariant ? {
                price: variantPrice,
                sale_price: variantSalePrice,
            } : undefined,
            quantity: qty,
        };

        console.log('Attempting to add to cart:', JSON.stringify(cartItem, null, 2));

        try {
            await addToCart(cartItem);
            console.log('Successfully added to cart');
            setModalVisible(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            let errorMessage = 'Failed to add to cart';

            if (error instanceof Error) {
                const errorLower = error.message.toLowerCase();

                if (errorLower.includes('stock') || errorLower.includes('available') || errorLower.includes('exceed')) {
                    // Extract the available quantity if mentioned in the error
                    const quantityMatch = error.message.match(/\d+/);
                    if (quantityMatch) {
                        const availableQty = quantityMatch[0];
                        errorMessage = `Only ${availableQty} item${availableQty === '1' ? ' is' : 's are'} available in stock`;
                    } else {
                        errorMessage = 'Not enough items in stock';
                    }
                }
            }

            setTimeout(() => setCartMessage(null), 3000);
        }
    };

    const insets = useSafeAreaInsets();
    const cartItemCount = useCartStore(state =>
        state.cartItems
            .filter((item) => String(item.user) === String(phone))
            .reduce((sum, item) => sum + item.quantity, 0)
    );
    useEffect(() => {
        if (!images.length) return;

        const interval = setInterval(() => {
            setSelectedImg((prev: any) => {
                const currentIndex = images.findIndex(img => img === prev);
                const nextIndex = currentIndex + 1 >= images.length ? 0 : currentIndex + 1;
                return images[nextIndex];
            });
        }, 6000);

        return () => clearInterval(interval);
    }, [images]);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const res = await fetchUsers();
                setUsers(res || []);
            } catch (error) {
                console.error('Error loading users:', error);
            }
        };

        loadUsers();
    }, []);
    const reviews = product?.reviews || [];

    const totalReviews = reviews.length;

    const ratingCounts = [1, 2, 3, 4, 5].map(star => {
        return reviews.filter((r: any) => Number(r.rating) === star).length;
    });

    const avgRating =
        totalReviews > 0
            ? reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / totalReviews
            : 0;

    const roundedStars = Math.round(avgRating);

    return (
        <SafeAreaView style={{ flex: 1, paddingBottom: Math.max(insets.bottom, verticalScale(4)) }}>
            <ImageBackground source={bgKey ? (backgroundImages as any)[bgKey] : require('../assets/images/ss1.png')} style={{ flex: 1 }} resizeMode="cover">
                <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                    <View style={[styles.header, { justifyContent: 'space-between', paddingHorizontal: 16 }]}>
                        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={28} color={mainColor} />
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!isAuthenticated) {
                                        setCartMessage('Please log in to view your cart.');
                                        const currentRoute = `/Products?id=${id}&data=${encodeURIComponent(data as any)}&category=${category}&backgroundImage=${backgroundImage}`;
                                        setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
                                        return;
                                    }
                                    router.push('/(tabs)/Cart');
                                }}
                            >
                                <Ionicons name="cart-outline" size={24} color={mainColor} />
                                {cartItemCount > 0 && (
                                    <View style={{
                                        position: 'absolute',
                                        right: -6,
                                        top: -6,
                                        backgroundColor: 'red',
                                        borderRadius: 10,
                                        width: 18,
                                        height: 18,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                                            {cartItemCount > 9 ? '9+' : cartItemCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ marginLeft: scale(10) }}
                                onPress={async () => {
                                    if (!isAuthenticated) {
                                        setWishlistMessage('Please log in to use wishlist.');
                                        setTimeout(() => setWishlistMessage(null), 1000);
                                        const currentRoute = `/Products?id=${id}&data=${encodeURIComponent(data as any)}&category=${category}&backgroundImage=${backgroundImage}`;
                                        setTimeout(() => router.replace(`/Login?returnTo=${encodeURIComponent(currentRoute)}`), 1000);
                                        return;
                                    }

                                    const inWishlist = wishlistItems.some((w) => w.id === product.id);

                                    if (inWishlist) {
                                        await useWishlistStore.getState().removeFromWishlist(product.id);
                                        setWishlistMessage('Removed from wishlist');
                                    } else {
                                        const selectedVariantLabel = selectedVariant?.label || '';

                                        await useWishlistStore.getState().addToWishlist({
                                            id: product.id,
                                            name: product.name,
                                            regular_price: selectedVariant?.price ?? product.regular_price ?? 0,
                                            sale_price: selectedVariant?.sale_price ?? product.sale_price,
                                            image: product.img || product.image || selectedImg,
                                            pack: selectedVariantLabel,
                                            category: product.Category || (category),
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
                                <Ionicons
                                    name={wishlistItems.some((w) => w.id === product.id) ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={wishlistItems.some((w) => w.id === product.id) ? 'red' : mainColor}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.imageWrap}>
                        <Image
                            source={typeof selectedImg === 'string' ? { uri: selectedImg } : selectedImg}
                            style={styles.productImg}
                            resizeMode="contain"
                        />

                        <View style={styles.thumbnailRow}>
                            {images.map((img, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSelectedImg(img)}
                                    style={[
                                        styles.thumbnailWrap,
                                        selectedImg === img && styles.thumbnailSelected
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Image
                                        source={typeof img === 'string' ? { uri: img } : img}
                                        style={styles.thumbnailImg}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    {/* Card Section */}
                    <View style={styles.cardSection}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            {product.brand && <Text style={styles.brand}><Text style={{ fontFamily: 'PoppinsBold', fontSize: moderateScale(20) }}>Brand:</Text> {product.brand}</Text>}

                            {/* ✅ Show ONLY when no variants */}
                            {variants.length === 0 && product.pts !== undefined && (
                                <View style={styles.ptsBadge}>
                                    <Text style={[styles.ptsText, { color: mainColor }]}>
                                        {product.pts} PTS
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.title}>{product.name}</Text>

                        {/* ✅ Only show when NO variants */}
                        {variants.length === 0 && (
                            <>
                                {product.quantity !== undefined && (
                                    <Text style={styles.pcs}>{product.quantity} pcs</Text>
                                )}
                            </>
                        )}
                        <Text style={styles.sectionTitle}>Product Details</Text>
                        <RenderHtml html={cleanedHTML} style={styles.details} />
                        <View style={styles.divider} />
                        <Text style={styles.sectionTitle}>Reviews</Text>

                        {/* Top Summary */}
                        <View style={{ flexDirection: 'row', marginBottom: 16 }}>

                            {/* LEFT: Breakdown */}
                            <View style={{ flex: 1 }}>
                                {[5, 4, 3, 2, 1].map((star, index) => {
                                    const count = ratingCounts[star - 1];
                                    const percentage = totalReviews ? (count / totalReviews) * 100 : 0;

                                    return (
                                        <View key={star} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>

                                            <Text style={{ color: '#d6b627ff', width: 30 }}>
                                                {star}★
                                            </Text>

                                            <View style={{
                                                flex: 1,
                                                height: 6,
                                                backgroundColor: 'white',
                                                borderRadius: 4,
                                                marginHorizontal: 8,
                                                overflow: 'hidden'
                                            }}>
                                                <View style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    backgroundColor: '#d6b627ff'
                                                }} />
                                            </View>

                                            <Text style={{ color: '#ccc', width: 30, textAlign: 'right' }}>
                                                {count}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* RIGHT: Average */}
                            <View style={{ width: 90, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 28, color: '#fff', fontFamily: 'PoppinsBold' }}>
                                    {avgRating.toFixed(1)}
                                </Text>
                                <Text style={{ color: '#d6b627ff' }}>
                                    {Array(roundedStars).fill('★').join('')}
                                </Text>
                                <Text style={{ color: '#ccc', fontSize: 12 }}>
                                    {totalReviews} reviews
                                </Text>
                            </View>

                        </View>
                        {reviews.length > 0 ? (
                            reviews.map((review: any) => {
                                const reviewDate = new Date(review.created_at).toLocaleDateString();
                                const matchedUser = users.find(u => String(u.id) === String(review.user));
                                return (
                                    <View key={review.id} style={{ marginBottom: 16 }}>

                                        {/* Top Row */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                                            {/* LEFT: User */}
                                            <Text style={{
                                                color: '#fff',
                                                fontFamily: 'PoppinsBold',
                                                fontSize: 14
                                            }}>
                                                {matchedUser?.name || `User #${review.user}`}
                                            </Text>

                                            {/* RIGHT: Date */}
                                            <Text style={{
                                                color: '#ccc',
                                                fontSize: 12
                                            }}>
                                                {reviewDate}
                                            </Text>
                                        </View>

                                        {/* Comment */}
                                        <Text style={{
                                            color: '#fff',
                                            fontSize: 14,
                                            marginTop: 6,
                                            marginRight: 60 // space for rating on right
                                        }}>
                                            {review.comment}
                                        </Text>

                                        {/* Rating on right */}
                                        <View style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: 24
                                        }}>
                                            <Text style={{ color: '#FFD600', fontSize: 14 }}>
                                                {Array(review.rating).fill('★').join('')}
                                            </Text>
                                        </View>

                                        {/* Divider */}
                                        <View style={{
                                            height: 1,
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            marginTop: 12
                                        }} />
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={{ color: '#ccc', fontSize: 14 }}>
                                No reviews yet
                            </Text>
                        )}
                    </View>
                </ScrollView>
                {/* Price & Add to Cart */}
                <View style={styles.bottomBar}>
                    <View>
                        {variants.length === 0 ? (
                            <Text style={[styles.priceLabel, { color: mainColor }]}>
                                Total Price
                            </Text>
                        ) : (
                            <Text style={[styles.priceLabel, { color: mainColor }]}>
                                Price Starting From
                            </Text>
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: scale(150) }}>
                            {priceRange ? (
                                <Text style={[styles.price, { color: mainColor, fontSize: moderateScale(18) }]} numberOfLines={1}>
                                    {`Rs ${priceRange.min} - ${priceRange.max}`}
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
                                <>
                                    <Text
                                        style={{
                                            color: mainColor,
                                            fontFamily: 'PoppinsRegular',
                                            fontSize: moderateScale(15),
                                            marginBottom: 10,
                                        }}
                                    >
                                        Variants
                                    </Text>

                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 4 }}
                                        style={{ marginBottom: 16 }}
                                    >
                                        <View style={{ flexDirection: 'row' }}>
                                            {variants.map((s, index) => {
                                                const isSelected = s.id?.toString() === selectedVariantId;

                                                return (
                                                    <TouchableOpacity
                                                        key={`${s.label}-${s.price}-${index}`}
                                                        onPress={() => {
                                                            setSelectedVariantId(s.id?.toString() || '');
                                                            setSelectedImg(s.image);
                                                        }}
                                                        activeOpacity={0.8}
                                                        style={{
                                                            borderWidth: isSelected ? 2 : 1,
                                                            borderColor: isSelected ? mainColor : '#ddd',
                                                            borderRadius: 12,
                                                            marginRight: 12,
                                                            padding: 10,
                                                            alignItems: 'center',
                                                            width: scale(100),
                                                            minHeight: verticalScale(120),
                                                            backgroundColor: '#fff',
                                                        }}
                                                    >
                                                        <View style={{ position: 'relative' }}>
                                                            <Image
                                                                source={
                                                                    typeof s.image === 'string'
                                                                        ? { uri: s.image }
                                                                        : s.image
                                                                }
                                                                style={{
                                                                    width: scale(100),
                                                                    height: verticalScale(80),
                                                                    borderRadius: 8,
                                                                    resizeMode: 'contain',
                                                                }}
                                                            />

                                                            {/* ✅ PTS Badge Top Right */}
                                                            {s.points !== undefined && (
                                                                <View
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: -6,
                                                                        right: -6,
                                                                        backgroundColor: '#fff',
                                                                        paddingHorizontal: 6,
                                                                        paddingVertical: 2,
                                                                        borderRadius: 8,
                                                                        elevation: 2,
                                                                    }}
                                                                >
                                                                    <Text
                                                                        style={{
                                                                            fontSize: 10,
                                                                            color: mainColor,
                                                                            fontFamily: 'PoppinsBold',
                                                                        }}
                                                                    >
                                                                        {s.points} pts
                                                                    </Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View style={{ alignItems: 'center' }}>
                                                            {s.attributes.map(([key, value]: any, i: number) => (
                                                                <Text key={i} style={{ fontSize: 10, textAlign: 'center' }}>
                                                                    <Text style={{ color: '#000', fontFamily: 'PoppinsBold' }}>
                                                                        {key}{' '}
                                                                    </Text>
                                                                    <Text style={{ color: '#E53935', fontFamily: 'PoppinsBold' }}>
                                                                        {value}
                                                                    </Text>
                                                                </Text>
                                                            ))}
                                                        </View>
                                                        {/* Price */}
                                                        {s.sale_price ? (
                                                            <Text
                                                                style={{
                                                                    color: '#E53935',
                                                                    fontFamily: 'PoppinsBold',
                                                                    fontSize: moderateScale(12),
                                                                    marginTop: 4,
                                                                }}
                                                            >
                                                                Rs {s.sale_price}
                                                            </Text>
                                                        ) : (
                                                            <Text
                                                                style={{
                                                                    color: mainColor,
                                                                    fontFamily: 'PoppinsBold',
                                                                    fontSize: moderateScale(12),
                                                                    marginTop: 4,
                                                                }}
                                                            >
                                                                Rs {s.price}
                                                            </Text>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </>
                            )}
                            {selectedVariant?.description ? (
                                <View style={styles.variantDescriptionContainer}>
                                    <Text style={[styles.variantDescriptionTitle, { color: mainColor }]}>
                                        Description
                                    </Text>
                                    <Text style={styles.variantDescriptionText} numberOfLines={5}>
                                        {selectedVariant.description}
                                    </Text>
                                </View>
                            ) : null}
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
                                        style={[{
                                            backgroundColor: '#E5E5E5',
                                            borderRadius: 6,
                                            width: 32,
                                            height: 32,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginLeft: 12,
                                        }]}
                                        onPress={() => setQty(q => q + 1)}
                                    >
                                        <Ionicons
                                            name="add"
                                            size={20}
                                            color={mainColor}
                                        />
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

                                                const hasSalePrice = product?.sale_price || 0;
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
                                                                    Pkr {Math.round(product.regular_price || 0 * qty)}
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
                               {isOutOfStock || isVariantInactive ? (
                                    <View style={[{
                                        backgroundColor: 'gray',
                                        borderRadius: 24,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingHorizontal: 22, 
                                        paddingVertical: 12
                                    }]}>
                                        <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#fff', fontFamily: 'PoppinsMedium', fontSize: moderateScale(15) }}>
                                            Out of stock
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={handleAddToCart}
                                        style={{
                                            backgroundColor: mainColor,
                                            borderRadius: 24,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: 22,
                                            paddingVertical: 12
                                        }}
                                    >
                                        <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={{ color: '#fff', fontFamily: 'PoppinsMedium', fontSize: moderateScale(15) }}>
                                            Add to Cart
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            )}
            {showSuccess && (
                <View style={{ position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                    <View style={{ backgroundColor: mainColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                        <Text style={{ color: '#fff', fontFamily: 'PoppinsBold', fontSize: 16 }}>Product added to cart!</Text>
                    </View>
                </View>
            )}
            {/* Cart Message */}
            {cartMessage && (
                <View style={{ position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                    <View style={{ backgroundColor: '#ff4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{cartMessage}</Text>
                    </View>
                </View>
            )}

            {/* Wishlist Message */}
            {wishlistMessage && (
                <View style={{ position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                    <View style={{ backgroundColor: mainColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{wishlistMessage}</Text>
                    </View>
                </View>
            )}
            {cartMessage && (
                <View style={{ position: 'absolute', top: 40, left: 0, right: 0, alignItems: 'center', zIndex: 20 }}>
                    <View style={{ backgroundColor: mainColor, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{cartMessage}</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    outOfStockContainer: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8
    },
    outOfStockText: {
        fontFamily: 'PoppinsMedium',
        fontSize: 16,
    },
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
        borderBottomEndRadius: 20,
        borderBottomStartRadius: 20,
    },
    productImg: {
        width: scale(340),
        height: verticalScale(250),
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
        backgroundColor: '#fff',
        marginHorizontal: 2,
    },
    thumbnailSelected: {
        borderColor: colors.primaryDark,
    },
    thumbnailImg: {
        width: scale(45),
        height: verticalScale(45),
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
        fontSize: moderateScale(16),
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
        fontSize: moderateScale(25),
        lineHeight: verticalScale(25),
        fontFamily: 'Sigmar',
        marginTop: 8,
    },
    pcs: {
        color: '#fff',
        fontSize: moderateScale(28),
        fontFamily: 'Sigmar',
        lineHeight: verticalScale(30),
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
        fontSize: moderateScale(12),
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
    variantDescriptionContainer: {
        marginTop: 8,
        marginBottom: 12,
    },

    variantDescriptionTitle: {
        fontSize: moderateScale(14),
        fontFamily: 'PoppinsSemi',
        marginBottom: 4,
    },

    variantDescriptionText: {
        fontSize: moderateScale(13),
        fontFamily: 'PoppinsRegular',
        color: '#333',
        lineHeight: 18,
    },
});


export default Products;
