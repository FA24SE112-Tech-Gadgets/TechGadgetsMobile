import { View, Text, TouchableOpacity, ImageBackground, TextInput, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import { Image } from 'react-native';
import RenderStars from '../../CustomComponents/RenderStars';
import useAuth from '../../../utils/useAuth';
import { Feather } from '@expo/vector-icons';
import api from '../../Authorization/api';
import { useNavigation } from '@react-navigation/native';

export default function ReviewItem({
    gadgetId,
    name,
    thumbnailUrl,
    review,
    status,
    sortOption,
    setStringErr,
    setIsError,
    refreshing,
    setRefreshing,
    setSnackbarVisible,
    setSnackbarMessage
}) {
    const { user } = useAuth();

    const [newSellerReply, setNewSellerReply] = useState("");

    const [isReplying, setIsReplying] = useState(false);
    const [openEditField, setOpenEditField] = useState(false);

    const navigation = useNavigation();

    const handleSendReply = async () => {
        try {
            setIsReplying(true);
            if (sortOption === "NotReply") {
                await api.post(`/seller-reply/review/${review.id}`, {
                    content: newSellerReply
                });
            } else {
                await api.patch(`/seller-reply/${review.sellerReply.id}`, {
                    content: newSellerReply
                });
            }
            setIsReplying(false);
            setSnackbarMessage(sortOption === "NotReply" ? "Phản hồi thành công" : "Sửa thành công");
            setSnackbarVisible(true);
            setRefreshing(!refreshing);
        } catch (error) {
            setIsReplying(false);
            setIsError(true);

            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
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
            <View style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10
            }}>
                {/* Customer avatar */}
                {review?.customer?.avatarUrl ? (
                    <Image
                        source={{
                            uri: review?.customer.avatarUrl,
                        }}
                        style={{
                            height: 40,
                            width: 40,
                            backgroundColor: "black",
                            borderRadius: 30,
                        }}
                    />
                ) : (
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
                        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
                            {review?.customer !== null ? review?.customer.fullName?.charAt(0) : "G"}
                        </Text>
                    </View>
                )}

                <View>
                    {/* FullName */}
                    <Text
                        style={{
                            width: ScreenWidth / 1.4
                        }}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >{review?.customer.fullName}</Text>

                    {/* Number of stars */}
                    <View style={{ flexDirection: "row", columnGap: -4 }}>
                        <RenderStars avgRating={review?.rating} size={16} />
                        <Text style={{
                            fontSize: 12,
                            color: "rgba(0, 0, 0, 0.5)",
                            marginLeft: 10
                        }}>{review?.isUpdated ? "Đã chỉnh sửa" : ""}</Text>
                    </View>

                    {/* CreatedAt and categoryName */}
                    <View style={{
                        flexDirection: "row",
                        marginVertical: 10,
                    }}>
                        <Text style={{
                            color: "rgba(0, 0, 0, 0.5)"
                        }}>{formatVietnamDate(review?.createdAt)}</Text>

                        <Text style={{
                            color: "rgba(0, 0, 0, 0.5)"
                        }}> | Phân loại: {review?.categoryName}</Text>
                    </View>

                    {/* Content */}
                    <Text style={{
                        width: ScreenWidth / 1.25,
                    }}>{review?.content}</Text>

                    {/* Gadget */}
                    <TouchableOpacity style={{
                        flexDirection: "row",
                        gap: 10,
                        width: ScreenWidth / 1.25,
                        backgroundColor: "rgba(0, 0, 0, 0.1)",
                        borderRadius: 10,
                        alignItems: "center",
                        marginVertical: 10
                    }}
                        onPress={() => { navigation.navigate('GadgetSellerDetail', { gadgetId: gadgetId }) }}
                    >
                        {/* thumbnailUrl */}
                        <View style={{
                            width: ScreenWidth / 5.5,
                            height: ScreenHeight / 20,
                            borderRadius: 10,
                            borderColor: "rgba(0, 0, 0, 0.5)",
                            borderWidth: 0.5,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "white"
                        }}>
                            <ImageBackground
                                source={{ uri: thumbnailUrl }} // Replace with your image URL
                                style={{
                                    width: ScreenWidth / 8,
                                    height: ScreenHeight / 25,
                                }}
                            >
                            </ImageBackground>
                        </View>

                        {/* gadget name */}
                        <Text
                            style={{
                                width: ScreenWidth / 1.75,
                            }}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >{name}</Text>
                    </TouchableOpacity>

                    {/* Seller reply */}
                    {
                        sortOption === "Replied" &&
                        <>
                            <Text style={{
                                color: "rgba(0, 0, 0, 0.5)"
                            }}>Phản hồi của bạn:</Text>
                            <View style={{
                                flexDirection: "row",
                                gap: 10
                            }}>
                                {/* Shop avatar */}
                                <View
                                    style={{
                                        height: 35,
                                        width: 35,
                                        borderRadius: 30,
                                        backgroundColor: "#ed8900",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>
                                        {user?.seller !== null ? user.seller.shopName?.charAt(0) : "G"}
                                    </Text>
                                </View>

                                {/* SellerName and SellerReplyContent */}
                                <View style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 10
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        gap: 10,
                                        alignItems: "center"
                                    }}>
                                        {/* seller name */}
                                        <Text
                                            style={{ fontWeight: "500", color: "black", overflow: "hidden", width: review?.sellerReply.isUpdated ? (ScreenWidth / 3) : (ScreenWidth / 1.9) }}
                                            numberOfLines={1} // Giới hạn hiển thị trên 1 dòng
                                            ellipsizeMode="tail" // Thêm "..." vào cuối nếu quá dài
                                        >
                                            {review.sellerReply !== null ? review.sellerReply.seller?.shopName : "Người dùng hệ thống"}
                                        </Text>
                                        <Text style={{
                                            fontSize: 12,
                                            color: "rgba(0, 0, 0, 0.8)"
                                        }}>{review?.sellerReply.isUpdated ? "Đã chỉnh sửa" : ""}</Text>
                                    </View>

                                    {/* seller reply content */}
                                    <Text style={{ color: "black" }}>
                                        {review.sellerReply !== null ? review.sellerReply?.content : "Cảm ơn bạn đã ủng hộ shop"}
                                    </Text>
                                </View>

                                {/* Edit button */}
                                {
                                    !review?.sellerReply?.isUpdated &&
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center"
                                        }}
                                        onPress={() => {
                                            setOpenEditField(!openEditField);
                                            setNewSellerReply(review.sellerReply ? review.sellerReply?.content : "");
                                        }}
                                    >
                                        <Feather name="edit" size={20} color="black" />
                                    </TouchableOpacity>
                                }
                            </View>
                        </>
                    }

                    {
                        (sortOption === "NotReply" || openEditField) &&
                        <View style={{
                            marginTop: 10,
                            backgroundColor: "#f9f9f9",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 20,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <TextInput
                                placeholder={"Phản hồi của bạn"}
                                returnKeyType="search"
                                style={{ width: ScreenWidth / 1.7, textAlign: "left" }}
                                value={newSellerReply}
                                onChangeText={(value) => setNewSellerReply(value)}
                            />
                            {
                                isReplying ?
                                    <ActivityIndicator color={"#ed8900"} />
                                    :
                                    <TouchableOpacity
                                        disabled={newSellerReply == "" || newSellerReply == review.sellerReply?.content}
                                        onPress={() => {
                                            handleSendReply();
                                        }}
                                    >
                                        <Feather name="send" size={20} color={newSellerReply == "" || newSellerReply == review.sellerReply?.content ? "rgba(0, 0, 0, 0.5)" : "#ed8900"} />
                                    </TouchableOpacity>
                            }
                        </View>
                    }
                </View>
            </View>
        </>
    )
}