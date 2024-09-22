import {
    View,
    Text,
    Pressable,
} from "react-native";
import React from "react";
import LottieView from "lottie-react-native";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";

export default function ErrModal({ stringErr, isError, setIsError }) {
    return (
        <Modal
            isVisible={isError}
            onBackdropPress={() => setIsError(false)}
            style={{
                alignItems: "center",
            }}
        >
            <View
                style={{
                    rowGap: 1,
                    width: ScreenWidth * 0.8,
                    padding: 20,
                    borderRadius: 10,
                    backgroundColor: "white",
                }}
            >
                <View
                    style={{
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <LottieView
                        source={require("../../assets/animations/catRole.json")}
                        style={{ width: ScreenWidth / 2, height: ScreenWidth / 2 }}
                        autoPlay
                        loop
                        speed={0.8}
                    />
                    <Text
                        style={{
                            fontSize: 15,
                            width: ScreenWidth / 1.5,
                        }}
                    >
                        {stringErr}
                    </Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        columnGap: 12,
                    }}
                >
                    <Pressable
                        style={{
                            backgroundColor: "#ed8900",
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                            borderRadius: 10,
                            width: 60,
                            height: ScreenHeight / 23,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onPress={() => setIsError(false)}
                    >
                        <Text style={{ fontWeight: "bold", color: "white" }}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};
