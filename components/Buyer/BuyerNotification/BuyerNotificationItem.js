import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { ScreenWidth } from '@rneui/base';
import api from '../../Authorization/api';
import useNotification from '../../../utils/useNotification';

export default function BuyerNotificationItem({
    id,
    title,
    content,
    isRead,
    type,
    sellerOrderId,
    createdAt,
    customer,
    seller,
    index,
    newNotificationsLength,
    setIsError,
    setStringErr,
    setIsFetching,
}) {

    const navigation = useNavigation();

    const { markNotificationAsRead } = useNotification();

    const handleReadNoti = async () => {
        try {
            if (!isRead) {
                setIsFetching(true);
                await api.put(
                    `/notification/${id}`
                );
                setIsFetching(false);
                markNotificationAsRead(id);
            }
            switch (type) {
                case "WalletTracking":
                    navigation.navigate("WalletTrackingScreen");
                    break;
                case "SellerOrder":
                    if (sellerOrderId) {
                        navigation.navigate('BuyerOrderDetail', { sellerOrderId: sellerOrderId })
                    }
                    break;
                case "User":
                case "Order":
                default:
                    break;
            }
        } catch (error) {
            setIsError(true);
            setStringErr(
                error.response?.data?.reasons[0]?.message
                    ? error.response.data.reasons[0].message
                    : "Lỗi mạng vui lòng thử lại sau"
            );
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
        <>
            {
                (index == 0 && newNotificationsLength > 0) &&
                <Text style={{
                    fontWeight: "500",
                    fontSize: 16,
                    paddingHorizontal: 10,
                    paddingVertical: 16
                }}>Trước đó</Text>
            }
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    gap: 10,
                    backgroundColor: isRead ? null : "rgba(242, 174, 100, 0.3)",
                    paddingVertical: 10,
                    paddingHorizontal: 10
                }}
                onPress={() => {
                    handleReadNoti();
                }}
            >
                <View
                    style={{
                        height: 40,
                        width: 40,
                        borderRadius: 30,
                        backgroundColor: "#ed8900",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: "#ffecd0" }}>
                        S
                    </Text>
                </View>
                <View>
                    <Text style={{
                        fontWeight: "500"
                    }}>Hệ thống - {formatVietnamDate(createdAt)}</Text>
                    <Text style={{
                        width: ScreenWidth / 1.2,
                    }}>{content}</Text>
                    <Text style={{ color: "rgba(0, 0, 0, 0.5)", fontSize: 15 }}>
                        {
                            formatDistanceToNow(new Date(createdAt), {
                                addSuffix: true,
                                locale: vi
                            }) //Create at
                        }
                    </Text>
                </View>
            </TouchableOpacity>
        </>
    )
}