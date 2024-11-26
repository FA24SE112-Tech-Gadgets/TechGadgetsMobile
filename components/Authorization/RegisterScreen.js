import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import LottieView from "lottie-react-native";
import Modal from "react-native-modal";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { Snackbar } from "react-native-paper";
import { NODE_ENV, DEV_API, PROD_API } from "@env";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { Checkbox } from 'react-native-paper';
import useNotification from "../../utils/useNotification"

export default function RegisterScreen({ navigation }) {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [isOpenKeyboard, setIsOpenKeyboard] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const { deviceToken } = useNotification();

  const { t } = useTranslation();

  const toggleSecurePassword = () => {
    setSecurePassword(!securePassword);
  };

  const toggleSecureConfirmPassword = () => {
    setSecureConfirmPassword(!secureConfirmPassword);
  };

  const [account, setAccount] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
    role: "Customer"
  });

  const handleChangeData = (fieldName, data) => {
    setAccount((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  const validateForm = () => {
    //email
    if (account.email === "") {
      return { isError: true, stringErr: t("empty-email") };
    }
    // else if (!handleValidEmail(account.email)) {
    //   return { isError: true, stringErr: t("email-wrong-format") };
    // }

    //fullName
    if (account.fullName === "") {
      return { isError: true, stringErr: t("empty-name") };
    }

    //password
    if (account.password === "") {
      return { isError: true, stringErr: t("empty-password") };
    } else if (account.password.length < 5) {
      return {
        isError: true,
        stringErr: t("password-length"),
      };
    }

    //confirm password
    if (account.password != account.passwordConfirm) {
      return { isError: true, stringErr: t("password-not-match") };
    }

    if (account.role == "") {
      return { isError: true, stringErr: t("account-type-err") };
    }

    return {
      isError: false,
      stringErr: "",
    };
  };

  // const handleValidEmail = (mail) => {
  //   return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(mail);
  // };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const saveChanges = async () => {
    // Validate the form
    const { isError, stringErr } = validateForm();
    setIsError(isError);
    setStringErr(stringErr);
    if (!isError) {
      setIsFetching(true);
      const response = await registerAccount({ ...account, deviceToken });
      setIsFetching(false);
      if (response.status >= 200 && response.status < 300) {
        setSnackbarVisible(true);
        setSnackbarMessage(t("check-mail"));
        await delay(1500);
        navigation.navigate("VerifyCode", {
          email: account.email,
        });
      } else if (response.status == 400) {
        const data = await response.json();
        setIsError(true);
        setStringErr(data.reasons[0].message);
      } else if (response.status == 500) {
        const data = await response.json();
        setIsError(true);
        setStringErr(data.reasons[0].message);
      }
    }
  };

  async function registerAccount({ fullName, email, password, role, deviceToken }) {
    const url =
      NODE_ENV == "development"
        ? DEV_API
        : PROD_API;

    try {
      const response = await axios.post(`${url}/auth/signup`, {
        fullName,
        email,
        password,
        role,
        deviceToken
      });

      return response;
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("network-error")
      );
    }
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

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
        colors={["#FFFFFF", "#fea92866"]}
        style={[styles.linearGradient]}
      >
        <LottieView
          source={require("../../assets/animations/background-login.json")}
          style={styles.background}
          autoPlay
          loop={false}
        />
        <ScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={account.role !== "Quán ăn" && {
            height: ScreenHeight / 1.2,
            justifyContent: "center"
          }}
        >
          <Text style={styles.title}>{t('register-title')}</Text>

          {/* fullName */}
          <View>
            <TextInput
              style={[account.role == "Quán ăn" ? styles.textInput2 : styles.textInput]}
              placeholder={t('register-name')}
              value={account.fullName}
              onChangeText={(value) => handleChangeData("fullName", value)}
            />
          </View>

          {/* email */}
          <TextInput
            style={[styles.textInput]}
            placeholder="Email"
            value={account.email}
            onChangeText={(value) => handleChangeData("email", value)}
          />

          {/* password */}
          <View>
            <TextInput
              style={[styles.textInput]}
              placeholder={t('password-input')}
              secureTextEntry={securePassword}
              value={account.password}
              onChangeText={(value) => handleChangeData("password", value)}
            />
            {account.password.length > 0 && (
              <Pressable
                onPress={toggleSecurePassword}
                style={{ position: "absolute", bottom: 17, right: 24 }}
              >
                <Icon
                  name={securePassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  type="material-community"
                  color="grey"
                />
              </Pressable>
            )}
          </View>

          {/* confirm password */}
          <View>
            <TextInput
              style={[styles.textInput]}
              placeholder={t('password-retype')}
              secureTextEntry={secureConfirmPassword}
              value={account.passwordConfirm}
              onChangeText={(text) => handleChangeData("passwordConfirm", text)}
            />
            {account.passwordConfirm.length > 0 && (
              <Pressable
                onPress={toggleSecureConfirmPassword}
                style={{ position: "absolute", bottom: 17, right: 24 }}
              >
                <Icon
                  name={
                    secureConfirmPassword ? "eye-off-outline" : "eye-outline"
                  }
                  size={22}
                  type="material-community"
                  color="grey"
                />
              </Pressable>
            )}
          </View>

          {/* role */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 15
          }}>
            <Text style={styles.roleText}>Bạn là: </Text>
            <View style={styles.roleSelectionContainer}>
              <Pressable
                style={styles.checkboxContainer}
                onPress={() => handleChangeData("role", "Customer")}
              >
                <Checkbox
                  status={account.role === "Customer" ? 'checked' : 'unchecked'}
                  color="black"
                />
                <Text>Khách hàng</Text>
              </Pressable>
              <Pressable
                style={styles.checkboxContainer}
                onPress={() => handleChangeData("role", "Seller")}
              >
                <Checkbox
                  status={account.role === "Seller" ? 'checked' : 'unchecked'}
                  color="black"
                />
                <Text>Người bán</Text>
              </Pressable>
            </View>
          </View>

          {/* ĐĂNG KÝ */}
          <Pressable
            style={styles.registerButton}
            onPress={() => {
              setShowConfirmModal(true);
            }}
            disabled={isFetching}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                letterSpacing: 1,
                fontSize: 15,
              }}
            >
              {t("sign-up-btn")}
            </Text>
            {
              isFetching &&
              <ActivityIndicator color={"white"} />
            }
          </Pressable>

          {/* Đăng nhập ngay */}
          <Text
            style={{
              fontSize: 15,
              width: "100%",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {t("already-have-account")}
            <Text
              style={{ fontWeight: "bold", fontSize: 15 }}
              onPress={() => navigation.goBack()}
            >
              {" "}
              {t("sign-in-now")}
            </Text>
          </Text>
        </ScrollView>
      </LinearGradient>

      {/* Version control */}
      {
        !isOpenKeyboard &&
        <View style={{
          position: "absolute",
          right: ScreenWidth / 25,
          bottom: ScreenWidth / 25
        }}>
          <Text>
            {t("app-version")}
          </Text>
        </View>
      }

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
      <RegisterConfirmModal
        setShowConfirmModal={setShowConfirmModal}
        showConfirmModal={showConfirmModal}
        handleConfirm={saveChanges}
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0, zIndex: 1 }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const RegisterConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  handleConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={showConfirmModal}
      onBackdropPress={() => setShowConfirmModal(false)}
      style={{
        alignItems: "center",
      }}
    >
      <View style={{
        rowGap: 20,
        width: ScreenWidth * 0.8,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "white",
      }}>
        <Text style={{ fontSize: 18 }}>{t("confirm-modal")}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            columnGap: 20,
          }}
        >
          <Pressable
            onPress={() => setShowConfirmModal(false)}
            style={{
              backgroundColor: "white",
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#ed8900",
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#ed8900" }}>{t("cancel-modal")}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowConfirmModal(false);
              handleConfirm();
            }}
            style={{
              backgroundColor: "#ed8900",
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 10,
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ fontWeight: "bold", color: "white" }}>{t("yes-modal")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    width: ScreenWidth / 1.1
  },
  textInput2: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 15,
    marginVertical: 7,
    width: ScreenWidth / 1.6
  },
  textInput3: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 15,
    marginVertical: 7,
    width: ScreenWidth / 1.6,
    height: ScreenHeight / 17
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
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 50,
    marginTop: 10,
    backgroundColor: "black",
    width: ScreenWidth / 1.1,
    justifyContent: "center",
    gap: 5,
    flexDirection: "row"
  },
  linearGradient: {
    flex: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
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
    paddingVertical: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 0.3
  },
  roleSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: "center",
    flex: 0.7
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
