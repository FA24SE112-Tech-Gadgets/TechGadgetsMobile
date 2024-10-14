import { View, Text } from 'react-native'
import React from 'react'
import ProductDetails from './Detail/ProductDetail'

export default function FavouriteGagdets() {
    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <Text>FavouriteGagdets</Text>
            <ProductDetails/>
        </View>
    )
}