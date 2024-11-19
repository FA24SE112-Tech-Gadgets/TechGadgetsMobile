import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import useAuth from '../utils/useAuth';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import SellerProfile from '../components/Seller/SellerProfile/SellerProfile';
import AuthRoute from '../components/Authorization/AuthRoute';
import SellerHome from '../components/Seller/SellerHome/SellerHome';
import SellerOrders from '../components/Seller/SellerOrder/SellerOrders';
import SellerNotifications from '../components/Seller/SellerNotification/SellerNotifications';
import useNotification from "../utils/useNotification"
const Tab = createBottomTabNavigator();

const SellerNavigator = () => {
    const { isLoggedIn, isBackgroundNoti } = useAuth();
    const { unreadNotifications, setUnreadNotifications, showNotification, setShowNotification } = useNotification();

    return (
        <Tab.Navigator
            initialRouteName={!isBackgroundNoti ? 'SellerHome' : "SellerNotification"}
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    display: !isLoggedIn ? 'none' : 'flex',
                    // borderTopRightRadius: 15,
                    // borderTopLeftRadius: 15,
                    backgroundColor: "white",
                    borderTopWidth: 0,
                },
                // tabBarShowLabel: false,
                tabBarActiveTintColor: "#ed8900",
                tabBarInactiveTintColor: "#757575",
                // tabBarActiveBackgroundColor: "#ed8900",
                tabBarHideOnKeyboard: true,
                // tabBarItemStyle: {
                // 	display: route.name === 'BackgroundTask' ? 'none' : 'flex',
                // }
            })}
            screenListeners={({ route }) => ({
                tabPress: () => {
                    if (route.name !== "SellerNotification") {
                        setShowNotification(true);
                    } else {
                        setShowNotification(false);
                    }
                },
            })}
        >
            <Tab.Screen
                name='SellerHome'
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={+size} color={color} />
                    ),
                    // tabBarItemStyle: {
                    //     borderTopLeftRadius: 15,
                    // },
                    tabBarLabel: "Shop"
                }}
            >
                {() => (
                    <AuthRoute>
                        <SellerHome />
                    </AuthRoute>
                )}
            </Tab.Screen>
            <Tab.Screen
                name='SellerOrders'
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-sharp" size={+size} color={color} />
                    ),
                    tabBarLabel: "Đơn hàng",

                }}
            >
                {() => (
                    <AuthRoute>
                        <SellerOrders />
                    </AuthRoute>
                )}
            </Tab.Screen>
            <Tab.Screen
                name='SellerNotification'
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications" size={+size} color={color} />
                    ),
                    // tabBarItemStyle: {
                    //     borderTopRightRadius: 15,
                    // }
                    tabBarLabel: "Thông báo",
                    tabBarBadge: unreadNotifications > 0 ? unreadNotifications : null,
                    tabBarBadgeStyle: {
                        display: showNotification ? "flex" : "none",
                        backgroundColor: "#FF3D00",
                        color: "white",
                        fontSize: 12,
                    }
                }}
                listeners={{
                    tabPress: () => {
                        // Đặt lại số thông báo chưa đọc khi người dùng nhấn vào tab "Thông báo"
                        setUnreadNotifications(0);
                    },
                }}
            >
                {() => (
                    <AuthRoute>
                        <SellerNotifications />
                    </AuthRoute>
                )}
            </Tab.Screen>
            <Tab.Screen
                name='SellerProfile'
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={+size} color={color} />
                    ),
                    // tabBarItemStyle: {
                    //     borderTopRightRadius: 15,
                    // }
                    tabBarLabel: "Hồ sơ"
                }}
            >
                {() => (
                    <AuthRoute>
                        <SellerProfile />
                    </AuthRoute>
                )}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default SellerNavigator;
