import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import api from '../../Authorization/api';
import { useNavigation } from '@react-navigation/native';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import LottieView from 'lottie-react-native';
import { Snackbar } from "react-native-paper";

const { width } = Dimensions.get('window');

const EmptyStateView = ({ message }) => (
    <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
            <LottieView
                source={require("../../../assets/animations/catRole.json")}
                style={styles.lottieAnimation}
                autoPlay
                loop
                speed={0.8}
            />
            <Text style={styles.emptyText}>{message}</Text>
        </View>
    </LinearGradient>
);

const FavoriteList = () => {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const navigation = useNavigation();
    
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
            await api.post(`/favorite-gadgets/${gadgetId}`);
            setFavorites(favorites.filter(item => item.gadget.id !== gadgetId));
            showSnackbar('Đã xóa khỏi danh sách yêu thích');
        } catch (error) {
            console.log('Error deleting favorite:', error);
            showSnackbar('Không thể xóa. Vui lòng thử lại');
        }
    };

    const deleteAllFavorites = async () => {
        try {
            await api.delete('/favorite-gadgets');
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

    const renderFavoriteItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => !isEditMode && navigation.navigate('GadgetDetail', { gadgetId: item.gadget.id })}
        >
            <Image source={{ uri: item.gadget.thumbnailUrl }} style={styles.thumbnail} />
            {item.gadget.discountPercentage > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>-{item.gadget.discountPercentage}%</Text>
                </View>
            )}
            <View style={styles.infoContainer}>
                <Text style={styles.gadgetName} numberOfLines={2}>{item.gadget.name}</Text>
                <View style={styles.priceContainer}>
                    {item.gadget.discountPercentage > 0 ? (
                        <>
                            <Text style={styles.originalPrice}>{item.gadget.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                            <Text style={styles.discountPrice}>{item.gadget.discountPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
                        </>
                    ) : (
                        <Text style={styles.gadgetPrice}>{item.gadget.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                    )}
                </View>
                <View style={styles.shopInfo}>
                    <Image source={{ uri: item.gadget.brand.logoUrl }} style={styles.brandLogo} />
                    <Text style={styles.shopName} numberOfLines={1}>{item.gadget.seller.shopName}</Text>
                </View>
                <View style={styles.badgeContainer}>
                    <Text style={[styles.badge, { backgroundColor: item.gadget.isForSale ? '#4CAF50' : '#F44336' }]}>
                        {item.gadget.isForSale ? 'Đang bán' : 'Ngừng kinh doanh'}
                    </Text>
                    <Text style={[styles.badge, { backgroundColor: '#2196F3' }]}>{item.gadget.condition}</Text>
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
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (isLoading) {
            return <EmptyStateView message="Đang load dữ liệu" />;
        }

        if (favorites.length === 0) {
            return <EmptyStateView message="Danh sách yêu thích trống" />;
        }

        return (
            <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.gadget.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    return (
        <LinearGradient colors={['#FFFFFF', '#fea92866']} style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
              
                    <Text style={styles.headerTxt}>Danh sách yêu thích</Text>
               
                {favorites.length > 0 && (
                    <TouchableOpacity
                        onPress={() => setIsEditMode(!isEditMode)}
                        style={styles.editButton}
                    >
                        <Text style={styles.editButtonText}>{isEditMode ? 'Xong' : 'Chỉnh sửa'}</Text>
                    </TouchableOpacity>
                )}
                {favorites.length === 0 && <View style={styles.editButton} />}
            </View>
            {renderContent()}
            {isEditMode && favorites.length > 0 && (
                <TouchableOpacity
                    style={styles.deleteAllButton}
                    onPress={deleteAllFavorites}
                >
                    <Text style={styles.deleteAllText}>Xóa tất cả</Text>
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
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        padding: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderColor: 'rgb(254, 169, 40)',
        backgroundColor: 'rgba(254, 169, 40, 0.3)',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(254, 161, 40, 0.5)",
        borderWidth: 1,
        borderColor: "rgb(254, 161, 40)",
    },
    headerTxt: {
        fontSize: 18,
        fontWeight: "500",
        flex: 1,
    },
    editButton: {
        width: 70,
        alignItems: 'flex-end',
    },
    editButtonText: {
        color: '#fea128',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContent: {
        alignItems: 'center',
    },
    lottieAnimation: {
        width: ScreenWidth,
        height: ScreenWidth / 1.5,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 10,
    },
    listContainer: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    thumbnail: {
        width: 120,
        height: 120,
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#E53935',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
        padding: 12,
    },
    gadgetName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: '#999',
        textDecorationLine: 'line-through',
        marginRight: 8,
    },
    discountPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    gadgetPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
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
    badgeContainer: {
        flexDirection: 'row',
    },
    badge: {
        fontSize: 12,
        color: 'white',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 4,
    },
    deleteButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
    },
    deleteAllButton: {
        backgroundColor: '#E53935',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteAllText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default FavoriteList;