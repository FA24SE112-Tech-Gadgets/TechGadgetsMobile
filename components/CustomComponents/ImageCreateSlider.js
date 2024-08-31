import {
    StyleSheet,
    Text,
    View,
    Image,
    FlatList,
} from "react-native";
import React from "react";
import { Icon, ScreenWidth, ScreenHeight } from "@rneui/base";
import { IconButton } from "react-native-paper";

export default function ImageCreateSlider({ list, handleRemoveImage }) {

    const renderDots = (list, index) => {
        const dots = [];
        for (let i = 0; i < list.length; i++) {
            if (i == index) {
                dots.push(
                    <Icon
                        type="octicon"
                        key={i}
                        name="dot-fill"
                        size={20}
                        color={"#FB6562"}
                    />
                );
            } else {
                dots.push(
                    <Icon
                        type="octicon"
                        key={i}
                        name="dot-fill"
                        size={20}
                        color={"#D2CFCF"}
                    />
                );
            }
        }
        return dots;
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={list}
                pagingEnabled={true}
                horizontal
                overScrollMode="never"
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View key={index}>
                        <Image
                            style={{ width: ScreenWidth, height: ScreenHeight / 3 }}
                            source={{ uri: item.imageUrl }}
                            alt={item.caption}
                        />
                        <View style={styles.overlay}>
                            {list.length > 1 && (
                                <Text style={styles.overlayText}>
                                    {index + 1}/{list.length}
                                </Text>
                            )}
                        </View>
                        <View style={styles.dotContainerWrapper}>
                            {list.length > 1 && (
                                <View style={styles.dotContainer}>
                                    {renderDots(list, index)}
                                </View>
                            )}
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                position: "absolute",
                                top: 0,
                                left: 0,
                            }}
                        >
                            <IconButton
                                icon={"close"}
                                iconColor='grey'
                                size={ScreenWidth / 12}
                                onPress={() => {
                                    handleRemoveImage(item, item.base64);
                                }}
                            />
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    dotContainerWrapper: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
    },
    dotContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        columnGap: 8,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 30,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    overlay: {
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: 5,
        borderRadius: 5,
    },
    overlayText: {
        color: "white",
        fontSize: 14,
    },
});
