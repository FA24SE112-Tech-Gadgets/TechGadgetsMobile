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
import { Feather } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const CustomerNavigator = () => {
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
			initialRouteName='CustomerHome'
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
				name='CustomerHome'
				component={CustomerHome}
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
				name='CustomSocial'
				component={CustomSocial}
				options={{
					tabBarIcon: ({ color, size }) => (
						<FontAwesome name="globe" size={+size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name='CustomCreatePost'
				component={CustomCreatePost}
				options={{
					tabBarIcon: ({ color, size }) => (
						<Feather name="plus-square" size={+size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name='CustomerHistory'
				component={CustomerHistory}
				options={{
					tabBarIcon: ({ color, size }) => (
						<FontAwesome5 name="history" size={+size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name='CustomerProfile'
				component={CustomerProfile}
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

export default CustomerNavigator;
