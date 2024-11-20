import { View, Text, TextInput, FlatList, Pressable, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { ScreenHeight, ScreenWidth } from '@rneui/base'
import LottieView from 'lottie-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import GadgetSearchItem from './Gadget/GadgetSearchItem';
import api from "../../Authorization/api";
import ErrModal from '../../CustomComponents/ErrModal';
import SellerSearchItem from './Seller/SellerSearchItem';
import CustomMapModal from '../../CustomComponents/CustomMapModal';
import { Snackbar } from 'react-native-paper';

export default function SearchNaturalLanguage() {
    const [hasStartedSearch, setHasStartedSearch] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    const [isOpenBigMap, setOpenBigMap] = useState(false);

    const [gadgets, setGadgets] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [isFetching, setIsFetching] = useState(false);

    const [isOpenSearchBtn, setOpenSearchBtn] = useState(false);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const navigation = useNavigation();

    const handleSearch = async () => {
        try {
            setHasStartedSearch(true);
            //Delete state before fetching
            setGadgets([]);
            setSelectedLocation(null);
            setSellers([]);
            setIsFetching(true);
            const res = await api.post(`/natural-languages/search`, {
                input: searchInput
            });
            setIsFetching(false);

            const newGadgets = res.data.gadgets;
            const newSellers = res.data.sellers;

            if (newGadgets && newGadgets.length > 0) {
                setGadgets(newGadgets);
            } else {
                setGadgets([]);
            }

            if (newSellers && newSellers.length > 0) {
                setSellers(newSellers);
            } else {
                setSelectedLocation(null);
                setSellers([]);
            }
        } catch (error) {
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
            setGadgets([]);
            setSelectedLocation(null);
            setSellers([]);
            setIsFetching(false);
        }
    };

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setHasStartedSearch(false);
            setGadgets([]);
            setSellers([]);
            setSearchInput("");
        }, [])
    );

    return (
        <TouchableWithoutFeedback onPress={() => {
            // Khi người dùng nhấn ra ngoài, ẩn bàn phím và đặt trạng thái thành false
            Keyboard.dismiss();
            setOpenSearchBtn(false);
        }}>
            <LinearGradient colors={['#FFFFFF', '#fea92866']} style={{ flex: 1 }}>
                {
                    (isFetching || (gadgets.length == 0 && sellers.length == 0)) &&
                    <>
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                height: ScreenHeight / 1.4
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
                                {isFetching ? "Đang tìm kiếm..." : !hasStartedSearch ? "Hãy nhập nội dung muốn tìm kiếm" : "Không tìm thấy nội dung phù hợp"}
                            </Text>
                        </View>
                    </>
                }

                {
                    gadgets.length > 0 &&
                    <View style={{
                        height: isOpenSearchBtn ? (ScreenHeight / 1.35) : (ScreenHeight / 1.25),
                        paddingHorizontal: 10,
                        paddingTop: 10
                    }}>
                        <FlatList
                            data={gadgets}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    onPress={() =>
                                        navigation.navigate('GadgetSellerDetail', { gadgetId: item.id })
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
                            scrollEventThrottle={16}
                            numColumns={2}
                            key={2} //Rất cần dòng này để tránh báo lỗi numColumns khi reload API
                            initialNumToRender={30}
                            showsVerticalScrollIndicator={false}
                            overScrollMode="never"
                        />
                    </View>
                }

                {
                    sellers.length > 0 &&
                    <View style={{
                        height: isOpenSearchBtn ? (ScreenHeight / 1.35) : (ScreenHeight / 1.25),
                        paddingHorizontal: 10,
                        paddingTop: 10
                    }}>
                        <FlatList
                            data={sellers}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    onPress={
                                        () => {
                                            navigation.navigate('SellerDetailScreen', { sellerId: item.id })
                                        }
                                    }
                                >
                                    <SellerSearchItem
                                        {...item}
                                        setSnackbarVisible={setSnackbarVisible}
                                        setSnackbarMessage={setSnackbarMessage}
                                        setOpenBigMap={setOpenBigMap}
                                        setSelectedLocation={setSelectedLocation}
                                    />
                                </Pressable>
                            )}
                            scrollEventThrottle={16}
                            initialNumToRender={5}
                            showsVerticalScrollIndicator={false}
                            overScrollMode="never"
                        />
                    </View>
                }

                {/* Search Input */}
                <View
                    style={{
                        position: "absolute",
                        bottom: 10,
                        width: ScreenWidth / 1.05,
                        alignSelf: "center",
                        borderWidth: 1,
                        borderTopLeftRadius: 10 + 10,
                        borderTopRightRadius: 10 + 10,
                        borderBottomLeftRadius: 10 + 5,
                        borderBottomRightRadius: 10 + 5,
                        borderColor: 'rgb(254, 169, 40)',
                        backgroundColor: 'rgba(254, 169, 40, 0.8)',
                        justifyContent: "center",
                        paddingHorizontal: 10,
                        paddingVertical: 15,
                        gap: 10
                    }}
                >
                    <TextInput
                        style={{
                            borderColor: "rgba(0, 0, 0, 0.5)",
                            borderWidth: 1,
                            borderRadius: 10,
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                            textAlignVertical: "top",
                            fontSize: 16,
                            backgroundColor: "#f9f9f9"
                        }}
                        placeholder={"Nhập nội dung tìm kiếm"}
                        value={searchInput}
                        onChangeText={(value) => {
                            setSearchInput(value)
                        }}
                        multiline={true} // Allow multiple lines
                        numberOfLines={3} // Set initial number of lines
                        onFocus={() => setOpenSearchBtn(true)} // Khi vào TextInput, hiện nút search
                        onBlur={() => setOpenSearchBtn(false)}  // Khi mất tiêu điểm, ẩn nút search
                    />

                    {
                        isOpenSearchBtn &&
                        <TouchableOpacity
                            style={{
                                backgroundColor: "#112A46",
                                height: ScreenHeight / 25,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 10
                            }}
                            disabled={isFetching || searchInput == ""}
                            onPress={async () => {
                                await handleSearch();
                            }}
                        >
                            <Text style={{
                                color: "white",
                                fontWeight: "500",
                                fontSize: 16
                            }}>Tìm kiếm</Text>
                        </TouchableOpacity>
                    }
                </View>

                <CustomMapModal
                    isOpen={isOpenBigMap}
                    setOpen={setOpenBigMap}
                    location={selectedLocation ? selectedLocation : null}
                />

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
        </TouchableWithoutFeedback>
    )
}