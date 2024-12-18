import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import api from '../../Authorization/api';
import Modal from 'react-native-modal';
import { CheckBox } from '@rneui/themed';
import { Snackbar } from 'react-native-paper';
import ErrModal from '../../CustomComponents/ErrModal';

const BuyerCartItem = () => {
    const [sellers, setSellers] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItems, setSelectedItems] = useState({});
    const [isModalVisible, setModalVisible] = useState(false);
    const [itemsToCheckout, setItemsToCheckout] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(() => { });
    const [stringErr, setStringErr] = useState('');
    const [isError, setIsError] = useState(false);

    const [isFetching, setIsFetching] = useState(false);

    const navigation = useNavigation();

    const fetchSellers = async () => {
        try {
            const response = await api.get('/cart/sellers?Page=1&PageSize=30');
            return response.data.items;
        } catch (error) {
            console.log('Error fetching sellers:', error);
            if (error.respone?.data && error.respone?.data?.code !== "WEB_00") {
                setStringErr(
                    error.response?.data?.reasons[0]?.message ?
                        error.response.data.reasons[0].message
                        :
                        "Lỗi mạng vui lòng thử lại sau"
                );
                setIsError(true);
            }
            return [];
        }
    };

    const fetchCartItems = async (sellerId) => {
        try {
            let allItems = [];
            let page = 1;
            let hasMoreItems = true;

            while (hasMoreItems) {
                const response = await api.get(`/cart/seller/${sellerId}?Page=${page}&PageSize=30`);
                const items = response.data.items;
                allItems = [...allItems, ...items];

                if (items.length < 30) {
                    hasMoreItems = false;
                } else {
                    page++;
                }
            }

            return allItems;
        } catch (error) {
            console.log('Error fetching cart items:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
            return [];
        }
    };

    const refreshCart = async () => {
        setRefreshing(true);
        try {
            const fetchedSellers = await fetchSellers();
            const newCartItems = {};
            await Promise.all(fetchedSellers.map(async (seller) => {
                const items = await fetchCartItems(seller.id);
                if (items.length > 0) {
                    newCartItems[seller.id] = items;
                }
            }));
            setSellers(fetchedSellers.filter(seller => newCartItems[seller.id]?.length > 0));
            setCartItems(newCartItems);
        } catch (error) {
            console.log('Error refreshing cart:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
            setSellers([]);
            setCartItems({});
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            refreshCart().finally(() => setLoading(false));
        }, [])
    );

    const removeGadget = async (gadgetId) => {
        try {
            setIsFetching(true);
            await api.put('/cart/old', { gadgetId, quantity: 0 });
            setIsFetching(false);
            setSnackbarMessage('Xóa sản phẩm thành công');
            setSnackbarVisible(true);
            await refreshCart();
        } catch (error) {
            console.log('Error removing gadget:', error);
            setSnackbarMessage('Xóa sản phẩm không thành công');
            setSnackbarVisible(true);
            setIsFetching(false);
        }
    };

    const removeShop = async (sellerId) => {
        try {
            setIsFetching(true);
            await api.delete(`/cart/seller/${sellerId}`);
            await refreshCart();
            setIsFetching(false);
            setSnackbarMessage('Xóa thành công');
            setSnackbarVisible(true);
        } catch (error) {
            console.log('Error removing shop:', error);
            await refreshCart();
            setSnackbarMessage('Xóa không thành công');
            setSnackbarVisible(true);
            setIsFetching(false);
        }
    };

    const removeAll = async () => {
        try {
            setIsFetching(true);
            await api.delete('https://tech-gadgets-dev.xyz/api/cart/clear');
            setIsFetching(false);
            await refreshCart();
            setSnackbarMessage('Đã xóa tất cả sản phẩm');
            setSnackbarVisible(true);
            setEditMode(false);
        } catch (error) {
            console.log('Error removing all items:', error);
            setSnackbarMessage('Không thể xóa tất cả sản phẩm');
            setSnackbarVisible(true);
            setIsFetching(false);
        }
    };

    const updateGadgetQuantity = async (gadgetId, newQuantity) => {
        try {
            setIsFetching(true);
            await api.put('/cart/old', { gadgetId, quantity: newQuantity });
            setIsFetching(false);
            await refreshCart();
        } catch (error) {
            console.log('Error updating gadget quantity:', error);
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

    const toggleItemSelection = (sellerId, gadgetId) => {
        // setSelectedItems(prevState => ({
        //     ...prevState,
        //     [sellerId]: {
        //         ...prevState[sellerId],
        //         [gadgetId]: !prevState[sellerId]?.[gadgetId]
        //     }
        // }));
        const item = cartItems[sellerId]?.find(item => item.gadget.id === gadgetId);

        // Kiểm tra điều kiện trước khi thay đổi trạng thái
        if (item && item.gadget.status !== "Inactive" && item.gadget.isForSale === true) {
            setSelectedItems(prevState => ({
                ...prevState,
                [sellerId]: {
                    ...prevState[sellerId],
                    [gadgetId]: !prevState[sellerId]?.[gadgetId]
                }
            }));
        }
    };

    const toggleShopSelection = (sellerId) => {
        // const allSelected = cartItems[sellerId]?.every(item => selectedItems[sellerId]?.[item.gadget.id]);
        // setSelectedItems(prevState => ({
        //     ...prevState,
        //     [sellerId]: cartItems[sellerId]?.reduce((acc, item) => {
        //         acc[item.gadget.id] = !allSelected;
        //         return acc;
        //     }, {})
        // }));
        const allSelected = cartItems[sellerId]?.every(item => {
            if (selectedItems[sellerId]?.[item.gadget.id] ||
                item.gadget.status !== "Inactive" && item.gadget.isForSale === true) {
                return selectedItems[sellerId]?.[item.gadget.id]
            }
        });

        setSelectedItems(prevState => ({
            ...prevState,
            [sellerId]: cartItems[sellerId]?.reduce((acc, item) => {
                if (item.gadget.status !== "Inactive" && item.gadget.isForSale === true) {
                    acc[item.gadget.id] = !allSelected;
                }
                return acc;
            }, {})
        }));
    };

    const toggleAllSelection = () => {
        // const allSelected = sellers.every(seller =>
        //     cartItems[seller.id]?.every(item => selectedItems[seller.id]?.[item.gadget.id])
        // );
        // const newSelectedItems = {};
        // sellers.forEach(seller => {
        //     newSelectedItems[seller.id] = {};
        //     cartItems[seller.id]?.forEach(item => {
        //         newSelectedItems[seller.id][item.gadget.id] = !allSelected;
        //     });
        // });
        // setSelectedItems(newSelectedItems);
        const allSelected = sellers.every(seller =>
            cartItems[seller.id]?.every(item => {
                if (selectedItems[seller.id]?.[item.gadget.id] ||
                    item.gadget.status !== "Inactive" && item.gadget.isForSale === true) {
                    return selectedItems[seller.id]?.[item.gadget.id]
                }
            }
            )
        );

        const newSelectedItems = {};
        sellers.forEach(seller => {
            newSelectedItems[seller.id] = {};
            cartItems[seller.id]?.forEach(item => {
                if (item.gadget.status !== "Inactive" && item.gadget.isForSale === true) {
                    newSelectedItems[seller.id][item.gadget.id] = !allSelected;
                }
            });
        });
        setSelectedItems(newSelectedItems);
    };

    const getSelectedItemsCount = () => {
        return Object.values(selectedItems).reduce((total, sellerItems) =>
            total + Object.values(sellerItems).filter(Boolean).length, 0
        );
    };

    const calculateTotalPrice = () => {
        let total = 0;
        Object.entries(selectedItems).forEach(([sellerId, sellerItems]) => {
            cartItems[sellerId]?.forEach(item => {
                if (sellerItems[item.gadget.id]) {
                    total += item.gadget.discountPrice * item.quantity;
                }
            });
        });
        return total;
    };

    const handleCheckout = () => {
        const itemsToCheckout = [];
        Object.entries(selectedItems).forEach(([sellerId, sellerItems]) => {
            Object.entries(sellerItems).forEach(([gadgetId, isSelected]) => {
                if (isSelected) {
                    itemsToCheckout.push(gadgetId);
                }
            });
        });
        setItemsToCheckout(itemsToCheckout);
        setTotalPrice(calculateTotalPrice());
        setModalVisible(true);
    };

    const confirmCheckout = async () => {
        try {
            setIsFetching(true);
            await api.post('/order', { listGadgetItems: itemsToCheckout });
            setIsFetching(false);
            setItemsToCheckout([]);
            setTotalPrice(0);
            setSelectedItems({});
            setModalVisible(false);
            await refreshCart();
            setSnackbarMessage('Đặt hàng thành công');
            setSnackbarVisible(true);
        } catch (error) {
            console.log('Error creating order:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        }
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const showConfirmModal = (action, message) => {
        setConfirmAction(() => action);
        setConfirmModalVisible(true);
    };

    const renderGadgetItem = useCallback(({ item, index, sellerId }) => (
        <View>
            <TouchableOpacity
                style={[
                    styles.gadgetItem,
                    index === cartItems[sellerId].length - 1 && styles.lastGadgetItem
                ]}
                key={`${sellerId}-${item.gadget.id}-${index}`}
                onPress={() => navigation.navigate('GadgetDetail', { gadgetId: item.gadget.id })}
            >
                <CheckBox
                    checked={selectedItems[sellerId]?.[item.gadget.id] || false}
                    disabled={!item.gadget.isForSale || item.gadget.status !== "Active"}
                    onPress={() => toggleItemSelection(sellerId, item.gadget.id)}
                    containerStyle={styles.checkbox}
                    uncheckedColor={(!item.gadget.isForSale || item.gadget.status !== "Active") ? "white" : undefined}
                />
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.gadget.thumbnailUrl }} style={styles.gadgetImage} />

                </View>
                <View style={styles.gadgetInfo}>
                    <Text style={styles.gadgetName} numberOfLines={2}>{item.gadget.name}</Text>
                    <View style={styles.priceContainer}>
                        {item.gadget.discountPercentage > 0 ? (
                            <View style={{
                                flexDirection: "column"
                            }}>
                                <View style={{
                                    flexDirection: "row"
                                }}>
                                    <Text style={styles.originalPrice}>{item.gadget.price.toLocaleString('vi-VN')} ₫</Text>
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-{item.gadget.discountPercentage}%</Text>
                                    </View>
                                </View>
                                <Text style={styles.discountPrice}>{item.gadget.discountPrice.toLocaleString('vi-VN')} ₫</Text>
                            </View>
                        ) : (
                            <Text style={styles.gadgetPrice}>{item.gadget.price.toLocaleString('vi-VN')} ₫</Text>
                        )}
                    </View>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            disabled={!item.gadget.isForSale || item.gadget.status !== "Active" || isFetching}
                            onPress={
                                () => {
                                    if (item.quantity - 1 == 0) {
                                        showConfirmModal(() => removeGadget(item.gadget.id), 'Bạn có chắc chắn muốn xóa sản phẩm này?')
                                    } else {
                                        updateGadgetQuantity(item.gadget.id, Math.max(1, item.quantity - 1))
                                    }
                                }
                            }
                        >
                            <AntDesign name="minuscircleo" size={24} color={(!item.gadget.isForSale || item.gadget.status !== "Active" || isFetching) ? "rgba(0, 0, 0, 0.5)" : "#ed8900"} />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                            disabled={!item.gadget.isForSale || item.gadget.status !== "Active" || isFetching}
                            onPress={() => updateGadgetQuantity(item.gadget.id, item.quantity + 1)}
                        >
                            <AntDesign name="pluscircleo" size={24} color={(!item.gadget.isForSale || item.gadget.status !== "Active" || isFetching) ? "rgba(0, 0, 0, 0.5)" : "#ed8900"} />
                        </TouchableOpacity>
                    </View>
                </View>
                {editMode && (
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => showConfirmModal(() => removeGadget(item.gadget.id), 'Bạn có chắc chắn muốn xóa sản phẩm này?')}
                    >
                        <AntDesign name="delete" size={24} color="rgb(210, 65, 82)" />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
            {(!item.gadget.isForSale && item.gadget.status === "Active" && !editMode) && (
                <TouchableOpacity
                    style={styles.watermarkContainer}
                    onPress={() => navigation.navigate('GadgetDetail', { gadgetId: item.gadget.id })}
                >
                    <Text style={styles.watermarkText}>Ngừng bán</Text>
                </TouchableOpacity>
            )}
            {(item.gadget.status !== "Active" && !editMode) && (
                <View style={styles.statusWatermark}>
                    <Text style={styles.statusText}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                </View>
            )}
        </View>
    ), [selectedItems, toggleItemSelection, updateGadgetQuantity, removeGadget, editMode, navigation, cartItems]);

    const renderShopItem = useCallback(({ item: seller, index }) => (
        <View style={styles.shopContainer} key={`${seller.id}-${index}`}>
            <View style={styles.shopHeader}>
                <CheckBox
                    checked={cartItems[seller.id]?.every(item => selectedItems[seller.id]?.[item.gadget.id]) || false}
                    onPress={() => toggleShopSelection(seller.id)}
                    containerStyle={styles.checkbox}
                />
                <Text style={styles.shopName}>{seller.shopName}</Text>
                {editMode && (
                    <TouchableOpacity onPress={() => showConfirmModal(() => removeShop(seller.id), 'Bạn có chắc chắn muốn xóa cửa hàng này?')}>
                        <Text style={styles.removeShopText}>Xóa cửa hàng</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={cartItems[seller.id] || []}
                renderItem={({ item, index }) => renderGadgetItem({ item, index, sellerId: seller.id })}
                keyExtractor={(item, index) => `${seller.id}-${item.gadget.id}-${index}`}
            />
        </View>
    ), [cartItems, selectedItems, toggleShopSelection, renderGadgetItem, removeShop, editMode]);

    if (loading) {
        return (
            <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                    <LottieView
                        source={require("../../../assets/animations/catRole.json")}
                        style={styles.loadingAnimation}
                        autoPlay
                        loop
                        speed={0.8}
                    />
                    <Text style={styles.loadingText}>Đang load dữ liệu</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#FFFFFF', '#fea92866']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.headerTxt}>Giỏ hàng của tôi</Text>
            </View>

            <FlatList
                data={sellers}
                renderItem={renderShopItem}
                keyExtractor={(item, index) => `seller-${item.id}-${index}`}
                ListHeaderComponent={
                    sellers.length > 0 && Object.keys(cartItems).length > 0 ? (
                        <View style={styles.headerContainer}>
                            <View style={styles.selectAllContainer}>
                                <CheckBox
                                    checked={sellers.every((seller) =>
                                        cartItems[seller.id]?.every(
                                            (item) => selectedItems[seller.id]?.[item.gadget.id]
                                        )
                                    )}
                                    onPress={() => {
                                        toggleAllSelection()
                                    }}
                                    title="Chọn tất cả"
                                    containerStyle={styles.selectAllCheckbox}
                                />
                            </View>
                            <TouchableOpacity style={styles.editButton} onPress={toggleEditMode}>
                                <Text style={styles.editButtonText}>{editMode ? 'Xong' : 'Chỉnh sửa'}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyCartContainer}>
                        <LottieView
                            source={require('../../../assets/animations/catRole.json')}
                            autoPlay
                            loop
                            style={styles.emptyCartAnimation}
                        />
                        <Text style={styles.emptyCartText}>Giỏ hàng trống</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refreshCart} />
                }
            />

            {sellers.length > 0 && (
                <View style={styles.bottomContainer}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Đã chọn: {getSelectedItemsCount()} sản phẩm</Text>
                        <Text style={styles.totalPriceText}>Tổng tiền: {calculateTotalPrice().toLocaleString('vi-VN')} ₫</Text>
                    </View>
                    {editMode ? (
                        <TouchableOpacity
                            style={styles.removeAllButton}
                            onPress={() => showConfirmModal(removeAll, 'Bạn có chắc chắn muốn xóa tất cả sản phẩm?')}
                            disabled={isFetching}
                        >
                            <Text style={styles.removeAllButtonText}>Xóa tất cả</Text>
                            {
                                isFetching &&
                                <ActivityIndicator color={"white"} />
                            }
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.checkoutButton, (getSelectedItemsCount() === 0 || isFetching) && styles.disabledButton]}
                            onPress={handleCheckout}
                            disabled={getSelectedItemsCount() === 0 || isFetching}
                        >
                            <Text style={styles.checkoutButtonText}>Thanh toán</Text>
                            {
                                isFetching &&
                                <ActivityIndicator color={"white"} />
                            }
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Xác nhận thanh toán</Text>
                    <Text style={styles.modalText}>Bạn có chắc chắn muốn thanh toán {itemsToCheckout.length} sản phẩm đã chọn?</Text>
                    <Text style={styles.modalTotalPrice}>Tổng tiền: {totalPrice.toLocaleString('vi-VN')} ₫</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            disabled={isFetching}
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            disabled={isFetching}
                            style={[styles.modalButton, styles.confirmButton, isFetching && styles.disabledButton]}
                            onPress={confirmCheckout}
                        >
                            <Text style={styles.modalButtonText}>Xác nhận</Text>
                            {
                                isFetching &&
                                <ActivityIndicator color={"white"} />
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal isVisible={confirmModalVisible} onBackdropPress={() => setConfirmModalVisible(false)}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Xác nhận</Text>
                    <Text style={styles.modalText}>Bạn có chắc chắn muốn thực hiện hành động này?</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            disabled={isFetching}
                            style={styles.modalButton}
                            onPress={() => setConfirmModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            disabled={isFetching}
                            style={[styles.modalButton, styles.confirmButton]}
                            onPress={() => {
                                confirmAction();
                                setConfirmModalVisible(false);
                            }}
                        >
                            <Text style={styles.modalButtonText}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        height: ScreenHeight / 1.5,
    },
    loadingContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingAnimation: {
        width: ScreenWidth,
        height: ScreenWidth / 1.5,
    },
    loadingText: {
        fontSize: 18,
        width: ScreenWidth / 1.5,
        textAlign: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 16,
        borderWidth: 1,
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
        fontWeight: "500"
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 10,
    },
    selectAllContainer: {
        flex: 1,
    },
    editButton: {
        padding: 10,
    },
    editButtonText: {
        color: '#ed8900',
        fontWeight: '600',
    },
    shopContainer: {
        backgroundColor: 'white',
        margin: 10,
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
    shopHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    shopName: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    removeShopText: {
        color: 'rgb(210, 65, 82)',
    },
    gadgetItem: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 10,
        alignItems: 'center',
    },
    lastGadgetItem: {
        borderBottomWidth: 0,
    },
    imageContainer: {
        position: 'relative',
        width: 80,
        height: 80,
    },
    gadgetImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
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
        zIndex: 10,
        borderRadius: 10,
    },
    watermarkText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
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
        color: 'rgb(210, 65, 82)',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    gadgetInfo: {
        flex: 1,
        marginLeft: 10,
    },
    gadgetName: {
        fontSize: 14,
        fontWeight: '500',
    },
    priceContainer: {
        marginTop: 5,
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
        marginRight: 5,
    },
    discountBadge: {
        transform: [{ rotate: '0deg' }],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    gadgetPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 16,
    },
    removeButton: {
        justifyContent: 'center',
        paddingHorizontal: 10,
        zIndex: 1,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: ScreenHeight * 0.7,
    },
    emptyCartAnimation: {
        width: ScreenWidth * 0.7,
        height: ScreenWidth * 0.7,
    },
    emptyCartText: {
        fontSize: 18,
        marginTop: 20,
    },
    checkbox: {
        padding: 0,
        margin: 0,
        marginRight: 10,
    },
    selectAllCheckbox: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        margin: 0,
    },
    bottomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalContainer: {
        flex: 1,
    },
    totalText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalPriceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
        marginTop: 5,
    },
    checkoutButton: {
        backgroundColor: '#ed8900',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        minWidth: 120,
        justifyContent: "center"
    },
    checkoutButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    removeAllButton: {
        backgroundColor: 'rgb(210, 65, 82)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        minWidth: 120,
        flexDirection: "row",
        gap: 10,
        justifyContent: "center"
    },
    removeAllButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flexDirection: "row",
        gap: 10
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        alignSelf: "center"
    },
    modalText: {
        fontSize: 16,
        marginBottom: 15,
    },
    modalTotalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ed8900',
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    modalButton: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        minWidth: 100,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#ed8900',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default BuyerCartItem;