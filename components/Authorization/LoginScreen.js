import {
  ActivityIndicator,
  Keyboard,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import useAuth from "../../utils/useAuth";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import Hyperlink from "react-native-hyperlink";
import { NODE_ENV, DEV_API, PRO_API } from "@env";
import * as Location from "expo-location"
import { useTranslation } from "react-i18next";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ErrModal from "../CustomComponents/ErrModal";
import LanguageModal from "../CustomComponents/LanguageModal";
import { useFocusEffect } from "@react-navigation/native";
import { Client } from '@stomp/stompjs';
import 'text-encoding';

const routingKey = "getAllNoti";
const exchangeName = "test-exchange";
const webSocketPort = "15674";
const domainName = "kietpt.online"

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRecentPushed, setIsRecentPushed] = useState(false);
  let client;

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [isResError, setIsResError] = useState(false);

  const [isOpenKeyboard, setIsOpenKeyboard] = useState(false);

  const { t } = useTranslation();
  const [openChooseLanguage, setOpenChooseLanguage] = useState(false);

  const { login } = useAuth();

  const url =
    NODE_ENV == "development"
      ? (DEV_API + "/auth/login")
      : (PRO_API + "/auth/login");

  const handleLoginBtn = async () => {
    setIsRecentPushed(true);
    try {
      const res = await axios.post(url, {
        email: username,
        password,
      });
      const { token, refreshToken } = res.data;

      const decoded = jwtDecode(token);
      if (decoded.role == "MANAGER" || decoded.role == "ADMIN") {
        setStringErr(t("role-required"));
        setIsError(true);
        return;
      }
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("token", token);

      await login();
    } catch (error) {
      if (error.response.data.code === "WEA-0010") {
        //Code user
        setStringErr(error.response.data.reasons[0].message);
        setIsError(true);
        await delay(1500);
        navigation.navigate("VerifyCode", {
          email: username,
        });
      } else if (error.response.data.code === "WEA-0009") {
        //Code restaurant
        setIsResError(true);
      } else {
        setStringErr(error.response.data.reasons[0].message);
        setIsError(true);
      }
    } finally {
      setIsRecentPushed(false);
    }
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const getPermissionAndroid = async () => {
    try {
      let granted;
      if (parseInt(Platform.Version.toString()) >= 32) {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
      } else {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
      }
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.warn(err);
    }
  };

  //Check keyboard open
  useFocusEffect(
    useCallback(() => {
      (async () => {

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setStringErr(t("request-location-deny"));
          setIsError(true);
          return;
        }
        if (Platform.OS === "android") {
          const granted = await getPermissionAndroid();
          if (!granted) {
            return;
          }
        }
      })();
    }, [])
  );

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

  const [serverMessages, setServerMessages] = useState([]);

  const connectToRabbitMQ = () => {
    const headers = {
      login: 'myadmin', // Replace with your RabbitMQ username
      passcode: 'mypassword' // Replace with your RabbitMQ password
    };
    client = new Client({
      brokerURL: `ws://${domainName}:${webSocketPort}/ws`,
      connectHeaders: headers,
      onConnect: () => {
        console.log("connect success");
        client.subscribe(`/exchange/${exchangeName}/${routingKey}`, message => {
          console.log(`Received: ${message.body}`)
          setServerMessages(prevNotifications => [
            ...prevNotifications,
            message.body
          ]);
        }
        );
      },
      onStompError: (frame) => {
        const readableString = new TextDecoder().decode(frame.binaryBody);
        console.log('STOMP error', readableString);
      },
      appendMissingNULLonIncoming: true,
      forceBinaryWSFrames: true
    });

    client.activate();
  };

  useFocusEffect(
    useCallback(() => {
      connectToRabbitMQ();
      return () => {
        if (client) {
          console.log("Disconnecting from RabbitMQ");
          client.deactivate(); // Properly deactivate the client on component unmount
        }
      };
    }, [])
  );

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#fff72e"]}
      style={styles.linearGradient}
    >
      <LottieView
        source={require("../../assets/background-login.json")}
        style={styles.background}
        autoPlay
        loop={false}
      />
      <Pressable style={{
        height: ScreenWidth / 12,
        width: ScreenWidth / 12,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "transparent",
        position: "absolute",
        top: ScreenWidth / 20,
        right: ScreenWidth / 20
      }}
        onPress={() => {
          setOpenChooseLanguage(true)
        }}
      >
        <MaterialIcons name="language" size={ScreenWidth / 12} color="black" />
      </Pressable>

      {/* Choose language */}
      <LanguageModal
        openChooseLanguage={openChooseLanguage}
        setOpenChooseLanguage={setOpenChooseLanguage}
      />

      <View View style={styles.container} >
        <Text style={styles.title}>{t('login-title')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={t('email-input')}
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <View style={{ position: "relative" }}>
            <TextInput
              style={styles.textInput}
              placeholder={t('password-input')}
              secureTextEntry={showPassword ? false : true}
              value={password}
              onChangeText={(text) => setPassword(text)}
            ></TextInput>
            {password?.length > 0 && (
              <Pressable
                style={styles.showPasswordBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? "eye-off-sharp" : "eye-sharp"}
                  size={20}
                  color="black"
                />
              </Pressable>
            )}
          </View>
        </View>
        {
          errorMsg?.length > 0 ? (
            <Text style={styles.errorMessage}>{errorMsg}</Text>
          ) : (
            <View style={{ height: 10 }}></View>
          )
        }
        <Pressable
          style={[
            styles.loginButton,
            isRecentPushed
              ? { backgroundColor: "gray" }
              : { backgroundColor: "black" },
          ]}
          onPress={() => handleLoginBtn()}
          disabled={isRecentPushed}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              letterSpacing: 1,
              fontSize: 18,
            }}
          >
            {t('sign-in-btn')}
          </Text>
          {
            isRecentPushed &&
            <ActivityIndicator color={"white"} />
          }
        </Pressable>
        <Text
          style={{
            width: "100%",
            textAlign: "center",
            marginTop: 20,
            fontSize: 16,
            fontWeight: 500,
            opacity: 0.5,
            letterSpacing: 1,
          }}
        >
          {t('or')}
        </Text>
        <Pressable
          style={styles.registerButton}
          onPress={() => navigation.push("Register")}
        >
          <Text
            style={{
              color: "black",
              fontWeight: "bold",
              letterSpacing: 1,
              fontSize: 18,
            }}
          >
            {t('sign-up-btn')}
          </Text>
        </Pressable>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>STOMP WebSocket Messages:</Text>
          {serverMessages.map((msg, index) => (
            <Text key={index}>{msg}</Text>
          ))}
        </View>
      </View>

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
      <RestaurantErrModal isError={isResError} setIsError={setIsResError} />
    </LinearGradient >
  );
};

const RestaurantErrModal = ({ isError, setIsError }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={isError}
      onBackdropPress={() => setIsError(false)}
      style={{
        alignItems: "center"
      }}
    >
      <View style={{
        rowGap: 20,
        width: ScreenWidth * 0.8,
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10
      }}>
        <Hyperlink
          linkDefault={true}
          linkText={(url) =>
            url === "https://www.facebook.com/profile.php?id=61559132142635"
              ? "Fanpage WhatEat"
              : url
          }
          onPress={(url, text) => {
            Linking.openURL(
              "https://www.facebook.com/profile.php?id=61559132142635"
            ); //Link fanpage facebook WhatEat
          }}
        >
          <Text style={{ fontSize: 16 }}>
            {t("account-not-active1")}{"\u00A0"}
            <Text
              style={{
                fontSize: 16,
                color: "#FB5854",
              }}
            >
              https://www.facebook.com/profile.php?id=61559132142635
            </Text>
            {"\u00A0"}{t("account-not-active2")}
          </Text>
        </Hyperlink>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            columnGap: 12,
          }}
        >
          <Pressable
            style={{
              backgroundColor: "#FB6562",
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
    height: 120,
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

export default LoginScreen;
