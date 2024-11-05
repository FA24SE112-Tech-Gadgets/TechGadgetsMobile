import Clipboard from "@react-native-clipboard/clipboard";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid } from "react-native";

const SellerOrderItem = ({ id, customer, amount, status, createdAt }) => {
    function formatCurrency(number) {
        // Convert the number to a string
        if (number) {
            let numberString = number.toString();

            // Regular expression to add dot as thousand separator
            let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";

            return formattedString;
        }
    }

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        ToastAndroid.show("Sao chép thành công", ToastAndroid.CENTER);
    };

    const formatVietnamDate = (time) => {
        const date = new Date(time);
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
        const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
        const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = vietnamTime.getUTCFullYear();

        return `${day}/${month}/${year}`;
    };

    return (
        <>
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <Text style={styles.sellerOrderId} numberOfLines={1} ellipsizeMode="tail">
                    Mã đơn hàng: {id}
                </Text>
                <TouchableOpacity
                    disabled={id != null ? false : true}
                    onPress={() => copyToClipboard(id)}
                >
                    <Text style={{ color: "#ed8900", fontSize: 16, fontWeight: "500" }}>Sao chép</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sellerOrderDetail}>
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Text style={styles.sellerOrderTxt}>
                        Đến:
                        <Text style={{ fontWeight: "400" }}>{" " + customer.fullName}</Text>
                    </Text>
                    <Text style={styles.sellerOrderTxt}>
                        Ngày tạo:
                        <Text style={{ fontWeight: "400" }}>{" " + formatVietnamDate(createdAt)}</Text>
                    </Text>
                </View>
                <Text style={styles.sellerOrderTxt}>Địa chỉ người nhận:</Text>
                <Text style={{
                    backgroundColor: "#F9F9F9",
                    padding: 10,
                    height: ScreenHeight / 10,
                    borderWidth: 1,
                    borderColor: "grey",
                    borderRadius: 10
                }}>{customer.address}</Text>
                <View style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center"
                }}>
                    <Text style={styles.sellerOrderTxt}>
                        Sđt người nhận:
                        <Text style={{ fontWeight: "400" }}>{" " + customer.phoneNumber}</Text>
                    </Text>
                    <TouchableOpacity
                        disabled={customer.phoneNumber != null ? false : true}
                        onPress={() => copyToClipboard(customer.phoneNumber)}
                    >
                        <Text style={{ color: "#ed8900", fontSize: 16, fontWeight: "500" }}>Sao chép</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.sellerOrderTxt} numberOfLines={1}>
                    Tổng:
                    <Text style={{ color: "#ed8900", fontWeight: "500" }}>{" " + formatCurrency(amount)}</Text>
                </Text>

                <View style={{
                    flexDirection: "row",
                    gap: 5
                }}>
                    <Text style={styles.sellerOrderTxt}>
                        Tình trạng:
                    </Text>

                    <Text style={[{
                        color: status === "Success" ? "#50C346" : status === "Pending" ? "#FFC100" : "#C40C0C",
                        fontSize: 16
                    }]} numberOfLines={1} ellipsizeMode="tail">
                        {status === "Success" ? "Đã giao" : status === "Pending" ? "Chờ xử lý" : "Đã hủy"}
                    </Text>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    sellerOrderTxt: {
        fontSize: 16,
        fontWeight: "500",
    },
    sellerOrderDetail: {
        flex: 1,
        gap: 5
    },
    sellerOrderId: {
        fontSize: 19,
        fontWeight: "700",
        marginBottom: 5,
        width: ScreenWidth / 1.4
    }
});

export default SellerOrderItem;
