import { ScreenHeight, ScreenWidth } from "@rneui/base";
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import CustomGadgetImage from "./CustomGadgetImage";
import api from "../../../Authorization/api";

const GadgetSearchItem = ({
    id,
    thumbnailUrl,
    name,
    price,
    isFavorite,
    discountPrice,
    isForSale,
    gadgetStatus,
    discountPercentage,
    setGadgets
}) => {
    const toggleFavorite = async (gadgetId) => {
        try {
            await api.post(`/favorite-gadgets/${gadgetId}`);
            // Update the `isFavorite` property of the gadget with the specified ID
            setGadgets(prevGadgets => {
                return prevGadgets.map(gadget => {
                    // Find the gadget with the specified ID and toggle its `isFavorite` status
                    if (gadget.id === gadgetId) {
                        return {
                            ...gadget,
                            isFavorite: !gadget.isFavorite // Toggle the current value
                        };
                    }
                    // For other gadgets, return as is
                    return gadget;
                });
            });
        } catch (error) {
            console.log('Error toggling favorite:', error);
        }
    };

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
            <View style={{
                width: (ScreenWidth - 30) / 2,
                backgroundColor: "rgba(254, 169, 40, 0.8)",
                padding: 10,
                borderRadius: 15 + 10,
                borderWidth: 1,
                borderColor: "#ed8900"
            }}>
                {/* Gadget Image */}
                <View style={{
                    height: ScreenHeight / 7,
                    borderRadius: 15,
                    borderColor: "#ed8900",
                    borderWidth: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white"
                }}>
                    <CustomGadgetImage imageUrl={thumbnailUrl} />
                    {discountPercentage > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 5,
                                left: 6,
                                transform: [{ rotate: '0deg' }],
                                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 4,
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontSize: 12,
                                fontWeight: 'bold',
                            }}>-{discountPercentage}%</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 5,
                            right: 6,
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: 15,
                            width: 30,
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        onPress={() => toggleFavorite(id)}
                    >
                        <AntDesign
                            name={isFavorite ? "heart" : "hearto"}
                            size={24}
                            color={isFavorite ? "red" : "black"}
                        />
                    </TouchableOpacity>
                </View>
                {(gadgetStatus !== "Active") && (
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 10,
                            borderRadius: 15 + 10,
                            paddingHorizontal: 15
                        }}
                    >
                        <Text style={{
                            color: 'red',
                            fontSize: 20,
                            fontWeight: '500',
                            textTransform: 'uppercase',
                        }}>Sản phẩm đã bị khóa do vi phạm chính sách TechGadget</Text>
                    </View>
                )}
                {(!isForSale && gadgetStatus == "Active") && (
                    <View
                        style={{
                            width: (ScreenWidth - 70) / 2,
                            height: ScreenHeight / 7,
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            transform: [{ rotate: '0deg' }],
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            zIndex: 1,
                            borderRadius: 15,
                        }}
                    >
                        <Text style={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: '500',
                            textAlign: 'center',
                            padding: 4,
                        }}>Ngừng bán</Text>
                    </View>
                )}

                <View style={{
                    flex: 1,
                }}>
                    {/* Gadget Name */}
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "500",
                        marginBottom: 5,
                        overflow: "hidden",
                        color: "#112A46"
                    }} numberOfLines={1} ellipsizeMode="tail">
                        {name}
                    </Text>

                    <View style={{
                        backgroundColor: "#112A46",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 15,
                    }}>
                        {discountPercentage > 0 ? (
                            <>
                                <Text style={{
                                    fontSize: 14,
                                    color: '#999',
                                    textDecorationLine: 'line-through',
                                    marginBottom: 2,
                                }}>{formatCurrency(price)}</Text>
                                <Text style={{
                                    fontSize: 15,
                                    fontWeight: 'bold',
                                    color: "white"
                                }}>{formatCurrency(discountPrice)}</Text>
                            </>
                        ) : (
                            <Text style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                color: "white"
                            }}>{formatCurrency(price)}</Text>
                        )}
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        // flexDirection: "row",
        alignItems: "center",
        width: (ScreenWidth - 30) / 2,
        marginHorizontal: 5,
        marginBottom: 10,
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
        width: ScreenWidth / 4,
        height: ScreenHeight / 8,
    },
    detailsContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "500",
        marginBottom: 5,
        overflow: "hidden"
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

export default GadgetSearchItem;
