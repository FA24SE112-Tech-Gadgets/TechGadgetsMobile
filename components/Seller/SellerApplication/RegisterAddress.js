import { View, Text, Pressable, Modal, Image } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Icon, ScreenHeight, ScreenWidth } from '@rneui/base'
import { IconButton, Snackbar } from 'react-native-paper';
import { TextInput } from 'react-native';
import * as Location from "expo-location"
import { useDebounce } from 'use-debounce';
import Mapbox, { MapView, Camera, PointAnnotation, Logger } from "@rnmapbox/maps";
import { useFocusEffect } from '@react-navigation/native';
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
import userLocationAva from "../../../assets/userLocationAva.png";

export default function RegisterAddress({ isOpen, setOpen, location, setLocation, address, setShopAddress }) {
    const [searchString, setSearchString] = useState("");
    const [searchBounceString] = useDebounce(searchString, 1000);
    const [isNotFound, setIsNotFound] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [arrAddress, setArrAddress] = useState([]);

    const [chooseLocation, setChooseLocation] = useState([]);

    const [userLocation, setUserLocation] = useState(null);
    const pointAnnotationRef = useRef(null); // Tham chiếu đến PointAnnotation

    const handleMapPress = async (feature) => {
        const longitude = feature.geometry.coordinates[0];
        const latitude = feature.geometry.coordinates[1];
        console.log(longitude, latitude);
        setChooseLocation({ latitude, longitude });

        const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
            latitude: latitude,
            longitude: longitude,
        });

        if (reverseGeocodedAddress.length > 0) {
            const addresses = reverseGeocodedAddress.map((item) => {
                const addressParts = [];

                if (item.formattedAddress) {
                    addressParts.push(item.formattedAddress);
                }

                // Join the parts with a comma and space
                const strAddress = addressParts.join(", ");

                return strAddress;
            });

            setArrAddress(addresses);
        }
    };

    const geocode = async () => {
        try {
            const geocodedLocation = await Location.geocodeAsync(searchBounceString);
            if (geocodedLocation.length > 0) {
                setIsNotFound(false);
                const location = geocodedLocation[0];
                setChooseLocation(location);

                // Reverse geocode to get address name
                const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
                    latitude: location.latitude,
                    longitude: location.longitude,
                });

                if (reverseGeocodedAddress.length > 0) {
                    const addresses = reverseGeocodedAddress.map((item) => {
                        const addressParts = [];

                        if (item.formattedAddress) {
                            addressParts.push(item.formattedAddress);
                        }

                        // Join the parts with a comma and space
                        const strAddress = addressParts.join(", ");

                        return strAddress;
                    });

                    setArrAddress(addresses);
                }
            } else {
                setIsNotFound(true);
            }
        } catch (error) {
            setIsNotFound(true);
        }
    }

    const getCurrentPosition = async () => {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setUserLocation(currentLocation.coords);
    };

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const handleChooseLocation = async () => {
        setLocation(chooseLocation);
        setShopAddress(arrAddress[0]);
        setSnackbarMessage("Chọn thành công");
        setSnackbarVisible(true);
        await delay(500);
        setOpen(false);
        setSnackbarVisible(false);
    }

    useEffect(() => {
        setChooseLocation(location);
        setArrAddress([])
        setSearchString("")
    }, [isOpen])

    useEffect(() => {
        const fetchItems = async () => {
            if (searchBounceString !== "") {
                await geocode();
            }
        };
        fetchItems();
    }, [searchBounceString])

    //Fetch current position
    useFocusEffect(
        useCallback(() => {
            getCurrentPosition();
        }, [])
    );

    useEffect(() => {
        let locationSubscription;

        const startWatchingLocation = async () => {
            // Theo dõi vị trí thời gian thực
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000, // Lấy vị trí mỗi 1 giây
                    distanceInterval: 0.5, // Lấy vị trí khi di chuyển tối thiểu 5m
                },
                (location) => {
                    setUserLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }
            );
        };

        startWatchingLocation();

        // Hủy theo dõi khi component unmount
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    return (
        <Modal
            visible={isOpen}
        >
            {/* Close icon and search bar */}
            <View style={{
                flex: 1,
                position: "relative",
                height: ScreenHeight,
                width: ScreenWidth
            }}>
                {/* Close icon */}
                <View style={{
                    position: "absolute",
                    top: 5,
                    left: 5,
                    zIndex: 1
                }}>
                    <IconButton
                        icon={"close"}
                        iconColor='grey'
                        size={ScreenWidth / 12}
                        onPress={() => {
                            setOpen(false)
                        }}
                    />
                </View>

                {/* Search bar */}
                <View
                    style={{
                        flexDirection: "row",
                        backgroundColor: "#E9ECEE",
                        alignItems: "center",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        columnGap: 12,
                        borderRadius: 6,
                        height: ScreenWidth / 9,
                        width: ScreenWidth / 1.45,
                        position: "absolute",
                        top: 15,
                        left: ScreenWidth / 5,
                        zIndex: 1,
                        borderColor: "rgba(0,0,0,0.5)",
                        borderWidth: 0.5
                    }}
                >
                    <Icon type="font-awesome" name="search" size={23} color={"grey"} />
                    <TextInput
                        style={{
                            fontSize: ScreenWidth / 23,
                            width: ScreenWidth / 2,
                        }}
                        placeholder={"Tìm địa chỉ..."}
                        value={searchString}
                        onChangeText={(query) => {
                            setSearchString(query);
                        }}
                    />
                </View>

                <MapView
                    style={{
                        height: ScreenHeight / 1.37,
                        width: ScreenWidth
                    }}
                    styleURL="mapbox://styles/mapbox/streets-v12"
                    onPress={handleMapPress}
                    attributionEnabled={false} //Ẩn info icon
                    logoEnabled={false} //Ẩn logo
                >
                    <Camera
                        centerCoordinate={[chooseLocation?.longitude || 106.69592033355514, chooseLocation?.latitude || 10.782684066469386]}
                        zoomLevel={17}
                        pitch={10}
                        heading={0}
                        allowUpdates={true}
                    />

                    <PointAnnotation
                        id="marker"
                        coordinate={[chooseLocation?.longitude || 106.69592033355514, chooseLocation?.latitude || 10.782684066469386]}
                    />

                    <PointAnnotation
                        id="user-position"
                        coordinate={[userLocation?.longitude || 106.69592033355514, userLocation?.latitude || 10.782684066469386]}
                        ref={pointAnnotationRef} // Gắn ref vào PointAnnotation
                    >
                        <Image
                            source={userLocationAva} // Đường dẫn tới file ảnh
                            style={{
                                width: 35,
                                height: 35,
                                borderRadius: 30,
                                borderWidth: 0.5,
                                borderColor: "rgba(0,0,0,0.5)"
                            }}
                            onLoad={async () => {
                                if (pointAnnotationRef.current) {
                                    await delay(500);
                                    pointAnnotationRef.current.refresh(); // Nếu thư viện hỗ trợ, gọi refresh() tại đây
                                }
                            }}
                        />
                    </PointAnnotation>
                </MapView>

                <View style={{
                    height: ScreenHeight / 4,
                    width: ScreenWidth,
                    backgroundColor: "white",
                    paddingHorizontal: 15,
                    paddingTop: 15,
                    justifyContent: "space-between"
                }}>
                    <View style={{
                        gap: 10
                    }}>
                        <Text style={{
                            fontSize: ScreenWidth / 22,
                            fontWeight: "500"
                        }}>
                            Địa chỉ hiện tại:
                            <Text style={{
                                fontWeight: "normal"
                            }}>
                                {'\u00A0'}{address}
                            </Text>
                        </Text>
                        <Text style={{
                            fontSize: ScreenWidth / 22,
                            fontWeight: "500"
                        }}>
                            Địa chỉ mới:
                            {
                                isNotFound ?
                                    <Text style={{
                                        fontWeight: "normal",
                                        color: "red"
                                    }}>
                                        {'\u00A0'}Không tìm thấy địa chỉ này
                                    </Text>
                                    :
                                    arrAddress.length != 0 ?
                                        <Text style={{
                                            fontWeight: "normal"
                                        }}>
                                            {'\u00A0'}{arrAddress[0]}
                                        </Text> :
                                        <Text style={{
                                            fontWeight: "normal",
                                            color: "rgba(0,0,0,0.5)"
                                        }}>
                                            {'\u00A0'}Chưa chọn
                                        </Text>
                            }
                        </Text>
                    </View>

                    <Pressable style={{
                        height: ScreenHeight / 20,
                        width: ScreenWidth / 2,
                        backgroundColor: arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? "#cccccc" : "#ed8900",
                        bottom: 0,
                        alignItems: "center",
                        alignSelf: "center",
                        justifyContent: "center",
                        borderRadius: 30,
                        borderWidth: 1,
                        borderColor: arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? "#999999" : "#ed8900",
                    }}
                        onPress={() => {
                            handleChooseLocation()
                        }}
                        disabled={arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? true : false}
                    >
                        <Text style={{
                            color: arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? "#999999" : "white"
                        }}>
                            Chọn địa chỉ này
                        </Text>
                    </Pressable>
                </View>

                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={1500}
                    wrapperStyle={{ bottom: 0, zIndex: 1 }}
                >
                    {snackbarMessage}
                </Snackbar>
            </View>
        </Modal>
    )
}