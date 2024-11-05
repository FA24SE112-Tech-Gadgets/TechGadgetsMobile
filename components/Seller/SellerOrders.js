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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native';
import api from "../Authorization/api";
import logo from "../../assets/adaptive-icon.png";
import { useDebounce } from 'use-debounce';
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import ErrModal from '../CustomComponents/ErrModal';
import SellerOrderItem from './SellerOrder/SellerOrderItem';

export default function SellerOrders() {
    const [sellerOrders, setSellerOrders] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchBounceString] = useDebounce(searchQuery, 1000);

    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("PRICE");

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [isSearching, setIsSearching] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setSellerOrders([]);
            setCurrentPage(1);
        }, [])
    );

    const filter = sortOption == "PRICE" ? `SortColumn=price` : `SortColumn=name`;

    // Gadget pagination
    useFocusEffect(
        useCallback(() => {
            const init = async () => {
                try {
                    setIsFetching(true);
                    const res = await api.get(
                        `/seller-orders?Status=Cancelled&Page=${currentPage}&PageSize=10`
                    );
                    const newData = res.data.items;
                    setHasMoreData(newData.length > 0);
                    setIsFetching(false);

                    if (newData.length == 0) {
                        console.log("No more data to fetch");
                        return; // Stop the process if there is no more data
                    }

                    setSellerOrders((prevArray) => [...prevArray, ...newData]);
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

            if (currentPage >= 2) init();
        }, [currentPage])
    );

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
                    const res = await api.get(
                        `/seller-orders?Status=Cancelled&Page=1&PageSize=10`
                    );
                    const newData = res.data.items;

                    if (newData.length == 0) {
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
                }
            };
            fetchItems();
        }, [searchBounceString])
    );

    const handleSortOption = (option) => {
        if (option != sortOption) {
            setSortOption(option);
            setModalVisible(false);
            setSellerOrders([]);
            setCurrentPage(1);
            const init = async () => {
                try {
                    const url =
                        option == "PRICE"
                            ? `/seller-orders?Status=Cancelled&Page=1&PageSize=10`
                            : `/seller-orders?Status=Cancelled&Page=1&PageSize=10`;
                    const res = await api.get(url);
                    const newData = res.data.items;

                    if (newData.length == 0) {
                        console.log("No more data to fetch");
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
                }
            };

            init();
        }
    };

    const handleScroll = () => {
        if (!isFetching && hasMoreData) {
            setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
        }
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
                        placeholder={"Tìm kiếm sản phẩm"}
                        returnKeyType="search"
                        style={{ fontSize: 20 }}
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
                    disabled={sellerOrders.length == 0}
                />
            </View>

            <View
                style={{
                    height: ScreenHeight / 1.16,
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
                                source={require("../../assets/animations/catRole.json")}
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
                    <View style={{ marginBottom: 20, marginTop: 16 }}>
                        <FlatList
                            data={sellerOrders}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    onPress={() =>
                                        navigation.navigate('GadgetSellerDetail', { gadgetId: item.id })
                                    }
                                >
                                    <SellerOrderItem
                                        {...item}
                                    />
                                    {index < sellerOrders.length - 1 && (
                                        <Divider style={{ marginVertical: 14 }} />
                                    )}
                                </Pressable>
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