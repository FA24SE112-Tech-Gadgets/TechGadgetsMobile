import { createContext, useCallback, useEffect, useState } from "react";
import messaging from '@react-native-firebase/messaging';
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";
import useAuth from "../../utils/useAuth";

const NotificationContext = createContext({
    unreadNotifications: 0,
    setUnreadNotifications: () => { },
    showNotification: true,
    setShowNotification: () => { },
    deviceToken: "",
    newNotifications: [],
    setNewNotifications: () => { },
    notifications: [],
    setNotifications: () => { },
    isFetching: false,
    setIsFetching: () => { },
    refreshing: false,
    stringErr: "",
    setStringErr: () => { },
    isError: false,
    setIsError: () => { },
    handleScroll: () => { },
    handleRefresh: async () => { },
    fetchNewNotifications: async () => { },
    fetchNotifications: async (page, type) => { },
    markNotificationAsRead: () => { },
    markAllNotificationsAsRead: () => { },
    setCurrentPage: () => { },
    handleDeleteDeviceToken: async () => { }
})

const NotificationProvider = ({ children }) => {
    const { user, isBackgroundNoti, setIsBackgroundNoti, fetchUser } = useAuth();
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [showNotification, setShowNotification] = useState(true);

    const [deviceToken, setDeviceToken] = useState("");

    const [isFetching, setIsFetching] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const [newNotifications, setNewNotifications] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const handleDeleteDeviceToken = async () => {
        try {
            await api.delete(`/device-tokens`, {
                data: { token: deviceToken }
            });

        } catch (error) {
            setIsError(true);
            setStringErr(
                error.response?.data?.reasons[0]?.message
                    ? error.response.data.reasons[0].message
                    : "Lỗi mạng vui lòng thử lại sau"
            );
        }
    }

    //Function for trigger new notification when have fcm noti
    const fetchNewNotifications = async () => {
        try {
            setIsFetching(true);
            const res = await api.get(
                `/notifications?Page=1&PageSize=10`
            );
            setIsFetching(false);

            const newData = res.data.items;

            if (newData && newData.length > 0) {
                // Lọc những thông báo mới chỉ có trong newData và chưa có trong notifications
                const uniqueNewNotifications = newData.filter(
                    (newResNotification) => {
                        return !notifications.some(
                            (existingNotification) => existingNotification.id === newResNotification.id
                        ) && !newNotifications.some(
                            (existingNewNotification) => existingNewNotification.id === newResNotification.id
                        );
                    }
                );

                // Thêm những thông báo này vào newNotifications
                setNewNotifications([...uniqueNewNotifications, ...newNotifications]);
            }
        } catch (error) {
            setIsError(true);
            setStringErr(
                error.response?.data?.reasons[0]?.message
                    ? error.response.data.reasons[0].message
                    : "Lỗi mạng vui lòng thử lại sau"
            );
        }
    };

    // Fetch notifications function
    const fetchNotifications = async (page, type) => {
        try {
            setIsFetching(true);
            const res = await api.get(
                `/notifications?Page=${page}&PageSize=10`
            );
            setIsFetching(false);

            const newData = res.data.items;

            if (newData && newData.length > 0) {
                // Lọc những thông báo mới chỉ có trong newData và chưa có trong newNotifications
                const uniqueNotifications = newData.filter(
                    (newResNotification) => {
                        return !notifications.some(
                            (existingNotification) => existingNotification.id === newResNotification.id
                        ) && !newNotifications.some(
                            (existingNewNotification) => existingNewNotification.id === newResNotification.id
                        );
                    }
                );

                // Kết hợp và lọc trùng lặp
                const allNotifications = type === "scroll"
                    ? [...notifications, ...uniqueNotifications]
                    : [...uniqueNotifications, ...notifications];

                setNotifications(allNotifications);
            }

            // Update hasMoreData status
            setHasMoreData(res.data.hasNextPage);
        } catch (error) {
            setIsError(true);
            setStringErr(
                error.response?.data?.reasons[0]?.message
                    ? error.response.data.reasons[0].message
                    : "Lỗi mạng vui lòng thử lại sau"
            );
        }
    };

    const handleScroll = () => {
        if (isFetching) return; // Ngăn không gọi nếu đang fetch

        if (hasMoreData) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
            fetchNotifications(nextPage, "scroll"); // Gọi fetchNewNotifications với trang tiếp theo
        } else {
            setIsFetching(true);
            fetchNotifications(currentPage, "scroll"); // Gọi fetchNewNotifications nhưng không tăng currentPage
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setCurrentPage(1);
        await fetchNewNotifications(); // Fetch new notification
        setRefreshing(false);
    };

    const markAllNotificationsAsRead = () => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) => ({
                ...notification,
                isRead: true, // Cập nhật isRead thành true cho tất cả các phần tử
            }))
        );
        setNewNotifications((prevNotifications) =>
            prevNotifications.map((notification) => ({
                ...notification,
                isRead: true, // Cập nhật isRead thành true cho tất cả các phần tử
            }))
        );
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === notificationId
                    ? { ...notification, isRead: true } // Cập nhật isRead nếu id trùng
                    : notification
            )
        );
        setNewNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === notificationId
                    ? { ...notification, isRead: true } // Cập nhật isRead nếu id trùng
                    : notification
            )
        );
    };

    const getDeviceToken = async () => {
        let token = await messaging().getToken();
        setDeviceToken(token);
        console.log("my deviceToken", token);
    }

    // registerDeviceForRemoteMessages and getDeviceToken
    useFocusEffect(
        useCallback(() => {
            (async () => {
                await messaging().registerDeviceForRemoteMessages();
                await getDeviceToken();
            })();
        }, [])
    );

    //get FCM message
    useFocusEffect(
        useCallback(() => {
            const unsubscribe = messaging().onMessage(async remoteMessage => {
                if (user) {
                    if (notifications && notifications.length == 0) {
                        await fetchNotifications(1, "normal");
                    } else {
                        await fetchNewNotifications();
                    }
                }
                console.log("nhận đc noti", showNotification);

                if (showNotification) { //Nếu đang ở tab khác ngoài Notification thì mới đếm không thì không đếm
                    setUnreadNotifications((prevState) => prevState + 1);
                }
            });

            return unsubscribe;
        }, [showNotification])
    );

    //For click to notification from the background
    useEffect(() => {
        const unsubscribe = messaging().onNotificationOpenedApp(async (remoteMessage) => {
            console.log('Notification caused app to open from background state:', remoteMessage);
            if (user) {
                if (notifications && notifications.length == 0) {
                    await fetchNotifications(1, "normal");
                } else {
                    await fetchNewNotifications();
                }
            }
            console.log("nhận đc bgNoti", showNotification);

            if (showNotification) { //Nếu đang ở tab khác ngoài Notification thì mới đếm không thì không đếm
                setUnreadNotifications((prevState) => prevState + 1);
            }
        });

        // Check notification when app is opened from terminated state
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log('App opened from terminated state by notification:', remoteMessage);
                    setIsBackgroundNoti(true);
                }
            });

        return unsubscribe;
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                unreadNotifications,
                setUnreadNotifications,
                showNotification,
                setShowNotification,
                deviceToken,
                newNotifications,
                setNewNotifications,
                notifications,
                setNotifications,
                isFetching,
                setIsFetching,
                refreshing,
                stringErr,
                setStringErr,
                isError,
                setIsError,
                handleScroll,
                handleRefresh,
                fetchNewNotifications,
                fetchNotifications,
                markNotificationAsRead,
                markAllNotificationsAsRead,
                setCurrentPage,
                handleDeleteDeviceToken
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export { NotificationContext, NotificationProvider };