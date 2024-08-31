import React, { useState, useEffect } from 'react';
import { Animated, Easing, Image, View } from 'react-native';
import food1 from '../../assets/food1.jpg';
import food2 from '../../assets/food2.jpg';
import food3 from '../../assets/food3.jpg';
import food4 from '../../assets/food4.jpg';
import food5 from '../../assets/food5.jpg';
import food6 from '../../assets/food6.jpg';
import food7 from '../../assets/food7.jpg';
import food8 from '../../assets/food8.jpg';
import food9 from '../../assets/food9.jpg';
import food10 from '../../assets/food10.jpg';
import { Dimensions } from 'react-native';

export default function SpinnerImage({ setOpen, randomFood, navigation }) {
    const screenHeight = Dimensions.get("window").height;
    const screenWidth = Dimensions.get("window").width;
    function getRandomSubarray(arr, size) {
        // Shuffle the array
        const shuffled = arr.slice().sort(() => 0.5 - Math.random());
        // Return a subset of the array
        return shuffled.slice(0, size);
    }

    const arrData = getRandomSubarray([
        food1,
        food2,
        food3,
        food4,
        food5,
        food6,
        food7,
        food8,
        food9,
        food10,
    ], 7);

    const [imgIndex, setImgIndex] = useState(0);
    const [rotateValue] = useState(new Animated.Value(0));
    const [spinSpeed, setSpeed] = useState(700);
    const [imageWidth, setImgWidth] = useState(screenWidth / 1.8);
    const [imageHeight, setImgHeight] = useState(screenHeight / 2);

    useEffect(() => {
        startRotate();
    }, [spinSpeed]);

    useEffect(() => {
        if (imgIndex < arrData.length - 1) {
            setTimeout(() => {
                setImgIndex((prevIndex) => (prevIndex + 1) % arrData.length);
            }, spinSpeed / 2);
        } else if (imgIndex === arrData.length - 1) {
            setImgIndex((prevIndex) => prevIndex + 1);
        } else {
            stopRotate();
            setSpeed(spinSpeed / 2);
            setTimeout(() => {
                stopRotate();
                setSpeed(spinSpeed);
            }, spinSpeed);
            setTimeout(() => {
                stopRotate();
                setSpeed(spinSpeed * 1.2);
            }, spinSpeed * 1.2);
            setTimeout(() => {
                stopRotate();
                setImgWidth(screenWidth / 1.3);
                setImgHeight(screenHeight / 1.5);
            }, spinSpeed * 1.5);
            setTimeout(() => {
                setOpen(false)
                navigation.navigate('CustomerAfterRandom', { foodData: randomFood })
            }, spinSpeed * 1.5 + 500);
            // setTimeout(() => {
            //     setImgWidth(screenWidth / 1.3);
            //     setImgHeight(screenHeight / 1.5);
            // }, spinSpeed);
            // setTimeout(() => {
            //     setOpen(false)
            //     navigation.navigate('CustomerAfterRandom', { foodData: randomFood })
            // }, spinSpeed + 500);
        }
    }, [imgIndex]);

    const startRotate = () => {
        Animated.loop(
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: spinSpeed,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    const stopRotate = () => {
        rotateValue.resetAnimation();
        rotateValue.stopAnimation();
    };

    const spin = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],

    });

    return (
        <Animated.View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ rotateY: spin }],
            }}
        >
            <View
                style={{
                    height: imageHeight,
                    width: imageWidth,
                    backgroundColor: "white",
                    borderRadius: 20,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <View style={{
                    height: imageHeight,
                    width: imageWidth,
                    borderRadius: 20,
                    position: "relative"
                }}>

                    {
                        imgIndex < arrData.length - 1 &&
                        <Image
                            style={{
                                resizeMode: "cover",
                                height: imageHeight,
                                width: imageWidth,
                                borderRadius: 20,
                                zIndex: 1
                            }}
                            source={arrData[imgIndex]}
                        />
                    }
                    <Image
                        style={{
                            resizeMode: "cover",
                            height: imageHeight,
                            width: imageWidth,
                            borderRadius: 20,
                            zIndex: 0,
                            position: "absolute",
                            top: 0
                        }}
                        source={{ uri: randomFood?.image }}
                    />
                </View>
            </View>
        </Animated.View>
    )
}
