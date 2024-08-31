import { View, Text, ScrollView, Image, Pressable, Dimensions, TextInput } from "react-native";
import React, { useState } from "react";
import logo from "../../assets/adaptive-icon.png";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import Modal from "react-native-modal";
import Feather from "react-native-vector-icons/Feather";

const data = [
    {
        fullName: "Phạm Gia Hân",
        avaURL:
            "https://samkyvuong.vn/wp-content/uploads/2022/05/hinh-anh-gai-tay-590x590.jpg.webp",
    },
    {
        fullName: "Gia Hân",
        avaURL:
            "https://samkyvuong.vn/wp-content/uploads/2022/05/hinh-anh-gai-tay-590x590.jpg.webp",
    },
    {
        fullName: "Hân Phạm",
        avaURL:
            "https://samkyvuong.vn/wp-content/uploads/2022/05/hinh-anh-gai-tay-590x590.jpg.webp",
    },
]

export default function SaveInfoAccounts({ navigation, route }) {
    const { id } = route.params;
    const screenHeight = Dimensions.get("window").height;
    const screenWidth = Dimensions.get("window").width;

    const [listAccounts, setAccounts] = useState(data);

    const [isOpenChangePass, setOpenChangePass] = useState(false);
    const [currentPassword, setCurrentPasword] = useState("");
    const [newPassword, setNewPasword] = useState("");

    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.8 }}
            colors={['#FFFFFF', '#FB6562']}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={{ paddingHorizontal: 14 }}
                overScrollMode="never"
                showsVerticalScrollIndicator={false}
            >
                {/* WhatEat logo */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                        marginTop: 10
                    }}
                >
                    <Image
                        style={{
                            width: 70,
                            height: 70,
                            borderColor: "black",
                            marginRight: -12,
                        }}
                        source={logo}
                    />
                    <MaskedView
                        maskElement={
                            <Text
                                style={{
                                    backgroundColor: "transparent",
                                    fontSize: 28,
                                    fontWeight: "bold",
                                }}
                            >
                                WhatEat
                            </Text>
                        }
                    >
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.6, y: 0.6 }}
                            colors={["rgba(250, 164, 147, 0.65)", "#FB5854"]}
                        >
                            <Text style={{ opacity: 0, fontSize: 28, fontWeight: "bold" }}>
                                WhatEat
                            </Text>
                        </LinearGradient>
                    </MaskedView>
                    <Text style={{ color: "#505050" }}></Text>
                </View>

                {/* Thông tin đăng nhập đã lưu */}
                <Text style={{ fontSize: 25, fontWeight: "bold", textAlignVertical: "center" }}>
                    Thông tin đăng nhập đã lưu
                </Text>
                <Text style={{ fontSize: 15 }}>
                    Chọn tài khoản mà bạn muốn xóa thông tin đăng nhập
                </Text>

                {/* Danh sách tài khoản đã lưu */}
                {
                    listAccounts.length !== 0 && listAccounts.map((item, index) => {
                        if (index === id) {
                            return (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: "center",
                                        backgroundColor: "white",
                                        padding: 10,
                                        marginTop: 20,
                                        borderRadius: 10,
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: item.avaURL,
                                        }}
                                        style={{
                                            height: 45,
                                            width: 45,
                                            resizeMode: "contain",
                                            backgroundColor: "black",
                                            borderRadius: 30,
                                        }}
                                    />
                                    <View style={{
                                        width: screenWidth / 1.32
                                    }}>
                                        <Text style={{ fontSize: 17 }}>{item.fullName}</Text>
                                    </View>
                                </View>
                            )
                        } else {
                            return (
                                <Pressable
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: "center",
                                        backgroundColor: "white",
                                        padding: 10,
                                        marginTop: 20,
                                        borderRadius: 10,
                                        justifyContent: "space-between"
                                    }}
                                    onPress={() => {
                                        //TODO:
                                        //Do something to delete soon
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: item.avaURL,
                                        }}
                                        style={{
                                            height: 45,
                                            width: 45,
                                            resizeMode: "contain",
                                            backgroundColor: "black",
                                            borderRadius: 30,
                                        }}
                                    />
                                    <View style={{
                                        width: screenWidth / 1.5
                                    }}>
                                        <Text style={{ fontSize: 17 }}>{item.fullName}</Text>
                                    </View>
                                    <Feather name={"delete"} size={20} color={"#FB6562"} />
                                </Pressable>
                            )
                        }
                    })
                }

                <Modal
                    isVisible={isOpenChangePass}
                    onBackdropPress={() => setOpenChangePass(false)}
                    onSwipeComplete={() => setOpenChangePass(false)}
                    useNativeDriverForBackdrop
                    swipeDirection={"down"}
                    propagateSwipe={true}
                    style={{
                        justifyContent: 'flex-end',
                        margin: 0,
                    }}
                >
                    {/* Bottom Modal Screen */}
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 0.8 }}
                        colors={['#FFFFFF', '#FB6562']}
                        style={{
                            width: screenWidth,
                            height: screenHeight / 1.5,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                        }}>
                        {/* Thanh trên cùng */}
                        <View style={{
                            alignItems: "center",
                            padding: 10
                        }}>
                            <View style={{
                                width: screenWidth / 5,
                                height: screenHeight / 80,
                                backgroundColor: "#FB6562",
                                borderRadius: 30,
                            }} />
                        </View>

                        <View style={{
                            height: screenHeight / 2.1,
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <View
                                style={{
                                    marginVertical: 10,
                                    paddingHorizontal: 10,
                                    paddingVertical: 20,
                                    gap: 10,
                                    backgroundColor: "white",
                                    width: screenWidth / 1.1,
                                    height: screenHeight / 5,
                                    borderRadius: 10
                                }}
                            >
                                <TextInput
                                    style={{
                                        borderColor: "grey",
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        textAlignVertical: "top",
                                        fontSize: 20,
                                    }}
                                    placeholder="Nhập mật khẩu hiện tại"
                                    value={currentPassword}
                                    onChangeText={(value) => {
                                        setCurrentPasword(value);
                                    }}
                                />
                                <TextInput
                                    style={{
                                        borderColor: "grey",
                                        borderWidth: 1,
                                        borderRadius: 5,
                                        paddingVertical: 5,
                                        paddingHorizontal: 10,
                                        textAlignVertical: "top",
                                        fontSize: 20,
                                    }}
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChangeText={(value) => {
                                        setNewPasword(value);
                                    }}
                                />
                                <Pressable style={{
                                    backgroundColor: "black",
                                    paddingVertical: 5,
                                    paddingHorizontal: 10,
                                    borderRadius: 10
                                }}>
                                    <Text style={{
                                        color: "white",
                                        textAlign: "center",
                                        textAlignVertical: "center",
                                        fontSize: 17
                                    }}>Cập nhật</Text>
                                </Pressable>
                            </View>
                        </View>
                    </LinearGradient>
                </Modal>
            </ScrollView>
        </LinearGradient>
    )
}