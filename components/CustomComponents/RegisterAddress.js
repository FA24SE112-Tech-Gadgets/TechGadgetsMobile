import { View, Text, Pressable, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Icon, ScreenHeight, ScreenWidth } from '@rneui/base'
import { IconButton, Snackbar } from 'react-native-paper';
import { TextInput } from 'react-native';
import * as Location from "expo-location"
import { useDebounce } from 'use-debounce';
import Mapbox, { MapView, Camera, PointAnnotation, Logger } from "@rnmapbox/maps";
import { useTranslation } from 'react-i18next';
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

export default function RegisterAddress({ isOpen, setOpen, location, setLocation, address, handleChangeData }) {
    const [searchString, setSearchString] = useState("");
    const [searchBounceString] = useDebounce(searchString, 1000);
    const [isNotFound, setIsNotFound] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const { t } = useTranslation();

    const [arrAddress, setArrAddress] = useState([]);

    const [chooseLocation, setChooseLocation] = useState([]);

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

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const handleChooseLocation = async () => {
        setLocation(chooseLocation);
        handleChangeData("address", arrAddress[0]);
        setSnackbarMessage(t("choose-address-success"));
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
                        width: ScreenWidth / 1.7,
                        position: "absolute",
                        top: 15,
                        left: ScreenWidth / 5,
                        zIndex: 1
                    }}
                >
                    <Icon type="font-awesome" name="search" size={23} color={"grey"} />
                    <TextInput
                        style={{
                            fontSize: ScreenWidth / 23,
                            width: ScreenWidth / 2.3,
                        }}
                        placeholder={t("search-address")}
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
                </MapView>
                <View style={{
                    height: ScreenHeight / 4,
                    width: ScreenWidth,
                    backgroundColor: "white",
                    padding: 10,
                    justifyContent: "space-between"
                }}>
                    <View style={{
                        gap: 10
                    }}>
                        <Text style={{
                            fontSize: ScreenWidth / 22,
                            fontWeight: "500"
                        }}>
                            {t('current-location')}
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
                            {t('new-location')}
                            {
                                isNotFound ?
                                    <Text style={{
                                        fontWeight: "normal",
                                        color: "red"
                                    }}>
                                        {'\u00A0'}{t('location-not-found')}
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
                                            color: "red"
                                        }}>
                                            {'\u00A0'}{t('not-choose')}
                                        </Text>
                            }
                        </Text>
                    </View>
                    <View style={{
                        width: ScreenWidth,
                        alignItems: "center"
                    }}>
                        <Pressable style={{
                            height: ScreenHeight / 20,
                            width: ScreenWidth / 2,
                            backgroundColor: arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? "#cccccc" : "#FB6562",
                            bottom: 10,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 30,
                            borderWidth: 1,
                            borderColor: arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? "#999999" : "#FB6562",
                        }}
                            onPress={() => {
                                handleChooseLocation()
                            }}
                            disabled={arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? true : false}
                        >
                            <Text style={{
                                color: arrAddress.length === 0 || address === arrAddress[0] || isNotFound ? "#999999" : "white"
                            }}>
                                {t('choose-location-btn')}
                            </Text>
                        </Pressable>
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
            </View>
        </Modal>
    )
}