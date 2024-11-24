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
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from "../../Authorization/api";
import logo from "../../../assets/adaptive-icon.png";
import { useDebounce } from 'use-debounce';
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import ErrModal from '../../CustomComponents/ErrModal';
import SellerOrderItem from './../SellerOrder/SellerOrderItem';
import { Snackbar } from 'react-native-paper';

export default function SellerOrders() {
    const [sellerOrders, setSellerOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const navigation = useNavigation();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchBounceString] = useDebounce(searchQuery, 1000);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("Pending");

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [isSearching, setIsSearching] = useState(false);

    //Reset sort option and search query
    useFocusEffect(
        useCallback(() => {
            setSortOption("Pending")
            setSearchQuery("");
            setCurrentPage(1);
            setSellerOrders([]);
        }, [])
    );

    const filter = sortOption == "Success" ? `Status=Success` : sortOption == "Pending" ? `Status=Pending` : `Status=Cancelled`;

    // Search sellerOrders
    useFocusEffect(
        useCallback(() => {
            setCurrentPage(1);

            if (searchBounceString === "") {
                setIsSearching(false);
            } else {
                setIsSearching(true);
            }

            const fetchItems = async () => {
                try {
                    setIsFetching(true);
                    const res = await api.get(
                        `/seller-orders?${filter}&CustomerPhoneNumber=${searchBounceString}&Page=1&PageSize=10`
                    );
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (newData == null || newData.length == 0) {
                        setSellerOrders([])
                        return; // Stop the process if there is no more data
                    }

                    setSellerOrders(newData);
                } catch (error) {
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
            fetchItems();
        }, [searchBounceString])
    );

    // Seller order pagination
    const fetchSellerOrders = async (page) => {
        try {
            setIsFetching(true);
            const res = await api.get(
                `/seller-orders?${filter}&CustomerPhoneNumber=${searchBounceString}&Page=${page}&PageSize=10`
            );
            setIsFetching(false);

            const newData = res.data.items;

            if (newData && newData.length > 0) {
                const allSellerOrders = [
                    ...sellerOrders,
                    ...newData.filter(
                        (newSellerOrder) =>
                            !sellerOrders.some(
                                (existingSellerOrder) =>
                                    existingSellerOrder.id === newSellerOrder.id
                            )
                    ),
                ];
                setSellerOrders(allSellerOrders);
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
            setIsFetching(false);
        }
    }

    const handleSortOption = (option) => {
        if (option != sortOption) {
            setSortOption(option);
            setModalVisible(false);
            setSellerOrders([]);
            const init = async () => {
                try {
                    setIsFetching(true);
                    const url =
                        option == "Success"
                            ? `/seller-orders?Status=Success&CustomerPhoneNumber=${searchBounceString}&Page=1&PageSize=10`
                            : option == "Pending" ? `/seller-orders?Status=Pending&CustomerPhoneNumber=${searchBounceString}&Page=1&PageSize=10`
                                : `/seller-orders?Status=Cancelled&CustomerPhoneNumber=${searchBounceString}&Page=1&PageSize=10`;
                    const res = await api.get(url);
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (newData && newData.length > 0) {
                        setSellerOrders(newData);
                    }

                    if (!res.data.hasNextPage) {
                        setHasMoreData(false);
                    }

                } catch (error) {
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

            init();
        }
    };

    const handleScroll = () => {
        if (isFetching) return; // Ngăn không gọi nếu đang fetch

        if (hasMoreData) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
            fetchSellerOrders(nextPage); // Gọi fetchSellerOrders với trang tiếp theo
        } else {
            setIsFetching(true);
            fetchSellerOrders(currentPage); // Gọi fetchSellerOrders nhưng không tăng currentPage
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchSellerOrders(1); // Fetch new data (page 1)
        setRefreshing(false);
    };

    const renderFooter = () => {
        if (!isFetching) return null;
        return (
            <View style={{
                padding: 5,
                alignItems: 'center'
            }}>
                <ActivityIndicator color={"#ed8900"} />
            </View>
        );
    };

    //For refresh page when send reply
    useFocusEffect(
        useCallback(() => {
            if (refreshing) {
                setSellerOrders([]);
                setCurrentPage(1);
                fetchSellerOrders(1);
                setRefreshing(false);
            }
        }, [refreshing])
    );

    // Initial Fetch when component mounts
    useFocusEffect(
        useCallback(() => {
            fetchSellerOrders(1); // Fetch the first page
        }, [])
    );

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={{ flex: 1, paddingTop: 10, paddingHorizontal: 10 }}>
            {/* Search bar */}
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 5,
                alignItems: "center"
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
                        placeholder={"Nhập sđt"}
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

            {/* Filter Sort */}
            <View style={{ flexDirection: "row", marginTop: 10 }}>
                <SortModal
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    sortOption={sortOption}
                    handleSortOption={handleSortOption}
                    disabled={isError}
                />
            </View>

            <View
                style={{
                    height: ScreenHeight / 1.25,
                }}
            >
                {sellerOrders.length === 0 ? (
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
                                {isFetching ? "Đang tìm kiếm đơn hàng" : isSearching ? "Không tìm thấy đơn hàng nào" : "Không có đơn hàng nào"}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ marginBottom: 20, marginTop: 16 }}>
                        <FlatList
                            data={sellerOrders}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate('SellerOrderDetail', { sellerOrderId: item.id })
                                    }
                                >
                                    <SellerOrderItem
                                        {...item}
                                        setSnackbarMessage={setSnackbarMessage}
                                        setSnackbarVisible={setSnackbarVisible}
                                    />
                                    {index < sellerOrders.length - 1 && (
                                        <Divider style={{ marginVertical: 14 }} />
                                    )}
                                </TouchableOpacity>
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
                    </View>
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
    )
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
                    {sortOption == "Success" ? "Đã giao" : sortOption == "Pending" ? "Chờ xử lý" : "Đã hủy"}
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

                        {/* Đã giao */}
                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleSortOption("Success")}
                        >
                            <Text style={styles.modalOptionText}>Đã giao</Text>
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

                        {/* Chờ xử lý */}
                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleSortOption("Pending")}
                        >
                            <Text style={styles.modalOptionText}>Chờ xử lý</Text>
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
    sortButton: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderColor: "#FB6562",
        borderWidth: 2,
        borderRadius: 20,
        backgroundColor: "#FB6562",
    },
    sortButtonText: {
        fontWeight: "bold",
        fontSize: 18,
        color: "white",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        paddingVertical: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    modalOptionText: {
        fontSize: 16,
    },
});