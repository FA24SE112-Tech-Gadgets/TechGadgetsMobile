import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import { Snackbar } from "react-native-paper";
import api from "../Authorization/api";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import Mapbox, { MapView, Camera, PointAnnotation, Logger } from "@rnmapbox/maps";
import CustomMapModal from "../CustomComponents/CustomMapModal";
import ErrModal from "../CustomComponents/ErrModal";
import useAuth from "../../utils/useAuth";
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

const RestaurantDishDetail = ({ navigation, route }) => {
  const id = route.params;

  const [location, setLocation] = useState(null);
  const [isOpenBigMap, setOpenBigMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);

  const { t } = useTranslation();

  const { setCurrentPackage, setIsPayToWin } = useAuth();
  const [isChangeData, setIsChangeData] = useState(false);


  const [dish, setDish] = useState("");

  const geocode = async (address) => {
    const geocodedLocation = await Location.geocodeAsync(
      address !== null
        ? address
        : "Ho Chi Minh"
    ); //Default Ho Chi Minh
    setLocation(geocodedLocation[0]);
  };

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [isFetching, setIsFetching] = useState(false);

  const getCurrentPosition = async () => {
    const currentLocation = await Location.getCurrentPositionAsync({});
    setUserLocation(currentLocation.coords);
  };

  const calculateDistance = (userLatitude, userLongitude, resLatitude, resLongitude) => {
    const toRad = (value) => value * Math.PI / 180;

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(resLatitude - userLatitude);
    const dLon = toRad(resLongitude - userLongitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLatitude)) * Math.cos(toRad(resLatitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const calculateTravelTime = (distance, speed = 30) => {
    // speed is in km/h, distance is in km
    return (distance / speed) * 3600;
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const hoursString = hours.toString().padStart(2, '0');
    const minutesString = minutes.toString().padStart(2, '0');
    const secondsString = remainingSeconds.toString().padStart(2, '0');

    if (hoursString === "00" && minutesString === "00") {
      return t("near-here");
    } else if (hoursString === "00" && minutesString !== "00") {
      return `${minutesString} ${t("format-minute")}`;
    } else if (hoursString !== "00" && minutesString === "00") {
      return `${hoursString} ${t("format-hour")}`;
    } else {
      return `${hoursString} ${t("format-hour")} ${minutesString} ${t("format-minute")}`;
    }
  };

  //Fetch dish detail and get dish location
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          const res = await api.get(`/dishes/${id}`);
          await geocode(res.data?.restaurant?.address);
          setDish(res.data);
        } catch (error) {
          setIsError(true);
          setStringErr(
            error.response?.data?.reasons[0]?.message ?
              error.response.data.reasons[0].message
              :
              t("network-error")
          );
        }
      };

      init();
    }, [isChangeData])
  );

  //Get current position
  useFocusEffect(
    useCallback(() => {
      getCurrentPosition();
    }, [])
  );

  //Calculate time and distance
  useFocusEffect(
    useCallback(() => {
      if (userLocation && location) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        );
        setDistance(dist);
        const time = calculateTravelTime(dist);
        setTravelTime(time);
      }
    }, [userLocation, location])
  );

  function formatCurrency(number) {
    // Convert the number to a string
    if (number) {
      let numberString = number.toString();

      // Regular expression to add dot as thousand separator
      let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      return formattedString;
    }
  }

  const handleHide = async () => {
    if (dish.status == "ACTIVE") {
      try {
        setIsFetching(true);
        await api.delete(`/dishes/${id}`);
        setIsFetching(false);
        const newDish = { ...dish, status: "INACTIVE" };
        setDish(newDish);
        setShowConfirmModal(false);
        setSnackbarVisible(true);
        setSnackbarMessage(t("update-dish"));
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        setIsFetching(true);
        await api.post(`/dishes/${id}/activate`);
        setIsFetching(false);
        const newDish = { ...dish, status: "ACTIVE" };
        setDish(newDish);
        setShowConfirmModal(false);
        setSnackbarVisible(true);
        setSnackbarMessage(t("update-dish"));
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
  };

  async function fetchSubscription(status, page, limit) {
    const url = `/subscriptions/current?subscriptionStatus=${status}&page=${page}&limit=${limit}`;
    try {
      const res = await api.get(url);
      const data = res.data.data;
      if (data != undefined && data.length != 0) {
        setCurrentPackage(data[0]);
        setIsPayToWin(false);
        return true;
      }
      setCurrentPackage(null);
      setIsPayToWin(true);
      return false;
    } catch (error) {
      setIsError(true);
      setIsPayToWin(true);
      return false;
    }
  }

  async function handleClickDelete() {
    const isSubscription = await fetchSubscription("ACTIVE", 0, 1);
    if (isSubscription === true) {
      setShowConfirmModal(true);
    } else if (isSubscription === false) {
      setStringErr(
        dish?.status == "INACTIVE" ? t("expired-subscription") : t("just-expired")
      );
      if (dish?.status == "ACTIVE") { //TH dish đang active mà hết gói mà lỡ bấm nút thì fetch lại data
        setIsChangeData(!isChangeData);
      }
      setIsError(true);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView overScrollMode="never" showsVerticalScrollIndicator={false}>
        <View>
          {
            dish?.image &&
            <Image
              source={{ uri: dish?.image }}
              style={{ height: ScreenHeight * 0.3, width: "100%" }}
            />
          }
          {dish?.status == "INACTIVE" && (
            <View
              style={{
                position: "absolute",
                backgroundColor: "#FB6562",
                paddingHorizontal: 6,
                paddingVertical: 6,
                borderRadius: 30,
                top: 10,
                left: 10,
              }}
            >
              <Icon name="eye-off" type="material-community" color={"white"} />
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 14, paddingVertical: 16 }}>
          <Text style={{ fontWeight: "bold", fontSize: 24 }}>{dish?.name}</Text>

          {/* Mô tả */}
          <View
            style={{
              paddingHorizontal: 6,
              paddingVertical: 4,
              backgroundColor: "#F4F4F4",
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text>{dish?.description}</Text>
          </View>

          {/* Địa chỉ - MapView */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 12,
              marginBottom: 18,
            }}
          >
            <View style={{
              gap: 2
            }}>
              <Text style={{ color: "grey", marginBottom: 8, fontSize: 15 }}>
                {t("restaurant-address")}
              </Text>
              <Text
                style={{ color: "black", fontSize: 15, width: ScreenWidth / 2 }}
              >
                {dish?.restaurant?.address}
              </Text>
              {
                travelTime && distance &&
                <Text
                  style={{ color: "black", fontSize: 15, width: ScreenWidth / 2 }}
                >
                  {formatTime(travelTime)} - {distance.toFixed(2)} km
                </Text>
              }
            </View>

            <MapView
              style={{
                height: ScreenWidth / 4.5,
                width: ScreenWidth / 2.5,
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
                centerCoordinate={[location?.longitude || 106.69592033355514, location?.latitude || 10.782684066469386]}
                zoomLevel={15}
                pitch={10}
                heading={0}
              />

              <PointAnnotation
                id="marker"
                coordinate={[location?.longitude || 106.69592033355514, location?.latitude || 10.782684066469386]}
                onSelected={() => {
                  setOpenBigMap(true);
                }}
              />
            </MapView>
          </View>

          {/* Rating and review */}
          <Pressable
            onPress={() => navigation.navigate("RestaurantDishRating", id)}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <View>
                <Text style={{ color: "grey", marginBottom: 8, fontSize: 15 }}>
                  {t("rating-review")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    columnGap: 4,
                  }}
                >
                  <Icon
                    type="antdesign"
                    name="star"
                    size={20}
                    color="#FFC700"
                  />
                  <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                    {dish?.avgReview}
                  </Text>
                  <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                    ({dish?.numOfReview})
                  </Text>
                </View>
              </View>
              <Icon type="antdesign" name="right" size={24} color="#FB6562" />
            </View>
          </Pressable>

          {/* Food type and dish price */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ rowGap: 6 }}>
              <Text style={{ color: "grey", fontSize: 15 }}>{t("food-type")}</Text>
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                {dish?.food?.name}
              </Text>
            </View>
            <View style={{ rowGap: 6 }}>
              <Text style={{ color: "grey", fontSize: 15 }}>{t("dish-price")}</Text>
              <Text style={{ fontWeight: "500", fontSize: 15 }}>
                {formatCurrency(dish?.price?.amount)}
              </Text>
            </View>
          </View>

          {/* Edit and Delete Button */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 6,
              justifyContent: "space-between",
              marginTop: 40,
            }}
          >
            {/* Edit btn */}
            <Pressable
              style={{
                flexDirection: "row",
                justifyContent: "center",
                columnGap: 6,
                backgroundColor: "#FB6562",
                paddingHorizontal: 8,
                paddingVertical: 7,
                borderRadius: 4,
                width: "47%",
              }}
              onPress={() =>
                navigation.navigate("RestaurantEditDish", dish.id)
              }
            >
              <Text
                style={{ color: "white", fontSize: 17, fontWeight: "600" }}
              >
                {t("update-dish-btn")}
              </Text>
            </Pressable>

            {/* Delete btn */}
            <Pressable
              style={{
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "#FB6562",
                paddingHorizontal: 8,
                paddingVertical: 7,
                borderRadius: 4,
                width: "47%",
                gap: 5
              }}
              onPress={() => {
                handleClickDelete();
              }}
            >
              <Text
                style={{ color: "white", fontSize: 17, fontWeight: "600" }}
              >
                {dish?.status == "INACTIVE" ? t("show-btn") : t("hide-btn")}
              </Text>
              {
                isFetching &&
                <ActivityIndicator color={"white"} />
              }
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        setShowConfirmModal={setShowConfirmModal}
        showConfirmModal={showConfirmModal}
        handleHide={handleHide}
        hidden={dish.status == "INACTIVE"}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ zIndex: 1 }}
      >
        {snackbarMessage}
      </Snackbar>

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />

      <CustomMapModal
        isOpen={isOpenBigMap}
        setOpen={setOpenBigMap}
        location={location}
      />
    </View>
  );
};

const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  handleHide,
  hidden,
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
        backgroundColor: "white"
      }}>
        <Text style={{ fontSize: 15 }}>
          {t("are-u-sure")}{hidden ? t("show-txt") : t("hide-txt")}{t("this-dish")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            columnGap: 12,
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
            onPress={handleHide}
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
            <Text style={{ fontWeight: "bold", color: "white" }}>
              {hidden ? t("show-upper-btn") : t("hide-upper-btn")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default RestaurantDishDetail;
