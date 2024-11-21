import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native';
import api from "../../Authorization/api";
import logo from "../../../assets/adaptive-icon.png";
import { useNavigation } from '@react-navigation/native';
import { useDebounce } from 'use-debounce';
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import ErrModal from '../../CustomComponents/ErrModal';
import LottieView from 'lottie-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function SellerHome() {
    const [categories, setCategories] = useState([]);
    const [gadgets, setGadgets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchBounceString] = useDebounce(searchQuery, 1000);

    const [isFetching, setIsFetching] = useState(false);
    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const navigation = useNavigation();

    const fetchCategories = async () => {
        try {
            setIsFetching(true);
            const response = await api.get('/categories');
            setCategories(response.data.items);
            response.data.items.forEach((category) => {
                fetchGadgets(category.id);
            });
            setIsFetching(false);
        } catch (error) {
            console.log('Error fetching categories:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchGadgets = async (categoryId) => {
        try {
            setIsFetching(true);
            const response = await api.get(`/gadgets/category/${categoryId}/current-seller?Name=${searchBounceString}&Page=${currentPage}&PageSize=10`);
            setIsFetching(false);

            setGadgets(prev => {
                const updatedGadgets = { ...prev, [categoryId]: response.data.items };
                checkIfEmpty(updatedGadgets); // Kiểm tra sau khi cập nhật
                return updatedGadgets;
            });
        } catch (error) {
            console.log('Error fetching gadgets:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
            setIsFetching(false);
        }
    };

    const checkIfEmpty = (updatedGadgets) => {
        const isAllEmpty = Object.values(updatedGadgets).every(gadgetList => gadgetList.length === 0);
        setIsEmpty(isAllEmpty);
    };

    const renderGadget = ({ item }) => (
        <TouchableOpacity
            style={[styles.gadgetCard, { backgroundColor: '#FFFFFF' }]}
            onPress={() => navigation.navigate('GadgetSellerDetail', { gadgetId: item.id })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.gadgetImage}
                    resizeMode="contain"
                />
                {(!item.isForSale && item.gadgetStatus === "Active") && (
                    <View style={styles.watermarkContainer}>
                        <Text style={styles.watermarkText}>Ngừng bán</Text>
                    </View>
                )}
                {item.discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                    </View>
                )}
            </View>
            {(item.gadgetStatus !== "Active") && (
                <View style={styles.statusWatermark}>
                    <Text style={styles.statusText}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                </View>
            )}
            <Text style={styles.gadgetName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceContainer}>
                {item.discountPercentage > 0 ? (
                    <>
                        <Text style={styles.originalPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                        <Text style={styles.discountPrice}>{item.discountPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
                    </>
                ) : (
                    <Text style={styles.gadgetPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderCategory = ({ item }) => {
        const categoryGadgets = gadgets[item.id] || [];

        if (categoryGadgets.length <= 0) {
            return null;
        }

        return (
            <LinearGradient
                colors={['#FFFFFF', '#fea92866']}
                style={styles.categoryContainer}
            >
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <TouchableOpacity onPress={() =>
                        navigation.navigate("SellerGadgetByCategory", { categoryId: item.id })
                    }>
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

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setCategories([]);
            setGadgets({});
            setCurrentPage(1);
            setSearchQuery("");
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [searchBounceString])
    );

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.container}>
            {/* Search bar */}
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 5,
                alignItems: "center",
                paddingHorizontal: 10,
                marginVertical: 10
            }}>
                <View
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#F9F9F9",
                        alignItems: "center",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        columnGap: 12,
                        borderRadius: 6,
                        height: ScreenWidth / 9,
                        flex: 1
                    }}
                >
                    <Icon type="font-awesome" name="search" size={23} color={"#ed8900"} />
                    <TextInput
                        placeholder={"Tìm kiếm sản phẩm"}
                        returnKeyType="search"
                        style={{ fontSize: 20, width: ScreenWidth / 1.7, textAlign: "left" }}
                        value={searchQuery}
                        onChangeText={(query) => setSearchQuery(query)}
                    />
                </View>

                {/* Logo */}
                <View
                    style={{
                        height: 43,
                        width: 43,
                        overflow: 'hidden',
                        borderRadius: 50,
                        justifyContent: "center",
                        alignItems: "center",
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
            </View>

            {(categories.length === 0 || (isEmpty && !isFetching) || isFetching) ? (
                <View
                    style={{
                        flex: 1,
                        height: ScreenHeight / 1.5,
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <LottieView
                            source={require("../../../assets/animations/catRole.json")}
                            style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                            autoPlay
                            loop
                            speed={0.8}
                        />
                        <Text
                            style={{
                                fontSize: 18,
                                width: ScreenWidth / 1.5,
                                textAlign: "center",
                            }}
                        >
                            {isFetching ? "Đang load dữ liệu" : isEmpty && "Không tìm thấy sản phẩm nào"}
                        </Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.id}
                    style={styles.categoryList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </LinearGradient>
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
    statusWatermark: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 10,
        paddingHorizontal: 15
    },
    statusText: {
        color: 'red',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    discountBadge: {
        position: 'absolute',
        top: 5,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: "grey"
    },
    discountText: {
        color: 'grey',
        fontSize: 12,
        fontWeight: '500',
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