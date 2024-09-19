import { View, Text, Image, Pressable } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/AntDesign";
import * as Location from "expo-location";
import { ScreenWidth, ScreenHeight } from "@rneui/base/dist/helpers";
import CustomMapModal from "../CustomComponents/CustomMapModal";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";
import Mapbox, { MapView, Camera, PointAnnotation, Logger } from "@rnmapbox/maps";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";
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
Mapbox.setAccessToken("pk.eyJ1IjoidGVjaGdhZGdldHMiLCJhIjoiY20wbTduZ2luMGUwOTJrcTRoZ2sxdDlxNSJ9._u75BBT2ZyNAfGwkcSgVOw");

const CustomerDishDetail = ({ navigation, route }) => {
  const [location, setLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [travelTime, setTravelTime] = useState(null);

  const [isOpenBigMap, setOpenBigMap] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { t } = useTranslation();

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [review, setReview] = useState("");

  const dish = route.params;

  const getCurrentPosition = async () => {
    const currentLocation = await Location.getCurrentPositionAsync({});
    setUserLocation(currentLocation.coords);
  };

  const geocode = async () => {
    const geocodedLocation = await Location.geocodeAsync(
      dish?.restaurant?.address
        ? dish?.restaurant?.address
        : "Ho Chi Minh"
    ); //Default Ho Chi Minh
    setLocation(geocodedLocation[0]);
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

  // Dish review
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          {
            const res = await api.get(`/dishes/${dish.id}/reviews/summary`);
            const newData = res.data;
            setReview(newData);
          }
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
    }, [])
  );

  //Fetch current position and dish position
  useFocusEffect(
    useCallback(() => {
      getCurrentPosition();
      geocode();
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

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Image
        source={{ uri: dish.image }}
        style={{ height: ScreenHeight * 0.3, width: ScreenWidth }}
      />
      <View style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
        <Text style={{ fontWeight: "bold", fontSize: 30, color: "#FB5854", paddingBottom: 6 }}>{dish.restaurant.name}</Text>
        <Text style={{ fontWeight: "500", fontSize: 24 }}>{dish.name}</Text>
        <View
          style={{
            paddingHorizontal: 6,
            paddingVertical: 4,
            backgroundColor: "#F4F4F4",
            borderRadius: 12,
            marginTop: 8,
          }}
        >
          <Text>{dish.description}</Text>
        </View>

        {/* Địa chỉ */}
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

        {/* Đánh giá và nhận xét */}
        <Pressable
          onPress={() => {
            navigation.navigate("CustomerRating", dish.id);
          }}
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
                <Icon name="star" size={20} color="#FFC700" />
                <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                  {review?.avgReview}
                </Text>
                <Text style={{ fontWeight: "bold", fontSize: 15 }}>
                  ({review?.numOfReview})
                </Text>
              </View>
            </View>
            <Icon name="right" size={24} color="#FB6562" />
          </View>
        </Pressable>

        {/* Loại món ăn, Giá */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ rowGap: 6 }}>
            <Text style={{ color: "grey", fontSize: 15 }}>{t("food-type")}</Text>
            <Text style={{ fontWeight: "500", fontSize: 15 }}>
              {dish.food.name}
            </Text>
          </View>
          <View style={{ rowGap: 6 }}>
            <Text style={{ color: "grey", fontSize: 15 }}>{t("dish-price")}</Text>
            <Text style={{ fontWeight: "500", fontSize: 15 }}>
              {dish.price.amount}
            </Text>
          </View>
        </View>
      </View>
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

export default CustomerDishDetail;
