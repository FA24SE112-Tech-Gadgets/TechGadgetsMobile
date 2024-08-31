import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import logo from "../../assets/adaptive-icon.png";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import useAuth from "../../utils/useAuth";
import Modal from "react-native-modal";
import { Snackbar } from "react-native-paper";
import api from "../Authorization/api";
import * as ImagePicker from "expo-image-picker";
import ErrModal from "./ErrModal";
import { useTranslation } from "react-i18next";
import ChooseLocation from "./ChooseLocation";
import Mapbox, { MapView, Camera, PointAnnotation, Logger, } from "@rnmapbox/maps";
import * as Location from "expo-location"
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


export default function ChangeProfile() {
  const [location, setLocation] = useState(null);

  const { logout, user, setUser } = useAuth();

  const urlUser = `/users/${user.id}`;
  const urlRestaurant = `/restaurants/${user.idRestaurant}`;

  const [isOpenFields, setIsOpenFields] = useState({
    image: false,
    fullName: false,
    phoneNumber: false,
    description: false,
    address: false,
  });

  const [newFields, setNewFields] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    description: "",
    image: "",
    imageBase64: "",
  });

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [isFetching, setIsFetching] = useState(false);

  const { t } = useTranslation();

  const geocode = async (address) => {
    const geocodedLocation = await Location.geocodeAsync(
      address
        ? address
        : "Ho Chi Minh"
    ); //Default Ho Chi Minh
    setLocation(geocodedLocation[0]);
  };

  const handleChangeData = (fieldName, data) => {
    setNewFields((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  const handleChangeModal = (fieldName, data) => {
    setIsOpenFields((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  const handleChangeFullName = async () => {
    if (newFields.fullName == "") {
      setIsError(true);
      setStringErr(t("empty-new-name"));
      return;
    }

    if (user.role != "RESTAURANT") {
      try {
        setIsFetching(true);
        const res = await api.patch(urlUser, {
          fullName: newFields.fullName,
        });
        setIsFetching(false);

        handleChangeModal("fullName", false);
        setSnackbarVisible(true);
        handleChangeData("fullName", "");
        setSnackbarMessage(t("update-name-success"));
        setUser((prev) => ({ ...prev, fullName: res.data.fullName }));
      } catch (e) {
        setStringErr(e.response.data.reasons[0].message);
        setIsError(true);
      }
    } else {
      try {
        setIsFetching(true);
        const res = await api.patch(urlRestaurant, {
          name: newFields.fullName,
        });
        setIsFetching(true);

        handleChangeModal("fullName", false);
        setSnackbarVisible(true);
        setSnackbarMessage(t("update-name-success"));
        setUser((prev) => ({ ...prev, fullName: res.data.fullName }));
      } catch (e) {
        setStringErr(e.response.data.reasons[0].message);
        setIsError(true);
      }
    }
  };

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

        try {
          let res;
          if (user.role == "USER") {
            res = await api.patch(urlUser, {
              image: strBase64,
            });
            setUser((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
          } else {
            setIsFetching(true);
            res = await api.patch(urlRestaurant, {
              image: strBase64,
            });
            setIsFetching(false);
            setUser((prev) => ({ ...prev, imageUrl: res.data.image }));
          }
          setSnackbarVisible(true);
          setSnackbarMessage(t("update-image-success"));
        } catch (e) {
          setStringErr(e.response.data.reasons[0].message);
          setIsError(true);
        }
      } else {
        setIsError(true);
        setStringErr(t("img-oversize"));
      }
    }
  };

  const deleteImage = async () => {
    try {
      setIsFetching(true);
      let res;
      if (user.role == "USER") {
        res = await api.patch(urlUser, {
          image: "",
        });
        setUser((prev) => ({ ...prev, imageUrl: res.data.imageUrl }));
      }
      setIsFetching(false);
      setSnackbarVisible(true);
      setSnackbarMessage(t("delete-image-success"));
    } catch (e) {
      setStringErr(e.response.data.reasons[0].message);
      setIsError(true);
    }
  };

  const handleChangePhoneNumber = async () => {
    if (newFields.phoneNumber == "") {
      setIsError(true);
      setStringErr(t("empty-new-phone"));
      return;
    }

    if (user.role == "RESTAURANT") {
      try {
        const res = await api.patch(urlRestaurant, {
          phoneNumber: newFields.phoneNumber,
        });

        handleChangeModal("phoneNumber", false);
        setSnackbarVisible(true);
        handleChangeData("phoneNumber", "");
        setSnackbarMessage(t("update-phone-number-success"));
        const newUser = await api.get("/users/current");
        setUser((prev) => ({ ...prev, phoneNumber: newUser.data.phoneNumber }));
      } catch (e) {
        setStringErr(e.response.data.reasons[0].message);
        setIsError(true);
      }
    } else {
      try {
        setIsFetching(true);
        const res = await api.patch(urlUser, {
          phoneNumber: newFields.phoneNumber,
        });
        setIsFetching(false);

        handleChangeModal("phoneNumber", false);
        setSnackbarVisible(true);
        handleChangeData("phoneNumber", "");
        setSnackbarMessage(t("update-phone-number-success"));
        setUser((prev) => ({ ...prev, phoneNumber: res.data.phoneNumber }));
      } catch (e) {
        setStringErr(e.response.data.reasons[0].message);
        setIsError(true);
      }
    }
  };

  const handleChangeDescription = async () => {
    if (newFields.description == "") {
      setIsError(true);
      setStringErr(t("empty-new-description"));
      return;
    }

    try {
      setIsFetching(true);
      const res = await api.patch(urlRestaurant, {
        description: newFields.description,
      });
      setIsFetching(false);

      handleChangeModal("description", false);
      setSnackbarVisible(true);
      handleChangeData("description", "");
      setSnackbarMessage(t("update-new-description-success"));
      setUser((prev) => ({ ...prev, description: res.data.description }));
    } catch (e) {
      setStringErr(e.response.data.reasons[0].message);
      setIsError(true);
    }
  };

  const handleChangeAddress = async (newAddress) => {
    try {
      setIsFetching(true);
      const res = await api.patch(urlRestaurant, {
        address: newAddress,
      });
      setIsFetching(false);

      setUser((prev) => ({ ...prev, address: res.data.address }));
    } catch (e) {
      setStringErr(e.response.data.reasons[0].message);
      setIsError(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      geocode(user.address)
    }, [user.address])
  );

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#FB6562"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ paddingHorizontal: 14 }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {/* WhatEat logo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 10,
          }}
        >
          <Image
            style={{
              width: 70,
              height: 70,
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
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                WhatEat
              </Text>
            }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 0.6 }}
              colors={["rgba(250, 164, 147, 0.65)", "#FB5854"]}
            >
              <Text style={{ opacity: 0, fontSize: 28, fontWeight: "bold" }}>
                WhatEat
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* Thông tin cá nhân */}
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            textAlignVertical: "center",
          }}
        >
          {t("personal-profile-title")}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          {t("personal-profile-content")}
        </Text>

        {/* Open image modal */}
        <Pressable
          style={{
            height: 140,
            width: 140,
            backgroundColor: "white",
            borderRadius: 100,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginVertical: 12,
          }}
          onPress={() => handleChangeModal("image", true)}
          disabled={isFetching}
        >
          {
            isFetching ?
              <ActivityIndicator color={"#FB6562"} size={30} />
              :
              <View
                style={{
                  height: 140,
                  width: 140,
                  backgroundColor: "white",
                  borderRadius: 100,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {user.imageUrl == null ? (
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
                      size={40}
                      color="#FB6562"
                    />
                    <Icon
                      type="material"
                      name="add"
                      size={30}
                      color="#FB6562"
                    />
                  </View>
                ) : (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={{
                      height: 140,
                      width: 140,
                      borderRadius: 100,
                    }}
                  />
                )}
              </View>
          }
        </Pressable>

        <View
          style={{
            marginTop: 10,
            backgroundColor: "white",
            borderRadius: 10,
            paddingVertical: 5,
            marginBottom: 16,
          }}
        >
          {/* Thông tin liên hệ */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
            onPress={() => handleChangeModal("fullName", true)}
          >
            <View
              style={{
                width: ScreenWidth / 1.5,
              }}
            >
              <Text style={{ fontSize: 17 }}>
                {t("contact-info")}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "300" }}>
                {user.email}, {user.role === "RESTAURANT" ? user.restaurantName : user.fullName}
              </Text>
            </View>
            <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
          </Pressable>
          {/* Số điện thoại */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
            onPress={() => handleChangeModal("phoneNumber", true)}
          >
            <View
              style={{
                width: ScreenWidth / 1.5,
              }}
            >
              <Text style={{ fontSize: 17 }}>
                {t("contact-phone")}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "300" }}>
                {user.phoneNumber}
              </Text>
            </View>
            <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
          </Pressable>

          {/* Mô tả*/}
          {user.role == "RESTAURANT" && (
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "white",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                justifyContent: "space-between",
              }}
              onPress={() => handleChangeModal("description", true)}
            >
              <View
                style={{
                  width: ScreenWidth / 1.5,
                }}
              >
                <Text style={{ fontSize: 17 }}>Mô tả</Text>
                <Text style={{ fontSize: 15, fontWeight: "300" }}>
                  {user.description}
                </Text>
              </View>
              <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
            </Pressable>
          )}

          {/* Địa chỉ */}
          {user.role == "RESTAURANT" && (
            <>
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  justifyContent: "space-between",
                }}
                onPress={() => handleChangeModal("address", true)}
              >
                <View
                  style={{
                    width: ScreenWidth / 1.5,
                  }}
                >
                  <Text style={{ fontSize: 17 }}>Địa chỉ</Text>
                  <Text style={{ fontSize: 15, fontWeight: "300" }}>
                    {user.address}
                  </Text>
                </View>
                <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
              </Pressable>
              <MapView
                style={{
                  height: ScreenHeight / 6,
                  width: ScreenWidth / 1.2,
                  marginVertical: 7,
                  alignSelf: "center"
                }}
                styleURL="mapbox://styles/mapbox/streets-v12"
                onPress={() => {
                  handleChangeModal("address", true);
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
                    handleChangeModal("address", true);
                  }}
                />
              </MapView>
            </>
          )}
        </View>

        <ChooseLocation
          isOpen={isOpenFields.address}
          handleChangeModal={handleChangeModal}
          location={location}
          setLocation={setLocation}
          address={user.address}
          handleChangeAddress={handleChangeAddress}
          isFetching={isFetching}
          setIsFetching={setIsFetching}
        />

        <DescriptionModal
          handleChangeData={handleChangeData}
          handleChangeDescription={handleChangeDescription}
          isOpen={isOpenFields.description}
          description={newFields.description}
          handleChangeModal={handleChangeModal}
          isFetching={isFetching}
        />

        <NameModel
          handleChangeData={handleChangeData}
          handleChangeFullName={handleChangeFullName}
          isOpen={isOpenFields.fullName}
          fullName={newFields.fullName}
          handleChangeModal={handleChangeModal}
          isFetching={isFetching}
        />

        <PhoneModal
          handleChangeData={handleChangeData}
          handleChangePhoneNumber={handleChangePhoneNumber}
          isOpen={isOpenFields.phoneNumber}
          phoneNumber={newFields.phoneNumber}
          handleChangeModal={handleChangeModal}
          isFetching={isFetching}
        />

        <ImageModal
          isOpen={isOpenFields.image}
          pickImage={pickImage}
          deleteImage={deleteImage}
          handleChangeModal={handleChangeModal}
        />
      </ScrollView>
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
    </LinearGradient>
  );
}

const DescriptionModal = ({
  isOpen,
  handleChangeModal,
  description,
  handleChangeData,
  handleChangeDescription,
  isFetching
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={() => handleChangeModal("description", false)}
      onSwipeComplete={() => handleChangeModal("description", false)}
      useNativeDriverForBackdrop
      swipeDirection={"down"}
      propagateSwipe={true}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      {/* Bottom Modal Screen */}
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
        colors={["#FFFFFF", "#FB6562"]}
        style={{
          width: ScreenWidth,
          height: ScreenHeight / 1.5,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20
        }}
      >
        {/* Thanh trên cùng */}
        <View
          style={{
            alignItems: "center",
            padding: 10,
          }}
        >
          <View
            style={{
              width: ScreenWidth / 5,
              height: ScreenHeight / 80,
              backgroundColor: "#FB6562",
              borderRadius: 30,
            }}
          />
        </View>

        <View
          style={{
            height: ScreenHeight / 2.1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              marginVertical: 10,
              paddingHorizontal: 10,
              paddingVertical: 10,
              gap: 14,
              backgroundColor: "white",
              width: ScreenWidth / 1.1,
              borderRadius: 10,
            }}
          >
            <TextInput
              style={{
                borderColor: "#B7B7B7",
                borderWidth: 1,
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                fontSize: 18,
              }}
              multiline={true}
              numberOfLines={5}
              textAlignVertical="top"
              placeholder={t("input-new-description")}
              value={description}
              onChangeText={(value) => {
                handleChangeData("description", value);
              }}
            />
            <Pressable
              style={{
                backgroundColor: "#FB6562",
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 10,
                flexDirection: "row",
                gap: 5,
                justifyContent: "center"
              }}
              onPress={handleChangeDescription}
              disabled={isFetching}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  textAlignVertical: "center",
                  fontSize: 18,
                }}
              >
                {t("input-btn")}
              </Text>
              {
                isFetching &&
                <ActivityIndicator color={"white"} />
              }
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const NameModel = ({
  isOpen,
  handleChangeModal,
  fullName,
  handleChangeData,
  handleChangeFullName,
  isFetching
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={() => handleChangeModal("fullName", false)}
      onSwipeComplete={() => handleChangeModal("fullName", false)}
      useNativeDriverForBackdrop
      swipeDirection={"down"}
      propagateSwipe={true}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      {/* Bottom Modal Screen */}
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
        colors={["#FFFFFF", "#FB6562"]}
        style={{
          width: ScreenWidth,
          height: ScreenHeight / 1.5,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20
        }}
      >
        {/* Thanh trên cùng */}
        <View
          style={{
            alignItems: "center",
            padding: 10,
          }}
        >
          <View
            style={{
              width: ScreenWidth / 5,
              height: ScreenHeight / 80,
              backgroundColor: "#FB6562",
              borderRadius: 30,
            }}
          />
        </View>

        <View
          style={{
            height: ScreenHeight / 2.1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              marginVertical: 10,
              paddingHorizontal: 10,
              paddingVertical: 10,
              gap: 14,
              backgroundColor: "white",
              width: ScreenWidth / 1.1,
              borderRadius: 10,
            }}
          >
            <TextInput
              style={{
                borderColor: "#B7B7B7",
                borderWidth: 1,
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                fontSize: 18,
              }}
              placeholder={t("input-new-name")}
              value={fullName}
              onChangeText={(value) => {
                handleChangeData("fullName", value);
              }}
            />
            <Pressable
              style={{
                backgroundColor: "#FB6562",
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 10,
                flexDirection: "row",
                gap: 5,
                justifyContent: "center"
              }}
              onPress={handleChangeFullName}
              disabled={isFetching}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  textAlignVertical: "center",
                  fontSize: 18,
                }}
              >
                {t("input-btn")}
              </Text>
              {
                isFetching &&
                <ActivityIndicator color={"white"} />
              }
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const PhoneModal = ({
  isOpen,
  handleChangeModal,
  phoneNumber,
  handleChangeData,
  handleChangePhoneNumber,
  isFetching
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={() => handleChangeModal("phoneNumber", false)}
      onSwipeComplete={() => handleChangeModal("phoneNumber", false)}
      useNativeDriverForBackdrop
      swipeDirection={"down"}
      propagateSwipe={true}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      {/* Bottom Modal Screen */}
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
        colors={["#FFFFFF", "#FB6562"]}
        style={{
          width: ScreenWidth,
          height: ScreenHeight / 1.5,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20
        }}
      >
        {/* Thanh trên cùng */}
        <View
          style={{
            alignItems: "center",
            padding: 10,
          }}
        >
          <View
            style={{
              width: ScreenWidth / 5,
              height: ScreenHeight / 80,
              backgroundColor: "#FB6562",
              borderRadius: 30,
            }}
          />
        </View>

        <View
          style={{
            height: ScreenHeight / 2.1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              marginVertical: 10,
              paddingHorizontal: 10,
              paddingVertical: 10,
              gap: 14,
              backgroundColor: "white",
              width: ScreenWidth / 1.1,
              borderRadius: 10,
            }}
          >
            <TextInput
              style={{
                borderColor: "#B7B7B7",
                borderWidth: 1,
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                fontSize: 18,
              }}
              placeholder={t("input-new-phone-number")}
              value={phoneNumber}
              onChangeText={(value) => {
                handleChangeData("phoneNumber", value);
              }}
            />
            <Pressable
              style={{
                backgroundColor: "#FB6562",
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 10,
                flexDirection: "row",
                gap: 5,
                justifyContent: "center"
              }}
              onPress={handleChangePhoneNumber}
              disabled={isFetching}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  textAlignVertical: "center",
                  fontSize: 18,
                }}
              >
                {t("input-btn")}
              </Text>
              {
                isFetching &&
                <ActivityIndicator color={"white"} />
              }
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const ImageModal = ({
  isOpen,
  handleChangeModal,
  pickImage,
  deleteImage,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={() => handleChangeModal("image", false)}
      onSwipeComplete={() => handleChangeModal("image", false)}
      useNativeDriverForBackdrop
      swipeDirection={"down"}
      propagateSwipe={true}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      {/* Bottom Modal Screen */}
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
        colors={["#FFFFFF", "#FFFFFF"]}
        style={{
          width: ScreenWidth,
          height: ScreenHeight / 6,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          position: "relative",
          justifyContent: "center"
        }}
      >
        {/* Thanh trên cùng */}
        <View
          style={{
            width: ScreenWidth / 5,
            height: ScreenHeight / 80,
            backgroundColor: "#FB6562",
            borderRadius: 30,
            position: "absolute",
            top: 10,
            alignSelf: "center"
          }}
        />

        {/* Choose image */}
        <Pressable
          style={{
            paddingVertical: 5,
            paddingHorizontal: 10,
            flexDirection: "row",
            gap: 5,
          }}
          onPress={() => {
            pickImage();
            handleChangeModal("image", false);
          }}
        >
          <Text
            style={{
              color: "black",
              textAlign: "center",
              textAlignVertical: "center",
              fontSize: 18,
            }}
          >
            {t("choose-image-content")}
          </Text>
        </Pressable>

        {/* Delete image */}
        {
          user.role !== "RESTAURANT" &&
          <Pressable
            style={{
              paddingVertical: 5,
              paddingHorizontal: 10,
              flexDirection: "row",
              gap: 5,
            }}
            onPress={() => {
              deleteImage();
              handleChangeModal("image", false);
            }}
            disabled={user.imageUrl == null}
          >
            <Text
              style={{
                color: "black",
                textAlign: "center",
                textAlignVertical: "center",
                fontSize: 18,
              }}
            >
              {t("delete-image-content")}
            </Text>
          </Pressable>
        }

      </LinearGradient>
    </Modal>
  );
};
