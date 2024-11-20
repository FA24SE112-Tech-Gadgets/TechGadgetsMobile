import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    TouchableOpacity,
    FlatList,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import api from "../../Authorization/api";
import ErrModal from "../../CustomComponents/ErrModal";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from '@expo/vector-icons';
import Modal from "react-native-modal";
import WalletTrackingItem from "./WalletTrackingItem";
import { Snackbar } from "react-native-paper";

export function WalletTrackingScreen({ route, navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("DESC");

    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [walletTrackings, setWalletTrackings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setWalletTrackings([]);
            setCurrentPage(1);
            setSortOption("DESC");
        }, [])
    );

    const filter = sortOption == "DESC" ? `SortByDate=DESC` : `SortByDate=ASC`;

    const handleSortOption = (option) => {
        if (option != sortOption) {
            setSortOption(option);
            setModalVisible(false);
            setWalletTrackings([]);
            setCurrentPage(1);
            const init = async () => {
                try {
                    setIsFetching(true);
                    const url =
                        option == "DESC"
                            ? `/wallet-trackings?SortByDate=DESC&Page=${currentPage}&PageSize=10`
                            : `/wallet-trackings?SortByDate=ASC&Page=${currentPage}&PageSize=10`;
                    const res = await api.get(url);
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (newData && newData.length > 0) {
                        setWalletTrackings(newData);
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
                    setIsFetching(false);
                }
            };

            init();
        }
    };

    //Fetch wallet trackings
    const fetchWalletTrackings = async (page) => {
        try {
            setIsFetching(true);
            const res = await api.get(
                `/wallet-trackings?${filter}&Page=${page}&PageSize=10`
            );
            setIsFetching(false);
            const newData = res.data.items;

            if (newData && newData.length > 0) {
                const allWalletTrackings = [
                    ...walletTrackings,
                    ...newData.filter(
                        (newWalletTracking) =>
                            !walletTrackings.some(
                                (existingWalletTracking) =>
                                    existingWalletTracking.id === newWalletTracking.id
                            )
                    ),
                ];
                setWalletTrackings(allWalletTrackings);
            }

            // Update hasMoreData status
            setHasMoreData(res.data.hasNextPage);
        } catch (error) {
            setIsError(true);
            setStringErr(
                error.response?.data?.reasons[0]?.message
                    ? error.response.data.reasons[0].message
                    : "Lỗi mạng vui lòng thử lại sau"
            );
            setIsFetching(false);
        }
    }

    const handleScroll = () => {
        if (isFetching) return; // Ngăn không gọi nếu đang fetch

        if (hasMoreData) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
            fetchWalletTrackings(nextPage); // Gọi fetchWalletTrackings với trang tiếp theo
        } else {
            setIsFetching(true);
            fetchWalletTrackings(currentPage); // Gọi fetchWalletTrackings nhưng không tăng currentPage
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWalletTrackings(1); // Fetch new data (page 1)
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
                setWalletTrackings([]);
                setCurrentPage(1);
                fetchWalletTrackings(1);
                setRefreshing(false);
            }
        }, [refreshing])
    );

    // Initial Fetch when component mounts
    useFocusEffect(
        useCallback(() => {
            fetchWalletTrackings(1); // Fetch the first page
        }, [])
    );

    return (
        <LinearGradient colors={['#FFFFFF', '#fea92866']} style={{ flex: 1 }}>
            {/* Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: 16,
                borderWidth: 1,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                borderColor: 'rgb(254, 169, 40)',
                backgroundColor: 'rgba(254, 169, 40, 0.3)',
            }}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        padding: 8,
                        borderRadius: 20,
                        backgroundColor: "rgba(254, 161, 40, 0.5)",
                        borderWidth: 1,
                        borderColor: "rgb(254, 161, 40)",
                    }}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>

                <Text style={{
                    fontSize: 18,
                    fontWeight: "500"
                }}>Lịch sử giao dịch</Text>
            </View>

            <View style={{ paddingHorizontal: 10, height: ScreenHeight / 1.2 }}>
                {/* Filter Sort */}
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                    <SortModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        sortOption={sortOption}
                        handleSortOption={handleSortOption}
                        disabled={walletTrackings.length == 0}
                    />
                </View>

                {walletTrackings.length == 0 ? (
                    <View
                        style={{
                            flex: 1,
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
                                style={{ width: ScreenWidth, height: ScreenWidth / 1.4 }}
                                autoPlay
                                loop
                                speed={0.8}
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    width: ScreenWidth / 1.5,
                                    fontWeight: "500",
                                    textAlign: "center",
                                }}
                            >
                                {isFetching ? "Đang tải dữ liệu giao dịch" : "Chưa có lịch sử giao dịch nào..."}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ marginTop: 16 }}>
                        <FlatList
                            data={walletTrackings}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => (
                                <>
                                    <WalletTrackingItem
                                        {...item}
                                        setSnackbarVisible={setSnackbarVisible}
                                        setSnackbarMessage={setSnackbarMessage}
                                    />
                                    {index < walletTrackings.length - 1 && (
                                        <Divider style={{ marginVertical: 14 }} />
                                    )}
                                </>
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
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderColor: "#FB6562",
                    borderWidth: 2,
                    borderRadius: 20,
                    backgroundColor: "#FB6562",
                    backgroundColor: disabled ? "#cccccc" : "#ed8900",
                    borderColor: disabled ? "#999999" : "#ed8900",
                }}
                onPress={() => setModalVisible(true)}
                disabled={disabled}
            >
                <Text style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    color: "white",
                }}>
                    {sortOption == "DESC" ? "Ngày gần nhất" : "Ngày xa nhất"}
                </Text>
                <Icon
                    type="material-community"
                    name="chevron-down"
                    size={24}
                    color="white"
                />
            </Pressable>

            {/* choose Ngày gần nhất/ Ngày xa nhất */}
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
                    <View style={{
                        backgroundColor: "white",
                        paddingVertical: 16,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    }}>
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
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                        }}>
                            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Lọc theo</Text>
                        </View>

                        {/* Giá thấp nhất */}
                        <Pressable
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                            onPress={() => handleSortOption("DESC")}
                        >
                            <Text style={{
                                fontSize: 16,
                            }}>Ngày gần nhất</Text>
                            {sortOption === "DESC" ? (
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
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                            onPress={() => handleSortOption("ASC")}
                        >
                            <Text style={{
                                fontSize: 16,
                            }}>Ngày xa nhất</Text>
                            {sortOption === "ASC" ? (
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