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
    Keyboard,
    TouchableWithoutFeedback,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native';
import api from "../../Authorization/api";
import logo from "../../../assets/adaptive-icon.png";
import { useDebounce } from 'use-debounce';
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import GadgetItem from '../Gadget/GadgetItem';
import ErrModal from '../../CustomComponents/ErrModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SellerGadgetByCategory({ navigation, route }) {
    const { categoryId } = route.params;

    const [gadgets, setGadgets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchBounceString] = useDebounce(searchQuery, 1000);

    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("PRICE");

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [isSearching, setIsSearching] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [keywords, setKeywords] = useState([
        "Nokia 105",
        "Loa Bluetooth",
        "Tai nghe chụp tai"
    ])

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
                    setIsFetching(true);
                    const res = await api.get(
                        `/gadgets/category/${categoryId}/current-seller?Name=${searchBounceString}&${filter}&Page=1&PageSize=10`
                    );
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (newData == null || newData.length == 0) {
                        setGadgets([]);
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
                    setIsFetching(false);
                    setIsSearching(false);
                }
            };
            fetchItems();
        }, [searchBounceString])
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
                            ? `/gadgets/category/${categoryId}/current-seller?Name=${searchBounceString}&SortColumn=price&Page=1&PageSize=10`
                            : `/gadgets/category/${categoryId}/current-seller?Name=${searchBounceString}&SortColumn=name&Page=1&PageSize=10`;
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
                    setIsFetching(false);
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
                `/gadgets/category/${categoryId}/current-seller?Name=${searchBounceString}&${filter}&Page=${page}&PageSize=10`
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
            setIsFetching(false);
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
        <TouchableWithoutFeedback onPress={() => {
            // Khi người dùng nhấn ra ngoài, ẩn bàn phím và đặt trạng thái thành false
            Keyboard.dismiss();
            setIsFocused(false);
        }}>
            <LinearGradient colors={['#fea92866', '#FFFFFF']} style={{ flex: 1, paddingTop: 10, paddingHorizontal: 10 }}>
                {/* Search bar */}
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginVertical: isFocused ? 0 : 10
                }}>
                    <View
                        style={{
                            flexDirection: "row",
                            backgroundColor: "#F9F9F9",
                            alignItems: "center",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            gap: 12,
                            borderRadius: 6,
                            height: ScreenWidth / 9,
                            width: ScreenWidth / 1.2,
                            borderBottomLeftRadius: isFocused ? 0 : 6,
                            borderBottomRightRadius: isFocused ? 0 : 6,
                        }}
                    >
                        <Icon type="font-awesome" name="search" size={23} color={"#ed8900"} />
                        <TextInput
                            placeholder={"Tìm kiếm sản phẩm"}
                            returnKeyType="search"
                            style={{
                                fontSize: 16,
                                width: ScreenWidth / 1.45,
                                height: ScreenHeight / 1.2,
                                textAlignVertical: "center",
                            }}
                            value={searchQuery}
                            onChangeText={(query) => setSearchQuery(query)}
                            onFocus={() => setIsFocused(true)} // Khi nhận focus
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
                {
                    (isFocused && keywords.length > 0) &&
                    <View style={{
                        backgroundColor: "#f9f9f9",
                        height: (ScreenHeight / 40) * (keywords.length + 1) + (5 * keywords.length) + 5,
                        width: ScreenWidth / 1.2,
                        paddingHorizontal: 10,
                        borderBottomLeftRadius: 6,
                        borderBottomRightRadius: 6,
                        marginBottom: 10,
                    }}>
                        <FlatList
                            data={keywords}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={{
                                    height: ScreenHeight / 40,
                                    alignItems: "center",
                                    marginBottom: 5,
                                    flexDirection: "row",
                                    gap: 15
                                }}
                                    onLongPress={() => {
                                        console.log("click me 2");
                                    }}
                                    onPress={() => {
                                        setSearchQuery(item);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={"history"}
                                        size={19}
                                        color={"rgba(0, 0, 0, 0.5)"}
                                    />
                                    <Text style={{
                                        fontSize: 13,
                                        color: "rgba(0, 0, 0, 0.5)",
                                        fontWeight: "500",
                                    }}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index}
                            scrollEnabled={false}
                            ListFooterComponent={<>
                                <TouchableOpacity
                                    style={{
                                        alignSelf: "center",
                                        height: ScreenHeight / 40,
                                        justifyContent: "center",
                                    }}
                                    onPress={() => {
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 14,
                                        color: "#ed8900",
                                        fontWeight: "500"
                                    }}>
                                        Xóa lịch xử tìm kiếm
                                    </Text>
                                </TouchableOpacity>
                            </>}
                        />
                    </View>
                }

                {/* Filter Sort */}
                <View style={{ flexDirection: "row", marginTop: 10 }}>
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
                        height: ScreenHeight / 1.16,
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
                                    {isFetching ? "Đang tìm sản phẩm" : isSearching ? "Không tìm thấy sản phẩm" : "Không có sản phẩm nào"}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={{ marginBottom: 20, marginTop: 16 }}>
                            <FlatList
                                data={gadgets}
                                keyExtractor={item => item.id}
                                renderItem={({ item, index }) => (
                                    <Pressable
                                        onPress={() =>
                                            navigation.navigate('GadgetSellerDetail', { gadgetId: item.id })
                                        }
                                    >
                                        <GadgetItem
                                            {...item}
                                        />
                                        {index < gadgets.length - 1 && (
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
                        </View>
                    )}
                </View>

                <ErrModal
                    stringErr={stringErr}
                    isError={isError}
                    setIsError={setIsError}
                />
            </LinearGradient>
        </TouchableWithoutFeedback>
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