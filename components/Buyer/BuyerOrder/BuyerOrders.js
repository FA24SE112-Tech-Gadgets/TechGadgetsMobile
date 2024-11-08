import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TextInput,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from "../../Authorization/api";
import logo from "../../../assets/adaptive-icon.png";
import { useDebounce } from 'use-debounce';
import { Icon, ScreenHeight, ScreenWidth, Divider } from "@rneui/base";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import { Snackbar } from 'react-native-paper';
import BuyerOrderItem from './BuyerOrderItem';
import ErrModal from '../../CustomComponents/ErrModal';

export default function BuyerOrders() {
    const [buyerOrders, setBuyerOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("Pending");
    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    //Reset sort option
    useFocusEffect(
        useCallback(() => {
            setSortOption("Pending");
            setSearchQuery("");
            setCurrentPage(1);
            setBuyerOrders([]);
        }, [])
    );

    const filter = sortOption === "Success" ? `Status=Success` : sortOption === "Pending" ? `Status=Pending` : `Status=Cancelled`;

    // useFocusEffect(
    //     useCallback(() => {
    //         const init = async () => {
    //             try {
    //                 setIsFetching(true);
    //                 const res = await api.get(
    //                     `/seller-orders?${filter}&Page=${currentPage}&PageSize=10`
    //                 );
    //                 const newData = res.data.items;
    //                 setHasMoreData(res.data.hasNextPage);
    //                 setIsFetching(false);
                    
    //                 if (newData && newData.length > 0) {
    //                     setBuyerOrders((prevArray) => [...prevArray, ...newData]);
    //                 }
    //                 if (!res.data.hasNextPage) {
    //                     console.log("No more data to fetch");
    //                     return; // Stop the process if there is no more data
    //                 }
    //             } catch (error) {
    //                 console.log('Error fetching buyer orders:', error);
    //                 setSnackbarMessage("Không thể tải đơn hàng. Vui lòng thử lại sau.");
    //                 setSnackbarVisible(true);
    //             }
    //         };

    //         if (currentPage >= 1) init();
    //     }, [currentPage])
    // );

 // Seller order pagination
 const fetchBuyerOrders = async (page) => {
    try {
        setIsFetching(true);
        const res = await api.get(
            `/seller-orders?${filter}&Page=${page}&PageSize=10`
        );
        setIsFetching(false);

        const newData = res.data.items;

        if (newData && newData.length > 0) {
            const allBuyerOrders = [
                ...buyerOrders,
                ...newData.filter(
                    (newBuyerOrder) =>
                        !buyerOrders.some(
                            (existingBuyerOrder) =>
                                existingBuyerOrder.id === newBuyerOrder.id
                        )
                ),
            ];
            setBuyerOrders(allBuyerOrders);
        }

        // Update hasMoreData status
        setHasMoreData(res.data.hasNextPage);
    } catch (error) {
        setIsError(true);
        setStringErr(
            error.response?.data?.reasons[0]?.message ?
                error.response.data.reasons[0].message
                :
                "Lỗi mạng vui lòng thử lại sau"
        );
    }
}


    const handleSortOption = (option) => {
        if (option != sortOption) {
            setSortOption(option);
            setModalVisible(false);
            setBuyerOrders([]);
           
            const init = async () => {
                try {
                    setIsFetching(true);
                    const url =
                        option == "Success"
                            ? `/seller-orders?Status=Success&Page=1&PageSize=10`
                            : option == "Pending" ? `/seller-orders?Status=Pending&Page=1&PageSize=10`
                                : `/seller-orders?Status=Cancelled&Page=1&PageSize=10`;
                                
                    const res = await api.get(url);
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (newData && newData.length > 0) {
                       setBuyerOrders(newData);
                    }

                    if (!res.data.hasNextPage) {
                        setHasMoreData(false);
                    }

                } catch (error) {
                    console.log("Error fetching data:", error);
                    setStringErr(
                        error.response?.data?.reasons[0]?.message
                            ? error.response.data.reasons[0].message
                            : "Lỗi mạng vui lòng thử lại sau"
                    );
                    setIsError(true);
                }
            };

            init();
        }
    };

    const handleScroll = () => {
        if (isFetching) return; // Ngăn không gọi nếu đang fetch

        if (hasMoreData) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
            fetchBuyerOrders(nextPage); // Gọi fetchBuyerOrders với trang tiếp theo
        } else {
            setIsFetching(true);
            fetchBuyerOrders(currentPage); // Gọi fetchBuyerOrders nhưng không tăng currentPage
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchBuyerOrders(1); // Fetch new data (page 1)
        setRefreshing(false);
    };

    const renderFooter = () => {
        if (!isFetching) return null;
        return (
            <View style={styles.loaderStyle}>
                <ActivityIndicator size="large" color="#ed8900" />
            </View>
        );
    };
 
  //For refresh page when send reply
  useFocusEffect(
    useCallback(() => {
        if (refreshing) {
            setBuyerOrders([]);
            setCurrentPage(1);
            fetchBuyerOrders(1);
            setRefreshing(false);
        }
    }, [refreshing])
);  

    // Initial Fetch when component mounts
    useFocusEffect(
        useCallback(() => {
            fetchBuyerOrders(1); // Fetch the first page
        }, [])
    );

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.headerTxt}>Lịch sử đơn hàng</Text>
            </View>

            <View style={styles.filterContainer}>
                <SortModal
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    sortOption={sortOption}
                    handleSortOption={handleSortOption}
                    disabled={isError}
                />
            </View>

            <View style={styles.orderListContainer}>
                {buyerOrders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <LottieView
                            source={require("../../../assets/animations/catRole.json")}
                            style={styles.lottieAnimation}
                            autoPlay
                            loop
                            speed={0.8}
                        />
                        <Text style={styles.emptyText}>
                            {isSearching ? "Không tìm thấy đơn hàng nào" : "Không có đơn hàng nào"}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={buyerOrders}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() => navigation.navigate('BuyerOrderDetail', { orderId: item.id })}
                            >
                                <BuyerOrderItem
                                    {...item}
                                    setSnackbarMessage={setSnackbarMessage}
                                    setSnackbarVisible={setSnackbarVisible}
                                />
                                {index < buyerOrders.length - 1 && (
                                    <Divider style={{ marginVertical: 14 }} />
                                )}
                            </Pressable>
                        )}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        ListFooterComponent={renderFooter}
                        initialNumToRender={10}
                        showsVerticalScrollIndicator={false}
                        overScrollMode="never"
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                )}
            </View>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0, zIndex: 1, alignSelf: "center" }}
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
}

const SortModal = ({
    modalVisible,
    setModalVisible,
    sortOption,
    handleSortOption,
    disabled,
}) => {
    return (
        <View>
            <Pressable
                style={[
                    styles.sortButton,
                    {
                        backgroundColor: disabled ? "#cccccc" : "#ed8900",
                        borderColor: disabled ? "#999999" : "#ed8900",
                    },
                ]}
                onPress={() => setModalVisible(true)}
                disabled={disabled}
            >
                <Text style={styles.sortButtonText}>
                    {sortOption == "Success" ? "Thành công" : sortOption == "Pending" ? "Đang chờ" : "Đã hủy"}
                </Text>
                <Icon
                    type="material-community"
                    name="chevron-down"
                    size={24}
                    color="white"
                />
            </Pressable>

            {/* choose Giá thấp nhất/ Đánh giá cao nhất */}
            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                onSwipeComplete={() => setModalVisible(false)}
                useNativeDriverForBackdrop
                swipeDirection={"down"}
                propagateSwipe={true}
                style={{
                    justifyContent: 'flex-end',
                    margin: 0,
                }}
            >
                <View>
                    <View style={styles.modalContent}>
                        {/* Thanh hồng trên cùng */}
                        <View
                            style={{
                                alignItems: "center",
                                paddingBottom: 12,
                            }}
                        >
                            <View
                                style={{
                                    width: ScreenWidth / 7,
                                    height: ScreenHeight / 100,
                                    backgroundColor: "#ed8900",
                                    borderRadius: 30,
                                }}
                            />
                        </View>

                        {/* Lọc theo */}
                        <View style={[styles.modalOption]}>
                            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Lọc theo</Text>
                        </View>

                        {/* Thành công */}
                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleSortOption("Success")}
                        >
                            <Text style={styles.modalOptionText}>Thành công</Text>
                            {sortOption === "Success" ? (
                                <Icon
                                    type="material-community"
                                    name="check-circle"
                                    size={24}
                                    color="#ed8900"
                                />
                            ) : (
                                <Icon
                                    type="material-community"
                                    name="checkbox-blank-circle-outline"
                                    size={24}
                                    color="#ed8900"
                                />
                            )}
                        </Pressable>

                        {/* Đang chờ */}
                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleSortOption("Pending")}
                        >
                            <Text style={styles.modalOptionText}>Đang chờ</Text>
                            {sortOption === "Pending" ? (
                                <Icon
                                    type="material-community"
                                    name="check-circle"
                                    size={24}
                                    color="#ed8900"
                                />
                            ) : (
                                <Icon
                                    type="material-community"
                                    name="checkbox-blank-circle-outline"
                                    size={24}
                                    color="#ed8900"
                                />
                            )}
                        </Pressable>

                        {/* Đã hủy */}
                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleSortOption("Cancelled")}
                        >
                            <Text style={styles.modalOptionText}>Đã hủy</Text>
                            {sortOption === "Cancelled" ? (
                                <Icon
                                    type="material-community"
                                    name="check-circle"
                                    size={24}
                                    color="#ed8900"
                                />
                            ) : (
                                <Icon
                                    type="material-community"
                                    name="checkbox-blank-circle-outline"
                                    size={24}
                                    color="#ed8900"
                                />
                            )}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
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
    searchContainer: {
        flexDirection: "row",
        backgroundColor: "#F9F9F9",
        alignItems: "center",
        paddingHorizontal: 10,
        borderRadius: 6,
        height: ScreenWidth / 9,
        flex: 1,
    },
    searchInput: {
        fontSize: 16,
        marginLeft: 10,
        flex: 1,
    },
    logo: {
        height: 43,
        width: 43,
        borderRadius: 21.5,
        overflow: 'hidden',
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    logoImage: {
        width: 48,
        height: 48,
    },
    filterContainer: {
        flexDirection: "row",
        marginTop: 10,
    },
    orderListContainer: {
        flex: 1,
        marginTop: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    lottieAnimation: {
        width: ScreenWidth,
        height: ScreenWidth / 1.5,
    },
    emptyText: {
        fontSize: 18,
        textAlign: "center",
        width: ScreenWidth / 1.5,
    },
    loaderStyle: {
        marginVertical: 16,
        alignItems: "center",
    },
    snackbar: {
        bottom: 0,
    },
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ed8900",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    sortButtonText: {
        color: "white",
        fontWeight: "bold",
        marginRight: 4,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: "white",
        paddingVertical: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalHeader: {
        width: 40,
        height: 4,
        backgroundColor: "#ed8900",
        alignSelf: "center",
        marginBottom: 12,
        borderRadius: 2,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    modalOptionText: {
        fontSize: 16,
    },
});