import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect } from 'react'
import useNotification from '../../../utils/useNotification'
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { ScreenWidth, ScreenHeight } from '@rneui/base';
import SellerNotificationItem from './SellerNotificationItem';
import ErrModal from '../../CustomComponents/ErrModal';
import api from '../../Authorization/api';

export default function SellerNotifications() {
    const {
        newNotifications,
        notifications,
        isFetching,
        setIsFetching,
        refreshing,
        stringErr,
        setStringErr,
        isError,
        setIsError,
        handleScroll,
        handleRefresh,
        fetchNotifications,
        markAllNotificationsAsRead
    } = useNotification();

    const navigation = useNavigation();

    const handleReadAllNoti = async () => {
        try {
            setIsFetching(true);
            await api.put(
                `/notification/all`
            );
            setIsFetching(false);
            await handleRefresh();
            markAllNotificationsAsRead();
        } catch (error) {
            setIsError(true);
            setStringErr(
                error.response?.data?.reasons[0]?.message
                    ? error.response.data.reasons[0].message
                    : "Lỗi mạng vui lòng thử lại sau"
            );
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

    // Initial Fetch when component mounts
    useEffect(() => {
        fetchNotifications(1, "normal"); // Fetch the first page
    }, [])

    const renderNewNotification = () => (
        <>
            {
                newNotifications.length > 0 ?
                    <>
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 10,
                            paddingVertical: 16
                        }}>
                            <Text style={{
                                fontWeight: "500",
                                fontSize: 16,
                            }}>Mới</Text>
                            <TouchableOpacity onPress={() => {
                                handleReadAllNoti()
                            }}>
                                <Text style={{ color: "#ed8900", fontWeight: "500" }}>Đánh dấu tất cả đã đọc</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexShrink: 1 }}>
                            <FlatList
                                data={newNotifications}
                                renderItem={({ item, index }) => (
                                    <SellerNotificationItem
                                        {...item}
                                        setIsError={setIsError}
                                        setStringErr={setStringErr}
                                        setIsFetching={setIsFetching}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                scrollEnabled={false}
                            />
                        </View>
                    </>
                    :
                    <TouchableOpacity style={{
                        alignSelf: "flex-end",
                        paddingHorizontal: 10,
                        paddingTop: 10,
                    }} onPress={() => {
                        handleReadAllNoti()
                    }}>
                        <Text style={{ color: "#ed8900", fontWeight: "500" }}>Đánh dấu tất cả đã đọc</Text>
                    </TouchableOpacity>
            }
        </>
    );

    return (
        <LinearGradient colors={['#FFFFFF', '#f9f9f9']} style={{ flex: 1 }}>
            {/* Header */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: 16,
                borderWidth: 1,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                borderColor: 'rgb(254, 169, 40)',
                backgroundColor: 'rgba(254, 169, 40, 0.3)',
            }}>
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        padding: 8,
                        borderRadius: 20,
                        backgroundColor: "rgba(254, 161, 40, 0.5)",
                        borderWidth: 1,
                        borderColor: "rgb(254, 161, 40)",
                    }}
                >
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>

                <Text style={{
                    fontSize: 18,
                    fontWeight: "500"
                }}>Thông báo</Text>
            </View>

            <View style={{ flexShrink: notifications.length > 0 ? 1 : undefined, height: notifications.length > 0 ? undefined : ScreenHeight / 1.75 }}>
                {notifications.length == 0 ? (
                    <View
                        style={{
                            flex: 1,
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <LottieView
                                source={require("../../../assets/animations/catRole.json")}
                                style={{ width: ScreenWidth, height: ScreenWidth / 1.4 }}
                                autoPlay
                                loop
                                speed={0.8}
                            />
                            <Text
                                style={{
                                    fontSize: 16,
                                    width: ScreenWidth / 1.5,
                                    fontWeight: "500",
                                    textAlign: "center",
                                }}
                            >
                                {isFetching ? "Đang tải thông báo" : "Không có thông báo nào"}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={notifications}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => (
                            <SellerNotificationItem
                                {...item}
                                index={index}
                                newNotificationsLength={newNotifications.length}
                                setIsError={setIsError}
                                setStringErr={setStringErr}
                                setIsFetching={setIsFetching}
                            />
                        )}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        ListHeaderComponent={renderNewNotification}
                        ListFooterComponent={renderFooter}
                        initialNumToRender={10}
                        showsVerticalScrollIndicator={false}
                        overScrollMode="never"
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                )}
            </View>

            <ErrModal
                stringErr={stringErr}
                isError={isError}
                setIsError={setIsError}
            />
        </LinearGradient>
    )
}