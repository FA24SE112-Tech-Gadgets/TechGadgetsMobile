import { Animated, Dimensions, Text, View } from 'react-native';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { G, Path, Svg, TSpan, Text as TextSVG } from 'react-native-svg';
import randomColor from 'randomcolor';
import * as d3Shape from 'd3-shape';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { snap } from '@popmotion/popcorn';

const { width } = Dimensions.get('screen');

const numberOfSegments = 10;
const wheelSize = width * 0.9;
const fontSize = 26;
const oneTurn = 360;
const angleBySegment = oneTurn / numberOfSegments;
const angleOffset = angleBySegment / 2;
const knobFill = randomColor({ hue: 'purple' });

const makeWheel = () => {
    const data = Array.from({ length: numberOfSegments }).fill(1);
    const arcs = d3Shape.pie()(data);
    const colors = randomColor({
        luminosity: 'dark',
        count: numberOfSegments,
    });

    return arcs.map((arc, index) => {
        const instance = d3Shape
            .arc()
            .padAngle(0.01)
            .outerRadius(width / 2)
            .innerRadius(20);

        return {
            path: instance(arc),
            color: colors[index],
            value: Math.round(Math.random() * 10 + 1) * 200, // [200, 2200]
            value: "a", // [200, 2200]
            centroid: instance.centroid(arc),
        };
    });
};

const SpinnerWheel = () => {
    const _wheelPaths = useMemo(() => makeWheel(), []);
    const _angle = useRef(new Animated.Value(0)).current;
    const angle = useRef(0);

    const [enabled, setEnabled] = useState(true);
    const [finished, setFinished] = useState(false);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        _angle.addListener((event) => {
            if (enabled && !finished) {
                setEnabled(false);
                setFinished(false);
            }
            angle.current = event.value;
        });
        return () => {
            _angle.removeAllListeners();
        };
    }, [enabled, finished]);

    const _getWinnerIndex = () => {
        const deg = Math.abs(Math.round(angle.current % oneTurn));
        return Math.floor(deg / angleBySegment);
    };

    const _onPan = ({ nativeEvent }) => {
        if (nativeEvent.state === State.END) {
            const { velocityY } = nativeEvent;

            Animated.decay(_angle, {
                velocity: velocityY / 1000,
                deceleration: 0.999,
                useNativeDriver: true,
            }).start(() => {
                _angle.setValue(angle.current % oneTurn);
                const snapTo = snap(oneTurn / numberOfSegments);
                Animated.timing(_angle, {
                    toValue: snapTo(angle.current),
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    const winnerIndex = _getWinnerIndex();
                    setEnabled(true);
                    setFinished(true);
                    setWinner(_wheelPaths[winnerIndex].value);
                });
            });
        }
    };

    const _renderKnob = () => {
        const knobSize = 40;
        //[0, numberOfSegments]
        // 2.37 % 1 = 0.37
        const YOLO = Animated.modulo(
            Animated.divide(
                Animated.modulo(Animated.subtract(_angle, angleOffset), oneTurn),
                new Animated.Value(angleBySegment)
            ),
            1
        );

        return (
            <Animated.View
                style={{
                    width: knobSize,
                    height: knobSize,
                    justifyContent: 'flex-end',
                    zIndex: 1,
                    transform: [
                        {
                            rotate: YOLO.interpolate({
                                inputRange: [-1, -0.45, -0.0001, 0.0001, 0.45, 1],
                                outputRange: ['0deg', '0deg', '35deg', '-35deg', '0deg', '0deg'],
                            }),
                        },
                    ],
                }}
            >
                <Svg
                    width={knobSize}
                    height={knobSize}
                    viewBox="0 0 20 20"
                    style={{
                        transform: [
                            {
                                translateY: 8,
                            },
                        ],
                    }}
                >
                    <Path
                        fill={knobFill}
                        d="M10.292,4.229c-1.487,0-2.691,1.205-2.691,2.691s1.205,2.691,2.691,2.691s2.69-1.205,2.69-2.691
								S11.779,4.229,10.292,4.229z M10.292,8.535c-0.892,0-1.615-0.723-1.615-1.615S9.4,5.306,10.292,5.306
								c0.891,0,1.614,0.722,1.614,1.614S11.184,8.535,10.292,8.535z M10.292,1C6.725,1,3.834,3.892,3.834,7.458
								c0,3.567,6.458,10.764,6.458,10.764s6.458-7.196,6.458-10.764C16.75,3.892,13.859,1,10.292,1z M4.91,7.525
								c0-3.009,2.41-5.449,5.382-5.449c2.971,0,5.381,2.44,5.381,5.449s-5.381,9.082-5.381,9.082S4.91,10.535,4.91,7.525z"
                    />
                </Svg>
            </Animated.View>
        );
    };

    const _renderWinner = () => {
        return (
            <Text
                style={{
                    fontSize: 32,
                    color: 'black',
                }}
            >
                Winner is: {winner}
            </Text>
        );
    };

    const _renderSvgWheel = () => {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {_renderKnob()}
                <Animated.View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [
                            {
                                rotate: _angle.interpolate({
                                    inputRange: [-oneTurn, 0, oneTurn],
                                    outputRange: [`-${oneTurn}deg`, `0deg`, `${oneTurn}deg`],
                                }),
                            },
                        ],
                    }}
                >
                    <Svg
                        width={wheelSize}
                        height={wheelSize}
                        viewBox={`0 0 ${width} ${width}`}
                        style={{
                            transform: [{ rotate: `-${angleOffset}deg` }],
                        }}
                    >
                        <G x={width / 2} y={width / 2}>
                            {_wheelPaths.map((arc, i) => {
                                const [x, y] = arc.centroid;
                                const number = arc.value.toString();

                                return (
                                    <G key={`arc-${i}`}>
                                        <Path d={arc.path} fill={arc.color} />
                                        <G
                                            rotation={(i * oneTurn) / numberOfSegments + angleOffset}
                                            origin={`${x}, ${y}`}
                                        >
                                            <TextSVG
                                                x={x}
                                                y={y - 70}
                                                fill="white"
                                                textAnchor="middle"
                                                fontSize={fontSize}
                                            >
                                                {Array.from({ length: number.length }).map((_, j) => {
                                                    return (
                                                        <TSpan key={`arc-${i}-slice-${j}`} x={x} dy={fontSize}>
                                                            {number.charAt(j)}
                                                        </TSpan>
                                                    );
                                                })}
                                            </TextSVG>
                                        </G>
                                    </G>
                                );
                            })}
                        </G>
                    </Svg>
                </Animated.View>
            </View>
        );
    };


    return (
        <PanGestureHandler onHandlerStateChange={_onPan} enabled={enabled}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {_renderSvgWheel()}
                {enabled && finished && _renderWinner()}
            </View>
        </PanGestureHandler >
    );
};

export default SpinnerWheel;
