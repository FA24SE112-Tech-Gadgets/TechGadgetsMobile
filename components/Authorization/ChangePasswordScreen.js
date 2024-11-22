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
import Icon from "react-native-vector-icons/Ionicons";
import { Snackbar } from "react-native-paper";

const ChangePasswordScreen = ({ route }) => {
    const navigation = useNavigation()
    const { userEmail } = route.params;
    const [isRecentPushed, setIsRecentPushed] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(true);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(true);

    const [code, setCode] = useState("");

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");


    const [isOpenKeyboard, setIsOpenKeyboard] = useState(false);

    const { t } = useTranslation();

    const handleChangePassword = async () => {
        const url =
            NODE_ENV == "development"
                ? (DEV_API + "/auth/forgot-password")
                : (PROD_API + "/auth/forgot-password");
        setIsRecentPushed(true);
        try {
            await axios.post(url, {
                email: userEmail,
                newPassword: newPassword,
                code: code
            });
            setIsRecentPushed(false);
            setSnackbarMessage("Cập nhật thành công");
            setSnackbarVisible(true);
            await delay(500);

            navigation.replace("Login");
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

    const handleResendCode = async () => {
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

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

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

    //Reset to default state
    useFocusEffect(
        useCallback(() => {
            setNewPassword("");
            setShowNewPassword(true);
            setConfirmPassword("");
            setShowConfirmPassword(true);
            setCode("");
        }, [])
    );

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            colors={["#FFFFFF", "#fea92866"]}
            style={{
                flex: 1,
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
                    marginTop: ScreenHeight / 8
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
                height: ScreenHeight / 1.85,
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

                <View>
                    <Text style={{
                        fontSize: 16,
                    }}>
                        Nhập mật khẩu mới cho tài khoản:
                    </Text>
                    <Text style={{
                        color: "#ed8900",
                        fontWeight: "500"
                    }}>
                        {userEmail}
                    </Text>
                </View>

                {/* New password */}
                <View style={{ position: "relative" }}>
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
                        placeholder={"Mật khẩu mới"}
                        value={newPassword}
                        onChangeText={(text) => setNewPassword(text)}
                        secureTextEntry={showNewPassword}
                    />
                    {newPassword?.length > 0 && (
                        <Pressable
                            style={{
                                position: "absolute",
                                right: 15,
                                top: 14,
                            }}
                            onPress={() => setShowNewPassword(!showNewPassword)}
                        >
                            <Icon
                                name={showNewPassword ? "eye-off-sharp" : "eye-sharp"}
                                size={20}
                                color="rgba(0, 0, 0, 0.5)"
                            />
                        </Pressable>
                    )}
                </View>

                {/* Confirm password */}
                <View style={{ position: "relative" }}>
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
                        placeholder={"Nhập lại mật khẩu mới"}
                        value={confirmPassword}
                        onChangeText={(text) => setConfirmPassword(text)}
                        secureTextEntry={showConfirmPassword}
                    />
                    {confirmPassword?.length > 0 && (
                        <Pressable
                            style={{
                                position: "absolute",
                                right: 15,
                                top: 14,
                            }}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Icon
                                name={showConfirmPassword ? "eye-off-sharp" : "eye-sharp"}
                                size={20}
                                color="rgba(0, 0, 0, 0.5)"
                            />
                        </Pressable>
                    )}
                </View>

                {/* Code */}
                <View>
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
                        placeholder={"Mã xác thực"}
                        value={code}
                        onChangeText={(text) => setCode(text)}
                    />
                    <Pressable
                        onPress={() => handleResendCode()}
                        disabled={isRecentPushed}
                        style={{
                            marginRight: 10
                        }}
                    >
                        <Text
                            style={{
                                alignSelf: "flex-end",
                                fontSize: 15,
                                fontWeight: 500,
                                opacity: 0.5,
                                letterSpacing: 1,
                            }}
                        >
                            {t("resend-code")}
                        </Text>
                    </Pressable>
                </View>

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
                        isRecentPushed ||
                            (newPassword === "" && confirmPassword === "") ||
                            (newPassword !== confirmPassword) ||
                            code === ""
                            ? { backgroundColor: "gray" }
                            : { backgroundColor: "black" },
                    ]}
                    onPress={() => handleChangePassword()}
                    disabled={isRecentPushed ||
                        (newPassword === "" && confirmPassword === "") ||
                        (newPassword !== confirmPassword) ||
                        code === ""}
                >
                    <Text
                        style={{
                            color: "white",
                            fontWeight: "bold",
                            letterSpacing: 1,
                            fontSize: 18,
                        }}
                    >
                        Cập nhật mật khẩu
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
                        navigation.replace("Login");
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
                    bottom: 10,
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

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0, zIndex: 1 }}
            >
                {snackbarMessage}
            </Snackbar>
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

export default ChangePasswordScreen;