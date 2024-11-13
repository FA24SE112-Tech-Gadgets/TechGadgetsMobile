import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import { Divider, ScreenHeight, ScreenWidth } from "@rneui/base";
import LottieView from 'lottie-react-native';
import { Snackbar } from "react-native-paper";

// Assume these are imported from your project
import api from '../../Authorization/api';
import ErrModal from '../../CustomComponents/ErrModal';

const GadgetHistory = () => {
    const [gadgetHistory, setGadgetHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const [stringErr, setStringErr] = useState('');
    const [isError, setIsError] = useState(false);

    const navigation = useNavigation();

    const fetchGadgetHistory = useCallback(async (page = 1) => {
        if (page === 1) setIsLoading(true);
        try {
            const response = await api.get(`/gadget-histories?Page=${page}&PageSize=10`);
            const newItems = response.data.items;
            setGadgetHistory(prevItems => page === 1 ? newItems : [...prevItems, ...newItems]);
            setHasMoreData(response.data.hasNextPage);
            setCurrentPage(page);
        } catch (error) {
            console.log('Error fetching gadget history:', error);
            showSnackbar('Không thể tải lịch sử. Vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchGadgetHistory();
        }, [])
    );

    const toggleFavorite = async (gadgetId) => {
        try {
            await api.post(`/favorite-gadgets/${gadgetId}`);
            setGadgetHistory(prevHistory =>
                prevHistory.map(item =>
                    item.gadget.id === gadgetId
                        ? { ...item, gadget: { ...item.gadget, isFavorite: !item.gadget.isFavorite } }
                        : item
                )
            );
        } catch (error) {
            console.log('Error toggling favorite:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        }
    };

    const showSnackbar = (message) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
    };

    const formatCurrency = (number) => {
        if (number) {
            let numberString = number.toString();
            let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
            return formattedString;
        }
        return "";
    };

    const renderGadgetHistoryItem = ({ item }) => (
        <Pressable
            disabled={item.gadget.status !== "Active"}
            onPress={() => navigation.navigate('GadgetDetail', { gadgetId: item.gadget.id })}
        >
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.gadget.thumbnailUrl }} style={styles.image} />
                    {item.gadget.discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{item.gadget.discountPercentage}%</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={() => toggleFavorite(item.gadget.id)}
                    >
                        <AntDesign
                            name={item.gadget.isFavorite ? "heart" : "hearto"}
                            size={24}
                            color={item.gadget.isFavorite ? "red" : "black"}
                        />
                    </TouchableOpacity>
                </View>
                {(!item.gadget.isForSale && item.gadget.status === "Active") && (
                    <View style={styles.watermarkContainer}>
                        <Text style={styles.watermarkText}>Ngừng kinh doanh</Text>
                    </View>
                )}
                {(item.gadget.status !== "Active") && (
                    <View style={styles.statusWatermark}>
                        <Text style={styles.statusText}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                    </View>
                )}

                <View style={styles.detailsContainer}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {item.gadget.name}
                    </Text>
                    <View style={styles.shopInfo}>
                        <Image source={{ uri: item.gadget.brand.logoUrl }} style={styles.brandLogo} />
                        <Text style={styles.shopName} numberOfLines={1}>{item.gadget.seller.shopName}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Tình trạng: </Text>
                        <Text style={[styles.statusValue, { color: item.gadget.quantity > 0 ? "#50C346" : "#C40C0C" }]}>
                            {item.gadget.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                        </Text>
                    </View>

                    <View style={styles.priceContainer}>
                        {item.gadget.discountPercentage > 0 ? (
                            <>
                                <Text style={styles.originalPrice}>{formatCurrency(item.gadget.price)}</Text>
                                <Text style={styles.discountPrice}>{formatCurrency(item.gadget.discountPrice)}</Text>
                            </>
                        ) : (
                            <Text style={styles.discountPrice}>{formatCurrency(item.gadget.price)}</Text>
                        )}
                    </View>
                </View>
            </View>
            <Divider style={styles.divider} />
        </Pressable>
    );

    const handleLoadMore = () => {
        if (hasMoreData && !isLoading) {
            fetchGadgetHistory(currentPage + 1);
        }
    };

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.gradientContainer}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sản phẩm đã xem</Text>
            </View>

            <View style={styles.listContainer}>
                {isLoading && gadgetHistory.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <LottieView
                            source={require("../../../assets/animations/catRole.json")}
                            style={styles.lottieAnimation}
                            autoPlay
                            loop
                            speed={0.8}
                        />
                        <Text style={styles.emptyText}>Đang tải dữ liệu...</Text>
                    </View>
                ) : gadgetHistory.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <LottieView
                            source={require("../../../assets/animations/catRole.json")}
                            style={styles.lottieAnimation}
                            autoPlay
                            loop
                            speed={0.8}
                        />
                        <Text style={styles.emptyText}>Chưa có sản phẩm nào được xem</Text>
                    </View>
                ) : (
                    <FlatList
                        data={gadgetHistory}
                        renderItem={renderGadgetHistoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.1}
                        ListFooterComponent={() =>
                            isLoading && gadgetHistory.length > 0 ? (
                                <View style={styles.loadingFooter}>
                                    <LottieView
                                        source={require("../../../assets/animations/catRole.json")}
                                        style={styles.footerLottie}
                                        autoPlay
                                        loop
                                        speed={0.8}
                                    />
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0, zIndex: 1 }}
            >
                {snackbarMessage}
            </Snackbar>

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
        paddingHorizontal: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(254, 169, 40)',
        backgroundColor: 'rgba(254, 169, 40, 0.3)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(254, 161, 40, 0.5)",
        borderWidth: 1,
        borderColor: "rgb(254, 161, 40)",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
        flex: 1,
        textAlign: 'center',
    },
    listContainer: {
        flex: 1,
    },
    flatListContent: {
        padding: 10,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    lottieAnimation: {
        width: ScreenWidth,
        height: ScreenWidth / 1.5,
    },
    emptyText: {
        fontSize: 18,
        width: ScreenWidth / 1.5,
        textAlign: "center",
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: ScreenWidth / 1.05,
        alignSelf: "center",
        paddingHorizontal: 10,
        paddingVertical: 15
    },
    imageContainer: {
        width: ScreenWidth / 2.5,
        height: ScreenHeight / 7,
        borderRadius: 15,
        marginRight: 10,
        borderColor: "#ed8900",
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    image: {
        width: ScreenWidth / 3,
        height: ScreenHeight / 8,
        resizeMode: 'contain',
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        right: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    favoriteButton: {
        position: 'absolute',
        top: 0,
        left: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1,
        borderRadius: 10 + 15,
    },
    watermarkText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
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
        zIndex: 2,
        borderRadius: 10 + 15,
        paddingHorizontal: 50
    },
    statusText: {
        color: 'red',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    detailsContainer: {
        flex: 1,
    },
    name: {
        fontSize: 19,
        fontWeight: "700",
        marginBottom: 5,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    statusValue: {
        fontSize: 16,
        fontWeight: "500",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 5,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    divider: {
        marginVertical: 2,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    brandLogo: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 8,
    },
    shopName: {
        fontSize: 14,
        color: '#616161',
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerLottie: {
        width: 50,
        height: 50,
    },
});

export default GadgetHistory;