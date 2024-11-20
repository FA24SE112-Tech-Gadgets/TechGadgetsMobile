import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import api from '../../Authorization/api';
import { useNavigation } from '@react-navigation/native';
import { Divider, ScreenHeight, ScreenWidth } from '@rneui/base';
import LottieView from 'lottie-react-native';
import { Snackbar } from "react-native-paper";

const FavoriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigation = useNavigation();

    const [isFetching, setIsFetching] = useState(false);

    const fetchFavorites = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/favorite-gadgets?Page=1&PageSize=40');
            setFavorites(response.data.items);
        } catch (error) {
            console.log('Error fetching favorites:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);


    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const deleteFavorite = async (gadgetId) => {
        try {
            setIsFetching(true);
            await api.post(`/favorite-gadgets/${gadgetId}`);
            setIsFetching(false);
            setFavorites(favorites.filter(item => item.gadget.id !== gadgetId));
            showSnackbar('Đã xóa khỏi danh sách yêu thích');
        } catch (error) {
            console.log('Error deleting favorite:', error);
            showSnackbar('Không thể xóa. Vui lòng thử lại');
        }
    };

    const deleteAllFavorites = async () => {
        try {
            setIsFetching(true);
            await api.delete('/favorite-gadgets');
            setIsFetching(false);
            setFavorites([]);
            showSnackbar('Đã xóa tất cả khỏi danh sách yêu thích');
        } catch (error) {
            console.log('Error deleting all favorites:', error);
            showSnackbar('Không thể xóa tất cả. Vui lòng thử lại');
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

    const renderFavoriteItem = ({ item }) => (
        <Pressable
            disabled={item.gadget.status !== "Active"}
            onPress={() => !isEditMode && navigation.navigate('GadgetDetail', { gadgetId: item.gadget.id })}
        >
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.gadget.thumbnailUrl }} style={styles.image} />
                    {item.gadget.discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{item.gadget.discountPercentage}%</Text>
                        </View>
                    )}
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
                        <Text
                            style={styles.shopName}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >{item.gadget.seller.shopName}</Text>
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
                {isEditMode && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteFavorite(item.gadget.id)}
                    >
                        <AntDesign name="delete" size={24} color="#E53935" />
                    </TouchableOpacity>
                )}
            </View>
            <Divider style={styles.divider} />
        </Pressable>
    );

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.gradientContainer}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
                {favorites.length > 0 ? (
                    <TouchableOpacity
                        onPress={() => setIsEditMode(!isEditMode)}
                        style={styles.editButton}
                    >
                        <Text style={styles.editButtonText}>{isEditMode ? 'Xong' : 'Chỉnh sửa'}</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.editButton} />
                )}
            </View>

            <View style={styles.listContainer}>
                {isLoading ? (
                    <View style={styles.emptyContainer}>
                        <LottieView
                            source={require("../../../assets/animations/catRole.json")}
                            style={styles.lottieAnimation}
                            autoPlay
                            loop
                            speed={0.8}
                        />
                        <Text style={styles.emptyText}>Đang load dữ liệu...</Text>
                    </View>
                ) : favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <LottieView
                            source={require("../../../assets/animations/catRole.json")}
                            style={styles.lottieAnimation}
                            autoPlay
                            loop
                            speed={0.8}
                        />
                        <Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
                    </View>
                ) : (
                    <FlatList
                        data={favorites}
                        renderItem={renderFavoriteItem}
                        keyExtractor={(item) => item.gadget.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                    />
                )}
            </View>

            {isEditMode && favorites.length > 0 && (
                <TouchableOpacity
                    style={styles.deleteAllButton}
                    onPress={deleteAllFavorites}
                    disabled={isFetching}
                >
                    <Text style={styles.deleteAllText}>Xóa tất cả</Text>
                    {
                        isFetching &&
                        <ActivityIndicator color={"white"} />
                    }
                </TouchableOpacity>
            )}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0, zIndex: 1 }}
            >
                {snackbarMessage}
            </Snackbar>
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
    editButton: {
        width: 70,
        alignItems: 'flex-end',
    },
    editButtonText: {
        color: '#fea128',
        fontWeight: '600',
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
        paddingVertical: 15,
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
        transform: [{ rotate: '0deg' }],
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
    deleteButton: {
        padding: 10,
        zIndex: 3,
    },
    divider: {
        marginVertical: 2,
    },
    deleteAllButton: {
        backgroundColor: '#E53935',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: "row",
        borderRadius: 10,
        gap: 10,
        marginBottom: 10,
        width: ScreenWidth / 1.1,
        alignSelf: "center"
    },
    deleteAllText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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
        width: ScreenWidth / 2.5
    },
});

export default FavoriteList;