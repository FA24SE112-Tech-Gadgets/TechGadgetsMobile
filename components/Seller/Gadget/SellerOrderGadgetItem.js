import { ScreenHeight, ScreenWidth } from "@rneui/base";
import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { Entypo } from '@expo/vector-icons';

const SellerOrderGadgetItem = ({
    thumbnailUrl,
    name,
    price,
    quantity,
    discountPrice,
    discountPercentage,
    totalGadgets,
    index,
    totalAmount,
    isOpenPriceDetail,
    setOpenPriceDetail,
    discountAmount,
    beforeAppliedDiscountAmount
}) => {
    function formatCurrency(number) {
        // Convert the number to a string
        if (number) {
            let numberString = number.toString();

            // Regular expression to add dot as thousand separator
            let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";

            return formattedString;
        } else {
            return "0 ₫";
        }
    }

    return (
        <>
            <View style={[
                styles.container,
                index === 0 && styles.firstItem, // Apply top rounded corners to the first item
            ]}
            >
                <View style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginRight: 10
                }}>
                    <ImageBackground
                        source={{ uri: thumbnailUrl }} // Replace with your image URL
                        style={styles.image}
                    >
                    </ImageBackground>
                    {discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{discountPercentage}%</Text>
                        </View>
                    )}
                </View>

                <View style={styles.detailsContainer}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {name}
                    </Text>

                    <Text style={[styles.name, {
                        fontSize: 14,
                        fontWeight: "400",
                        alignSelf: "flex-end",
                        color: "rgba(0, 0, 0, 0.5)"
                    }]} numberOfLines={1}>
                        x{quantity}
                    </Text>

                    <View style={{
                        flexDirection: "row",
                        gap: 5,
                        alignSelf: "flex-end",
                    }}>
                        {discountPercentage > 0 ? (
                            <>
                                <Text style={styles.originalPrice}>{formatCurrency(price)}</Text>
                                <Text style={styles.discountPrice}>{formatCurrency(discountPrice)}</Text>
                            </>
                        ) : (
                            <Text style={styles.discountPrice}>{formatCurrency(price)}</Text>
                        )}
                    </View>
                </View>
            </View>
            {
                index === totalGadgets - 1 &&
                <View
                    onStartShouldSetResponder={() => true} // Chặn sự kiện chạm
                    onTouchEnd={(e) => {
                        e.stopPropagation(); // Ngăn sự kiện lan ra ngoài
                    }}
                >
                    {
                        isOpenPriceDetail &&
                        <View style={[
                            {
                                width: ScreenWidth / 1.05,
                                alignSelf: "center",
                                backgroundColor: "white",
                                paddingHorizontal: 10,
                                paddingVertical: 15,
                                borderTopWidth: 0.2,
                                borderColor: "rgba(0, 0, 0, 0.5)",
                                gap: 5
                            }
                        ]}>
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}>
                                <Text style={{
                                    fontSize: 12
                                }}>Tổng tiền hàng</Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: "rgba(0, 0, 0, 0.5)"
                                }}>{formatCurrency(beforeAppliedDiscountAmount)}</Text>
                            </View>
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between"
                            }}>
                                <Text style={{
                                    fontSize: 12
                                }}>Phí giảm giá</Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: "rgba(0, 0, 0, 0.5)"
                                }}>- {formatCurrency(discountAmount)}</Text>
                            </View>
                        </View>
                    }

                    <View style={[
                        {
                            width: ScreenWidth / 1.05,
                            alignSelf: "center",
                            backgroundColor: "white",
                            paddingHorizontal: 10,
                            paddingVertical: 15,
                            justifyContent: "flex-end",
                            borderTopWidth: 0.5,
                            borderColor: "rgba(0, 0, 0, 0.5)",
                            flexDirection: "row",
                            gap: 5
                        },
                        index === totalGadgets - 1 && styles.lastItem
                    ]}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '500',
                        }}>
                            Thành tiền:
                            <Text style={{
                                fontWeight: 'bold',
                                color: '#ed8900',
                            }}>{" " + formatCurrency(totalAmount)}</Text>
                        </Text>
                        <TouchableOpacity
                            onPress={() => setOpenPriceDetail(!isOpenPriceDetail)}
                            style={{
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                        >
                            <Entypo name={isOpenPriceDetail ? "chevron-up" : "chevron-down"} size={18} color="rgba(0, 0, 0, 0.5)" />
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: ScreenWidth / 1.05,
        alignSelf: "center",
        backgroundColor: "white",
        paddingHorizontal: 10,
        paddingVertical: 15
    },
    firstItem: {
        borderTopLeftRadius: 15, // Rounded corners for the first item
        borderTopRightRadius: 15,
    },
    lastItem: {
        borderBottomLeftRadius: 15, // Rounded corners for the last item
        borderBottomRightRadius: 15,
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        right: 6,
        transform: [{ rotate: '0deg' }],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    discountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    image: {
        width: ScreenWidth / 6,
        height: ScreenHeight / 18,
    },
    detailsContainer: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 5,
    },
    price: {
        fontSize: 16,
        fontWeight: "500",
    },
    originalPrice: {
        fontSize: 14,
        color: '#999',
        textDecorationLine: 'line-through',
        marginBottom: 2,
    },
    discountPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ed8900',
    },
});

export default SellerOrderGadgetItem;
