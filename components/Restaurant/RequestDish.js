import { View, Text, Dimensions, Pressable, Modal, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { TextInput } from 'react-native-paper';
import FontAwesome from "react-native-vector-icons/FontAwesome"
import { FilterModal } from './LookUpTransaction';
import { ScreenHeight, ScreenWidth } from '@rneui/base';

const arrRequestData = [
    {
        date: "03/05/2024 - Thứ Sáu",
        requestArr: [
            {
                requestID: 0,
                content: "Yêu cầu cho món 012345",
                status: 0
            },
            {
                requestID: 1,
                content: "Yêu cầu cho món 543210",
                status: 1
            }
        ]
    },
    {
        date: "02/05/2024 - Thứ Năm",
        requestArr: [
            {
                requestID: 2,
                content: "Yêu cầu cho món 012345",
                status: 0
            },
            {
                requestID: 3,
                content: "Yêu cầu cho món 543210",
                status: 2
            }
        ]
    },
    {
        date: "30/04/2024 - Thứ Ba",
        requestArr: [
            {
                requestID: 4,
                content: "Yêu cầu cho món 012345",
                status: 1
            },
            {
                requestID: 5,
                content: "Yêu cầu cho món 012345",
                status: 2
            },
            {
                requestID: 6,
                content: "Yêu cầu cho món 543210",
                status: 0
            }
        ]
    },
    {
        date: "28/04/2024 - Chủ Nhật",
        requestArr: [
            {
                requestID: 7,
                content: "Yêu cầu cho món 012345",
                status: 1
            },
        ]
    },
]

export default function RequestDish() {
    const [filterChoosed, setFilterChoosed] = useState("3 Tháng Gần Nhất");
    const [isChangeFilter, setChangeFilter] = useState(false);

    const handleChangeFilter = () => {
        setChangeFilter(!isChangeFilter);
    }

    return (
        <>
            {/* Search */}
            <View style={{
                alignItems: "center",
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: ScreenHeight / 30,
                    backgroundColor: "#D9D9D9",
                    height: ScreenHeight / 20,
                    width: ScreenWidth / 1.1,
                    borderRadius: 30,
                    paddingHorizontal: ScreenWidth / 30
                }}>
                    <FontAwesome name="search" size={24} color={"black"} />
                    <TextInput
                        style={{
                            backgroundColor: "#D9D9D9",
                            height: ScreenHeight / 20,
                            width: ScreenWidth / 1.35,
                        }}
                        placeholder='Tìm kiếm'
                    //     value={newComment}
                    // onChangeText={setNewComment}
                    // onFocus={handleFocus}
                    // onBlur={handleBlur}
                    />
                </View>
            </View>

            {/* Filter */}
            <View style={{
                alignItems: "center"
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: ScreenHeight / 80,
                    height: ScreenHeight / 20,
                    width: ScreenWidth / 1.1,
                    gap: ScreenWidth / 20,
                }}>
                    <Text>Lọc theo</Text>
                    <Pressable
                        style={{
                            borderColor: "#FB6562",
                            borderWidth: 1,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 30
                        }}
                        onPress={() => handleChangeFilter()}
                    >
                        <Text>{filterChoosed}</Text>
                    </Pressable>
                </View>
            </View>

            {/* Number of request */}
            <View style={{
                alignItems: "center"
            }}>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: ScreenHeight / 100,
                    height: ScreenHeight / 20,
                    width: ScreenWidth / 1.1,
                    gap: ScreenWidth / 20,
                }}>
                    <Text>60 yêu cầu</Text>
                </View>
            </View>

            {/* Request history list */}
            <ScrollView
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
            >
                {
                    arrRequestData.map((item, index) => (
                        <View key={index}>
                            {/* date */}
                            <View style={{
                                width: ScreenWidth,
                                backgroundColor: "#C40C0C",
                                paddingHorizontal: 10,
                                paddingVertical: 5
                            }}>
                                <Text style={{ color: "white" }}>{item.date}</Text>
                            </View>

                            {/* payment list per date */}
                            {
                                item.requestArr.map((payment, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            paddingHorizontal: 10,
                                            paddingVertical: 5,
                                            alignItems: "flex-start"
                                        }}
                                    >
                                        <View style={{
                                            width: ScreenWidth / 1.7,
                                        }}>
                                            <Text>{payment.content}</Text>
                                        </View>
                                        <View style={{
                                            width: ScreenWidth - ScreenWidth / 1.55,
                                            alignItems: "flex-end"
                                        }}>
                                            <Text style={{
                                                color: payment.status === 0 ? "red" : payment.status === 1 ? "#FFC700" : "green"
                                            }}>
                                                {payment.status === 0 ? "Đã Hủy" : payment.status === 1 ? "Đang Xử Lý" : "Đã Duyệt"}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            }
                        </View>
                    ))
                }
            </ScrollView>
            <FilterModal visible={isChangeFilter} onClose={handleChangeFilter} filterChoosed={filterChoosed} setFilterChoosed={setFilterChoosed} />
        </>
    )
}