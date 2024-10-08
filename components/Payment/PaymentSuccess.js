import { View, Text, Image, Pressable, BackHandler } from 'react-native'
import React, { useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import logo from "../../assets/adaptive-icon.png";
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import useAuth from '../../utils/useAuth';
import { useTranslation } from 'react-i18next';

export default function PaymentSuccess({ navigation }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    function handleNavigate() {
        if (user.role === "USER") {
            navigation.replace("StackBuyerHome", { screen: "CustomerHome" })
        } else {
            navigation.replace("StackSellerHome", { screen: "SellerHome" })
        }
    }
    useEffect(() => {
        const backAction = () => {
            // Logic điều hướng khi nhấn nút back
            handleNavigate();
            return true; // Trả về true để ngăn hành động back mặc định
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove(); // Hủy sự kiện khi component unmounts
    }, []);

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            colors={["#FFFFFF", "#ed8900"]}
            style={{
                flex: 1,
                position: "relative"
            }}
        >
            {/* TechGadget Logo */}
            <View style={{
                alignSelf: "center",
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10
            }}>
                <Image
                    style={{
                        width: ScreenWidth / 8,
                        height: ScreenWidth / 8,
                        borderColor: "black",
                        marginRight: -12,
                    }}
                    source={logo}
                />
                <MaskedView
                    maskElement={
                        <Text
                            style={{
                                backgroundColor: "transparent",
                                fontSize: ScreenWidth / 20,
                                fontWeight: "bold",
                            }}
                        >
                            TechGadget
                        </Text>
                    }
                >
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.6, y: 0.6 }}
                        colors={["rgba(250, 164, 147, 0.65)", "#FB5854"]}
                    >
                        <Text style={{ opacity: 0, fontSize: ScreenWidth / 20, fontWeight: "bold" }}>
                            TechGadget
                        </Text>
                    </LinearGradient>
                </MaskedView>
            </View>

            {/* Checked icon */}
            <View
                style={{
                    alignSelf: "center",
                    marginTop: ScreenHeight / 4,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                }}
            >
                <View style={{
                    height: ScreenWidth / 10,
                    width: ScreenWidth / 10,
                    backgroundColor: "white",
                    position: "absolute",
                }} />
                <AntDesign
                    name={"checkcircle"}
                    size={ScreenWidth / 6}
                    color={"#50C346"}

                />
            </View>

            <Text style={{
                color: "white",
                fontSize: ScreenWidth / 15,
                fontWeight: "500",
                alignSelf: "center",
                marginTop: 5
            }}>
                {t("payment-success-msg")}
            </Text>

            <Text style={{
                color: "white",
                fontSize: ScreenWidth / 20,
                fontWeight: "300",
                alignSelf: "center",
                width: ScreenWidth / 1.7,
                textAlign: "center",
                marginTop: 5
            }}>
                {t("payment-success-content")}
            </Text>

            {/* Home button */}
            <Pressable
                style={{
                    width: ScreenWidth / 1.5,
                    height: ScreenWidth / 8,
                    backgroundColor: "white",
                    alignSelf: "center",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    bottom: ScreenWidth / 10,
                    borderRadius: 30,
                    flexDirection: "row",
                    gap: 10
                }}
                onPress={() => {
                    handleNavigate();
                }}
            >
                <Ionicons name="home" size={ScreenWidth / 15} color={"#ed8900"} />
                <Text style={{
                    color: "#ed8900",
                    fontSize: ScreenWidth / 18,
                    fontWeight: "500"
                }}>
                    {t("home-btn")}
                </Text>
            </Pressable>
        </LinearGradient>
    )
}