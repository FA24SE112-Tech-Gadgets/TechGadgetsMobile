import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Pressable,
    Keyboard,
    BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from '@react-navigation/native';
import api from "../../Authorization/api";
import logo from "../../../assets/adaptive-icon.png";
import { useNavigation } from '@react-navigation/native';
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import ErrModal from '../../CustomComponents/ErrModal';
import LottieView from 'lottie-react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Modal from "react-native-modal";

export default function SellerHome() {
    const [categories, setCategories] = useState([]);
    const [gadgets, setGadgets] = useState([]);

    const [isSearching, setSearching] = useState(false);

    const [searchCategories, setSearchCategories] = useState([]);
    const [searchGadgets, setSearchGadgets] = useState([]);
    const [isSearchEmpty, setIsSearchEmpty] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");

    const [isFetching, setIsFetching] = useState(false);
    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const [isFocused, setIsFocused] = useState(false);
    const [keywords, setKeywords] = useState([]);
    const [keyWordIdSelected, setKeywordIdSelected] = useState("");

    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    const navigation = useNavigation();

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

    const fetchCategories = async () => {
        try {
            setIsFetching(true);
            const response = await api.get('/categories');
            setCategories(response.data.items);
            response.data.items.forEach((category) => {
                fetchGadgets(category.id);
            });
            setIsFetching(false);
        } catch (error) {
            console.log('Error fetching categories:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchGadgets = async (categoryId) => {
        try {
            setIsFetching(true);
            const response = await api.get(`/gadgets/category/${categoryId}/current-seller?Page=1&PageSize=10`);
            setIsFetching(false);

            setGadgets(prev => {
                const updatedGadgets = { ...prev, [categoryId]: response.data.items };
                checkIfEmpty(updatedGadgets); // Kiểm tra sau khi cập nhật
                return updatedGadgets;
            });
        } catch (error) {
            console.log('Error fetching gadgets:', error);
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

    const fetchSearchCategories = async (keywordHistory) => {
        try {
            if (!keywordHistory) {
                setSearchCategories([]);
                setSearchGadgets([]);
                return;
            }
            setIsFetching(true);
            const response = await api.get('/categories');
            setSearchCategories(response.data.items);
            response.data.items.forEach((category) => {
                fetchSearchGadgets(category.id, keywordHistory);
            });
            setIsFetching(false);
        } catch (error) {
            console.log('Error fetching categories:', error);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchSearchGadgets = async (categoryId, keywordHistory) => {
        try {
            setIsFetching(true);
            const response = await api.get(`/gadgets/category/${categoryId}/current-seller?Name=${keywordHistory}&Page=1&PageSize=10`);
            setIsFetching(false);

            setSearchGadgets(prev => {
                const updatedGadgets = { ...prev, [categoryId]: response.data.items };
                checkIfSearchEmpty(updatedGadgets); // Kiểm tra sau khi cập nhật
                return updatedGadgets;
            });
        } catch (error) {
            console.log('Error fetching gadgets:', error);
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

    const checkIfEmpty = (updatedGadgets) => {
        const isAllEmpty = Object.values(updatedGadgets).every(gadgetList => gadgetList.length === 0);
        setIsEmpty(isAllEmpty);
    };

    const checkIfSearchEmpty = (updatedGadgets) => {
        const isAllEmpty = Object.values(updatedGadgets).every(gadgetList => gadgetList.length === 0);
        setIsSearchEmpty(isAllEmpty);
    };

    const renderGadget = ({ item }) => (
        <TouchableOpacity
            style={[styles.gadgetCard, { backgroundColor: '#FFFFFF' }]}
            onPress={() => navigation.navigate('GadgetSellerDetail', { gadgetId: item.id })}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.gadgetImage}
                    resizeMode="contain"
                />
                {(!item.isForSale && item.gadgetStatus === "Active") && (
                    <View style={styles.watermarkContainer}>
                        <Text style={styles.watermarkText}>Ngừng bán</Text>
                    </View>
                )}
                {item.discountPercentage > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                    </View>
                )}
            </View>
            {(item.gadgetStatus !== "Active") && (
                <View style={styles.statusWatermark}>
                    <Text style={styles.statusText}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                </View>
            )}
            <Text style={styles.gadgetName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceContainer}>
                {item.discountPercentage > 0 ? (
                    <>
                        <Text style={styles.originalPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                        <Text style={styles.discountPrice}>{item.discountPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
                    </>
                ) : (
                    <Text style={styles.gadgetPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderCategory = ({ item }) => {
        const categoryGadgets = gadgets[item.id] || [];

        if (categoryGadgets.length <= 0) {
            return null;
        }

        return (
            <LinearGradient
                colors={['#FFFFFF', '#fea92866']}
                style={styles.categoryContainer}
            >
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <TouchableOpacity onPress={() =>
                        navigation.navigate("SellerGadgetByCategory", { categoryId: item.id })
                    }>
                        <Text style={styles.viewAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.categoryUnderline} />
                <FlatList
                    data={categoryGadgets.slice(0, 20)}
                    renderItem={renderGadget}
                    keyExtractor={(gadget) => gadget.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    contentContainerStyle={styles.gadgetList}
                />
            </LinearGradient>
        );
    };

    const renderSearchCategory = ({ item }) => {
        const categoryGadgets = searchGadgets[item.id] || [];

        if (categoryGadgets.length <= 0) {
            return null;
        }

        return (
            <LinearGradient
                colors={['#FFFFFF', '#fea92866']}
                style={styles.categoryContainer}
            >
                <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <TouchableOpacity onPress={() =>
                        navigation.navigate("SellerGadgetByCategory", { categoryId: item.id })
                    }>
                        <Text style={styles.viewAllText}>Xem tất cả</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.categoryUnderline} />
                <FlatList
                    data={categoryGadgets.slice(0, 20)}
                    renderItem={renderGadget}
                    keyExtractor={(gadget) => gadget.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    contentContainerStyle={styles.gadgetList}
                />
            </LinearGradient>
        );
    };

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setCategories([]);
            setGadgets({});
            setSearchCategories([]);
            setSearchGadgets([]);
            setSearchQuery("");
        }, [])
    );

    // Fetch cate + gadgets first time
    useFocusEffect(
        useCallback(() => {
            fetchCategories(searchQuery);
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
                setSearchCategories([]);
                setGadgets([]);
                setCategories([]);
                fetchCategories();
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
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.container}>
            {/* Header + search */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 15,
                    justifyContent: "space-between",
                    paddingBottom: isFocused ? 0 : 15,
                    marginBottom: (keywords.length <= 0 && isFocused) ? 10 : 0
                }}
            >
                {/* Logo + close search function */}
                <TouchableOpacity
                    style={{
                        width: 43,
                        height: 43,
                        borderRadius: 30,
                        overflow: 'hidden',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                        borderWidth: isFocused ? 2 : 0,
                        marginLeft: 10,
                    }}
                >
                    {
                        !isFocused &&
                        <Icon type="font-awesome" name="search" size={23} color={"#ed8900"} />
                    }
                    <TextInput
                        style={{
                            fontSize: 16,
                            width: ScreenWidth / 1.5,
                            height: ScreenHeight / 1.2,
                            textAlignVertical: "center",
                            marginLeft: !isFocused ? 10 : 0,
                        }}
                        placeholder={"Tìm kiếm sản phẩm"}
                        returnKeyType="search"
                        value={searchQuery}
                        onChangeText={(query) => setSearchQuery(query)}
                        onPressIn={() => {
                            fetchKeywordHistories();
                            setIsFocused(true);
                            setSearching(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onSubmitEditing={(event) => {
                            const value = event.nativeEvent.text;
                            if (value.trim()) {
                                fetchKeywordHistories();
                                fetchSearchCategories(value);
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
                                    fetchKeywordHistories();
                                    fetchSearchCategories(searchQuery);
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
                    marginHorizontal: 15,
                    width: ScreenWidth / 1.25,
                    paddingHorizontal: 10,
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                    paddingVertical: 5,
                    marginBottom: 10,
                    marginLeft: 43 + ScreenWidth / 14
                }}>
                    <FlatList
                        data={keywords}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps={"handled"}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={{
                                height: ScreenHeight / 40,
                                alignItems: "center",
                                marginBottom: 5,
                                flexDirection: "row",
                                gap: 13
                            }}
                                onLongPress={async () => {
                                    setKeywordIdSelected(item.id);
                                    setOpenConfirmDelete(true);
                                    await delay(200);
                                    setIsFocused(true);
                                }}
                                onPress={() => {
                                    setSearchQuery(item.keyword);
                                    fetchKeywordHistories();
                                    fetchSearchCategories(item.keyword);
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

            {
                isSearching ? (
                    (isFetching && isSearchEmpty) ? (
                        // Đang tìm kiếm sản phẩm
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
                                    Đang tìm sản phẩm
                                </Text>
                            </View>
                        </View>
                    ) : !isSearchEmpty ? (
                        // Danh sách sản phẩm tìm kiếm
                        <FlatList
                            data={searchCategories}
                            renderItem={renderSearchCategory}
                            keyExtractor={(item) => item.id}
                            style={styles.categoryList}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        // Không tìm thấy sản phẩm
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
                                    Không tìm thấy từ khóa của bạn
                                </Text>
                            </View>
                        </View>
                    )
                ) : (
                    (isFetching && isEmpty) ? (
                        // Đang tải dữ liệu sản phẩm
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
                                    Đang tải dữ liệu sản phẩm
                                </Text>
                            </View>
                        </View>
                    ) : !isEmpty ? (
                        // Danh sách sản phẩm
                        <FlatList
                            data={categories}
                            renderItem={renderCategory}
                            keyExtractor={(item) => item.id}
                            style={styles.categoryList}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        // Không có sản phẩm nào
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
                                    Shop không có sản phẩm nào
                                </Text>
                            </View>
                        </View>
                    )
                )
            }

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    logo: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        width: 45,
        height: 45,
        borderRadius: 80,
        overflow: 'hidden',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 15,
        marginRight: 10,
        fontSize: 16,
    },
    searchButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        backgroundColor: '#fea128',
        borderRadius: 20,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 120,
        marginBottom: 15,
    },
    watermarkContainer: {
        position: 'absolute',
        top: 30,
        left: -8,
        right: -8,
        bottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '0deg' }],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1,
    },
    watermarkText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 4,
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
        color: 'red',
        fontSize: 14,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    discountBadge: {
        position: 'absolute',
        top: 5,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: "grey"
    },
    discountText: {
        color: 'grey',
        fontSize: 12,
        fontWeight: '500',
    },
    priceContainer: {
        flexDirection: 'column',
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    expiryDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    bannerContainer: {
        height: ScreenWidth * 0.5,
        marginBottom: 15,
    },
    bannerImage: {
        width: ScreenWidth,
        height: ScreenWidth * 0.5,
    },
    categoryList: {
        flex: 1,
    },
    categoryContainer: {
        marginBottom: 15,
        paddingTop: 15,
        paddingBottom: 20,
        borderRadius: 10,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    categoryName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    viewAllText: {
        color: '#fea128',
        fontSize: 16,
    },
    categoryUnderline: {
        height: 2,
        backgroundColor: '#fea92866',
        marginStart: 10,
        marginBottom: 15,
    },
    gadgetList: {
        paddingHorizontal: 10,
    },
    gadgetCard: {
        width: (ScreenWidth - 40) / 3,
        marginHorizontal: 5,
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
    gadgetImage: {
        width: '100%',
        height: 120,
        borderRadius: 10,
        marginBottom: 15,
    },
    gadgetName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 5,
        color: '#333',
    },
    gadgetPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
    },
    favoriteButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});