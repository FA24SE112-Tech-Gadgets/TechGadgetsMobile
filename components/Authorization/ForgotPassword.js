import {
    ActivityIndicator,
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import LottieView from "lottie-react-native";
import axios from "axios";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import { NODE_ENV, DEV_API, PROD_API } from "@env";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import logo from "../../assets/adaptive-icon.png";
import MaskedView from "@react-native-masked-view/masked-view";

const ForgotPassword = () => {
    const navigation = useNavigation()
    const [userEmail, setUserEmail] = useState("");
    const [isRecentPushed, setIsRecentPushed] = useState(false);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [isOpenKeyboard, setIsOpenKeyboard] = useState(false);

    const { t } = useTranslation();

    const handleRequestCode = async () => {
        const url =
            NODE_ENV == "development"
                ? (DEV_API + "/auth/resend")
                : (PROD_API + "/auth/resend");
        setIsRecentPushed(true);
        try {
            await axios.post(url, {
                email: userEmail
            });
            setIsRecentPushed(false);
            navigation.navigate("ChangePasswordScreen", { userEmail: userEmail });
        } catch (error) {
            console.log(error.response.data);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    "Lỗi mạng vui lòng thử lại sau"
            );
            setIsError(true);
            setIsRecentPushed(false);
        }
    };

    //Check keyboard open
    useFocusEffect(
        useCallback(() => {
            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
                setIsOpenKeyboard(true);
            });
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                setIsOpenKeyboard(false);
            });

            // Cleanup các listener khi component unmount
            return () => {
                keyboardDidShowListener.remove();
                keyboardDidHideListener.remove();
            };
        }, [])
    );

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            colors={["#FFFFFF", "#fea92866"]}
            style={{
                width: ScreenWidth,
                height: ScreenHeight,
            }}
        >
            <LottieView
                source={require("../../assets/animations/background-login.json")}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: ScreenWidth,
                    height: ScreenHeight,
                    zIndex: 0,
                    opacity: 0.4,
                }}
                autoPlay
                loop={false}
            />

            {/* TechGadget Logo */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: ScreenHeight / 6
                }}
            >
                <View
                    style={{
                        height: 43,
                        width: 43,
                        overflow: 'hidden',
                        borderRadius: 50,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Image
                        style={{
                            width: 48,
                            height: 48,
                        }}
                        source={logo}
                    />
                </View>
                <MaskedView
                    maskElement={
                        <Text
                            style={{
                                backgroundColor: "transparent",
                                fontSize: 28,
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
                        colors={["#EDCD2B", "#EDCD2B", "rgba(0,0,0, 0.7)"]}
                    >
                        <Text style={{ opacity: 0, fontSize: 28, fontWeight: "bold" }}>
                            TechGadget
                        </Text>
                    </LinearGradient>
                </MaskedView>
            </View>

            <View style={{
                width: ScreenWidth / 1.1,
                height: ScreenHeight / 3,
                alignSelf: "center",
                backgroundColor: "#f9f9f9",
                paddingHorizontal: 30,
                paddingVertical: 20,
                borderColor: "rgba(0, 0, 0, 0.3)",
                borderWidth: 0.5,
                borderRadius: 10 + 10,
                shadowColor: '#000', // Màu của bóng
                shadowOffset: { width: 0, height: 2 }, // Độ lệch bóng
                shadowOpacity: 0.25, // Độ mờ của bóng (0-1)
                shadowRadius: 3.84, // Bán kính mờ của bóng
                elevation: 5,
                marginTop: ScreenHeight / 30,
                gap: 30
            }}>
                <Text style={{
                    alignSelf: "center",
                    fontSize: 30,
                    fontWeight: "bold",
                }}>QUÊN MẬT KHẨU</Text>

                <Text style={{
                    fontSize: 16,
                }}>
                    Nhập email mà bạn muốn nhận mã khôi phục
                </Text>

                {/* Email */}
                <TextInput
                    style={{
                        backgroundColor: "white",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 10,
                        fontSize: 17,
                        borderColor: "rgba(0, 0, 0, 0.3)",
                        borderWidth: 0.5,
                    }}
                    placeholder={"Email của bạn"}
                    value={userEmail}
                    onChangeText={(text) => setUserEmail(text)}
                />
                <Pressable
                    style={[
                        {
                            alignItems: "center",
                            paddingVertical: 13,
                            paddingHorizontal: 20,
                            borderRadius: 10,
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 5
                        },
                        (isRecentPushed || userEmail === "")
                            ? { backgroundColor: "gray" }
                            : { backgroundColor: "black" },
                    ]}
                    onPress={() => handleRequestCode()}
                    disabled={isRecentPushed || userEmail === ""}
                >
                    <Text
                        style={{
                            color: "white",
                            fontWeight: "bold",
                            letterSpacing: 1,
                            fontSize: 18,
                        }}
                    >
                        Yêu cầu gửi mã
                    </Text>
                    {
                        isRecentPushed &&
                        <ActivityIndicator color={"white"} />
                    }
                </Pressable>

                {/* Back button */}
                <TouchableOpacity
                    style={{
                        marginTop: -10
                    }}
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <Text style={{
                        alignSelf: "center",
                        fontSize: 15,
                        fontWeight: 500,
                        letterSpacing: 1,
                    }}>
                        Quay lại trang đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Version control */}
            {
                !isOpenKeyboard &&
                <Text style={{
                    position: "absolute",
                    bottom: 90,
                    right: 10,
                }}>
                    {t("app-version")}
                </Text>
            }
            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </LinearGradient >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 50,
        paddingHorizontal: 30,
        height: "auto",
    },
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "85%",
        zIndex: 0,
        opacity: 0.4,
    },
    backArrow: {
        position: "absolute",
        top: 50,
        left: 5,
        zIndex: 1,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        marginTop: 30,
        marginBottom: 40,
        width: "100%",
        textAlign: "center",
    },
    inputContainer: {
        width: "100%",
        height: ScreenHeight / 7,
        display: "flex",
        justifyContent: "space-between",
    },
    textInput: {
        backgroundColor: "white",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 50,
        fontSize: 17,
    },
    showPasswordBtn: {
        position: "absolute",
        right: 20,
        top: 14,
    },
    errorMessage: {
        marginTop: 15,
        textAlign: "left",
        paddingHorizontal: 10,
        fontSize: 17,
        color: "red",
        fontWeight: "600",
    },
    loginButton: {
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 20,
        borderRadius: 50,
        marginTop: 30,
        flexDirection: "row",
        justifyContent: "center",
        gap: 5
    },
    googleButtonContainer: {
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: 'black',
        borderRadius: 30,
        overflow: 'hidden',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 40,
        width: 320,
        height: 48,
        paddingVertical: 10,
        paddingHorizontal: 12,
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        gap: 12
    },
    googleButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    registerButton: {
        display: "flex",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 20,
        borderRadius: 50,
        marginTop: 20,
        borderWidth: 2,
        borderColor: "black",
    },
    linearGradient: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 15,
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    modalOption: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    modalOptionText: {
        fontSize: 16,
    },
});

export default ForgotPassword;