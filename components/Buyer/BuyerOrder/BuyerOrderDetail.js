import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Pressable,
    Linking,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../Authorization/api';
import { ScreenHeight, ScreenWidth, Icon } from '@rneui/base';
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import BuyerOrderGadgetItem from './BuyerOrderGadgetItem';
import Clipboard from '@react-native-clipboard/clipboard';
import { Snackbar } from 'react-native-paper';
import ErrModal from '../../CustomComponents/ErrModal';

export default function BuyerOrderDetail({ route, navigate }) {
    const [buyerOrder, setBuyerOrder] = useState(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [isFetching, setIsFetching] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [gadgets, setGadgets] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);

    const navigation = useNavigation();

    const [newReason, setNewReason] = useState("");

    const [showBottomBar, setShowBottomBar] = useState(true);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const sellerOrderId = route.params.sellerOrderId;

    const formatVietnamDate = (time) => {
        const date = new Date(time);
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
        const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = vietnamTime.getUTCFullYear();
        const hours = vietnamTime.getUTCHours().toString().padStart(2, '0');
        const minutes = vietnamTime.getUTCMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    function formatPhoneNumber(phone) {
        if (!phone) return "N/A";
        let countryCode, formattedNumber;

        if (phone.startsWith("0")) {
            countryCode = "(+84)";
            phone = phone.slice(1);
        } else {
            countryCode = `(${phone[0]})`;
            phone = phone.slice(1);
        }

        if (phone.length === 9) {
            formattedNumber = `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
        } else if (phone.length === 10) {
            formattedNumber = `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 10)} ${phone.slice(10)}`;
        } else {
            return "Invalid phone number length";
        }

        return `${countryCode} ${formattedNumber}`;
    }

    const handleSellerOrderDeny = async () => {
        try {
            setIsFetching(true);
            await api.put(`/seller-order/${sellerOrderId}/cancel`, {
                reason: newReason
            });
            await fetchBuyerOrderDetail();
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

    useFocusEffect(
        useCallback(() => {
            fetchBuyerOrderDetail();
        }, [])
    );

    const fetchBuyerOrderDetail = async () => {
        try {
            setIsFetching(true);
            const response = await api.get(`/seller-orders/${sellerOrderId}`);
            setBuyerOrder(response.data);
            setIsFetching(false);
        } catch (error) {
            console.log('Error fetching buyer order details:', error);
            setSnackbarMessage("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
            setSnackbarVisible(true);
            setIsFetching(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const init = async () => {
                try {
                    setIsFetching(true);
                    const res = await api.get(
                        `/seller-order/${sellerOrderId}/items?Page=${currentPage}&PageSize=10`
                    );
                    const newData = res.data.items;

                    setHasMoreData(res.data.hasNextPage);
                    setIsFetching(false);
                    if (newData && newData.length > 0) {
                        setGadgets((prevArray) => [...prevArray, ...newData]);
                    };
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
            setCurrentPage((prevPage) => prevPage + 1);
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
                marginBottom: buyerOrder.status == "Pending" ? (ScreenHeight / 5) : 0
            }}>
                <View style={styles.needHelpContainer}>
                    <Text style={styles.needHelpTxt}>Bạn cần hỗ trợ?</Text>

                    <Pressable style={styles.needHelpBtn}
                        onPress={() => {
                            setShowConfirmModal(true);
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}>
                            <Icon type="material-community" name="help-circle-outline" size={24} />
                            <Text style={styles.needHelpTxt}>Trung tâm trợ giúp</Text>
                        </View>
                        <Icon type="antdesign" name="right" color="rgba(0, 0, 0, 0.5)" size={20} />
                    </Pressable>
                </View>

                <View style={[styles.buyerOrderFooterContainer, {
                    marginBottom: buyerOrder.status === "Cancelled" ? 5 : buyerOrder.status === "Pending" ? 5 : 20,
                }]}>
                    <View style={styles.buyerOrderFooterRow}>
                        <Text style={styles.buyerOrderId} numberOfLines={1} ellipsizeMode="tail">
                            Mã đơn hàng: {sellerOrderId}
                        </Text>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(sellerOrderId)}
                        >
                            <Text style={styles.copyText}>Sao chép</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buyerOrderFooterRow}>
                        <Text style={styles.buyerOrderFooterItemTxt} numberOfLines={1} ellipsizeMode="tail">
                            Phương thức thanh toán: {buyerOrder.paymentMethod}
                        </Text>
                    </View>

                    <View style={styles.buyerOrderFooterDivider} />

                    <View style={styles.buyerOrderFooterRow}>
                        <Text style={styles.buyerOrderFooterItemTxt2}>Thời gian đặt hàng:</Text>
                        <Text style={styles.buyerOrderFooterItemTxt3}>
                            {formatVietnamDate(buyerOrder.sellerOrderCreatedAt)}
                        </Text>
                    </View>

                    <View style={styles.buyerOrderFooterRow}>
                        <Text style={styles.buyerOrderFooterItemTxt2}>Thời gian thanh toán:</Text>
                        <Text style={styles.buyerOrderFooterItemTxt3}>
                            {formatVietnamDate(buyerOrder.walletTrackingCreatedAt)}
                        </Text>
                    </View>

                    <View style={styles.buyerOrderFooterRow}>
                        <Text style={styles.buyerOrderFooterItemTxt2}>
                            {buyerOrder.status === "Cancelled" ? "Thời điểm hủy đơn hàng:" : "Thời gian hoàn thành đơn hàng:"}
                        </Text>
                        <Text style={styles.buyerOrderFooterItemTxt3}>
                            {buyerOrder?.sellerOrderUpdatedAt ? formatVietnamDate(buyerOrder.sellerOrderUpdatedAt) : "Đang xử lý"}
                        </Text>
                    </View>
                </View>

                {buyerOrder.status === "Cancelled" && (
                    <View style={styles.buyerOrderReasonContainer}>
                        <Text style={styles.buyerOrderReasonHeader}>Lý do hủy đơn:</Text>
                        <Text style={styles.buyerOrderFooterItemTxt}>
                            {buyerOrder.cancelledReason}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    if (!sellerOrderId) {
        return (
            <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.loadingContainer}>
                <Text style={styles.errorText}>Không thể tải thông tin đơn hàng. Mã đơn hàng không hợp lệ.</Text>
            </LinearGradient>
        );
    }

    if (isFetching || !buyerOrder) {
        return (
            <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.loadingContainer}>
                <LottieView
                    source={require("../../../assets/animations/catRole.json")}
                    style={styles.lottieAnimation}
                    autoPlay
                    loop
                    speed={0.8}
                />
                <Text style={styles.loadingText}>Đang load dữ liệu</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#F9F9F9', '#fea92866']} style={styles.container}>
            <View style={styles.contentContainer}>
                <FlatList
                    data={gadgets}
                    keyExtractor={item => item.gadgetId}
                    renderItem={({ item, index }) => (
                        <Pressable
                            onPress={
                                () => {
                                    if (item.gadgetStatus === "Active") {
                                        navigation.navigate('GadgetDetail', { gadgetId: item.gadgetId })
                                    } else {
                                        setStringErr("Sản phẩm này không còn tồn tại nữa.");
                                        setIsError(true);
                                    }
                                }
                            }
                        >
                            <BuyerOrderGadgetItem
                                {...item}
                                index={index}
                                totalGadgets={gadgets.length}
                                totalAmount={buyerOrder.totalAmount}
                            />
                        </Pressable>
                    )}
                    onEndReached={handleScroll}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    initialNumToRender={10}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={() => (
                        <>
                            <View style={styles.header}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={styles.backButton}
                                >
                                    <AntDesign name="arrowleft" size={24} color="black" />
                                </TouchableOpacity>
                                <Text style={styles.headerTxt}>Thông tin đơn hàng</Text>
                            </View>
                            <View style={styles.buyerOrderStatusContainer}>
                                <View style={[styles.buyerOrderStatusHeader, { backgroundColor: getStatusColor(buyerOrder.status) }]}>
                                    <Text style={styles.buyerOrderStatusHeaderTxt}>
                                        {getStatusText(buyerOrder.status)}
                                    </Text>
                                </View>
                                <View style={styles.buyerOrderStatusContent}>
                                    <MaterialCommunityIcons
                                        name="truck-outline"
                                        size={35}
                                        color="rgba(0, 0, 0, 0.6)"
                                    />
                                    <View>
                                        <Text style={[styles.buyerOrderStatusContentTxt, { color: getStatusTextColor(buyerOrder.status) }]}>
                                            {getStatusDescription(buyerOrder.status)}
                                        </Text>
                                        {(buyerOrder.status === "Success" || buyerOrder.status === "Cancelled") && (
                                            <Text style={styles.buyerOrderStatusDate}>
                                                {formatVietnamDate(buyerOrder.sellerOrderUpdatedAt)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={styles.buyerOrderAddressContainer}>
                                <Text style={styles.buyerOrderAddressHeaderTxt}>
                                    Địa chỉ nhận hàng
                                </Text>
                                <View style={styles.buyerOrderAddressItem}>
                                    <Ionicons
                                        name="location-outline"
                                        size={30}
                                        color="rgba(0, 0, 0, 0.6)"
                                    />
                                    <View>
                                        <View style={styles.buyerOrderAddressItem}>
                                            <Text style={styles.buyerOrderAddressItemName} numberOfLines={1} ellipsizeMode="tail">
                                                {buyerOrder.customerInfo.fullName}
                                            </Text>
                                            <Text style={styles.buyerOrderAddressItemPhoneNumber}>
                                                {formatPhoneNumber(buyerOrder.customerInfo.phoneNumber)}
                                            </Text>
                                        </View>
                                        <Text style={styles.buyerOrderAddressItemAddress}>
                                            {buyerOrder.customerInfo.address}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.buyerOrderAddressHeaderTxt}>
                                    Địa chỉ cửa hàng
                                </Text>
                                <View style={styles.buyerOrderAddressItem}>
                                    <Ionicons
                                        name="location-outline"
                                        size={30}
                                        color="rgba(0, 0, 0, 0.6)"
                                    />
                                    <View>
                                        <View style={styles.buyerOrderAddressItem}>
                                            <Text style={styles.buyerOrderAddressItemName} numberOfLines={1} ellipsizeMode="tail">
                                                {buyerOrder.sellerInfo.shopName}
                                            </Text>
                                            <Text style={styles.buyerOrderAddressItemPhoneNumber}>
                                                {formatPhoneNumber(buyerOrder.sellerInfo.phoneNumber)}
                                            </Text>
                                        </View>
                                        <Text style={styles.buyerOrderAddressItemAddress}>
                                            {buyerOrder.sellerInfo.shopAddress}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                    onScroll={() => setShowBottomBar(false)}
                    onMomentumScrollEnd={() => {
                        setShowBottomBar(true);
                    }}
                    ListHeaderComponentStyle={styles.listHeaderStyle}
                />
                {/* Customer cancel order reason form */}
                {
                    (buyerOrder.status == "Pending" && showBottomBar) &&
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
                            placeholder={"Nhập lý do (Không bắt buộc)"}
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
                                style={{
                                    backgroundColor: "rgb(210, 65, 82)",
                                    borderColor: "rgb(210, 65, 82)",
                                    paddingHorizontal: 16,
                                    height: 50,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    alignItems: 'center',
                                    justifyContent: "center",
                                    flex: 1
                                }}
                                disabled={isFetching}
                                onPress={() => {
                                    handleSellerOrderDeny();
                                }}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: 'white',
                                }}>Từ chối đơn hàng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            </View>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>

            <ConfirmHelpCenterModal
                showConfirmModal={showConfirmModal}
                setShowConfirmModal={setShowConfirmModal}
            />

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </LinearGradient>
    );
}

const ConfirmHelpCenterModal = ({ showConfirmModal, setShowConfirmModal }) => {
    return (
        <Modal
            isVisible={showConfirmModal}
            onBackdropPress={() => setShowConfirmModal(false)}
            style={styles.modal}
        >
            <View style={styles.modalContent}>
                <Text style={styles.modalText}>
                    Bạn sẽ được điều hướng sang trang Web khác
                </Text>
                <View style={styles.modalButtonContainer}>
                    <Pressable
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => setShowConfirmModal(false)}
                    >
                        <Text style={styles.cancelButtonText}>HỦY</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.modalButton, styles.confirmButton]}
                        onPress={() => {
                            Linking.openURL("https://fa24se112-tech-gadgets.github.io/Tech-Gadget-HelpCenter/");
                            setShowConfirmModal(false);
                        }}
                    >
                        <Text style={styles.confirmButtonText}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Success':
            return 'rgba(77, 218, 98, 0.5)';
        case 'Pending':
            return 'rgb(249, 222, 114)';
        case 'Cancelled':
            return 'rgba(210, 65, 82, 0.5)';
        default:
            return 'rgba(0, 0, 0, 0.1)';
    }
};

const getStatusTextColor = (status) => {
    switch (status) {
        case 'Success':
            return 'green';
        case 'Pending':
            return '#fea128';
        case 'Cancelled':
            return 'rgb(210, 65, 82)';
        default:
            return 'black';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'Success':
            return 'Đơn hàng đã hoàn thành';
        case 'Pending':
            return 'Đơn hàng đang xử lý';
        case 'Cancelled':
            return 'Đơn hàng đã hủy';
        default:
            return 'Trạng thái không xác định';
    }
};

const getStatusDescription = (status) => {
    switch (status) {
        case 'Success':
            return 'Đặt thành công';
        case 'Pending':
            return 'Đang chờ xử lý';
        case 'Cancelled':
            return 'Đơn hàng đã bị hủy';
        default:
            return 'Trạng thái không xác định';
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 16,
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
    buyerOrderStatusContainer: {
        backgroundColor: "white",
        width: ScreenWidth / 1.05,
        height: ScreenHeight / 7,
        alignSelf: "center",
        marginTop: 10,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    buyerOrderStatusHeader: {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        padding: 10,
    },
    buyerOrderStatusHeaderTxt: {
        color: "black",
        fontSize: 18,
        fontWeight: "500"
    },
    buyerOrderStatusContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 10
    },
    buyerOrderStatusContentTxt: {
        fontSize: 16,
        fontWeight: "500"
    },
    buyerOrderStatusDate: {
        color: "rgba(0, 0, 0, 0.6)"
    },
    buyerOrderAddressContainer: {
        backgroundColor: "white",
        width: ScreenWidth / 1.05,
        alignSelf: "center",
        marginTop: 5,
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        gap: 10
    },
    buyerOrderAddressHeaderTxt: {
        fontSize: 18,
        fontWeight: "500",
        color: "#ed8900"
    },
    buyerOrderAddressItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10
    },
    buyerOrderAddressItemName: {
        fontSize: 16,
        fontWeight: "500",
        overflow: "hidden",
        width: ScreenWidth / 2.5
    },
    buyerOrderAddressItemPhoneNumber: {
        fontSize: 16,
        color: "rgba(0, 0, 0, 0.5)"
    },
    buyerOrderAddressItemAddress: {
        fontSize: 16,
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
        fontSize: 16,
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
    buyerOrderId: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
        width: ScreenWidth / 1.4
    },
    buyerOrderFooterContainer: {
        width: ScreenWidth / 1.05,
        alignSelf: "center",
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: "#f9f9f9",
        gap: 10
    },
    buyerOrderFooterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    buyerOrderFooterItemTxt: {
        fontSize: 15,
        fontWeight: "500",
        width: ScreenWidth / 1.1,
        color: "rgba(0, 0, 0, 0.5)"
    },
    buyerOrderFooterItemTxt2: {
        fontSize: 15,
        fontWeight: "500",
        width: ScreenWidth / 1.8,
        color: "rgba(0, 0, 0, 0.5)",
        textAlign: "left"
    },
    buyerOrderFooterItemTxt3: {
        fontSize: 15,
        fontWeight: "500",
        width: ScreenWidth / 3,
        color: "rgba(0, 0, 0, 0.5)",
        textAlign: "right"
    },
    buyerOrderFooterDivider: {
        borderTopWidth: 0.5,
        borderColor: "rgba(0, 0, 0, 0.5)",
        marginVertical: 5
    },
    buyerOrderReasonContainer: {
        width: ScreenWidth / 1.05,
        alignSelf: "center",
        marginTop: 10,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 20,
        backgroundColor: "#f9f9f9",
        gap: 10
    },
    buyerOrderReasonHeader: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
        width: ScreenWidth / 1.4
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottieAnimation: {
        width: ScreenWidth,
        height: ScreenWidth / 1.5,
    },
    loadingText: {
        fontSize: 18,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        color: 'red',
    },
    listHeaderStyle: {
        marginBottom: 10,
    },
    snackbar: {
        bottom: 0,
    },
    copyText: {
        color: "#ed8900",
        fontSize: 16,
        fontWeight: "500"
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: ScreenWidth * 0.8,
    },
    modalText: {
        fontSize: 15,
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10,
        width: ScreenWidth * 0.25,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ed8900',
    },
    confirmButton: {
        backgroundColor: '#ed8900',
    },
    cancelButtonText: {
        fontWeight: 'bold',
        color: '#ed8900',
    },
    confirmButtonText: {
        fontWeight: 'bold',
        color: 'white',
    },
});
