import { View, Text, TouchableOpacity } from 'react-native'
import React, { useCallback, useState } from 'react'
import { ScreenWidth } from '@rneui/base'
import * as Location from "expo-location";
import Mapbox, { MapView, Camera, PointAnnotation, Logger } from "@rnmapbox/maps";
import { useFocusEffect } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
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

export default function SellerSearchItem({
    id,
    companyName,
    shopName,
    shopAddress,
    businessModel,
    taxCode,
    phoneNumber,
    setSnackbarVisible,
    setSnackbarMessage,
    setOpenBigMap,
    setSelectedLocation
}) {
    const [location, setLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [travelTime, setTravelTime] = useState(null);

    const getCurrentPosition = async () => {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setUserLocation(currentLocation.coords);
    };

    const geocode = async () => {
        const geocodedLocation = await Location.geocodeAsync(
            shopAddress
                ? shopAddress
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

    const copyToClipboard = (text) => {
        Clipboard.setString(text);
        setSnackbarMessage("Sao chép địa chỉ thành công");
        setSnackbarVisible(true);
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const hoursString = hours.toString().padStart(2, '0');
        const minutesString = minutes.toString().padStart(2, '0');
        const secondsString = remainingSeconds.toString().padStart(2, '0');

        if (hoursString === "00" && minutesString === "00") {
            return "Gần đây";
        } else if (hoursString === "00" && minutesString !== "00") {
            return `${minutesString} phút`;
        } else if (hoursString !== "00" && minutesString === "00") {
            return `${hoursString} giờ`;
        } else {
            return `${hoursString} giờ ${minutesString} phút`;
        }
    };

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
        <View style={{
            width: ScreenWidth - 20,
            backgroundColor: "rgba(254, 169, 40, 0.8)",
            padding: 10,
            borderRadius: 10 + 10,
            borderWidth: 1,
            borderColor: "#ed8900",
            marginBottom: 10
        }}>
            <Text style={{
                fontSize: 16,
                fontWeight: "500",
                marginBottom: 5,
                overflow: "hidden",
                color: "#112A46"
            }} numberOfLines={1} ellipsizeMode="tail">{shopName}{companyName ? ` - ${companyName}` : ""}</Text>

            <View style={{
                flexDirection: "row",
                gap: 10,
                backgroundColor: "#112A46",
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
            }}>
                <View style={{
                    width: (ScreenWidth - 20 - 50) * 2 / 3,
                    gap: 5
                }}>
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        paddingVertical: 5,
                        gap: 5
                    }}>
                        <Text
                            style={{
                                color: "white",
                                fontWeight: "500",
                                width: ScreenWidth / 2.5
                            }}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >{shopAddress}</Text>
                        <TouchableOpacity
                            disabled={shopAddress != null ? false : true}
                            onPress={() => copyToClipboard(shopAddress)}
                        >
                            <Text style={{ color: "#ed8900", fontSize: 15, fontWeight: "500" }}>Sao chép</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={{
                        color: "white",
                        fontWeight: "500"
                    }}>Số điện thoại: {phoneNumber ? phoneNumber : "Chưa cung cấp"}</Text>
                    {
                        travelTime && distance &&
                        <Text
                            style={{ color: "#ed8900", fontWeight: "500", width: ScreenWidth / 2 }}
                        >
                            {formatTime(travelTime)} - {distance.toFixed(2)} km
                        </Text>
                    }
                </View>

                <TouchableOpacity onPress={() => {
                    setSelectedLocation(location);
                    setOpenBigMap(true);
                }}>
                    <MapView
                        style={{
                            height: ScreenWidth / 4.5,
                            width: (ScreenWidth - 20 - 50) / 3,
                            borderRadius: 10
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
                        />
                    </MapView>
                </TouchableOpacity>
            </View>
        </View>
    )
}