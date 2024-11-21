import { ScreenHeight, ScreenWidth } from "@rneui/base";
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

const GadgetItem = ({ thumbnailUrl, name, price, quantity, discountPrice, isForSale, gadgetStatus, discountPercentage }) => {
    function formatCurrency(number) {
        // Convert the number to a string
        if (number) {
            let numberString = number.toString();

            // Regular expression to add dot as thousand separator
            let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";

            return formattedString;
        }
    }

    return (
        <>
            <View style={styles.container}>
                <View style={{
                    width: ScreenWidth / 2.5,
                    height: ScreenHeight / 7,
                    borderRadius: 15,
                    marginRight: 10,
                    borderColor: "#ed8900",
                    borderWidth: 2,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white"
                }}>
                    <Image source={{ uri: thumbnailUrl }} style={styles.image} />
                    {discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>-{discountPercentage}%</Text>
                        </View>
                    )}
                </View>
                {(gadgetStatus !== "Active") && (
                    <View style={styles.statusWatermark}>
                        <Text style={styles.statusText}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                    </View>
                )}
                {(!isForSale && gadgetStatus === "Active") && (
                    <View style={styles.watermarkContainer}>
                        <Text style={styles.watermarkText}>Ngừng bán</Text>
                    </View>
                )}

                <View style={styles.detailsContainer}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {name}
                    </Text>

                    <Text style={[styles.name, {
                        fontSize: 16,
                        fontWeight: "500"
                    }]} numberOfLines={1}>
                        Kho: {quantity}
                    </Text>

                    <View style={{
                        flexDirection: "row",
                        gap: 5
                    }}>
                        <Text style={[styles.name, {
                            fontSize: 16,
                            fontWeight: "500"
                        }]}>
                            Tình trạng:
                        </Text>

                        <Text style={[styles.name, {
                            color: quantity > 0 ? "#50C346" : "#C40C0C",
                            fontSize: 16
                        }]} numberOfLines={1} ellipsizeMode="tail">
                            {quantity > 0 ? "Còn hàng" : "Hết hàng"}
                        </Text>
                    </View>

                    <View style={{
                        flexDirection: "row",
                        gap: 5
                    }}>
                        {/* <Text style={styles.price}>{formatCurrency(price)}</Text> */}
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
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center"
    },
    watermarkContainer: {
        position: 'absolute',
        top: 20,
        left: -8,
        right: -8,
        bottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '0deg' }],
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1,
    },
    watermarkText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        padding: 4,
    },
    statusWatermark: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 15,
        paddingHorizontal: 15
    },
    statusText: {
        color: 'red',
        fontSize: 20,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    discountBadge: {
        position: 'absolute',
        top: 5,
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
        width: ScreenWidth / 3,
        height: ScreenHeight / 9,
    },
    detailsContainer: {
        flex: 1,
    },
    name: {
        fontSize: 19,
        fontWeight: "700",
        marginBottom: 5,
    },
    ratingsContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 5,
    },
    rating: {
        fontSize: 14,
        fontWeight: "500",
        marginRight: 5,
    },
    numRating: {
        fontSize: 14,
        fontWeight: "500",
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

export default GadgetItem;
