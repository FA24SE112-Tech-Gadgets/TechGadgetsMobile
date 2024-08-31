import React, { useEffect, useRef, useState } from 'react'
import { Animated, View } from 'react-native';
import SubscriptionComponent from './SubscriptionComponent';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import Modal from "react-native-modal";
import { useTranslation } from 'react-i18next';
import api from '../Authorization/api';
import ErrModal from './ErrModal';

const _spacing = 20;
const ITEM_SIZE = ScreenWidth / 2 + _spacing * 2

export default function RenderSubscription({ openSubscription, setOpenSubscription }) {
    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);
    const [isDisable, setDisable] = useState(false);
    const { t } = useTranslation();
    const silverPack = {
        name: "SILVER",
        price: "99.000đ",
        actualPrice: "129.000đ",
        arrContent: [t("silverContent1")],
    };

    const goldPack = {
        name: "GOLD",
        price: "149.000đ",
        actualPrice: "179.000đ",
        arrContent: [t("goldContent1")],
    };

    const diamondPack = {
        name: "DIAMOND",
        price: "299.000đ",
        actualPrice: "329.000đ",
        arrContent: [t("diamondContent1")],
    };

    const data = [
        {
            packageNumber: 0,
            pack: silverPack
        },
        {
            packageNumber: 1,
            pack: goldPack
        },
        {
            packageNumber: 2,
            pack: diamondPack
        },
    ]

    const scrollX = useRef(new Animated.Value(0)).current;

    async function createPaymentLink(type, accountRole) {
        try {
            const res = await api.post(accountRole === "user" ? `/subscriptions/users` : `/subscriptions/restaurants`,
                {
                    type: type
                }
            )
            return res.data;
        } catch (error) {
            setIsError(true);
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    t("network-error")
            );
        }
    }

    useEffect(() => {
        if (isDisable) {
            setOpenSubscription(false);
            setDisable(false);
        }
    }, [isDisable])

    return (
        <>
            <Modal
                isVisible={openSubscription && !isError}
                onBackdropPress={() => setOpenSubscription(false)}
                propagateSwipe={true}
            >
                <View style={{
                    flexGrow: 0,
                    width: ScreenWidth,
                    height: ScreenHeight / 1.5,
                    paddingRight: _spacing
                }}>
                    <Animated.FlatList
                        overScrollMode={"never"}
                        snapToInterval={ITEM_SIZE}
                        decelerationRate={"fast"}
                        data={data}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        keyExtractor={(item) => item.packageNumber}
                        contentContainerStyle={{ justifyContent: "center", alignItems: 'center', padding: _spacing }}
                        showsHorizontalScrollIndicator={false}
                        horizontal
                        removeClippedSubviews={true}
                        renderItem={({ item, index }) => {
                            const inputRange = [
                                (index - 1) * ITEM_SIZE,
                                (index - 0.1) * ITEM_SIZE,
                                (index + 1) * ITEM_SIZE
                            ];

                            const scale = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.8, 1, 0.8],
                            });

                            return (
                                <Animated.View
                                    style={{
                                        width: ScreenWidth / 1.5,
                                        height: ScreenHeight / 1.5,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transform: [{ scale }]
                                    }}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <SubscriptionComponent
                                        packageNumber={item.packageNumber}
                                        pack={item.pack}
                                        createPaymentLink={createPaymentLink}
                                        setIsError={setIsError}
                                        setStringErr={setStringErr}
                                        isDisable={isDisable}
                                        setDisable={setDisable}
                                        role={"restaurant"}
                                        setOpenSubscription={setOpenSubscription}
                                    />
                                </Animated.View>
                            )
                        }}
                    />
                </View>
            </Modal>
            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </>
    )
}
