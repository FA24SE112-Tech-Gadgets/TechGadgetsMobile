import { View, Text, Linking, Pressable, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import Entypo from "react-native-vector-icons/Entypo";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

export default function SubscriptionComponent({
    packageNumber,
    pack,
    createPaymentLink,
    setIsError,
    setStringErr,
    isDisable,
    setDisable,
    role,
    setOpenSubscription
}) {
    const { t } = useTranslation();
    const navigation = useNavigation();

    const linearSilver = ["#919191", "#000000", "#C6D8E5"];
    const linearGold = ["#E8CB26", "#000000", "#DECA55"];
    const linearDiamond = ["#E3E3F0", "#74D9DF", "#CECEDF"];
    const linearVip = ["#FFFEEB", "#F6E308", "#F7B915"];

    // Chuyển đổi chuỗi "99K" thành số 99000
    function convertPrice(priceStr) {
        return parseFloat(priceStr.replace('.000đ', '')) * 1000;
    }

    function calculateDiscountPercentage(initialPrice, discountedPrice) {
        if (initialPrice <= 0 || discountedPrice < 0) {
            return "Invalid input";
        }
        const discount = initialPrice - discountedPrice;
        const discountPercentage = (discount / initialPrice) * 100;
        return `-${discountPercentage.toFixed(0)}%`;
    }

    //Uri trả về từ  PayOs và mở nó trong Web View
    //Quản lý trạng thái nút bấm và gọi Api
    const [pressedButton1, setPressedButton1] = useState(undefined);
    useEffect(() => {
        if (pressedButton1 === undefined) return;
        (async () => {
            try {
                setDisable(true);
                const res = await createPaymentLink(pack.name, role === "user" ? "user" : "restaurant");
                setOpenSubscription(false);
                setDisable(false);

                const transferInfo = {
                    accountName: "DAO QUANG DUNG",
                    amount: pack.price.replace('đ', ''),
                    bin: "970422",
                    description: pack.name,
                    qrCode: res.qrCode,
                    paymentLinkId: res.paymentLinkId
                }
                navigation.navigate("TransferInfo", transferInfo);

                // Linking.canOpenURL(res.checkoutUrl).then(supported => {
                //     if (supported) {
                //         Linking.openURL(res.checkoutUrl);
                //     } else {
                //         console.log("Don't know how to open URI: " + res.checkoutUrl);
                //     }
                // });

                setPressedButton1(undefined);
            } catch (error) {
                console.log("vo day nua", error);
                setPressedButton1(undefined);
                setOpenSubscription(false);
                setIsError(true);
                setStringErr(
                    error.response?.data?.reasons[0]?.message ?
                        error.response.data.reasons[0].message
                        :
                        t("network-error")
                );
            }
        })();
    }, [pressedButton1]);

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            colors={
                packageNumber === 0
                    ? linearSilver
                    : packageNumber === 1
                        ? linearGold
                        : packageNumber === 2
                            ? linearDiamond
                            : linearVip
            }
            style={{
                width: ScreenWidth / 1.5,
                height: ScreenHeight / 1.5,
                position: "relative",
                borderRadius: 10,
            }}
        >
            {/* Package Logo */}
            <View
                style={{
                    alignItems: "center",
                    height: ScreenHeight / 4.5,
                    position: "relative",
                }}
            >
                <LottieView
                    source={
                        packageNumber === 0
                            ? require("../../assets/animations/silverSubscription.json")
                            : packageNumber === 1
                                ? require("../../assets/animations/goldSubscription.json")
                                : packageNumber === 2
                                    ? require("../../assets/animations/diamondSubscription.json")
                                    : require("../../assets/animations/vipPackage.json")
                    }
                    style={{ width: ScreenWidth / 2, height: ScreenWidth / 2 }}
                    autoPlay
                    loop
                    speed={0.8}
                />
                {
                    packageNumber != 3 &&
                    <View
                        style={{
                            position: "absolute",
                            alignItems: "center",
                            justifyContent: "center",
                            top: ScreenHeight / 27,
                            left:
                                packageNumber === 0
                                    ? ScreenWidth / 3.6
                                    : packageNumber === 1
                                        ? ScreenWidth / 3.7
                                        : ScreenWidth / 3.5,
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    packageNumber === 0
                                        ? "#C6D8E5"
                                        : packageNumber === 1
                                            ? "#FFE346"
                                            : "#4EE2EC",
                                fontSize: ScreenWidth / 5,
                            }}
                        >
                            {packageNumber === 0 ? "S" : packageNumber === 1 ? "G" : "D"}
                        </Text>
                    </View>
                }
            </View>

            {/* Title - price package */}
            <View
                style={{
                    alignItems: "center",
                    gap: 5
                }}
            >
                <Text
                    style={{
                        color: packageNumber === 3 ? "#ffffff" : "white",
                        fontSize: ScreenWidth / 17,
                    }}
                >
                    {pack.name}
                </Text>

                <Text
                    style={{
                        color:
                            packageNumber === 0
                                ? "#C6D8E5"
                                : packageNumber === 1
                                    ? "#FFE346"
                                    : packageNumber === 2
                                        ? "#4F7072"
                                        : "#ffffff",
                        fontSize: ScreenWidth / 15,
                        fontWeight: "bold"
                    }}
                >
                    {pack.price}
                </Text>

                <View style={{
                    flexDirection: "row",
                    gap: 5
                }}>
                    <View style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        backgroundColor: "#f5f5fa",
                        borderRadius: 8
                    }}>
                        <Text
                            style={{
                                color: "#27272a",
                                fontSize: ScreenWidth / 35,
                            }}
                        >
                            {calculateDiscountPercentage(convertPrice(pack.actualPrice), convertPrice(pack.price))}
                        </Text>
                    </View>

                    <Text
                        style={{
                            color: "#808089",
                            fontSize: ScreenWidth / 30,
                            textDecorationLine: "line-through",
                            textAlignVertical: "center"
                        }}
                    >
                        {pack.actualPrice}
                    </Text>
                </View>
            </View>

            {/* Package content list */}
            <View
                style={{
                    alignItems: "center",
                }}
            >
                {pack.arrContent.map((item, index) => (
                    <View
                        key={index}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 5,
                            width: ScreenWidth / 2,
                            marginTop: ScreenHeight / 50,
                        }}
                    >
                        <Entypo name="check" size={24} color={"#54B435"} />
                        <Text
                            style={{
                                color: "white",
                                fontSize: ScreenWidth / 25,
                                width: ScreenWidth / 2.3,
                            }}
                        >
                            {item}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Payment button */}
            <View style={{ alignItems: "center", position: "absolute", bottom: 20, alignItems: "center", width: ScreenWidth / 1.5 }}>
                <Pressable
                    onPress={() => setPressedButton1((prevState) => !prevState)}
                    style={{
                        backgroundColor: isDisable ? "#cccccc" : "#DD2E4C",
                        borderColor: isDisable ? "#999999" : "#000000",
                        paddingHorizontal: ScreenWidth / 25,
                        paddingVertical: ScreenHeight / 70,
                        borderRadius: 10,
                        flexDirection: "row",
                        gap: 5,
                        justifyContent: "center"
                    }}
                    disabled={isDisable}
                >
                    <Text
                        style={{
                            color: "white"
                        }}
                    >
                        {t("subscription-btn")}
                    </Text>
                    {
                        isDisable &&
                        <ActivityIndicator color={"white"} />
                    }
                </Pressable>
            </View>
        </LinearGradient>
    );
}
