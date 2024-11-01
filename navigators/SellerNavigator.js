import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../utils/useAuth';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import SellerProfile from '../components/Seller/SellerProfile';
import { Icon as IconRneui } from "@rneui/base";
import AuthRoute from '../components/Authorization/AuthRoute';
import SellerHome from '../components/Seller/SellerHome';
import SellerVouchers from '../components/Seller/SellerVouchers';
import SellerMarketing from '../components/Seller/SellerMarketing';
import SellerNotification from '../components/Seller/SellerNotification';
const Tab = createBottomTabNavigator();

const SellerNavigator = () => {
    const [cart, setCart] = useState([]);
    const { isChanged, user, isLoggedIn } = useAuth();

    useEffect(() => {
        const loadCart = async () => {
            const cartDB = await AsyncStorage.getItem('cart');
            if (cartDB) {
                let tmpCart = JSON.parse(cartDB);
                tmpCart = tmpCart.filter((product) => {
                    return product?.user === (user?._id ? user?._id : 'guest');
                });
                setCart([...tmpCart]);
            }
        };
        loadCart();
    }, [isChanged]);

    return (
        <Tab.Navigator
            initialRouteName='SellerHome'
            screenOptions={{
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
            }}
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
                name='SellerVouchers'
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="discount" size={+size} color={color} />
                    ),
                    tabBarLabel: "Mã giảm giá"
                }}
            >
                {() => (
                    <AuthRoute>
                        <SellerVouchers />
                    </AuthRoute>
                )}
            </Tab.Screen>
            <Tab.Screen
                name='SellerMarketing'
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <IconRneui type="material-community" name="chart-box-outline" size={+size} color={color} />
                    ),
                    tabBarLabel: "Marketing"
                }}
            >
                {() => (
                    <AuthRoute>
                        <SellerMarketing />
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
                    tabBarLabel: "Thông báo"
                }}
            >
                {() => (
                    <AuthRoute>
                        <SellerNotification />
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
