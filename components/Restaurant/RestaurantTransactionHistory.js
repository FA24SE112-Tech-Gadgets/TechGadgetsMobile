import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import { LookUpTransaction } from './LookUpTransaction';
import RestaurantReport from './RestaurantReport';
import RequestDish from './RequestDish';
import { useTranslation } from 'react-i18next';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import ErrModal from '../CustomComponents/ErrModal';

export default function RestaurantTransactionHistory() {
    const { t } = useTranslation();
    const [isChoosed, setChoosed] = useState(0);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    return (
        <View style={{
            flex: 1,
            backgroundColor: "white"
        }}>
            <View style={{
                height: ScreenHeight / 1.09,
                paddingBottom: ScreenHeight / 40,
            }}>
                {/* Choose function */}
                <View style={{
                    alignItems: "center"
                }}>
                    <View style={{
                        flexDirection: "row",
                        backgroundColor: "#D9D9D9",
                        justifyContent: "space-between",
                        marginTop: ScreenHeight / 30,
                        height: ScreenHeight / 20,
                        width: ScreenWidth / 1.1,
                        alignItems: "center",
                        borderRadius: 30,
                    }}>
                        {/* Tra cứu GD */}
                        <Pressable style={{
                            justifyContent: "center",
                            backgroundColor: isChoosed === 0 ? "#FB6562" : null,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            height: ScreenHeight / 20,
                            width: (ScreenWidth / 1.1) / 3,
                            borderRadius: 30,
                            borderWidth: isChoosed === 0 ? 1 : 0,
                            borderColor: "white",
                            alignItems: "center"
                        }}
                            onPress={() => setChoosed(0)}
                        >
                            <Text style={{
                                color: isChoosed === 0 ? "white" : "black"
                            }}
                            >{t("find-trans")}</Text>
                        </Pressable>

                        {/* Thống kê */}
                        <Pressable style={{
                            justifyContent: "center",
                            backgroundColor: isChoosed === 1 ? "#FB6562" : null,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            height: ScreenHeight / 20,
                            width: (ScreenWidth / 1.1) / 3,
                            borderRadius: 30,
                            borderWidth: isChoosed === 1 ? 1 : 0,
                            borderColor: "white",
                            alignItems: "center"
                        }}
                            onPress={() => {
                                // setChoosed(1);
                                // TODO: Sẽ mở sau khi đã làm xong
                                setIsError(true);
                                setStringErr(
                                    t("lock-feature")
                                );
                            }}
                        >
                            <Text style={{
                                color: isChoosed === 1 ? "white" : "black"
                            }}
                            >{t("statistical")}</Text>
                        </Pressable>

                        {/* Yêu cầu món */}
                        <Pressable style={{
                            justifyContent: "center",
                            backgroundColor: isChoosed === 2 ? "#FB6562" : null,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            height: ScreenHeight / 20,
                            width: (ScreenWidth / 1.1) / 3,
                            borderRadius: 30,
                            borderWidth: isChoosed === 2 ? 1 : 0,
                            borderColor: "white",
                            alignItems: "center"
                        }}
                            onPress={() => {
                                // setChoosed(2);
                                // TODO: Sẽ mở sau khi đã làm xong
                                setIsError(true);
                                setStringErr(
                                    t("lock-feature")
                                );
                            }}
                        >
                            <Text style={{
                                color: isChoosed === 2 ? "white" : "black"
                            }}
                            >{t("dish-request")}</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Tra cứu GD */}
                {
                    isChoosed === 0 &&
                    <LookUpTransaction />
                }

                {/* Thống kê */}
                {
                    isChoosed === 1 &&
                    <RestaurantReport />
                }

                {/* Yêu cầu món */}
                {
                    isChoosed === 2 &&
                    <RequestDish />
                }
            </View>
            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </View>
    )
}
