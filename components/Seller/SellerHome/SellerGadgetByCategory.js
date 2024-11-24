import React, { useState, useCallback, useEffect } from 'react';
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
    Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native';
import api from "../../Authorization/api";
import logo from "../../../assets/adaptive-icon.png";
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import GadgetItem from '../Gadget/GadgetItem';
import ErrModal from '../../CustomComponents/ErrModal';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

export default function SellerGadgetByCategory({ navigation, route }) {
    const { categoryId } = route.params;

    const [gadgets, setGadgets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [isSearching, setSearching] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchGadgets, setSearchGadgets] = useState([]);
    const [currentSearchPage, setCurrentSearchPage] = useState(1);

    const [refreshingSearch, setRefreshingSearch] = useState(false);
    const [hasMoreSearchData, setHasMoreSearchData] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [sortOption, setSortOption] = useState("PRICE");

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [isFocused, setIsFocused] = useState(false);
    const [keywords, setKeywords] = useState([]);
    const [keyWordIdSelected, setKeywordIdSelected] = useState("");

    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setGadgets([]);
            setSearchGadgets([]);
            setCurrentPage(1);
            setSearchQuery("");
            setSortOption("PRICE");
        }, [])
    );

    const filter = sortOption == "PRICE" ? `SortColumn=price` : `SortColumn=name`;

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
                            ? `/gadgets/category/${categoryId}/current-seller?Name=${searchQuery}&SortColumn=price&Page=1&PageSize=10`
                            : `/gadgets/category/${categoryId}/current-seller?Name=${searchQuery}&SortColumn=name&Page=1&PageSize=10`;
                    const res = await api.get(url);
                    setIsFetching(false);
                    const newData = res.data.items;

                    if (!isSearching) {
                        if (newData && newData.length > 0) {
                            setGadgets(newData);
                        }

                        if (!res.data.hasNextPage) {
                            setHasMoreData(false);
                        }
                    } else {
                        if (newData && newData.length > 0) {
                            setSearchGadgets(newData);
                        }

                        if (!res.data.hasNextPage) {
                            setHasMoreSearchData(false);
                        }
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
                `/gadgets/category/${categoryId}/current-seller?Name=${searchQuery}&${filter}&Page=${page}&PageSize=10`
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

    const fetchSearchGadgets = async (page, searchKeyword) => {
        try {
            setIsFetching(true);
            const res = await api.get(
                `/gadgets/category/${categoryId}/current-seller?${searchKeyword !== "" ? ("Name=" + searchKeyword) : ""}&${filter}&Page=${page}&PageSize=10`
            );
            await fetchKeywordHistories();
            setIsFetching(false);

            const newData = res.data.items;

            if (newData && newData.length > 0) {
                setSearchGadgets(newData);
            }

            // Update hasMoreSearchData status
            setHasMoreSearchData(res.data.hasNextPage);
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

    const fetchKeywordHistories = async () => {
        try {
            const response = await api.get(`/keyword-histories`);
            const keywords = response.data;
            if (keywords) {
                setKeywords(keywords);
            } else {
                setKeywords([]);
            }
        } catch (error) {
            console.error("Error fetching keyword histories:", error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        }
    };

    const handleDeleteAllKeyword = async () => {
        try {
            await api.delete(`/keyword-histories/all`);
            setKeywords([]);
        } catch (error) {
            console.error("Error delete all keyword histories:", error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        }
    };

    const handleDeleteKeywordById = async () => {
        try {
            if (keyWordIdSelected) {
                await api.delete(`/keyword-histories/${keyWordIdSelected}`);
                setKeywordIdSelected("");
            }
            await fetchKeywordHistories();
        } catch (error) {
            console.error("Error delete keyword by id:", error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        }
    };

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

    const handleScrollSearch = () => {
        if (isFetching) return; // Ngăn không gọi nếu đang fetch

        if (hasMoreSearchData) {
            const nextPage = currentSearchPage + 1;
            setCurrentSearchPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
            fetchSearchGadgets(nextPage, searchQuery); // Gọi fetchGadgets với trang tiếp theo
        } else {
            setIsFetching(true);
            fetchSearchGadgets(currentSearchPage, searchQuery); // Gọi fetchGadgets nhưng không tăng currentSearchPage
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchGadgets(1); // Fetch new data (page 1)
        setRefreshing(false);
    };

    const handleRefreshSearch = async () => {
        setRefreshingSearch(true);
        await fetchSearchGadgets(1, searchQuery); // Fetch new data (page 1)
        setRefreshingSearch(false);
    };

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

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

    //For refresh page
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

    //For refresh search page
    useFocusEffect(
        useCallback(() => {
            if (refreshingSearch) {
                setSearchGadgets([]);
                setCurrentSearchPage(1);
                fetchSearchGadgets(1, searchQuery);
                setRefreshingSearch(false);
            }
        }, [refreshingSearch])
    );

    // Initial Fetch when component mounts
    useFocusEffect(
        useCallback(() => {
            fetchGadgets(1); // Fetch the first page
        }, [])
    );

    //Fetch Keyword Histories
    useFocusEffect(
        useCallback(() => {
            fetchKeywordHistories();
        }, [])
    );

    //reset search when searchQuery === ""
    useFocusEffect(
        useCallback(() => {
            if (searchQuery === "" && !isSearching) {
                setSearchGadgets([])
                setCurrentSearchPage(1);
                setGadgets([])
                setCurrentPage(1);
                fetchGadgets(1);
            }
        }, [searchQuery])
    );

    // Ẩn lịch sử tìm kiếm khi keyboard hide
    useEffect(() => {
        // Lắng nghe sự kiện khi bàn phím ẩn
        const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
            if (!keyWordIdSelected) {
                setIsFocused(false);
            }
        });

        // Dọn dẹp listener khi component unmount
        return () => {
            keyboardHideListener.remove();
        };
    }, []);

    return (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={{ flex: 1, paddingTop: 15, paddingHorizontal: 15 }}>
            {/* Header + search */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: "space-between",
                paddingBottom: isFocused ? 0 : 15,
                marginBottom: (keywords.length <= 0 && isFocused) ? 10 : 0,
            }}>
                {/* Logo + close search function */}
                <TouchableOpacity
                    style={{
                        height: 43,
                        width: 43,
                        overflow: 'hidden',
                        borderRadius: 30,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: isFocused ? "#ed8900" : undefined,
                        borderWidth: isFocused ? 1 : 0,
                        borderColor: isFocused ? "#ed8900" : undefined,
                    }}
                    onPress={() => {
                        setIsFocused(false);
                        setSearching(false);
                        Keyboard.dismiss();
                        setSearchQuery("");
                    }}
                >
                    {
                        isSearching ?
                            <AntDesign name="arrowleft" size={24} color="white" /> :
                            <Image
                                style={{
                                    width: 48,
                                    height: 48,
                                }}
                                source={logo}
                            />
                    }
                </TouchableOpacity>

                {/* Search bar */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#F9F9F9',
                        borderRadius: 6,
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        height: ScreenWidth / 9,
                        width: ScreenWidth / 1.25,
                        borderColor: isFocused ? "#ed8900" : undefined,
                        borderWidth: isFocused ? 2 : 0
                    }}
                >
                    {
                        !isFocused &&
                        <Icon type="font-awesome" name="search" size={23} color={"#ed8900"} />
                    }
                    <TextInput
                        placeholder={"Tìm kiếm sản phẩm"}
                        returnKeyType="search"
                        style={{
                            fontSize: 16,
                            width: ScreenWidth / 1.5,
                            height: ScreenHeight / 1.2,
                            textAlignVertical: "center",
                            marginLeft: !isFocused ? 10 : 0,
                        }}
                        value={searchQuery}
                        onChangeText={(query) => setSearchQuery(query)}
                        onPressIn={() => {
                            setIsFocused(true);
                            setSearching(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onSubmitEditing={(event) => {
                            const value = event.nativeEvent.text;
                            if (value.trim()) {
                                setSearchGadgets([]);
                                setCurrentSearchPage(1);
                                fetchSearchGadgets(1, value);
                            }
                        }}
                        caretHidden={!isFocused}
                    />
                    {
                        isFocused &&
                        <TouchableOpacity
                            style={{
                                height: ScreenWidth / 9,
                                width: ScreenWidth / 9,
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#ed8900",
                                borderRadius: 6,
                            }}
                            onPress={() => {
                                if (searchQuery.trim()) {
                                    setSearchGadgets([]);
                                    setCurrentSearchPage(1);
                                    fetchSearchGadgets(1, searchQuery);
                                }
                            }}
                        >
                            <Icon type="font-awesome" name="search" size={23} color="white" />
                        </TouchableOpacity>
                    }
                </View>
            </View>

            {
                (isFocused && keywords.length > 0) &&
                <View style={{
                    backgroundColor: "#f9f9f9",
                    height: (ScreenHeight / 40) * (keywords.length + 1) + (5 * keywords.length) + 15,
                    width: ScreenWidth / 1.25,
                    paddingHorizontal: 10,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    paddingVertical: 5,
                    marginBottom: 10,
                    marginLeft: 43 + ScreenWidth / 25
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
                                onLongPress={async () => {
                                    setKeywordIdSelected(item.id);
                                    setOpenConfirmDelete(true);
                                    await delay(200);
                                    setIsFocused(true);
                                }}
                                onPress={() => {
                                    setSearchQuery(item.keyword);
                                    setSearchGadgets([]);
                                    setCurrentSearchPage(1);
                                    fetchSearchGadgets(1, item.keyword);
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
                                    {item.keyword}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyboardShouldPersistTaps={"handled"}
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
                                    handleDeleteAllKeyword();
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
                    height: (isFocused && keywords.length > 0) ? ((ScreenHeight / 1.265) - ((ScreenHeight / 40) * (keywords.length + 1) + (5 * keywords.length) + 15)) : (ScreenHeight / 1.265),
                }}
            >
                {
                    isSearching ? (
                        // Đang tìm kiếm sản phẩm
                        (isFetching && searchGadgets.length <= 0) ? (
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <LottieView
                                    source={require("../../../assets/animations/catRole.json")}
                                    style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                                    autoPlay
                                    loop
                                    speed={0.8}
                                />
                                <Text style={{ fontSize: 18, textAlign: "center", marginTop: 10 }}>
                                    Đang tìm sản phẩm
                                </Text>
                            </View>
                        ) : searchGadgets.length > 0 ? (
                            // Danh sách sản phẩm tìm kiếm
                            <View style={{ marginTop: 16 }}>
                                <FlatList
                                    data={searchGadgets}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item, index }) => (
                                        <Pressable
                                            onPress={() => navigation.navigate("GadgetSellerDetail", { gadgetId: item.id })}
                                        >
                                            <GadgetItem {...item} />
                                            {index < searchGadgets.length - 1 && <Divider style={{ marginVertical: 14 }} />}
                                        </Pressable>
                                    )}
                                    onScroll={handleScrollSearch}
                                    scrollEventThrottle={16}
                                    ListFooterComponent={renderFooter}
                                    initialNumToRender={10}
                                    showsVerticalScrollIndicator={false}
                                    overScrollMode="never"
                                    refreshing={refreshingSearch}
                                    onRefresh={handleRefreshSearch}
                                />
                            </View>
                        ) : (
                            // Không tìm thấy sản phẩm
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <LottieView
                                    source={require("../../../assets/animations/catRole.json")}
                                    style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                                    autoPlay
                                    loop
                                    speed={0.8}
                                />
                                <Text style={{ fontSize: 18, textAlign: "center", marginTop: 10 }}>
                                    Không tìm thấy từ khóa của bạn
                                </Text>
                            </View>
                        )
                    ) : (
                        (isFetching && gadgets.length <= 0) ? (
                            // Đang tải dữ liệu sản phẩm
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <LottieView
                                    source={require("../../../assets/animations/catRole.json")}
                                    style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                                    autoPlay
                                    loop
                                    speed={0.8}
                                />
                                <Text style={{ fontSize: 18, textAlign: "center", marginTop: 10 }}>
                                    Đang tải dữ liệu sản phẩm
                                </Text>
                            </View>
                        ) : gadgets.length > 0 ? (
                            // Danh sách sản phẩm
                            <View style={{ marginTop: 16 }}>
                                <FlatList
                                    data={gadgets}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item, index }) => (
                                        <Pressable
                                            onPress={() => navigation.navigate("GadgetSellerDetail", { gadgetId: item.id })}
                                        >
                                            <GadgetItem {...item} />
                                            {index < gadgets.length - 1 && <Divider style={{ marginVertical: 14 }} />}
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
                        ) : (
                            // Không có sản phẩm nào
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                                <LottieView
                                    source={require("../../../assets/animations/catRole.json")}
                                    style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                                    autoPlay
                                    loop
                                    speed={0.8}
                                />
                                <Text style={{ fontSize: 18, textAlign: "center", marginTop: 10 }}>
                                    Shop không có sản phẩm nào
                                </Text>
                            </View>
                        )
                    )
                }
            </View>

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />

            {/* Confirmation delete keyword */}
            <Modal
                isVisible={openConfirmDelete}
                onBackdropPress={() => {
                    setKeywordIdSelected("");
                    setOpenConfirmDelete(false);
                }}
                style={{
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        rowGap: 1,
                        width: ScreenWidth * 0.8,
                        padding: 20,
                        borderRadius: 10,
                        backgroundColor: "white",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 15,
                            width: ScreenWidth / 1.5,
                        }}
                    >
                        Xóa lịch sử tìm kiếm này?
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            columnGap: 12,
                        }}
                    >
                        <Pressable
                            style={{
                                backgroundColor: "rgba(0, 0, 0, 0.3)",
                                paddingHorizontal: 15,
                                paddingVertical: 5,
                                borderRadius: 10,
                                width: 60,
                                height: ScreenHeight / 25,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={() => {
                                setKeywordIdSelected("");
                                setOpenConfirmDelete(false);
                            }}
                        >
                            <Text style={{ fontWeight: "bold", color: "white" }}>HỦY</Text>
                        </Pressable>

                        <Pressable
                            style={{
                                backgroundColor: "#ed8900",
                                paddingHorizontal: 15,
                                paddingVertical: 5,
                                borderRadius: 10,
                                width: 60,
                                height: ScreenHeight / 25,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onPress={() => {
                                setOpenConfirmDelete(false)
                                handleDeleteKeywordById();
                            }}
                        >
                            <Text style={{ fontWeight: "bold", color: "white" }}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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