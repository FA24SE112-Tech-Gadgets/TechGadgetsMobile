import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../utils/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import CustomSocial from '../components/Reference/CustomSocial';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import CustomerHistory from '../components/Buyer/CustomerHistory';
import BuyerProfile from '../components/Buyer/BuyerProfile';
import { Ionicons } from '@expo/vector-icons';
import AuthRoute from '../components/Authorization/AuthRoute';
import FavouriteGagdets from '../components/Buyer/FavouriteGagdets';
import OrdersHistory from '../components/Buyer/OrdersHistory';
import BuyerNotification from '../components/Buyer/BuyerNotification';
import BuyerHome from '../components/Buyer/BuyerHome/BuyerHome';
import BuyerOrders from '../components/Buyer/BuyerOrder/BuyerOrders';

const Tab = createBottomTabNavigator();

const BuyerNavigator = () => {
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
			initialRouteName='BuyerHome'
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
		>
			<Tab.Screen
				name='BuyerHome'
				options={{
					tabBarIcon: ({ color, size }) => (
						<Icon name="home" size={+size} color={color} />
					),
					// tabBarItemStyle: {
					// 	borderTopLeftRadius: 15,
					// },
					tabBarLabel: "Trang chủ",
				}}
			>
				{() => (
					<AuthRoute>
						<BuyerHome />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='FavouriteGagdets'
				options={{
					tabBarIcon: ({ color, size }) => (
						<FontAwesome name="heart" size={+size} color={color} />
					),
					tabBarLabel: "Yêu thích",
				}}
			>
				{() => (
					<AuthRoute>
						<FavouriteGagdets />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='BuyerOrder'
				options={{
					tabBarIcon: ({ color, size }) => (
						<FontAwesome5 name="history" size={+size} color={color} />
					),
					tabBarLabel: "Lịch sử mua hàng",
				}}
			>
				{() => (
					<AuthRoute>
						<BuyerOrders />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='BuyerNotification'
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="notifications" size={+size} color={color} />
					),
					tabBarLabel: "Thông báo",
				}}
			>
				{() => (
					<AuthRoute>
						<BuyerNotification />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='BuyerProfile'
				options={{
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="person" size={+size} color={color} />
					),
					// tabBarItemStyle: {
					// 	borderTopRightRadius: 15,
					// },
					tabBarLabel: "Tôi",
				}}
			>
				{() => (
					<AuthRoute>
						<BuyerProfile />
					</AuthRoute>
				)}
			</Tab.Screen>
		</Tab.Navigator>
	);
};

export default BuyerNavigator;
