import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../utils/useAuth';
import RestaurantHome from '../components/Restaurant/RestaurantHome';
import CustomSocial from '../components/CustomComponents/CustomSocial';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import RestaurantProfile from '../components/Restaurant/RestaurantProfile';
import CustomCreatePost from '../components/CustomComponents/CustomCreatePost';
import { Icon as IconRneui } from "@rneui/base";
import RestaurantTransactionHistory from '../components/Restaurant/RestaurantTransactionHistory';
const Tab = createBottomTabNavigator();

const RestaurantNavigator = () => {
    const [cart, setCart] = useState([]);
    const { isChanged, user } = useAuth();

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
            initialRouteName='RestaurantHome'
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    borderTopRightRadius: 15,
                    borderTopLeftRadius: 15,
                    backgroundColor: "#FB6562",
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "white",
                tabBarActiveBackgroundColor: "#E25F5C"
            }}
        >
            <Tab.Screen
                name='RestaurantHome'
                component={RestaurantHome}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={+size} color={color} />
                    ),
                    tabBarItemStyle: {
                        borderTopLeftRadius: 15,
                    }
                }}
            />
            <Tab.Screen
                name='RestaurantSocial'
                component={CustomSocial}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="globe" size={+size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name='RestaurantCreatePost'
                component={CustomCreatePost}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="plus-square" size={+size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name='RestaurantTransactionHistory'
                component={RestaurantTransactionHistory}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <IconRneui type="material-community" name="chart-box-outline" size={+size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name='RestaurantProfile'
                component={RestaurantProfile}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={+size} color={color} />
                    ),
                    tabBarItemStyle: {
                        borderTopRightRadius: 15,
                    }
                }}
            />
        </Tab.Navigator>
    );
};

export default RestaurantNavigator;
