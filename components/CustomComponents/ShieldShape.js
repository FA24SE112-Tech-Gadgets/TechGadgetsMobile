import React from 'react';
import { Dimensions, View } from 'react-native';
import * as d3Shape from "d3-shape"
import { Defs, Image, Path, Pattern, Svg } from 'react-native-svg';

export default ShieldShape = ({ urlImg }) => {
    const { width } = Dimensions.get('window');
    const height = width * 1.25; // Adjust height to be proportional to width

    // Define the data points for the shield shape
    const data = [
        { x: width * 0.12, y: height * 0.2 }, // Top left corner
        { x: width * 0.1, y: height * 0.8 }, // Bottom left side
        { x: width / 2, y: height }, // Bottom point
        { x: width * 0.9, y: height * 0.8 }, // Bottom right side
        { x: width * 0.9, y: height * 0.2 }, // Top right corner
        { x: width * 0.87, y: height * 0.2 }, // Top right curve
        { x: width * 0.12, y: height * 0.2 }  // Closing the path
    ];

    // Create the line generator function
    const shieldLine = d3Shape.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3Shape.curveBasisClosed);

    // Generate the SVG path data
    const pathData = shieldLine(data);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Svg
                width={width}
                height={height}
            >
                <Defs>
                    <Pattern id="image" x="0" y="0" width="100%" height="100%">
                        <Image
                            href={{ uri: urlImg }}
                            x="0"
                            y="0"
                            width={width}
                            height={height}
                            preserveAspectRatio="xMidYMid slice"
                        />
                    </Pattern>
                </Defs>
                <Path
                    d={pathData}
                    fill="url(#image)"
                    stroke="black"
                    strokeWidth={2}
                />
            </Svg>
        </View>
    );
};