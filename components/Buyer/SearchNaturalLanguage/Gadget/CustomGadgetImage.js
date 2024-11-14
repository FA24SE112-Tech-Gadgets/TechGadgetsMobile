import { ScreenHeight, ScreenWidth } from '@rneui/base';
import React, { useState, useEffect } from 'react';
import { Image } from 'react-native';

const CustomGadgetImage = ({ imageUrl }) => {
    const [imageSize, setImageSize] = useState({ width: 100, height: 100 });

    useEffect(() => {
        Image.getSize(
            imageUrl,
            (width, height) => {
                // Tính toán để xác định hình ảnh là dọc hay ngang
                if (width > height) {
                    // Hình ngang
                    setImageSize({ width: ScreenWidth / 3, height: ScreenHeight / 9.5 });
                } else {
                    // Hình dọc
                    setImageSize({ width: ScreenWidth / 4, height: ScreenHeight / 8 });
                }
            },
            (error) => {
                console.error('Error getting image size:', error);
            }
        );
    }, [imageUrl]);

    return (
        <Image
            source={{ uri: imageUrl }}
            style={{
                width: imageSize.width,
                height: imageSize.height,
                resizeMode: 'cover', // Điều chỉnh cách hiển thị hình ảnh
            }}
        />
    );
};

export default CustomGadgetImage;