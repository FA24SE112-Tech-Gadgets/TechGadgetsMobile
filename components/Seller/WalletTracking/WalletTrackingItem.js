import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Clipboard from '@react-native-clipboard/clipboard';
import { ScreenWidth } from '@rneui/base';
import { useNavigation } from '@react-navigation/native';

export default function WalletTrackingItem({ id, amount, type, status, sellerOrderId, createdAt, setSnackbarMessage, setSnackbarVisible }) {
    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        setSnackbarMessage("Sao chép thành công");
        setSnackbarVisible(true);
    };

    const navigation = useNavigation();

    function formatCurrency(number) {
        // Convert the number to a string
        if (number) {
            let numberString = number.toString();

            // Regular expression to add dot as thousand separator
            let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";

            return formattedString;
        }
    }

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

    return (
        <TouchableOpacity onPress={() => {
            if (sellerOrderId) {
                navigation.navigate('SellerOrderDetail', { sellerOrderId: sellerOrderId })
            }
        }}>
            {/* Wallet tracking id */}
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <Text style={{
                    fontSize: 19,
                    fontWeight: "700",
                    marginBottom: 5,
                    width: ScreenWidth / 1.4
                }} numberOfLines={1} ellipsizeMode="tail">
                    Mã giao dịch: {id}
                </Text>
                <TouchableOpacity
                    disabled={id != null ? false : true}
                    onPress={() => copyToClipboard(id)}
                >
                    <Text style={{ color: "#ed8900", fontSize: 16, fontWeight: "500" }}>Sao chép</Text>
                </TouchableOpacity>
            </View>

            {/* wallet tracking type */}
            <Text style={{
                fontSize: 16,
                fontWeight: "500",
            }}>
                Loại giao dịch:
                <Text style={{ fontWeight: "400" }}>{" " + (type === "SellerTransfer" ? "Giao dịch tự động" : "Giao dịch khác")}</Text>
            </Text>

            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 5
            }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "500",
                }}>Trạng thái:</Text>
                <View style={{
                    backgroundColor: "#f9f9f9",
                    borderWidth: 0.5,
                    borderColor: "rgba(0, 0, 0, 0.5)",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10
                }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: status == "Success" ? "green" : "black",
                    }}>{status == "Success" ? "Hoàn thành" : "Chờ về"}</Text>
                </View>
            </View >

            {/* amount and createdAt */}
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 5
            }}>
                <Text
                    style={{
                        fontSize: 16,
                        color: status == "Success" ? "green" : "black",
                        fontWeight: "500"
                    }}
                >{status == "Success" ? "+ " : ""}{formatCurrency(amount)}</Text>
                <Text style={{ fontWeight: "400" }}>{formatVietnamDate(createdAt)}</Text>
            </View >
        </TouchableOpacity>
    )
}