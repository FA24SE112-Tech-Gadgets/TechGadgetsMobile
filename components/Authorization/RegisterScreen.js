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
import { useCallback, useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import useAuth from "../../utils/useAuth";
import Modal from "react-native-modal";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { Snackbar } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { NODE_ENV, DEV_API, PRO_API } from "@env";
import * as Location from "expo-location"
import RegisterAddress from "../CustomComponents/RegisterAddress";
import Mapbox, { MapView, Camera, PointAnnotation, Logger, } from "@rnmapbox/maps";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";
import { useFocusEffect } from "@react-navigation/native";
Logger.setLogCallback(log => {
  const { message } = log;
  if (
    message.match("Request failed due to a permanent error: Canceled") ||
    message.match("Request failed due to a permanent error: Socket Closed")
  ) {
    return true;
  }
  return false;
})
Mapbox.setWellKnownTileServer('Mapbox');
Mapbox.setAccessToken("pk.eyJ1Ijoia2lldHB0MjAwMyIsImEiOiJjbHh4MzVjbnoxM3Z3MmxvZzdqOWRzazJ3In0._eSko2EyAB4hAIs9tgmO2w");

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();

  const [location, setLocation] = useState(null);
  const [isOpenBigMap, setOpenBigMap] = useState(false);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);

  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const [isOpenKeyboard, setIsOpenKeyboard] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

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
    image: "",
    imageBase64: "",
    fullName: "",
    phone: "",
    role: "",
    description: "",
    address: "",
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      const fileSizeInMB = result.assets[0].filesize / (1024 * 1024);
      const fileExtension = result.assets[0].uri.split(".").pop();

      if (fileSizeInMB <= 3) {
        const strBase64 =
          `data:image/${fileExtension};base64,` + result.assets[0].base64;
        handleChangeData("imageBase64", strBase64);
        handleChangeData("image", result.assets[0]);
      } else {
        setIsError(true);
        setStringErr(t("img-err-oversize"));
      }
    }
  };

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
    } else if (!handleValidEmail(account.email)) {
      return { isError: true, stringErr: t("email-wrong-format") };
    }

    //fullName
    if (account.fullName === "") {
      return { isError: true, stringErr: t("empty-name") };
    }

    //phone
    if (account.phone === "") {
      return { isError: true, stringErr: t("empty-phone-number") };
    } else if (!handleValidPhone(account.phone)) {
      return { isError: true, stringErr: t("invalid-phone-number") };
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

    if (account.role == "Quán ăn") {
      if (account.description == "")
        return { isError: true, stringErr: t("empty-description") };

      if (account.address == "")
        return { isError: true, stringErr: t("empty-address") };

      if (account.image == "")
        return { isError: true, stringErr: t("empty-image") };
    }

    return {
      isError: false,
      stringErr: "",
    };
  };

  const handleValidEmail = (mail) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(mail);
  };

  const handleValidPhone = (phone) => {
    return /((^(\+84|84|0){1})(3|5|7|8|9))+([0-9]{8})$/.test(phone);
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const saveChanges = async () => {
    // Validate the form
    const { isError, stringErr } = validateForm();
    setIsError(isError);
    setStringErr(stringErr);
    if (!isError) {
      let createAccountReq = {
        email: account.email,
        password: account.password,
        // fullName: account.fullName,
        phoneNumber: account.phone,
      };
      if (account.role == "Quán ăn") {
        createAccountReq = {
          ...createAccountReq,
          name: account.fullName,
          address: account.address,
          description: account.description,
          image: account.imageBase64,
        };
      } else {
        createAccountReq = {
          ...createAccountReq,
          fullName: account.fullName,
        };
      }

      setIsFetching(true);
      const response = await registerAccount(createAccountReq);
      setIsFetching(false);
      if (response.status >= 200 && response.status < 300) {
        setSnackbarVisible(true);
        if (account.role !== "Quán ăn") {
          setSnackbarMessage(t("check-mail"));
          await delay(1500);
          navigation.navigate("VerifyCode", {
            email: account.email,
          });
        } else {
          setIsError(true);
          setStringErr(
            t("account-in-rv")
          );
          await delay(1500);
          navigation.goBack();
        }
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

  async function registerAccount(createAccountReq) {
    const urlUser =
      NODE_ENV == "development"
        ? (DEV_API + "/users")
        : (PRO_API + "/users");

    const urlRestaurant =
      NODE_ENV == "development"
        ? (DEV_API + "/restaurants")
        : (PRO_API + "/restaurants");

    try {
      let response;
      if (createAccountReq.fullName) {
        response = await fetch(urlUser, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(createAccountReq),
        });
      } else {
        response = await fetch(urlRestaurant, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(createAccountReq),
        });
      }

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

  const getCurrentPosition = async () => {
    // let { status } = await Location.requestForegroundPermissionsAsync();
    // if (status !== "granted") {
    //   console.log("Please grant location permissions");
    //   return;
    // }
    try {
      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation.coords);
      // Reverse geocode to get address
      const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocodedAddress.length > 0) {
        const currentAddress = reverseGeocodedAddress[0];
        const addressParts = [];

        addressParts.push(currentAddress.formattedAddress);

        // Join the parts with a comma and space
        const strAddress = addressParts.join(", ");
        handleChangeData("address", strAddress);
      } else {
        handleChangeData("address", "")
        setIsError(true);
        setStringErr(t("current-location-err"));
      }
    } catch (error) {
      handleChangeData("address", "");
      setIsError(true);
      setStringErr(t("map-err"));
    }
  }

  //Get user current position
  useFocusEffect(
    useCallback(() => {
      getCurrentPosition();
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

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
        colors={["#FFFFFF", "#fff72e"]}
        style={[styles.linearGradient]}
      >
        <LottieView
          source={require("../../assets/background-login.json")}
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

          {/* fullName, phone */}
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            {/* Restaurant Image */}
            {account.role == "Quán ăn" && (
              <Pressable
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: 12,
                }}
                onPress={pickImage}
              >
                <View
                  style={{
                    height: ScreenWidth / 4.5,
                    width: ScreenWidth / 4.5,
                    backgroundColor: "white",
                    borderRadius: 100,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {account.image == "" ? (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon
                        type="feather"
                        name="image"
                        size={35}
                        color="#FB6562"
                      />
                      <Icon
                        type="material"
                        name="add"
                        size={25}
                        color="#FB6562"
                      />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: account.image.uri }}
                      style={{
                        height: ScreenWidth / 4.5,
                        width: ScreenWidth / 4.5,
                        borderRadius: 100,
                      }}
                    />
                  )}
                </View>
              </Pressable>
            )}

            {/* fullName, phone */}
            <View>
              {/* fullName */}
              <TextInput
                style={[account.role == "Quán ăn" ? styles.textInput2 : styles.textInput]}
                placeholder={t('register-name')}
                value={account.fullName}
                onChangeText={(value) => handleChangeData("fullName", value)}
              />
              {/* phone */}
              <TextInput
                style={[account.role == "Quán ăn" ? styles.textInput2 : styles.textInput]}
                placeholder={t('register-phone')}
                value={account.phone}
                onChangeText={(value) => handleChangeData("phone", value)}
                keyboardType="numeric"
              />
            </View>
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

          <RoleModal
            handleChangeData={handleChangeData}
            setShowRoleModal={setShowRoleModal}
            role={account.role}
            showRoleModal={showRoleModal}
          />

          {/* Mô tả, địa chỉ, gg map */}
          {account.role == "Quán ăn" && (
            <>
              {/* Mô tả */}
              <TextInput
                style={[styles.textInput, { paddingVertical: 12 }]}
                placeholder={t("register-description")}
                value={account.description}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
                onChangeText={(value) => handleChangeData("description", value)}
              />

              {/* Địa chỉ */}
              <Pressable
                style={[styles.textInput]}
                onPress={() => {
                  setOpenBigMap(true)
                }}
              >
                <Text>
                  {account.address}
                </Text>
              </Pressable>

              <MapView
                style={{
                  height: ScreenHeight / 6,
                  width: ScreenWidth / 1.1,
                  marginVertical: 7,
                }}
                styleURL="mapbox://styles/mapbox/streets-v12"
                onPress={() => {
                  setOpenBigMap(true);
                }}
                zoomEnabled={false}
                attributionEnabled={false} //Ẩn info icon
                logoEnabled={false} //Ẩn logo
                rotateEnabled={false}
                scrollEnabled={false}
              >
                <Camera
                  centerCoordinate={[location?.longitude || 0, location?.latitude || 0]}
                  zoomLevel={15}
                  pitch={10}
                  heading={0}
                />

                <PointAnnotation
                  id="marker"
                  coordinate={[location?.longitude || 0, location?.latitude || 0]}
                  onSelected={() => {
                    setOpenBigMap(true);
                  }}
                />
              </MapView>
            </>
          )}

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
      <RegisterAddress
        isOpen={isOpenBigMap}
        setOpen={setOpenBigMap}
        location={location}
        setLocation={setLocation}
        address={account.address}
        handleChangeData={handleChangeData}
        setSnackbarVisible={setSnackbarVisible}
        setSnackbarMessage={setSnackbarMessage}
      />
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
      <ConfirmModal
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

const RoleModal = ({
  showRoleModal,
  setShowRoleModal,
  role,
  handleChangeData,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <Pressable
        onPress={() => setShowRoleModal(true)}
        style={[
          styles.textInput,
          {
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
          },
        ]}
      >
        {role == "" ? (
          <Text style={{ color: "#878787", fontSize: 15 }}>{t('account-type')}</Text>
        ) : (
          <Text style={{ fontSize: 15 }}>{role === "Khách hàng" ? t("role-user") : t("role-restaurant")}</Text>
        )}

        <Icon
          type="material-community"
          name="chevron-down"
          size={24}
          color={"#FB6562"}
        />
      </Pressable>

      <Modal
        isVisible={showRoleModal}
        onBackdropPress={() => setShowRoleModal(false)}
        onSwipeComplete={() => setShowRoleModal(false)}
        useNativeDriverForBackdrop
        swipeDirection={"down"}
        propagateSwipe={true}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
      >
        <View style={styles.modalContent}>
          <View
            style={{
              alignItems: "center",
              padding: 12,
            }}
          >
            <View
              style={{
                width: ScreenWidth / 7,
                height: ScreenHeight / 80,
                backgroundColor: "#FB6562",
                borderRadius: 30,
              }}
            />
          </View>

          <View >
            <Pressable
              style={styles.modalOption}
              onPress={() => {
                handleChangeData("role", "Khách hàng"), setShowRoleModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>{t('role-user')}</Text>
              {role === "Khách hàng" ? (
                <Icon
                  type="material-community"
                  name="check-circle"
                  size={24}
                  color="#FB6562"
                />
              ) : (
                <Icon
                  type="material-community"
                  name="checkbox-blank-circle-outline"
                  size={24}
                  color="#FB6562"
                />
              )}
            </Pressable>
            <Pressable
              style={styles.modalOption}
              onPress={() => {
                handleChangeData("role", "Quán ăn"), setShowRoleModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>{t("role-restaurant")}</Text>
              {role === "Quán ăn" ? (
                <Icon
                  type="material-community"
                  name="check-circle"
                  size={24}
                  color="#FB6562"
                />
              ) : (
                <Icon
                  type="material-community"
                  name="checkbox-blank-circle-outline"
                  size={24}
                  color="#FB6562"
                />
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ConfirmModal = ({
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
              borderColor: "#FB6562",
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#FB6562" }}>{t("cancel-modal")}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowConfirmModal(false);
              handleConfirm();
            }}
            style={{
              backgroundColor: "#FB6562",
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
});
