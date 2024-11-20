import {
  ActivityIndicator,
  Image,
  Keyboard,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import useAuth from "../../utils/useAuth";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob"; //For jwt decode
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import { NODE_ENV, DEV_API, PROD_API } from "@env";
import * as Location from "expo-location"
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import useNotification from "../../utils/useNotification"
import ggLogo from "../../assets/GoogleLogo.png"

const CustomGoogleSignInButton = ({ onPress }) => (
  <TouchableOpacity style={styles.googleButton} onPress={onPress}>
    <Image
      style={{
        width: 24,
        height: 24,
      }}
      source={ggLogo}
    />
    <Text style={styles.googleButtonText}>Sign in with Google</Text>
  </TouchableOpacity>
);


const LoginScreen = () => {
  GoogleSignin.configure({
    webClientId: NODE_ENV == "development" ?
      '918667179231-gc42utvqvgb3pu9949ce3c7225vrk9tr.apps.googleusercontent.com'
      : "918667179231-c1ninpp8fc7akdh9radu56lnpb7a346l.apps.googleusercontent.com",
  })

  const navigation = useNavigation()
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRecentPushed, setIsRecentPushed] = useState(false);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [isOpenKeyboard, setIsOpenKeyboard] = useState(false);

  const { deviceToken } = useNotification();

  const { t } = useTranslation();

  const { login, user, isLoggedIn } = useAuth();


  const handleLoginBtn = async () => {
    const url =
      NODE_ENV == "development"
        ? (DEV_API + "/auth/login")
        : (PROD_API + "/auth/login");
    setIsRecentPushed(true);
    try {
      const res = await axios.post(url, {
        email: userEmail,
        password,
        deviceToken
      });
      const { token, refreshToken } = res.data;

      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("token", token);

      await login();

      // navigation.replace("StackBuyerHome")
      if (user?.role === "Customer") {
        navigation.replace("StackBuyerHome");
      } else if (user?.role === "Seller") {


        if (!user?.seller) { //fix  
          navigation.replace("RegisterSeller");
        } else {
          navigation.replace("StackSellerHome");
        }
      }
    } catch (error) {
      console.log(error.response.data);

      if (error.response.data.code === "WEB_03") {
        //Code user
        setStringErr(error.response.data.reasons[0].message);
        setIsError(true);
        await delay(1500);
        const resendUrl = NODE_ENV == "development"
          ? (DEV_API + "/auth/resend")
          : (PROD_API + "/auth/resend");
        await axios.post(resendUrl, {
          email: userEmail,
        });
        navigation.navigate("VerifyCode", {
          email: userEmail,
        });
      } else {
        setStringErr(
          error.response?.data?.reasons[0]?.message ?
            error.response.data.reasons[0].message
            :
            "Lỗi mạng vui lòng thử lại sau"
        );
        setIsError(true);
      }
    } finally {
      setIsRecentPushed(false);
    }
  };

  const handleLoginGoogle = async (accessToken) => {
    try {
      const url =
        NODE_ENV == "development"
          ? DEV_API
          : PROD_API;
      const response = await axios.post(`${url}/auth/google/${accessToken}`, {
        deviceToken
      });
      const { token: apiToken, refreshToken } = response.data;

      const decodedToken = jwtDecode(apiToken);
      console.log('Decoded Token:', decodedToken);
      const userInfo = JSON.parse(decodedToken.UserInfo);
      console.log('User Info là:', userInfo);
      await AsyncStorage.setItem("refreshToken", refreshToken);
      await AsyncStorage.setItem("token", apiToken);

      await login();

      navigation.replace('StackBuyerHome');
    } catch (error) {
      console.log('API call error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);

      const token = await GoogleSignin.getTokens();
      console.log('Access Token:', token.accessToken);

      await handleLoginGoogle(token.accessToken);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("SIGN_IN_CANCELLED");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("IN_PROGRESS");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("PLAY_SERVICES_NOT_AVAILABLE");
      } else {
        console.log("Some other error happened", error.toString());
      }
      setStringErr(
        error ?
          error.toString()
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
    }
  };


  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const getPermissionsAndroid = async () => {
    try {
      const permissions = [];

      if (Platform.Version >= 33) {
        // For Android 13 (API level 33) and later
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      } else if (Platform.Version >= 30) {
        // For Android 11 (API level 30) to Android 12 (API level 31)
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      } else {
        // For Android 10 and below
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        // Add any other permissions for Android 10 and below
      }

      // Request permissions
      const grantedPermissions = await Promise.all(
        permissions.map(permission => PermissionsAndroid.request(permission))
      );

      // Check if all permissions are granted
      const allGranted = grantedPermissions.every(result => result === PermissionsAndroid.RESULTS.GRANTED);

      if (allGranted) {
        console.log('All permissions granted');
        return true;
      } else {
        console.log('Some permissions denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  //Android Request Permission
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
          const granted = await getPermissionsAndroid();
          if (!granted) {
            console.log('Permissions denied');
            return;
          }
          console.log('Permissions granted');
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

  //Check isLoggedIn for navigation
  useFocusEffect(
    useCallback(() => {
      const fetchFunction = () => {
        if (user?.role === "Customer") {
          navigation.replace("StackBuyerHome");
        } else if (user?.role === "Seller") {
          if (!user?.seller) { //fix  
            navigation.replace("RegisterSeller");
          } else {
            navigation.replace("StackSellerHome");
          }
        }
      }
      fetchFunction();
    }, [isLoggedIn])
  );

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#fea92866"]}
      style={styles.linearGradient}
    >
      <LottieView
        source={require("../../assets/animations/background-login.json")}
        style={styles.background}
        autoPlay
        loop={false}
      />

      <View View style={styles.container} >
        <Text style={styles.title}>{t('login-title')}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={t('email-input')}
            value={userEmail}
            onChangeText={(text) => setUserEmail(text)}
          />
          <View style={{ position: "relative" }}>
            <TextInput
              style={styles.textInput}
              placeholder={"Mật khẩu"}
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
            ĐĂNG NHẬP
          </Text>
          {
            isRecentPushed &&
            <ActivityIndicator color={"white"} />
          }
        </Pressable>

        <View style={styles.googleButtonContainer}>
          <CustomGoogleSignInButton onPress={handleGoogleSignIn} />
        </View>

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
          Hoặc
        </Text>
        <Pressable
          style={styles.registerButton}
          onPress={() => navigation.push("Register")}
        // onPress={() => navigation.push("RegisterSeller")}

        >
          <Text
            style={{
              color: "black",
              fontWeight: "bold",
              letterSpacing: 1,
              fontSize: 18,
            }}
          >
            ĐĂNG KÝ
          </Text>
        </Pressable>
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

export default LoginScreen;