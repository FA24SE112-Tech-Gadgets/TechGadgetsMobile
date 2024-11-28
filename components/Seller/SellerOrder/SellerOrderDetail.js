import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TextInput,
    Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import api from '../../Authorization/api';
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { ScreenHeight, ScreenWidth, Icon } from '@rneui/base';
import Modal from "react-native-modal";
import { Linking } from "react-native";
import ErrModal from '../../CustomComponents/ErrModal';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import SellerOrderGadgetItem from '../Gadget/SellerOrderGadgetItem';
import Clipboard from '@react-native-clipboard/clipboard';
import { Snackbar } from 'react-native-paper';

export default function SellerOrderDetail({ route, navigation }) {
    const [sellerOrder, setSellerOrder] = useState(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [isFetching, setIsFetching] = useState(false);
    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [newReason, setNewReason] = useState("");

    const [showBottomBar, setShowBottomBar] = useState(true);

    const [isOpenPriceDetail, setOpenPriceDetail] = useState(false);

    const formatVietnamDate = (time) => {
        const date = new Date(time);
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
        const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = vietnamTime.getUTCFullYear();
        const hours = vietnamTime.getUTCHours().toString().padStart(2, '0');
        const minutes = vietnamTime.getUTCMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    function formatPhoneNumber(phone) {
        // Kiểm tra nếu số bắt đầu bằng "0" hoặc không
        let countryCode, formattedNumber;

        if (phone.startsWith("0")) {
            // Trường hợp bắt đầu bằng "0", thay "0" bằng "+84"
            countryCode = "(+84)";
            phone = phone.slice(1); // Bỏ số "0" đầu tiên
        } else {
            // Trường hợp không bắt đầu bằng "0", lấy số đầu làm mã quốc gia
            countryCode = `(${phone[0]})`;
            phone = phone.slice(1); // Bỏ số đầu tiên
        }

        // Định dạng số điện thoại
        if (phone.length === 9) { // Số điện thoại có 10 chữ số (bỏ "0")
            formattedNumber = `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
        } else if (phone.length === 10) { // Số điện thoại có 11 chữ số
            formattedNumber = `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 10)} ${phone.slice(10)}`;
        } else {
            return "Invalid phone number length";
        }

        return `${countryCode} ${formattedNumber}`;
    }

    //Fetch seller order detail info
    useFocusEffect(
        useCallback(() => {
            fetchSellerOrderDetail();
        }, [])
    );

    const fetchSellerOrderDetail = async () => {
        try {
            setIsFetching(true);
            const response = await api.get(`/seller-orders/${route.params.sellerOrderId}`);
            setSellerOrder(response.data);
            setIsFetching(false);
        } catch (error) {
            console.log('Error fetching sellerOrder details:', error);
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

    const [gadgets, setGadgets] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    const [hasMoreData, setHasMoreData] = useState(true);

    const handleSellerOrderDeny = async () => {
        try {
            if (newReason == "") {
                setStringErr(
                    "Lý do không được để trống"
                );
                setIsError(true);
            }
            setIsFetching(true);
            await api.put(`/seller-order/${route.params.sellerOrderId}/cancel`, {
                reason: newReason
            });
            await fetchSellerOrderDetail();
            setCurrentPage(1);
            setIsFetching(false);
            setSnackbarMessage("Từ chối thành công");
            setSnackbarVisible(true);
        } catch (error) {
            console.log('Error fetching sellerOrder details:', error);
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

    const handleSellerOrderConfirm = async () => {
        try {

            setIsFetching(true);
            await api.put(`/seller-order/${route.params.sellerOrderId}/confirm`);
            await fetchSellerOrderDetail();
            setCurrentPage(1);
            setIsFetching(false);
            setSnackbarMessage("Xác nhận đơn hàng thành công");
            setSnackbarVisible(true);
        } catch (error) {
            console.log('Error fetching sellerOrder details:', error);
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

    // Gadget pagination
    useFocusEffect(
        useCallback(() => {
            const init = async () => {
                try {
                    setIsFetching(true);
                    const res = await api.get(
                        `/seller-order/${route.params.sellerOrderId}/items?Page=${currentPage}&PageSize=10`
                    );
                    const newData = res.data.items;

                    setHasMoreData(res.data.hasNextPage);
                    setIsFetching(false);

                    if (newData && newData.length > 0) {
                        setGadgets((prevArray) => [...prevArray, ...newData]);
                    }
                    if (!res.data.hasNextPage) {
                        console.log("No more data to fetch");
                        return; // Stop the process if there is no more data
                    }

                } catch (error) {
                    setStringErr(
                        error.response?.data?.reasons[0]?.message ?
                            error.response.data.reasons[0].message
                            :
                            error.toString()
                    );
                    setIsError(true);
                    setIsFetching(false);
                }
            };

            if (currentPage >= 1) init();
        }, [currentPage])
    );

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setGadgets([]);
            setCurrentPage(1);
        }, [])
    );

    const handleScroll = () => {
        if (!isFetching && hasMoreData) {
            setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
        }
    };

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        setSnackbarMessage("Sao chép thành công");
        setSnackbarVisible(true);
    };

    const renderFooter = () => {
        return (
            <View style={{
                marginBottom: sellerOrder.status == "Pending" ? (ScreenHeight / 5) : 10
            }}>
                {/* Bạn cần hỗ trợ? */}
                <View style={styles.needHelpContainer}>
                    <Text style={styles.needHelpTxt}>Bạn cần hỗ trợ?</Text>

                    <Pressable style={styles.needHelpBtn}
                        onPress={() => {
                            setShowConfirmModal(true);
                        }}
                    >
                        <View
                            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
                        >
                            <View
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: 25,
                                    width: 25,
                                }}
                            >
                                <Icon
                                    type="material-community"
                                    name="help-circle-outline"
                                    size={24}
                                />
                            </View>
                            <Text style={styles.needHelpTxt}>
                                Trung tâm trợ giúp
                            </Text>
                        </View>

                        <Icon type="antdesign" name="right" color={"rgba(0, 0, 0, 0.5)"} size={20} />
                    </Pressable>
                </View>

                {/* Seller order footer */}
                <View style={styles.sellerOrderFooterContainer}>
                    {/* Mã đơn hàng */}
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 5
                    }}>
                        <Text style={styles.sellerOrderId} numberOfLines={1} ellipsizeMode="tail">
                            Mã đơn hàng: {route.params.sellerOrderId}
                        </Text>
                        <TouchableOpacity
                            disabled={route.params.sellerOrderId != null ? false : true}
                            onPress={() => copyToClipboard(route.params.sellerOrderId)}
                        >
                            <Text style={{ color: "#ed8900", fontSize: 14 }}>Sao chép</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Phương thức thanh toán */}
                    <View style={{
                        paddingVertical: 10
                    }}>
                        <Text style={styles.sellerOrderFooterItemTxt} numberOfLines={1} ellipsizeMode="tail">
                            Phương thức thanh toán: {sellerOrder.paymentMethod}
                        </Text>
                    </View>

                    <View style={{
                        borderTopWidth: 0.5,
                        borderColor: "rgbd(0, 0, 0, 0.5)",
                        paddingTop: 10
                    }}>
                        {/* Thời gian đặt hàng */}
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between"
                        }}>
                            <Text style={styles.sellerOrderFooterItemTxt2} numberOfLines={1} ellipsizeMode="tail">
                                Thời gian đặt hàng:
                            </Text>
                            <Text style={styles.sellerOrderFooterItemTxt3} numberOfLines={1} ellipsizeMode="tail">
                                {formatVietnamDate(sellerOrder.sellerOrderCreatedAt)}
                            </Text>
                        </View>

                        {/* Thời gian thanh toán */}
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between"
                        }}>
                            <Text style={styles.sellerOrderFooterItemTxt2} numberOfLines={1} ellipsizeMode="tail">
                                Thời gian thanh toán:
                            </Text>
                            <Text style={styles.sellerOrderFooterItemTxt3} numberOfLines={1} ellipsizeMode="tail">
                                {formatVietnamDate(sellerOrder.walletTrackingCreatedAt)}
                            </Text>
                        </View>

                        {/* Thời gian hoàn thành đơn hàng || Thời điểm hủy đơn hàng */}
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between"
                        }}>
                            <Text style={styles.sellerOrderFooterItemTxt2} numberOfLines={1} ellipsizeMode="tail">
                                {sellerOrder.status === "Cancelled" ? "Thời điểm hủy đơn hàng" : "Thời gian hoàn thành đơn hàng:"}
                            </Text>
                            <Text style={styles.sellerOrderFooterItemTxt3} numberOfLines={1} ellipsizeMode="tail">
                                {sellerOrder?.sellerOrderUpdatedAt ? formatVietnamDate(sellerOrder.sellerOrderUpdatedAt) : "Đang xử lý"}
                            </Text>
                        </View>
                    </View>
                </View>

                {
                    sellerOrder.status === "Cancelled" &&
                    <View style={styles.sellerOrderReasonContainer}>
                        {/* Lý do hủy đơn */}
                        <Text style={styles.sellerOrderReasonHeader} numberOfLines={1} ellipsizeMode="tail">
                            Lý do hủy đơn:
                        </Text>

                        <Text style={styles.sellerOrderFooterItemTxt} numberOfLines={1} ellipsizeMode="tail">
                            {sellerOrder.cancelledReason}
                        </Text>
                    </View>
                }
            </View>
        );
    };

    if (!sellerOrder) {
        return (
            <LinearGradient colors={['#fea92866', '#FFFFFF']}
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
                        {isFetching ? "Đang tải dữ liệu đơn hàng" : "Không tìm thấy thông tin đơn hàng"}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 16,
            borderWidth: 1,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            borderColor: 'rgb(254, 169, 40)',
            backgroundColor: 'rgba(254, 169, 40, 0.3)',
        },
        backButton: {
            padding: 8,
            borderRadius: 20,
            backgroundColor: "rgba(254, 161, 40, 0.5)",
            borderWidth: 1,
            borderColor: "rgb(254, 161, 40)",
        },
        headerTxt: {
            fontSize: 18,
            fontWeight: "500"
        },
        sellerOrderStatusContainer: {
            backgroundColor: "white",
            width: ScreenWidth / 1.05,
            height: ScreenHeight / 7,
            alignSelf: "center",
            marginTop: 10,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10
        },
        sellerOrderStatusHeader: {
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            padding: 10,
            backgroundColor: sellerOrder.status === "Success" ? "rgba(77, 218, 98, 0.5)" : sellerOrder.status === "Pending" ? "rgb(249, 222, 114)" : "rgba(210, 65, 82, 0.5)"
        },
        sellerOrderStatusHeaderTxt: {
            color: "black",
            fontSize: 18,
            fontWeight: "500"
        },
        sellerOrderStatusContent: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            padding: 10
        },
        sellerOrderStatusContentTxt: {
            color: sellerOrder.status === "Success" ? "green" : sellerOrder.status === "Pending" ? "#ed8900" : "rgb(210, 65, 82)",
            fontSize: 16,
            fontWeight: "500"
        },
        sellerOrderAddressContainer: {
            backgroundColor: "white",
            width: ScreenWidth / 1.05,
            height: ScreenHeight / 3.5,
            alignSelf: "center",
            marginTop: 5,
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 15,
            gap: 10
        },
        sellerOrderAddressHeaderTxt: {
            fontSize: 18,
            fontWeight: "500",
            color: "#ed8900"
        },
        sellerOrderAddressItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10
        },
        sellerOrderAddressItemName: {
            fontSize: 16,
            fontWeight: "500",
            overflow: "hidden",
            width: ScreenWidth / 2.5
        },
        sellerOrderAddressItemPhoneNumber: {
            fontSize: 14,
            color: "rgba(0, 0, 0, 0.5)"
        },
        sellerOrderAddressItemAddress: {
            fontSize: 14,
            color: "rgba(0, 0, 0, 0.5)",
            width: ScreenWidth / 1.3
        },
        needHelpContainer: {
            backgroundColor: "white",
            width: ScreenWidth / 1.05,
            height: ScreenHeight / 10,
            alignSelf: "center",
            marginTop: 10,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            justifyContent: "space-evenly"
        },
        needHelpTxt: {
            fontSize: 14,
            fontWeight: '500',
            color: '#000000',
        },
        needHelpBtn: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            borderTopWidth: 0.5,
            borderColor: "rgba(0, 0, 0, 0.5)"
        },
        sellerOrderId: {
            fontSize: 15,
            fontWeight: "500",
            marginBottom: 5,
            width: ScreenWidth / 1.4
        },
        sellerOrderFooterContainer: {
            width: ScreenWidth / 1.05,
            height: ScreenHeight / 4.35,
            alignSelf: "center",
            marginTop: 10,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
            marginBottom: 5,
            backgroundColor: "#f9f9f9",
            gap: 10
        },
        sellerOrderFooterItemTxt: {
            fontSize: 14,
            fontWeight: "500",
            width: ScreenWidth / 1.1,
            color: "rgba(0, 0, 0, 0.5)"
        },
        sellerOrderFooterItemTxt2: {
            fontSize: 14,
            fontWeight: "500",
            width: ScreenWidth / 1.9,
            color: "rgba(0, 0, 0, 0.5)",
            textAlign: "left"
        },
        sellerOrderFooterItemTxt3: {
            fontSize: 14,
            fontWeight: "500",
            width: ScreenWidth / 2.8,
            color: "rgba(0, 0, 0, 0.5)",
            textAlign: "right",
        },
        sellerOrderReasonContainer: {
            width: ScreenWidth / 1.05,
            height: ScreenHeight / 7,
            alignSelf: "center",
            marginTop: 10,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 10,
            marginBottom: sellerOrder.status !== "Pending" ? 10 : ScreenHeight / 5,
            backgroundColor: "#f9f9f9",
            gap: 10
        },
        sellerOrderReasonHeader: {
            fontSize: 14,
            fontWeight: "500",
            marginBottom: 5,
            width: ScreenWidth / 1.4
        },
        sellerOrderBtn: {
            paddingHorizontal: 16,
            height: 50,
            borderRadius: 8,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: "center",
            flex: 1
        },
        sellerOrderBtnTxt: {
            fontSize: 16,
            fontWeight: '600',
            color: '#f9f9f9',
        },
    });

    return (
        <LinearGradient colors={['#F9F9F9', '#fea92866']} style={styles.container}>
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
                            {isFetching ? "Đang tải dữ liệu đơn hàng" : "Không tải được dữ liệu đơn hàng"}
                        </Text>
                    </View>
                </View>
            ) : (
                <>
                    <FlatList
                        data={gadgets}
                        keyExtractor={item => item.gadgetId}
                        renderItem={({ item, index }) => (
                            <Pressable
                                onPress={() =>
                                    navigation.navigate('GadgetSellerDetail', { gadgetId: item.gadgetId })
                                }
                            >
                                <SellerOrderGadgetItem
                                    {...item}
                                    index={index}
                                    totalGadgets={gadgets.length}
                                    totalAmount={sellerOrder.totalAmount}
                                    isOpenPriceDetail={isOpenPriceDetail}
                                    setOpenPriceDetail={setOpenPriceDetail}
                                    discountAmount={sellerOrder.discountAmount}
                                    beforeAppliedDiscountAmount={sellerOrder.beforeAppliedDiscountAmount}
                                />
                            </Pressable>
                        )}
                        onEndReached={handleScroll}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        initialNumToRender={10}
                        showsVerticalScrollIndicator={false}
                        overScrollMode="never"
                        nestedScrollEnabled
                        ListHeaderComponent={() => (
                            <>
                                {/* Header */}
                                <View style={styles.header}>
                                    {/* Back Button */}
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        style={styles.backButton}
                                    >
                                        <AntDesign name="arrowleft" size={24} color="black" />
                                    </TouchableOpacity>

                                    <Text style={styles.headerTxt}>Thông tin đơn hàng</Text>
                                </View>
                                {/* Seller order status container */}
                                <View style={styles.sellerOrderStatusContainer}>
                                    {/* Seller order status */}
                                    <View
                                        style={styles.sellerOrderStatusHeader}
                                    >
                                        <Text style={styles.sellerOrderStatusHeaderTxt}>
                                            {sellerOrder.status === "Success" ? "Đơn hàng đã hoàn thành" : sellerOrder.status === "Pending" ? "Đơn hàng đang xử lý" : "Đơn hàng đã hủy"}
                                        </Text>
                                    </View>

                                    <View style={styles.sellerOrderStatusContent}>
                                        <MaterialCommunityIcons
                                            name="truck-outline"
                                            size={35}
                                            color="rgba(0, 0, 0, 0.6)"
                                        />
                                        <View>
                                            <Text style={styles.sellerOrderStatusContentTxt}>
                                                {sellerOrder.status === "Success" ? "Giao hàng thành công" : sellerOrder.status === "Pending" ? "Đang chờ xử lý" : "Đơn hàng đã bị hủy"}
                                            </Text>
                                            {
                                                (sellerOrder.status === "Success" || sellerOrder.status === "Cancelled") &&
                                                <Text style={{
                                                    color: "rgba(0, 0, 0, 0.6)"
                                                }}>
                                                    {formatVietnamDate(sellerOrder.sellerOrderUpdatedAt)}
                                                </Text>
                                            }
                                        </View>
                                    </View>
                                </View>

                                {/* Customer address */}
                                <View style={styles.sellerOrderAddressContainer}>
                                    {/* Địa chỉ nhận hàng */}
                                    <>
                                        <Text style={styles.sellerOrderAddressHeaderTxt}>
                                            Địa chỉ nhận hàng
                                        </Text>
                                        <View style={styles.sellerOrderAddressItem}>
                                            <Ionicons
                                                name="location-outline"
                                                size={30}
                                                color="rgba(0, 0, 0, 0.6)"
                                            />
                                            <View>
                                                <View style={styles.sellerOrderAddressItem}>
                                                    <Text
                                                        style={styles.sellerOrderAddressItemName}
                                                        numberOfLines={1} // Giới hạn hiển thị trên 1 dòng
                                                        ellipsizeMode="tail" // Thêm "..." vào cuối nếu quá dài
                                                    >
                                                        {sellerOrder.customerInfo.fullName}
                                                    </Text>
                                                    <Text style={styles.sellerOrderAddressItemPhoneNumber}>
                                                        {formatPhoneNumber(sellerOrder.customerInfo.phoneNumber)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.sellerOrderAddressItemAddress}>
                                                    {sellerOrder.customerInfo.address}
                                                </Text>
                                            </View>
                                        </View>
                                    </>

                                    {/* Địa chỉ lấy hàng */}
                                    <>
                                        <Text style={styles.sellerOrderAddressHeaderTxt}>
                                            Địa chỉ lấy hàng
                                        </Text>
                                        <View style={styles.sellerOrderAddressItem}>
                                            <Ionicons
                                                name="location-outline"
                                                size={30}
                                                color="rgba(0, 0, 0, 0.6)"
                                            />
                                            <View>
                                                <View style={styles.sellerOrderAddressItem}>
                                                    <Text
                                                        style={styles.sellerOrderAddressItemName}
                                                        numberOfLines={1} // Giới hạn hiển thị trên 1 dòng
                                                        ellipsizeMode="tail" // Thêm "..." vào cuối nếu quá dài
                                                    >
                                                        {sellerOrder.sellerInfo.shopName}
                                                    </Text>
                                                    <Text style={styles.sellerOrderAddressItemPhoneNumber}>
                                                        {formatPhoneNumber(sellerOrder.sellerInfo.phoneNumber)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.sellerOrderAddressItemAddress}>
                                                    {sellerOrder.sellerInfo.shopAddress}
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                </View>
                            </>
                        )}
                        onScroll={() => setShowBottomBar(false)}
                        onMomentumScrollEnd={() => {
                            setShowBottomBar(true);
                        }}
                        ListHeaderComponentStyle={{
                            marginBottom: 10
                        }}
                    />

                    {/* Seller order reason form */}
                    {
                        (sellerOrder.status == "Pending" && showBottomBar) &&
                        <View style={{
                            position: "absolute",
                            bottom: 20,
                            height: ScreenHeight / 6,
                            width: ScreenWidth / 1.05,
                            alignSelf: "center",
                            borderWidth: 1,
                            borderRadius: 10,
                            borderColor: 'rgb(254, 169, 40)',
                            backgroundColor: 'rgba(254, 169, 40, 0.8)',
                            justifyContent: "center",
                            paddingHorizontal: 10,
                            paddingVertical: 15,
                            gap: 5
                        }}>
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
                                placeholder={"Nhập lý do"}
                                value={newReason}
                                onChangeText={(value) => {
                                    setNewReason(value)
                                }}
                                multiline={true} // Allow multiple lines
                                numberOfLines={3} // Set initial number of lines
                            />
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}>
                                <TouchableOpacity
                                    style={[
                                        {
                                            backgroundColor: "rgb(77, 218, 98)",
                                            borderColor: "rgb(77, 218, 98)",
                                        },
                                        styles.sellerOrderBtn
                                    ]}
                                    disabled={isFetching}
                                    onPress={() => {
                                        handleSellerOrderConfirm();
                                    }}
                                >
                                    <Text style={styles.sellerOrderBtnTxt}>Xác nhận</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        {
                                            backgroundColor: "rgb(210, 65, 82)",
                                            borderColor: "rgb(210, 65, 82)",
                                        },
                                        styles.sellerOrderBtn
                                    ]}
                                    disabled={isFetching}
                                    onPress={() => {
                                        handleSellerOrderDeny();
                                    }}
                                >
                                    <Text style={[styles.sellerOrderBtnTxt, { color: "white" }]}>Từ chối</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                </>
            )}

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0, zIndex: 1 }}
            >
                {snackbarMessage}
            </Snackbar>

            <ConfirmHelpCenterModal
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
            />
        </LinearGradient >
    )
}

const ConfirmHelpCenterModal = ({ showConfirmModal, setShowConfirmModal }) => {
    return (
        <Modal
            isVisible={showConfirmModal}
            onBackdropPress={() => setShowConfirmModal(false)}
            style={{
                alignItems: "center"
            }}
        >
            <View style={{
                rowGap: 20,
                width: ScreenWidth * 0.8,
                backgroundColor: "white",
                borderRadius: 10,
                padding: 20
            }}>
                <Text style={{ fontSize: 15 }}>
                    Bạn sẽ được điều hướng sang trang Web khác
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
                            backgroundColor: "white",
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#ed8900",
                            width: ScreenWidth * 0.25,
                            height: 35,
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        onPress={() => setShowConfirmModal(false)}
                    >
                        <Text style={{ fontWeight: "bold", color: "#ed8900" }}>HỦY</Text>
                    </Pressable>
                    <Pressable
                        style={{
                            backgroundColor: "#ed8900",
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                            borderRadius: 10,
                            width: ScreenWidth * 0.25,
                            height: 35,
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        onPress={() => {
                            Linking.openURL("https://fa24se112-tech-gadgets.github.io/Tech-Gadget-HelpCenter/");
                            setShowConfirmModal(false);
                        }}
                    >
                        <Text style={{ fontWeight: "bold", color: "white" }}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};
