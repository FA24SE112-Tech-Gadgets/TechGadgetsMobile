import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../utils/useAuth';
import CustomerHome from '../components/Customer/CustomerHome';
import { FontAwesome } from '@expo/vector-icons';
import CustomSocial from '../components/CustomComponents/CustomSocial';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import CustomerHistory from '../components/Customer/CustomerHistory';
import CustomerProfile from '../components/Customer/CustomerProfile';
import CustomCreatePost from '../components/CustomComponents/CustomCreatePost';
import { Ionicons } from '@expo/vector-icons';
import BackgroundTask from '../components/Notification/BackgroundTask';
import AuthRoute from '../components/Authorization/AuthRoute';

const Tab = createBottomTabNavigator();

const CustomerNavigator = () => {
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
			initialRouteName='CustomerHome'
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarStyle: {
					display: !isLoggedIn ? 'none' : 'flex',
					borderTopRightRadius: 15,
					borderTopLeftRadius: 15,
					backgroundColor: "#FB6562",
				},
				tabBarShowLabel: false,
				tabBarActiveTintColor: "white",
				tabBarInactiveTintColor: "white",
				tabBarActiveBackgroundColor: "#E25F5C",
				tabBarHideOnKeyboard: true,
				// tabBarItemStyle: {
				// 	display: route.name === 'BackgroundTask' ? 'none' : 'flex',
				// }
			})}
		>
			<Tab.Screen
				name='CustomerHome'
				options={{
					tabBarIcon: ({ color, size }) => (
						<Icon name="home" size={+size} color={color} />
					),
					tabBarItemStyle: {
						borderTopLeftRadius: 15,
					}
				}}
			>
				{() => (
					<AuthRoute>
						<CustomerHome />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='CustomerSocial'
				options={{
					tabBarIcon: ({ color, size }) => (
						<FontAwesome name="globe" size={+size} color={color} />
					),
				}}
			>
				{() => (
					<AuthRoute>
						<CustomSocial />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='BackgroundTask'
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="notifications" size={+size} color={color} />
					),
				}}
			>
				{() => (
					<AuthRoute>
						<BackgroundTask />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='CustomerHistory'
				options={{
					tabBarIcon: ({ color, size }) => (
						<FontAwesome5 name="history" size={+size} color={color} />
					),
				}}
			>
				{() => (
					<AuthRoute>
						<CustomerHistory />
					</AuthRoute>
				)}
			</Tab.Screen>
			<Tab.Screen
				name='CustomerProfile'
				options={{
					tabBarIcon: ({ color, size }) => (
						<MaterialIcons name="person" size={+size} color={color} />
					),
					tabBarItemStyle: {
						borderTopRightRadius: 15,
					}
				}}
			>
				{() => (
					<AuthRoute>
						<CustomerProfile />
					</AuthRoute>
				)}
			</Tab.Screen>
		</Tab.Navigator>
	);
};

export default CustomerNavigator;
