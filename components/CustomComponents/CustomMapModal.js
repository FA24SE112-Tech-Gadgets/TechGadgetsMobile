import { Image, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-native-modal'
import { ScreenHeight, ScreenWidth } from '@rneui/base'
import { IconButton } from 'react-native-paper';
import Mapbox, { MapView, Camera, PointAnnotation, Logger, ShapeSource, LineLayer } from "@rnmapbox/maps";
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
import useAuth from '../../utils/useAuth';
import axios from 'axios';
const accessToken = "sk.eyJ1IjoidGVjaGdhZGdldHMiLCJhIjoiY20wbTgzeWNyMDY5ZDJrczllYXFlNGcwayJ9.4ukbF2sMxF2Qmu0_JnlvCw"

export default function CustomMapModal({ isOpen, setOpen, location, userLocation }) {
    const pointAnnotationRef = useRef(null); // Tham chiếu đến PointAnnotation
    const { user } = useAuth();

    const [route, setRoute] = useState(null);

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    useEffect(() => {
        if (userLocation && location) {
            fetchRoute();
        }
    }, [userLocation, location]);

    const fetchRoute = async () => {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${location.longitude},${location.latitude}?geometries=geojson&access_token=${accessToken}`;

        try {
            const response = await axios.get(url);
            const data = response.data;

            if (data.routes && data.routes.length > 0) {
                setRoute(data.routes[0].geometry); // Lấy tuyến đường đầu tiên
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    return (
        <Modal
            isVisible={isOpen}
            style={{
                margin: 0
            }}
        >
            <View style={{
                position: "relative",
                height: ScreenHeight,
                width: ScreenWidth
            }}>
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

                <MapView
                    style={{
                        height: ScreenHeight,
                        width: ScreenWidth,
                        marginVertical: 7,
                    }}
                    styleURL="mapbox://styles/mapbox/streets-v12"
                    zoomEnabled={true}
                    attributionEnabled={false} //Ẩn info icon
                    logoEnabled={false} //Ẩn logo
                    rotateEnabled={true}
                    scrollEnabled={true}
                >
                    {/* Route, Hiển thị tuyến đường */}
                    {route && (
                        <ShapeSource id="routeSource" shape={route}>
                            <LineLayer
                                id="routeLine"
                                style={{
                                    lineColor: "#ed8900",
                                    lineWidth: 2.5,
                                    lineOpacity: 0.7,
                                }}
                            />
                        </ShapeSource>
                    )}

                    <Camera
                        centerCoordinate={[location?.longitude || 106.69592033355514, location?.latitude || 10.782684066469386]}
                        zoomLevel={15}
                        pitch={10}
                        heading={0}
                    />

                    <PointAnnotation
                        id="user-position"
                        coordinate={[userLocation?.longitude || 106.69592033355514, userLocation?.latitude || 10.782684066469386]}
                        ref={pointAnnotationRef} // Gắn ref vào PointAnnotation
                    >
                        {user.customer.avatarUrl ? (
                            <Image
                                source={{
                                    uri: user.customer.avatarUrl,
                                }}
                                style={{
                                    height: 40,
                                    width: 40,
                                    backgroundColor: "black",
                                    borderRadius: 30,
                                }}
                                onLoad={async () => {
                                    if (pointAnnotationRef.current) {
                                        await delay(500);
                                        pointAnnotationRef.current.refresh();
                                    }
                                }}
                            />
                        ) : (
                            <View
                                style={{
                                    height: 40,
                                    width: 40,
                                    borderRadius: 30,
                                    backgroundColor: "#ffecd0",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Text style={{ fontSize: 18, fontWeight: "bold", color: "#ed8900" }}>
                                    {user.customer.fullName.charAt(0)}
                                </Text>
                            </View>
                        )}
                    </PointAnnotation>

                    <PointAnnotation
                        id="shopAddress"
                        coordinate={[location?.longitude || 106.69592033355514, location?.latitude || 10.782684066469386]}
                    />
                </MapView>
            </View>
        </Modal>
    )
}