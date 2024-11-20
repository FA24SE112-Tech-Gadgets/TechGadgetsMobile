import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import useAuth from '../utils/useAuth';
import { FontAwesome5 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import BuyerProfile from '../components/Buyer/BuyerProfile/BuyerProfile';
import { Ionicons } from '@expo/vector-icons';
import AuthRoute from '../components/Authorization/AuthRoute';
import BuyerHome from '../components/Buyer/BuyerHome/BuyerHome';
import BuyerOrders from '../components/Buyer/BuyerOrder/BuyerOrders';
import useNotification from '../utils/useNotification';
import BuyerNotifications from '../components/Buyer/BuyerNotification/BuyerNotifications';
import SearchNaturalLanguage from '../components/Buyer/SearchNaturalLanguage/SearchNaturalLanguage';

const Tab = createBottomTabNavigator();

const BuyerNavigator = () => {
	const { isLoggedIn, isBackgroundNoti } = useAuth();
	const { unreadNotifications, setUnreadNotifications, showNotification, setShowNotification } = useNotification();

	return (
		<Tab.Navigator
			initialRouteName={!isBackgroundNoti ? 'BuyerHome' : "BuyerNotification"}
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
			})}
			screenListeners={({ route }) => ({
				tabPress: () => {
					if (route.name !== "BuyerNotification") {
						setShowNotification(true);
					} else {
						setShowNotification(false);
					}
				},
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
				name='SearchNaturalLanguage'
				options={{
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="search" size={+size} color={color} />
					),
					tabBarLabel: "Tìm kiếm",
				}}
			>
				{() => (
					<AuthRoute>
						<SearchNaturalLanguage />
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
						<BuyerNotifications />
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
