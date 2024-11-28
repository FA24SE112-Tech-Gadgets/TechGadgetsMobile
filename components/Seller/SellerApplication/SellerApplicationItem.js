import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Clipboard from '@react-native-clipboard/clipboard';
import { ScreenWidth } from '@rneui/base';

export default function SellerApplicationItem({
    shopName,
    businessModel,
    status,
    createdAt,
    id,
    handleViewDetails,
    setSnackbarMessage,
    setSnackbarVisible
}) {
    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        setSnackbarMessage("Sao chép thành công");
        setSnackbarVisible(true);
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    return (
        <TouchableOpacity
            style={{
                backgroundColor: "#F9F9F9",
                paddingHorizontal: 15,
                paddingVertical: 10,
                borderRadius: 10 + 10,
                borderWidth: 0.5,
                borderColor: "rgba(0, 0, 0, 0.5)"
            }}
            onPress={() => {
                if (id) {
                    handleViewDetails(id)
                }
            }}
        >
            {/* Seller application id */}
            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    marginBottom: 5,
                    width: ScreenWidth / 1.6
                }} numberOfLines={1} ellipsizeMode="tail">
                    Mã đơn: {id}
                </Text>
                <TouchableOpacity
                    disabled={id != null ? false : true}
                    onPress={() => copyToClipboard(id)}
                >
                    <Text style={{ color: "#ed8900", fontSize: 14, fontWeight: "500" }}>Sao chép</Text>
                </TouchableOpacity>
            </View>

            {/* shopName */}
            <Text style={{
                fontSize: 15,
                fontWeight: "500",
            }}>
                Tên cửa hàng:
                <Text style={{ fontWeight: "400" }}>{" " + shopName}</Text>
            </Text>

            {/* businessModel */}
            <Text style={{
                fontSize: 15,
                fontWeight: "500",
            }}>
                Mô Hình Kinh Doanh:
                <Text style={{ fontWeight: "400" }}>{" " + (businessModel === 'BusinessHousehold' ? 'Hộ Kinh Doanh' :
                    businessModel === 'Personal' ? 'Cá Nhân' :
                        businessModel === 'Company' ? 'Công Ty' : businessModel)}</Text>
            </Text>

            {/* Status */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 5,
                gap: 10
            }}>
                <Text style={{
                    fontSize: 15,
                    fontWeight: "500",
                }}>Trạng thái:</Text>
                <View style={{
                    backgroundColor: "white",
                    borderWidth: 0.5,
                    borderColor: "rgba(0, 0, 0, 0.5)",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10
                }}>
                    <Text style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: status == "Pending" ? "rgb(255, 193, 0)" : status === 'Approved' ? "rgb(77, 218, 98)" : "rgb(210, 65, 82)",
                    }}>{status === 'Pending' ? 'Đang Chờ' : status === 'Approved' ? 'Đã Duyệt' : 'Bị Từ Chối'}</Text>
                </View>
            </View >

            <Text style={{
                textAlign: 'center',
                fontSize: 15,
            }}>{formatDateTime(createdAt)}</Text>
        </TouchableOpacity>
    )
}