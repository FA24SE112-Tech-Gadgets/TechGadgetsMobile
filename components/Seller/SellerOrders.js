import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import api from "../Authorization/api";
import logo from "../../assets/adaptive-icon.png";
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const bannerArr = [
    { id: '1', image: 'https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/fd03b255-bb6c-4cfd-84cb-269df900b4b2.png' },
    { id: '2', image: 'https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/512a8bb8-b561-45c5-b40a-637c5734b098.png' },
    { id: '3', image: 'https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/f4a9f07b-7b35-4c9b-9893-01c1669e8d38.png' },
    { id: '4', image: 'https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/ad5f0c4e-066f-4448-b8a2-42df939462c5.png' },
];

export default function SellerOrders() {
    const [categories, setCategories] = useState([]);
    const [gadgets, setGadgets] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [favorites, setFavorites] = useState({});
    const flatListRef = useRef();
    const navigation = useNavigation();


    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data.items);
            response.data.items.forEach((category) => {
                fetchGadgets(category.id);
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGadgets = async (categoryId) => {
        try {
            const response = await api.get(`/gadgets/category/old/${categoryId}?Page=1&PageSize=20`);
            setGadgets(prev => ({ ...prev, [categoryId]: response.data.items }));
        } catch (error) {
            console.error('Error fetching gadgets:', error);
        }
    };

    const toggleFavorite = (gadgetId) => {
        setFavorites(prev => ({
            ...prev,
            [gadgetId]: !prev[gadgetId]
        }));
    };

    const renderGadget = ({ item }) => (
        <TouchableOpacity
            style={[styles.gadgetCard, { backgroundColor: '#FFFFFF' }]}
            onPress={() => navigation.navigate('GadgetDetail', { gadgetId: item.id })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.gadgetImage}
                    resizeMode="contain"
                />
                {!item.isForSale && (
                    <View style={styles.watermarkContainer}>
                        <Text style={styles.watermarkText}>Ngừng kinh doanh</Text>
                    </View>
                )}
                {item.discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(item.id)}
                >
                    <AntDesign
                        name={favorites[item.id] ? "heart" : "hearto"}
                        size={24}
                        color={favorites[item.id] ? "red" : "black"}
                    />
                </TouchableOpacity>
            </View>
            <Text style={styles.gadgetName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceContainer}>
                {item.discountPercentage > 0 ? (
                    <>
                        <Text style={styles.originalPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                        <Text style={styles.discountPrice}>{item.discountPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
                        {/* {item.discountExpiredDate && (
                <Text style={styles.expiryDate}>
                  HSD: {new Date(item.discountExpiredDate).toLocaleDateString('vi-VN')}
                </Text>
              )} */}
                    </>
                ) : (
                    <Text style={styles.gadgetPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderCategory = ({ item }) => {
        const categoryGadgets = gadgets[item.id] || [];

        return (
            <LinearGradient
                colors={['#FFFFFF', '#fea92866']}
                style={styles.categoryContainer}
            >
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.categoryUnderline} />
                <FlatList
                    data={categoryGadgets.slice(0, 20)}
                    renderItem={renderGadget}
                    keyExtractor={(gadget) => gadget.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    contentContainerStyle={styles.gadgetList}
                />
            </LinearGradient>
        );
    };

    const goToNextPage = () => {
        const nextSlide = currentSlide >= bannerArr.length - 1 ? 0 : currentSlide + 1;
        flatListRef.current.scrollToIndex({ index: nextSlide, animated: true });
        setCurrentSlide(nextSlide);
    };

    useFocusEffect(
        useCallback(() => {
            const timerId = setInterval(() => {
                goToNextPage();
            }, 4000);

            return () => {
                clearInterval(timerId);
            };
        }, [currentSlide, bannerArr])
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFFFFF', '#fea92866']}
                style={styles.header}
            >
                <View
                    style={{
                        height: 40,
                        width: 40,
                        overflow: 'hidden',
                        borderRadius: 50,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 8,
                    }}
                >
                    <Image
                        style={{
                            width: 48,
                            height: 48,
                        }}
                        source={logo}
                    />
                </View>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.searchButton}>
                        <AntDesign name="search1" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.bannerContainer}>
                <FlatList
                    data={bannerArr}
                    ref={flatListRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <Image
                            style={styles.bannerImage}
                            source={{ uri: item.image }}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                />
            </View>

            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                style={styles.categoryList}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    logo: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        width: 45,
        height: 45,
        borderRadius: 80,
        overflow: 'hidden',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 15,
        marginRight: 10,
        fontSize: 16,
    },
    searchButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        backgroundColor: '#fea128',
        borderRadius: 20,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 120,
        marginBottom: 15,
    },
    watermarkContainer: {
        position: 'absolute',
        top: 30,
        left: -8,
        right: -8,
        bottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '0deg' }],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1,
    },
    watermarkText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 4,
    },
    discountBadge: {
        position: 'absolute',
        top: 5,
        left: 5,
        backgroundColor: '#ff4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    priceContainer: {
        flexDirection: 'column',
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    expiryDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    bannerContainer: {
        height: screenWidth * 0.5,
        marginBottom: 15,
    },
    bannerImage: {
        width: screenWidth,
        height: screenWidth * 0.5,
    },
    categoryList: {
        flex: 1,
    },
    categoryContainer: {
        marginBottom: 15,
        paddingTop: 15,
        paddingBottom: 20,
        borderRadius: 10,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    categoryName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    viewAllText: {
        color: '#fea128',
        fontSize: 16,
    },
    categoryUnderline: {
        height: 2,
        backgroundColor: '#fea92866',
        marginStart: 10,
        marginBottom: 15,
    },
    gadgetList: {
        paddingHorizontal: 10,
    },
    gadgetCard: {
        width: (screenWidth - 40) / 3,
        marginHorizontal: 5,
        borderRadius: 10,
        padding: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    gadgetImage: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        marginBottom: 15,
    },
    gadgetName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
        color: '#333',
    },
    gadgetPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    favoriteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});