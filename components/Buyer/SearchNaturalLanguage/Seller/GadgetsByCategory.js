import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native';
import api from "../../../Authorization/api";
import { AntDesign } from '@expo/vector-icons';
import { useDebounce } from 'use-debounce';
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import ErrModal from '../../../CustomComponents/ErrModal';
import GadgetSearchItem from '../Gadget/GadgetSearchItem';
import { Snackbar } from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';

export default function GadgetsByCategory({ navigation, route }) {
    const { categoryId, sellerId } = route.params;

    const [seller, setSeller] = useState(null);

    const [gadgets, setGadgets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchBounceString] = useDebounce(searchQuery, 1000);

    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("PRICE");

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        setSnackbarMessage("Sao chép thành công");
        setSnackbarVisible(true);
    };

    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [isSearching, setIsSearching] = useState(false);

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setGadgets([]);
            setCurrentPage(1);
            setSearchQuery("");
            setSortOption("PRICE");
        }, [])
    );

    const filter = sortOption == "PRICE" ? `SortColumn=price` : `SortColumn=name`;

    const fetchSellerDetail = async () => {
        try {
            setIsFetching(true);
            const res = await api.get(
                `/sellers/${sellerId}`
            );
            setIsFetching(false);

            const newData = res.data;

            if (newData) {
                setSeller(newData);
            } else {
                setSeller(null);
            }
        } catch (error) {
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        }
    }

    // Search gadgets
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
                    const res = await api.get(
                        `/gadgets/categories/${categoryId}/sellers/${sellerId}?Name=${searchBounceString}&${filter}&Page=1&PageSize=10`
                    );
                    const newData = res.data.items;

                    if (newData == null || newData.length == 0) {
                        setGadgets([])
                        return; // Stop the process if there is no more data
                    }

                    setGadgets(newData);
                } catch (error) {
                    setIsError(true);
                    setStringErr(
                        error.response?.data?.reasons[0]?.message ?
                            error.response.data.reasons[0].message
                            :
                            "Lỗi mạng vui lòng thử lại sau"
                    );
                }
            };
            fetchItems();
        }, [searchBounceString])
    );

    // Fetch seller data
    useFocusEffect(
        useCallback(() => {
            fetchSellerDetail();
        }, [])
    );

    const handleSortOption = (option) => {
        if (option != sortOption) {
            setSortOption(option);
            setModalVisible(false);
            setGadgets([]);
            setCurrentPage(1);
            const init = async () => {
                try {
                    setIsFetching(true);
                    const url =
                        option == "PRICE"
                            ? `/gadgets/categories/${categoryId}/sellers/${sellerId}?Name=${searchBounceString}&SortColumn=price&Page=1&PageSize=10`
                            : `/gadgets/categories/${categoryId}/sellers/${sellerId}?Name=${searchBounceString}&SortColumn=name&Page=1&PageSize=10`;
                    const res = await api.get(url);
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (newData && newData.length > 0) {
                        setGadgets(newData);
                    }

                    if (!res.data.hasNextPage) {
                        setHasMoreData(false);
                    }

                } catch (error) {
                    setIsError(true);
                    setStringErr(
                        error.response?.data?.reasons[0]?.message ?
                            error.response.data.reasons[0].message
                            :
                            "Lỗi mạng vui lòng thử lại sau"
                    );
                }
            };

            init();
        }
    };

    // Gadget pagination
    const fetchGadgets = async (page) => {
        try {
            setIsFetching(true);
            const res = await api.get(
                `/gadgets/categories/${categoryId}/sellers/${sellerId}?Name=${searchBounceString}&${filter}&Page=${page}&PageSize=10`
            );
            setIsFetching(false);

            const newData = res.data.items;

            if (newData && newData.length > 0) {
                const allGadgets = [
                    ...gadgets,
                    ...newData.filter(
                        (newGadget) =>
                            !gadgets.some(
                                (existingGadget) =>
                                    existingGadget.id === newGadget.id
                            )
                    ),
                ];
                setGadgets(allGadgets);
            }

            // Update hasMoreData status
            setHasMoreData(res.data.hasNextPage);
        } catch (error) {
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        }
    }

    const handleScroll = () => {
        if (isFetching) return; // Ngăn không gọi nếu đang fetch

        if (hasMoreData) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
            fetchGadgets(nextPage); // Gọi fetchGadgets với trang tiếp theo
        } else {
            setIsFetching(true);
            fetchGadgets(currentPage); // Gọi fetchGadgets nhưng không tăng currentPage
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchGadgets(1); // Fetch new data (page 1)
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
                setGadgets([]);
                setCurrentPage(1);
                fetchGadgets(1);
                setRefreshing(false);
            }
        }, [refreshing])
    );

    // Initial Fetch when component mounts
    useFocusEffect(
        useCallback(() => {
            fetchGadgets(1); // Fetch the first page
        }, [])
    );

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={{ flex: 1 }}>
            <View style={{
                backgroundColor: "rgba(254, 169, 40, 0.8)",
                paddingHorizontal: 10,
                paddingVertical: 10,
                gap: 10,
            }}>
                {/* Search bar */}
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 5,
                    alignItems: "center",
                }}>
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                    >
                        <AntDesign name="arrowleft" size={35} color="#ed8900" />
                    </TouchableOpacity>
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
                </View>

                {/* Seller detail */}
                <View style={{
                    flexDirection: "row",
                    gap: 10,
                    alignSelf: "center",
                    paddingHorizontal: 10
                }}>
                    {/* Shop avatar */}
                    <View
                        style={{
                            height: 45,
                            width: 45,
                            borderRadius: 30,
                            backgroundColor: "#ed8900",
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: 1,
                            borderColor: "white"
                        }}
                    >
                        <Text style={{ fontSize: 25, fontWeight: "bold", color: "white" }}>
                            {seller !== null ? seller.shopName?.charAt(0) : "G"}
                        </Text>
                    </View>

                    <View style={{
                        backgroundColor: "#112A46",
                        padding: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "white"
                    }}>
                        {/* ShopName */}
                        <Text style={{
                            fontWeight: "500",
                            marginBottom: 3,
                            overflow: "hidden",
                            color: "#ed8900"
                        }} numberOfLines={1} ellipsizeMode="tail">
                            {seller !== null ? seller.shopName : "Người dùng hệ thống"}{seller?.companyName ? ` - ${seller.companyName}` : ""}
                        </Text>

                        {/* Shop address */}
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingVertical: 5,
                            gap: 5
                        }}>
                            <Text
                                style={{
                                    color: "white",
                                    fontWeight: "500",
                                    width: ScreenWidth / 1.9,
                                }}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >{seller !== null ? seller.shopAddress : "Người bán chưa cập nhật địa chỉ"}</Text>
                            <TouchableOpacity
                                disabled={seller !== null ? false : true}
                                onPress={() => copyToClipboard(seller?.shopAddress)}
                            >
                                <Text style={{ color: "#ed8900", fontSize: 15, fontWeight: "500" }}>Sao chép</Text>
                            </TouchableOpacity>
                        </View>

                        {/* phoneNumber */}
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingVertical: 5,
                            gap: 5
                        }}>
                            <Text style={{
                                color: "white",
                                fontWeight: "500"
                            }}>Số điện thoại: {seller !== null ? seller.phoneNumber : "Chưa cung cấp"}</Text>
                            <TouchableOpacity
                                disabled={seller !== null ? false : true}
                                onPress={() => copyToClipboard(seller?.phoneNumber)}
                            >
                                <Text style={{ color: "#ed8900", fontSize: 15, fontWeight: "500" }}>Sao chép</Text>
                            </TouchableOpacity>
                        </View>

                        {/* businessModel */}
                        <Text style={{
                            color: "white",
                            fontWeight: "500"
                        }}>Mô hình kinh doanh: {seller?.businessModel === "Personal" ? "Cá nhân" : seller?.businessModel === "BusinessHousehold" ? "Hộ kinh doanh" : "Công ty"}</Text>
                    </View>
                </View>
            </View>

            <View style={{ flex: 1, paddingTop: 10, paddingHorizontal: 10 }}>
                {/* Filter Sort */}
                <View style={{ flexDirection: "row" }}>
                    <SortModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        sortOption={sortOption}
                        handleSortOption={handleSortOption}
                        disabled={gadgets.length == 0}
                    />
                </View>

                <View
                    style={{
                        height: ScreenHeight / 1.45,
                    }}
                >
                    {gadgets.length === 0 ? (
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
                                    source={require("../../../../assets/animations/catRole.json")}
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
                                    {isSearching ? "Không tìm thấy sản phẩm" : "Không có sản phẩm nào"}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={{ marginTop: 16 }}>
                            <FlatList
                                data={gadgets}
                                keyExtractor={item => item.id}
                                renderItem={({ item, index }) => (
                                    <Pressable
                                        onPress={() =>
                                            navigation.navigate('GadgetDetail', { gadgetId: item.id })
                                        }
                                        style={{
                                            marginBottom: 10, // Tạo khoảng cách dưới mỗi item
                                            marginLeft: index % 2 === 0 ? 0 : 10, // Khoảng cách bên trái của item trong cột thứ hai
                                        }}
                                    >
                                        <GadgetSearchItem
                                            {...item}
                                            setGadgets={setGadgets}
                                        />
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
                                numColumns={2}
                                key={2} //Rất cần dòng này để tránh báo lỗi numColumns khi reload API
                            />
                        </View>
                    )}
                </View>
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
                    {sortOption == "PRICE" ? "Giá thấp nhất" : "Tên"}
                </Text>
                <Icon
                    type="material-community"
                    name="chevron-down"
                    size={24}
                    color="white"
                />
            </Pressable>

            {/* choose Giá thấp nhất/ Tên alphabet */}
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

                        {/* Giá thấp nhất */}
                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleSortOption("PRICE")}
                        >
                            <Text style={styles.modalOptionText}>Giá thấp nhất</Text>
                            {sortOption === "PRICE" ? (
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

                        {/* Name alphabet */}
                        <Pressable
                            style={styles.modalOption}
                            onPress={() => handleSortOption("NAME")}
                        >
                            <Text style={styles.modalOptionText}>Tên</Text>
                            {sortOption === "NAME" ? (
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
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(254, 161, 40, 0.5)",
        borderWidth: 1,
        borderColor: "rgb(254, 161, 40)",
    },
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