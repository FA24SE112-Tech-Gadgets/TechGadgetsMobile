import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
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
import useAuth from '../../../utils/useAuth';
import { AntDesign } from '@expo/vector-icons';
import * as Location from "expo-location";

export default function SearchNaturalLanguage() {
    const [hasStartedSearch, setHasStartedSearch] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    const [userLocation, setUserLocation] = useState(null);
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

    const { user } = useAuth();

    const navigation = useNavigation();

    const handleSearch = async () => {
        try {
            setHasStartedSearch(true);
            //Delete state before fetching
            setGadgets([]);
            setSelectedLocation(null);
            setSellers([]);
            setIsFetching(true);
            const res = await api.post(`/natural-languages-v2/search`, {
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

    const getCurrentPosition = async () => {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setUserLocation(currentLocation.coords);
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

    //Fetch current position
    useFocusEffect(
        useCallback(() => {
            getCurrentPosition();
        }, [])
    );

    useEffect(() => {
        let locationSubscription;

        const startWatchingLocation = async () => {
            // Theo dõi vị trí thời gian thực
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000, // Lấy vị trí mỗi 1 giây
                    distanceInterval: 0.5, // Lấy vị trí khi di chuyển tối thiểu 5m
                },
                (location) => {
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );
        };

        startWatchingLocation();

        // Hủy theo dõi khi component unmount
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    if (user == null || user?.status === "Inactive") {
        return (
            <LinearGradient colors={['#fea92866', '#FFFFFF']}
                style={{
                    flex: 1,
                    height: ScreenHeight / 1.5,
                }}
            >
                {/* Back btn */}
                <View style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    zIndex: 10,
                }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            padding: 8,
                            borderRadius: 20,
                        }}
                    >
                        <AntDesign name="arrowleft" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Error showing */}
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
                        {isFetching ? "Đang tải dữ liệu vui lòng chờ trong giây lát" : user?.status === "Inactive" ? "Tài khoản của bạn đã bị khóa, không thể sử dụng tính năng này" : "Không tìm thấy thông tin người dùng"}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    return (
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
                            <TouchableOpacity
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
                            </TouchableOpacity>
                        )}
                        onScroll={() => setOpenSearchBtn(false)}
                        onMomentumScrollEnd={() => {
                            setOpenSearchBtn(true);
                        }}
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
                            <TouchableOpacity
                                onPress={
                                    () => {
                                        navigation.navigate('SellerDetailScreen', { sellerId: item.id })
                                    }
                                }
                                style={{
                                    marginBottom: index == sellers.length - 1 ? 40 : 0
                                }}
                            >
                                <SellerSearchItem
                                    {...item}
                                    setSnackbarVisible={setSnackbarVisible}
                                    setSnackbarMessage={setSnackbarMessage}
                                    setOpenBigMap={setOpenBigMap}
                                    setSelectedLocation={setSelectedLocation}
                                    userLocation={userLocation}
                                    user={user}
                                />
                            </TouchableOpacity>
                        )}
                        scrollEventThrottle={16}
                        initialNumToRender={5}
                        onScroll={() => setOpenSearchBtn(false)}
                        onMomentumScrollEnd={() => {
                            setOpenSearchBtn(true);
                        }}
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
                    onPressIn={() => setOpenSearchBtn(true)} // Khi vào TextInput, hiện nút search
                />

                {
                    isOpenSearchBtn &&
                    <TouchableOpacity
                        style={{
                            backgroundColor: isFetching ? "rgba(0, 0, 0, 0.3)" : "#112A46",
                            height: ScreenHeight / 25,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 10,
                            flexDirection: "row",
                            gap: 10
                        }}
                        disabled={isFetching || searchInput == ""}
                        onPress={async () => {
                            Keyboard.dismiss();
                            await handleSearch();
                        }}
                    >
                        <Text style={{
                            color: "white",
                            fontWeight: "500",
                            fontSize: 16
                        }}>Tìm kiếm</Text>
                        {
                            isFetching &&
                            <ActivityIndicator color={"white"} />
                        }
                    </TouchableOpacity>
                }
            </View>

            <CustomMapModal
                isOpen={isOpenBigMap}
                setOpen={setOpenBigMap}
                location={selectedLocation ? selectedLocation : null}
                userLocation={userLocation}
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
    )
}