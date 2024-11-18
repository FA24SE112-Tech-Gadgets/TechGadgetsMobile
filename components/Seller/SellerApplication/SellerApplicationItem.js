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
                    fontSize: 19,
                    fontWeight: "700",
                    marginBottom: 5,
                    width: ScreenWidth / 1.4
                }} numberOfLines={1} ellipsizeMode="tail">
                    Mã đơn: {id}
                </Text>
                <TouchableOpacity
                    disabled={id != null ? false : true}
                    onPress={() => copyToClipboard(id)}
                >
                    <Text style={{ color: "#ed8900", fontSize: 16, fontWeight: "500" }}>Sao chép</Text>
                </TouchableOpacity>
            </View>

            {/* shopName */}
            <Text style={{
                fontSize: 16,
                fontWeight: "500",
            }}>
                Tên cửa hàng:
                <Text style={{ fontWeight: "400" }}>{" " + shopName}</Text>
            </Text>

            {/* businessModel */}
            <Text style={{
                fontSize: 16,
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
                    fontSize: 16,
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
                        fontSize: 16,
                        fontWeight: "bold",
                        color: status == "Pending" ? "rgb(255, 193, 0)" : status === 'Approved' ? "rgb(77, 218, 98)" : "rgb(210, 65, 82)",
                    }}>{status === 'Pending' ? 'Đang Chờ' : status === 'Approved' ? 'Đã Duyệt' : 'Bị Từ Chối'}</Text>
                </View>
            </View >

            <Text style={{
                textAlign: 'center',
                fontSize: 14,
            }}>{new Date(createdAt).toLocaleString()}</Text>
        </TouchableOpacity>
    )
}