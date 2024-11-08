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
import ReviewItem from "./ReviewItem";
import { Snackbar } from "react-native-paper";

export function SellerOrderReviewsScreen({ route, navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("NotReply");

    const [isFetching, setIsFetching] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [createReplied, setIsCreateReplied] = useState(false);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setReviews([]);
            setCurrentPage(1);
            setSortOption("NotReply");
            setIsCreateReplied(false);
        }, [])
    );

    const filter = sortOption == "NotReply" ? `FilterBy=NotReply` : `FilterBy=Replied`;

    const handleSortOption = (option) => {
        if (option != sortOption) {
            setSortOption(option);
            setModalVisible(false);
            setReviews([]);
            const init = async () => {
                try {
                    setIsFetching(true);
                    const url =
                        option == "NotReply"
                            ? `/reviews/seller-order-items?SortByDate=DESC&FilterBy=NotReply&Page=1&PageSize=10`
                            : `/reviews/seller-order-items?SortByDate=DESC&FilterBy=Replied&Page=1&PageSize=10`;
                    const res = await api.get(url);
                    const newData = res.data.items;

                    setReviews(newData);
                    setCurrentPage(2);

                    if (newData == null || !res.data.hasNextPage || newData.length == 0) {
                        setHasMoreData(false);
                        console.log("No more data to fetch2");
                        return; // Stop the process if there is no more data
                    }

                    setIsFetching(false);
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

    //For refresh page when send reply
    useFocusEffect(
        useCallback(() => {
            if (createReplied) {
                setReviews([]);
                setCurrentPage(1);
                handleSortOption(sortOption);
                setIsCreateReplied(false);
            }
        }, [createReplied])
    );

    //Fetch reviews pagination
    useFocusEffect(
        useCallback(() => {
            const init = async () => {
                try {
                    setIsFetching(true);

                    const res = await api.get(
                        `/reviews/seller-order-items?SortByDate=DESC&${filter}&Page=${currentPage}&PageSize=10`
                    );
                    const newData = res.data.items;

                    setHasMoreData(res.data.hasNextPage || newData.length > 0);

                    setIsFetching(false);
                    if (!(res.data.hasNextPage || newData.length > 0)) {
                        console.log("No more data to fetch");
                        return; // Stop the process if there is no more data
                    }
                    setReviews((prevArray) => [...prevArray, ...newData]);
                } catch (error) {
                    setIsError(true);
                    setStringErr(
                        error.response?.data?.reasons[0]?.message
                            ? error.response.data.reasons[0].message
                            : "Lỗi mạng vui lòng thử lại sau"
                    );
                }
            };

            if (currentPage >= 1) init();
        }, [currentPage])
    );

    const handleScroll = () => {
        if (!isFetching) {
            setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
        }
    };

    const renderFooter = () => {
        if (!isFetching && !hasMoreData) return null;
        return (
            <View style={{
                padding: 5,
                alignItems: 'center'
            }}>
                <ActivityIndicator color={"#ed8900"} />
            </View>
        );
    };

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
                }}>Danh sách đánh giá</Text>
            </View>

            <View style={{ paddingHorizontal: 10, height: ScreenHeight / 1.2 }}>
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

                {reviews.length == 0 ? (
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
                                Không có đánh giá nào
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ marginTop: 16 }}>
                        <FlatList
                            data={reviews}
                            keyExtractor={item => item.review.id}
                            renderItem={({ item, index }) => (
                                <>
                                    <ReviewItem
                                        {...item}
                                        sortOption={sortOption}
                                        setIsError={setIsError}
                                        setStringErr={setStringErr}
                                        createReplied={createReplied}
                                        setIsCreateReplied={setIsCreateReplied}
                                        setSnackbarMessage={setSnackbarMessage}
                                        setSnackbarVisible={setSnackbarVisible}
                                    />
                                    {index < reviews.length - 1 && (
                                        <Divider style={{ marginVertical: 14 }} />
                                    )}
                                </>
                            )}
                            onEndReached={handleScroll}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                            initialNumToRender={10}
                            showsVerticalScrollIndicator={false}
                            overScrollMode="never"
                        />
                    </View>
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
                    {sortOption == "NotReply" ? "Chưa phản hồi" : "Đã phản hồi"}
                </Text>
                <Icon
                    type="material-community"
                    name="chevron-down"
                    size={24}
                    color="white"
                />
            </Pressable>

            {/* choose Chưa phản hồi/ Đã phản hồi */}
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

                        {/* Chưa phản hồi */}
                        <Pressable
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                            onPress={() => handleSortOption("NotReply")}
                        >
                            <Text style={{
                                fontSize: 16,
                            }}>Chưa phản hồi</Text>
                            {sortOption === "NotReply" ? (
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

                        {/* Đã phản hồi */}
                        <Pressable
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                            }}
                            onPress={() => handleSortOption("Replied")}
                        >
                            <Text style={{
                                fontSize: 16,
                            }}>Đã phản hồi</Text>
                            {sortOption === "Replied" ? (
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