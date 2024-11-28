import { View, Text, StyleSheet, Pressable, Keyboard } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import { TextInput } from "react-native";
import { Snackbar } from "react-native-paper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useAuth from "../../utils/useAuth";
import { jwtDecode } from "jwt-decode";
import { NODE_ENV, DEV_API, PROD_API } from "@env";
import ErrModal from "../CustomComponents/ErrModal";
import { ActivityIndicator } from "react-native";

const VerifyCodeScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const { login } = useAuth();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const handleChange = (value, index) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && index > 0) {
      const newCode = [...code];

      if (!code[index]) {
        // Nếu ô hiện tại trống, xóa ô trước đó
        newCode[index - 1] = "";
        setCode(newCode);
        inputs.current[index - 1].focus();
      } else {
        // Nếu ô hiện tại có giá trị, chỉ xóa giá trị hiện tại
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handleVerify = async () => {
    const url =
      NODE_ENV == "development"
        ? DEV_API + "/auth/verify"
        : PROD_API + "/auth/verify";
    try {
      const verificationCode = code.join("").trim();
      setIsFetching(true);
      const response = await axios.post(url, {
        email: email,
        code: verificationCode,
      });
      setIsFetching(false);
      if (response.status >= 200 && response.status < 300) {
        setSnackbarVisible(true);
        setSnackbarMessage("Xác thực thành công");

        const { token, refreshToken } = response.data;

        const decodedToken = jwtDecode(token);
        console.log("deco", decodedToken);

        const userInfo = JSON.parse(decodedToken.UserInfo);
        console.log(userInfo);

        await AsyncStorage.setItem("refreshToken", refreshToken);
        await AsyncStorage.setItem("token", token);

        await login();

        setCode(["", "", "", "", "", ""]);
        Keyboard.dismiss();

        if (userInfo.Role == "Customer") {
          navigation.replace("StackBuyerHome")
          return;
        }

        //login seller
        if (userInfo.Role == "Seller") {
          navigation.replace("RegisterSeller")
          return;
        }


      } else if (response.status >= 400 && response.status <= 500) {
        const data = await response.json();
        setIsError(true);
        setStringErr(data.reasons[0].message);
      }
    } catch (error) {
      console.log("loi", error);

      setIsError(true);
      setStringErr(error.response?.data.reasons[0].message);
      setIsFetching(false);
      setCode(["", "", "", "", "", ""]);
      Keyboard.dismiss();
    }
  };

  const handleSendAgain = async () => {
    const url =
      NODE_ENV == "development"
        ? DEV_API + "/auth/resend"
        : PROD_API + "/auth/resend";
    try {
      setCode(["", "", "", "", "", ""]);
      setIsFetching(true);
      const response = await axios.post(url, {
        email: email,
      });
      setIsFetching(false);
      if (response.status >= 200 && response.status < 300) {
        setSnackbarVisible(true);
        setSnackbarMessage("Vui lòng kiểm tra mail và nhập mã mới.");
      } else if (response.status == 400) {
        const data = await response.json();
        setIsError(true);
        setStringErr(data.reasons[0].message);
      } else if (response.status == 500) {
        const data = await response.json();
        setIsError(true);
        setStringErr(data.reasons[0].message);
      }
    } catch (error) {
      setIsError(true);
      setStringErr(error.response?.data.reasons[0].message);
    }
  };

  //Keyboard linstener
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    // Cleanup listeners on component unmount
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  //Auto send verify
  useEffect(() => {
    // Kiểm tra nếu tất cả các phần tử của mảng `code` đều khác ""
    if (code.every((digit) => digit !== "")) {
      handleVerify();
    }
  }, [code]); // Theo dõi mảng `code`

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#fea92866"]}
      style={[styles.linearGradient]}
    >
      <View style={{
        marginTop: keyboardVisible ? ScreenHeight * 0.16 : ScreenHeight * 0.3,
      }}>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{ fontWeight: "bold", fontSize: 20, color: "#ed8900" }}
          >
            XÁC NHẬN ĐỊA CHỈ EMAIL
          </Text>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 15,
              color: "rgba(0,0,0,0.5)",
              paddingHorizontal: 15,
              marginTop: 5
            }}
          >
            Hãy nhập mã xác nhận, chúng tôi đã gửi qua email
          </Text>
        </View>

        {/* Tạo ra 6 ô để nhập mã xác nhận */}
        <View style={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.codeInput}
              value={digit}
              onChangeText={(value) => handleChange(value, index)}
              keyboardType="number-pad"
              maxLength={1}
              ref={(el) => (inputs.current[index] = el)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <View style={{ alignItems: "center" }}>
          <Pressable
            style={{
              width: ScreenWidth * 0.86,
              alignItems: "center",
              backgroundColor: "black",
              paddingVertical: 10,
              borderRadius: 10,
              flexDirection: "row",
              justifyContent: "center",
              gap: 5
            }}
            onPress={() => handleVerify()}
            disabled={isFetching}
          >
            <Text
              style={{ color: "white", fontWeight: "bold", fontSize: 20 }}
            >
              XÁC NHẬN
            </Text>
            {
              isFetching &&
              <ActivityIndicator color={"white"} />
            }
          </Pressable>

          <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
            <Text
              style={{
                color: "rgba(0,0,0,0.5)",
                fontSize: 16,
              }}
            >
              Bạn không nhận được mã?
            </Text>
            <Pressable
              onPress={() => handleSendAgain()}
              disabled={isFetching}
            >
              <Text
                style={{ color: "rgba(0,0,0,0.5)", fontSize: 16, fontWeight: "bold" }}
              >
                Gửi lại mã
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0, zIndex: 1 }}
      >
        {snackbarMessage}
      </Snackbar>

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: ScreenHeight * 0.06,
    marginBottom: ScreenHeight * 0.078,
  },
  codeInput: {
    width: 45,
    height: 45,
    color: "#ed8900",
    borderColor: "black",
    fontWeight: "bold",
    borderWidth: 0.3,
    borderRadius: 5,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "white",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    width: "100%",
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    height: 350,
    display: "flex",
    justifyContent: "space-between",
  },
  textInput: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 15,
    marginVertical: 7,
    marginHorizontal: 15,
  },
  showPasswordBtn: {
    position: "absolute",
    right: 20,
    top: 14,
  },
  forgotPassword: {
    marginTop: 15,
    textAlign: "right",
    paddingHorizontal: 10,
    fontSize: 17,
  },
  loginButton: {
    display: "flex",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    backgroundColor: "black",
    borderRadius: 50,
    marginTop: 20,
  },
  registerButton: {
    display: "flex",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    backgroundColor: "black",
    marginHorizontal: 15,
  },
  linearGradient: {
    height: ScreenHeight
  },

  inputContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 5,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  filterContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginVertical: 10,
    justifyContent: "space-between",
  },
  inputFilter: {
    fontSize: 17,
    color: "grey",
  },
  iconFilterContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  showItem: {
    flex: 1,
    backgroundColor: "#FEECE2",
    borderRadius: 10,
    marginTop: -10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: "black",
  },
  textError: {
    color: "red", // Change border color to red for invalid input
    fontSize: 12,
    paddingLeft: 10,
  },

  inputError: {
    borderColor: "red", // Change border color to red for invalid input
  },
  iconContainer: {
    // position: 'absolute',
    // right: 10,
    // top: 2.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 16,
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

export default VerifyCodeScreen;
