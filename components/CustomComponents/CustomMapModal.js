import { View } from 'react-native'
import React from 'react'
import Modal from 'react-native-modal'
import { ScreenHeight, ScreenWidth } from '@rneui/base'
import { IconButton } from 'react-native-paper';
import Mapbox, { MapView, Camera, PointAnnotation, Logger } from "@rnmapbox/maps";
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

export default function CustomMapModal({ isOpen, setOpen, location }) {
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
            </View>
        </Modal>
    )
}