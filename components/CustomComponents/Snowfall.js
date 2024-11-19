import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions, Image } from 'react-native';
import christmasTree from "../../assets/christmasTree.png"
import christmasLeaf from "../../assets/christmasLeaf.png"
import { ScreenWidth, ScreenHeight } from '@rneui/base';

const SNOWFLAKE_COUNT = 30;

const Snowfall = ({ children, style }) => {
    const snowflakes = useRef(
        Array.from({ length: SNOWFLAKE_COUNT }, () => ({
            animation: new Animated.Value(0),
            leftPosition: Math.random() * ScreenWidth, // Absolute position based on screen width
            size: Math.random() * 10 + 5,
            delay: Math.random() * 3000,
            duration: Math.random() * 3000 + 3000,
        }))
    ).current;

    useEffect(() => {
        const startSnowfall = (snowflake) => {
            snowflake.animation.setValue(0);

            Animated.timing(snowflake.animation, {
                toValue: ScreenHeight, // Move from 0 to the full height of the screen
                duration: snowflake.duration,
                delay: snowflake.delay,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => startSnowfall(snowflake));
        };

        snowflakes.forEach((snowflake) => startSnowfall(snowflake));
    }, []);

    return (
        <View style={[styles.container, style]}>
            {/* Cái lá trên cùng*/}
            <View style={styles.leafContainer}>
                <Image
                    source={christmasLeaf} // Thay link bằng link ảnh cây thông
                    style={styles.leafTop}
                />
            </View>

            {/* Cây thông bên trái */}
            <View style={styles.treeContainer}>
                <Image
                    source={christmasTree} // Thay link bằng link ảnh cây thông
                    style={styles.treeLeft}
                />
            </View>

            {/* Cây thông bên phải */}
            <View style={styles.treeContainer}>
                <Image
                    source={christmasTree} // Thay link bằng link ảnh cây thông
                    style={styles.treeRight}
                />
            </View>

            {children}
            {snowflakes.map((snowflake, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.snowflake,
                        {
                            width: snowflake.size,
                            height: snowflake.size,
                            borderRadius: snowflake.size / 2,
                            backgroundColor: '#FFFFFF',
                            opacity: 0.8,
                            transform: [
                                {
                                    translateY: snowflake.animation.interpolate({
                                        inputRange: [0, ScreenHeight],
                                        outputRange: [-10, ScreenHeight + 10], // Start above and end below the container
                                    }),
                                },
                                { translateX: snowflake.leftPosition }, // Absolute X position
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    leafContainer: {
        position: 'absolute',
        top: 0, // Điều chỉnh vị trí đứng của cây thông
        zIndex: 1,
    },
    leafTop: {
        height: ScreenHeight * 0.25,
        width: ScreenWidth,
        position: 'absolute',
        top: -130,
        left: 0,
        opacity: 0.8
    },
    treeContainer: {
        position: 'absolute',
        top: ScreenHeight * 0.115, // Điều chỉnh vị trí đứng của cây thông
        zIndex: 1,
    },
    treeLeft: {
        height: 100,
        width: 80,
        position: 'absolute',
        left: 0,
        top: 50,
        resizeMode: 'contain',
        opacity: 0.8
    },
    treeRight: {
        height: 120,
        width: 90,
        position: 'absolute',
        left: ScreenWidth / 1.2,
        top: 40,
        resizeMode: 'contain',
        opacity: 0.8
    },
    snowflake: {
        position: 'absolute',
        top: -20,
    },
});

export default Snowfall;
