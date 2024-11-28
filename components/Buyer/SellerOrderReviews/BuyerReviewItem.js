import { View, Text, TouchableOpacity, ImageBackground, TextInput, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { Icon, ScreenHeight, ScreenWidth } from '@rneui/base';
import { Image } from 'react-native';
import RenderStars from '../../CustomComponents/RenderStars';
import useAuth from '../../../utils/useAuth';
import { Feather } from '@expo/vector-icons';
import api from '../../Authorization/api';
import { useNavigation } from '@react-navigation/native';

export default function BuyerReviewItem({
    sellerOrderItemId,
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
    setSnackbarMessage,
    updateReviewById,
    setReviews,
    scrollToIndex,
    index
}) {
    const { user } = useAuth();

    const [newReview, setNewReview] = useState("");
    const [ratingStars, setRatingStars] = useState(0);
    const [maxStars] = useState(5);

    const [isReplying, setIsReplying] = useState(false);
    const [openEditField, setOpenEditField] = useState(false);

    const navigation = useNavigation();

    const handleSendReview = async () => {
        try {
            setIsReplying(true);
            if (sortOption === "NotReview") {
                await api.post(`/review/seller-order-item/${sellerOrderItemId}`, {
                    rating: ratingStars,
                    content: newReview
                });
            } else {
                await api.patch(`/review/${review.id}`, {
                    rating: ratingStars,
                    content: newReview
                });
            }
            setIsReplying(false);
            setSnackbarMessage(sortOption === "NotReview" ? "Đánh giá thành công" : "Sửa thành công");
            setSnackbarVisible(true);

            if (sortOption === "NotReview") {
                setReviews([]);
                setRefreshing(!refreshing);
            } else {
                updateReviewById(review.id, ratingStars, newReview);
                setOpenEditField(false);
            }
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

    const RatingStars = () => {
        const starColor = (index) => {
            if (ratingStars >= index) {
                return "#ed8900"; // Yellow
            } else {
                return "#D3D3D3"; // Gray
            }
        };

        return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {Array.from({ length: maxStars }, (_, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        onPress={() => setRatingStars(index + 1)}
                    >
                        <Icon
                            type="font-awesome"
                            name="star"
                            size={(sortOption === "Reviewed" && openEditField) ? 15 : 20}
                            color={starColor(index + 1)}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

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
                sortOption == "NotReview" ?
                    <View style={{
                        gap: 10,
                        backgroundColor: "rgba(254, 161, 40, 0.5)",
                        borderTopRightRadius: 10 + 10,
                        borderTopLeftRadius: 10 + 10,
                        borderBottomRightRadius: 20 + 10,
                        borderBottomLeftRadius: 20 + 10,
                        marginVertical: 5,
                        justifyContent: "flex-start",
                        padding: 10,
                        borderWidth: 0.5
                    }}>
                        {/* Gadget */}
                        <TouchableOpacity style={{
                            flexDirection: "row",
                            gap: 10,
                            backgroundColor: "rgba(0, 0, 0, 0.1)",
                            borderRadius: 10,
                            alignItems: "center"
                        }}
                            onPress={() => { navigation.navigate('GadgetSellerDetail', { gadgetId: gadgetId }) }}
                        >
                            {/* thumbnailUrl */}
                            <View style={{
                                width: ScreenWidth / 4,
                                height: ScreenHeight / 17,
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

                        {/* Rating */}
                        <View style={{
                            flexDirection: "row",
                            gap: 10
                        }}>
                            <Text>Đánh giá:</Text>
                            <RatingStars />
                        </View>

                        {/* Ô input */}
                        <View style={{
                            backgroundColor: "#f9f9f9",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 20,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderWidth: 0.5
                        }}>
                            <TextInput
                                placeholder={"Đánh giá của bạn"}
                                returnKeyType="search"
                                style={{ width: ScreenWidth / 1.7, textAlign: "left" }}
                                value={newReview}
                                onChangeText={(value) => setNewReview(value)}
                                onPressIn={() => {
                                    scrollToIndex(index);
                                }}
                            />
                            {
                                isReplying ?
                                    <ActivityIndicator color={"#ed8900"} />
                                    :
                                    <TouchableOpacity
                                        disabled={newReview == ""}
                                        onPress={() => {
                                            handleSendReview();
                                        }}
                                    >
                                        <Feather name="send" size={20} color={newReview == "" ? "rgba(0, 0, 0, 0.5)" : "#ed8900"} />
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>
                    :
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
                            {/* FullName and Number of stars with edit button */}
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: ScreenWidth / 1.25
                            }}>
                                {/* FullName and Number of stars */}
                                <View>
                                    {/* FullName */}
                                    <Text
                                        style={{
                                            width: ScreenWidth / 1.4,
                                        }}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >{review?.customer.fullName}</Text>

                                    {/* Number of stars */}
                                    <View style={{
                                        flexDirection: "row",
                                        columnGap: -4,
                                        alignItems: "center"
                                    }}>
                                        {
                                            (sortOption === "Reviewed" && openEditField) ?
                                                <RatingStars />
                                                :
                                                <RenderStars avgRating={review?.rating} size={16} />
                                        }
                                        <Text style={{
                                            fontSize: 12,
                                            color: "rgba(0, 0, 0, 0.5)",
                                            marginLeft: 10
                                        }}>{review?.isUpdated ? "Đã chỉnh sửa" : ""}</Text>
                                        {
                                            review?.status !== "Active" &&
                                            <View style={{
                                                backgroundColor: "rgb(210, 65, 82)",
                                                paddingHorizontal: 10,
                                                paddingVertical: 5,
                                                marginLeft: 10,
                                                borderRadius: 10
                                            }}>
                                                <Text style={{
                                                    fontSize: 12,
                                                    color: "white",
                                                }}>Khóa</Text>
                                            </View>
                                        }
                                    </View>
                                </View>

                                {/* Edit button */}
                                {
                                    !review?.isUpdated &&
                                    <TouchableOpacity
                                        style={{
                                            alignSelf: "center"
                                        }}
                                        onPress={() => {
                                            setOpenEditField(!openEditField);
                                            setRatingStars(review ? review.rating : 0);
                                            setNewReview(review ? review.content : "");
                                        }}
                                    >
                                        <Feather name="edit" size={20} color="black" />
                                    </TouchableOpacity>
                                }
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
                                onPress={() => {
                                    if (status === "Active") {
                                        navigation.navigate('GadgetSellerDetail', { gadgetId: gadgetId })
                                    } else {
                                        setStringErr("Sản phẩm này không còn tồn tại nữa.");
                                        setIsError(true);
                                    }
                                }}
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
                                (review.sellerReply && review.sellerReply.status === "Active") &&
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
                                    </View>
                                </>
                            }

                            {
                                (sortOption === "Reviewed" && openEditField) &&
                                <View style={{
                                    marginVertical: 10,
                                    backgroundColor: "#f9f9f9",
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    borderRadius: 20,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <TextInput
                                        placeholder={"Đánh giá của bạn"}
                                        returnKeyType="search"
                                        style={{ width: ScreenWidth / 1.7, textAlign: "left" }}
                                        value={newReview}
                                        onChangeText={(value) => setNewReview(value)}
                                        onPressIn={() => {
                                            scrollToIndex(index);
                                        }}
                                    />
                                    {
                                        isReplying ?
                                            <ActivityIndicator color={"#ed8900"} />
                                            :
                                            <TouchableOpacity
                                                disabled={(newReview == review.content && ratingStars == review.rating) || newReview == ""}
                                                onPress={() => {
                                                    handleSendReview();
                                                }}
                                            >
                                                <Feather name="send" size={20} color={(newReview == review.content && ratingStars == review.rating) || newReview == "" ? "rgba(0, 0, 0, 0.5)" : "#ed8900"} />
                                            </TouchableOpacity>
                                    }
                                </View>
                            }
                        </View>
                    </View>
            }
        </>
    )
}