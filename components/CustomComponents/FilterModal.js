import { View, Text, TextInput, FlatList, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { Checkbox, Snackbar } from "react-native-paper";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import ConfirmModal from "./ConfirmModal";
import { useDebounce } from 'use-debounce';
import api from '../Authorization/api';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Modal from 'react-native-modal';

export default function FilterModal({ filterModalVisible, handleCloseFilterModal, arrChoosedTag, setArrChoosedTag, isPayToWin, setIsPayToWin }) {
    const [dataTag, setDataTag] = useState([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchBounceString] = useDebounce(searchQuery, 1000);
    const scrollViewRef = useRef(null);

    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [isConfirm, setConfirm] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [isFetching, setIsFetching] = useState(false);

    const { t } = useTranslation();

    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    };

    const handleUnselectAll = async () => {
        const currentArr = [...arrChoosedTag];
        setArrChoosedTag([]);
        try {
            await api.delete(`/personal-profiles/all`);
            setSnackbarMessage("Đã xóa bộ lọc cá nhân");
            setSnackbarVisible(true);
        } catch (error) {
            setArrChoosedTag(currentArr);
            setSnackbarMessage("Mạng không ổn định vui lòng thử lại sau.");
            setSnackbarVisible(true);
            console.log(error);
        }
    }

    const toggleTagSelection = async (tag, functionNo) => {
        let index = -1;
        if (functionNo === 0) {
            index = arrChoosedTag.findIndex((item) => item?.tagId === tag?.id);
        } else {
            index = arrChoosedTag.findIndex((item) => item?.tagId === tag?.tagId);
        }

        if (index === -1) {
            // Nếu tag chưa được chọn, thêm vào mảng arrChoosedTag
            await addTag(tag);
        } else {
            // Nếu tag đã được chọn, xóa khỏi mảng arrChoosedTag
            await removeTag(tag, index, functionNo);
        }
    };

    async function addTag(tag) {
        const currentArr = [...arrChoosedTag];
        const newItem = {
            id: 0,
            tagId: tag.id,
            tagName: tag.name,
            type: "LIKE"
        }
        setArrChoosedTag(prevArr => [...prevArr, newItem]);

        try {
            const res = await api.post(`/personal-profiles`, {
                "like": [
                    tag.id
                ]
            });
            const newData = res.data.like;

            setArrChoosedTag(newData);
            setSnackbarMessage("Đã thêm vào bộ lọc");
            setSnackbarVisible(true);
        } catch (error) {
            setArrChoosedTag(currentArr);
            // Kiểm tra xem error.response có tồn tại không
            if (error.response) {
                const errorData = error.response.data;

                // Hiển thị thông báo lỗi từ response nếu cần
                setSnackbarMessage(errorData.title || "Đã xảy ra lỗi. Vui lòng thử lại.");
            } else {
                // Lỗi không phải từ response (ví dụ: network error)
                console.log("Error", error.message);
                setSnackbarMessage("Mạng không ổn định vui lòng thử lại sau.");
            }

            setSnackbarVisible(true);
        }
    }

    async function removeTag(tag, index, functionNo) {
        const currentArr = [...arrChoosedTag];
        //Xóa trc cải thiện giao diện
        setArrChoosedTag((prevArr) =>
            prevArr.filter((item) => {
                return functionNo === 0 ? (item.tagId !== tag.id) : (item.tagId !== tag.tagId)
            })
        );
        try {
            await api.delete(`/personal-profiles`, {
                data: {
                    ids: [
                        arrChoosedTag[index].id
                    ]
                }
            });

            //API Báo xóa thành công thì show ra
            setSnackbarMessage("Đã xóa khỏi bộ lọc");
            setSnackbarVisible(true);
        } catch (error) {
            setArrChoosedTag(currentArr);
            setSnackbarMessage("Mạng không ổn định vui lòng thử lại sau.");
            setSnackbarVisible(true);
            console.log(error);
        }
    }

    const handleScroll = () => {
        if (!isFetching) {
            setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
        }
    };

    const isTagChosen = (tag) => {
        return arrChoosedTag.some((item) => item?.tagId === tag?.id);
    };

    const fetchTags = async () => {
        try {
            const res = await api.get(
                `/tags?page=0&name=${searchBounceString}&limit=10`
            );
            const newData = res.data.data;

            setDataTag(newData);
        } catch (error) {
            console.log("error fetchTags", error.response?.data?.reasons[0]?.message);
        }
    };

    const handleGetPersonalTag = async () => {
        try {
            const res = await api.get(
                `/personal-profiles`
            );
            const newData = res.data.like;
            setArrChoosedTag(newData);
        } catch (error) {
            setIsPayToWin(true);
            console.log(error.response?.data?.reasons[0]?.message);
        }
    }

    const renderFooter = () => {
        if (!isFetching) return null;
        return (
            <View style={{
                padding: 5,
                alignItems: 'center'
            }}>
                <ActivityIndicator color={"#ed8900"} />
            </View>
        );
    };

    //Get personal tags
    useFocusEffect(
        useCallback(() => {
            handleGetPersonalTag();
        }, [filterModalVisible])
    );

    //Fetch tags / Search tags
    useFocusEffect(
        useCallback(() => {
            setCurrentPage(0);
            scrollToTop();
            fetchTags();
        }, [searchBounceString])
    );

    //Pagination
    useFocusEffect(
        useCallback(() => {
            const fetchItems = async () => {
                try {
                    setIsFetching(true);
                    const res = await api.get(
                        `/tags?page=${currentPage}&name=${searchBounceString}&limit=10`
                    );
                    setIsFetching(false);
                    const newData = res.data.data;

                    if (newData.length == 0) {
                        console.log("No more data to fetch");
                        return; // Stop the process if there is no more data
                    }
                    setDataTag((prevArray) => [...prevArray, ...newData]);
                } catch (error) {
                    console.log(error);
                }
            };
            if (currentPage >= 1) {
                fetchItems();
            }
        }, [currentPage])
    );

    return (
        <Modal
            isVisible={filterModalVisible && !isPayToWin}
            onSwipeComplete={() => {
                handleCloseFilterModal();
                setSnackbarVisible(false);
            }}
            onBackdropPress={() => {
                handleCloseFilterModal();
                setSnackbarVisible(false);
            }}
            swipeDirection="down"
            style={{
                margin: 0,
                justifyContent: 'flex-end',
            }}
        >
            <View style={{
                height: ScreenHeight * 0.66,
                backgroundColor: "white",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
            }}>
                <View style={styles.modalContent}>
                    {/* Thanh màu hồng nằm trên cùng */}
                    <View
                        style={{
                            alignItems: "center",
                            paddingBottom: 20,
                        }}
                    >
                        <View
                            style={{
                                width: ScreenWidth / 7,
                                height: ScreenHeight / 100,
                                backgroundColor: "#FFBBBA",
                                borderRadius: 30,
                            }}
                        />
                    </View>
                    {/* Bộ lọc cá nhân */}
                    <View style={{
                        flexDirection: "row",
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        justifyContent: "space-between"
                    }}>
                        <Text
                            style={{
                                fontSize: ScreenHeight / 37,
                                fontWeight: "bold",
                            }}
                        >
                            {t("personal-filter")} {arrChoosedTag.length !== 0 && `- ${arrChoosedTag.length}`}
                        </Text>
                        {
                            arrChoosedTag.length >= 2 &&
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        textAlignVertical: "center",
                                    }}
                                >
                                    {t("unselect")}
                                </Text>
                                <Checkbox
                                    status={arrChoosedTag.length >= 2 ? "checked" : "unchecked"}
                                    color="#FBACAA"
                                    uncheckedColor="#FBACAA"
                                    onPress={() => {
                                        setConfirm(true);
                                    }}
                                />
                            </View>
                        }
                    </View>

                    {/* Search bar */}
                    <View style={{ marginHorizontal: 14, marginBottom: 10 }}>
                        <View
                            style={{
                                flexDirection: "row",
                                backgroundColor: "#F1F3F4",
                                alignItems: "center",
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                columnGap: 12,
                                borderRadius: 6,
                            }}
                        >
                            <Icon
                                type="font-awesome"
                                name="search"
                                size={20}
                                color={"#FBACAA"}
                            />
                            <TextInput
                                placeholder={t("search-filter")}
                                style={{ flex: 1, fontSize: 15, fontWeight: "500" }}
                                value={searchQuery}
                                onChangeText={(query) => setSearchQuery(query)}
                            />
                        </View>
                    </View>

                    <View style={{
                        flexDirection: "row",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        alignItems: "center",
                        gap: 10
                    }}>
                        <Text style={{
                            fontSize: ScreenWidth / 25,
                            fontWeight: "500",
                        }}>
                            {t("your-filter")}
                        </Text>
                        {
                            arrChoosedTag.length === 0 ?
                                <Text style={{
                                    fontSize: ScreenWidth / 27,
                                }}>
                                    {t("no-data")}
                                </Text> :
                                <FlatList
                                    overScrollMode={"never"}
                                    data={arrChoosedTag}
                                    keyExtractor={(item) => item.tagId}
                                    horizontal
                                    contentContainerStyle={{ justifyContent: "center", alignItems: 'center', gap: 5 }}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item, index }) => {
                                        return (
                                            <Pressable style={{
                                                flexDirection: "row",
                                                paddingVertical: 5,
                                                paddingHorizontal: 8,
                                                alignItems: "center",
                                                gap: 5,
                                                backgroundColor: "#FBACAA",
                                                borderRadius: 10
                                            }}
                                                onPress={() => toggleTagSelection(item, 1)}
                                            >
                                                <Text style={{
                                                    fontSize: ScreenWidth / 27,
                                                    color: "white"
                                                }}>
                                                    {item.tagName}
                                                </Text>
                                                <AntDesign name="close" size={13} color={"white"} />
                                            </Pressable>
                                        )
                                    }}
                                />
                        }
                    </View>
                    <Divider />

                    <FlatList
                        data={dataTag}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                style={{
                                    paddingVertical: 16,
                                    paddingLeft: 14,
                                    paddingRight: 20,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                                onPress={() => toggleTagSelection(item, 0)}
                            >
                                <Text
                                    style={{
                                        fontSize: ScreenWidth / 25,
                                    }}
                                >
                                    {item.name}
                                </Text>
                                {
                                    isTagChosen(item) &&
                                    <Entypo name="check" size={ScreenWidth / 20} color={"#FBACAA"} />
                                }
                            </Pressable>
                        )}
                        onEndReached={handleScroll}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        initialNumToRender={10}
                        showsVerticalScrollIndicator={false}
                        overScrollMode="never"
                    />
                </View>
            </View>
            <ConfirmModal
                visible={isConfirm}
                onClose={() => {
                    setConfirm(false);
                }}
                onConfirm={() => {
                    handleUnselectAll();
                    setConfirm(false);
                }}
                textTitle={t("confirm-delete-filter")}
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={1500}
                wrapperStyle={{ bottom: 0 }}
            >
                {snackbarMessage}
            </Snackbar>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: "white",
        paddingVertical: 16,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
});