import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BuyerNavigator from "./BuyerNavigator";
import LoginScreen from "../components/Authorization/LoginScreen";
import RegisterScreen from "../components/Authorization/RegisterScreen";
import SellerNavigator from "./SellerNavigator";
import AboutTechGadget from "../components/CustomComponents/AboutTechGadget";
import BuyerPersonal from "../components/Buyer/BuyerProfile/BuyerPersonal";
import Policy from "../components/CustomComponents/Policy";
import ChangeProfile from "../components/CustomComponents/ChangeProfile";
import VerifyCodeScreen from "../components/Authorization/VerifyCodeScreen";
import TransferInfo from "../components/Payment/TransferInfo";
import PaymentSuccess from "../components/Payment/PaymentSuccess";
import PaymentFail from "../components/Payment/PaymentFail";
import AuthRoute from "../components/Authorization/AuthRoute";
import ApplicationRequest from "../components/Buyer/ApplicationRequest";
import Details from "../components/Buyer/Detail/Detail";
import { MaterialCommunityIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BusinessRegistrationCertificate from "../components/Seller/BusinessRegistrationCertificate";
import CertificateHistory from "../components/Seller/CertificateHistory";
import PasswordAndSecure from "../components/CustomComponents/PasswordAndSecure";
import GadgetDetail from "../components/Buyer/Detail/GadgetDetail";
import CategoryGadgets from "../components/Buyer/BuyerHome/CategoryGadgets";
import BuyerWallet from "../components/Buyer/WalletTracking/BuyerWallet";
import DepositHistory from "../components/Buyer/WalletTracking/DepositHistory";
import RefundHistory from "../components/Buyer/WalletTracking/RefundHistory";
import PaymentHistory from "../components/Buyer/WalletTracking/PaymentHistory";
import SellerGadgetByCategory from "../components/Seller/SellerHome/SellerGadgetByCategory";
import GadgetSellerDetail from "../components/Seller/Gadget/GadgetSellerDetail";
import SellerOrderDetail from "../components/Seller/SellerOrder/SellerOrderDetail";
import SellerProfile from "../components/Seller/SellerProfile/SellerProfile";
import useAuth from "../utils/useAuth";
import BuyerCartItem from "../components/Buyer/BuyerCart/BuyerCartItem";
import BuyerOrderDetail from "../components/Buyer/BuyerOrder/BuyerOrderDetail";
import { WalletTrackingScreen } from "../components/Seller/WalletTracking/WalletTrackingScreen";
import { SellerOrderReviewsScreen } from "../components/Seller/SellerOrderReviews/SellerOrderReviewsScreen";
import ReviewList from "../components/Buyer/BuyerReview/ReviewList";
import FavoriteList from "../components/Buyer/Favorite/FavoriteList";
import { BuyerReviewSellerOrdersScreen } from "../components/Buyer/SellerOrderReviews/BuyerReviewSellerOrdersScreen";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SellerStack = ({ isLoggedIn }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SellerTab" options={{ headerShown: false }}>
        {() => (
          <SellerTabNavigator isLoggedIn={isLoggedIn} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const SellerTabNavigator = ({ isLoggedIn }) => {
  return (
    <Tab.Navigator
      initialRouteName="RegisterSeller"
      // barStyle={{ backgroundColor: '#694fad' }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: !isLoggedIn ? 'none' : 'flex',
          // borderTopRightRadius: 15,
          // borderTopLeftRadius: 15,
          backgroundColor: "white",
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: "#ed8900",
        tabBarInactiveTintColor: "#757575",
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="RegisterSeller"
        component={BusinessRegistrationCertificate}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="application" size={+size} color={color} />
          ),
          tabBarLabel: "Đơn",
        }}
      />
      <Tab.Screen
        name="RegisterSellerHistory"
        component={CertificateHistory}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="history" size={+size} color={color} />
          ),
          tabBarLabel: "Lịch sử",
        }}
      />
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


const RootNavigator = () => {
  const { isChanged, user, isLoggedIn } = useAuth();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarColor: "black",
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="StackBuyerHome" component={BuyerNavigator} options={{ statusBarColor: "black", }} />
      <Stack.Screen
        name="RegisterSeller"
        options={{ headerShown: false }}
      >
        {() => (
          <SellerStack isLoggedIn={isLoggedIn} />
        )}
      </Stack.Screen>
      {/* <Stack.Screen name="RegisterSeller" component={BusinessRegistrationCertificate} options={{ headerShown: false }}/>
      <Stack.Screen name="RegisterSellerHistory" component={CertificateHistory} options={{ headerShown: false }}/> */}
      {/* Detail */}
      <Stack.Screen
        name="Details"
        component={Details}
        options={{ title: 'Chi tiết sản phẩm' }}
      />
      <Stack.Screen
        name="GadgetDetail"
        component={GadgetDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="CategoryGadgets"
        component={CategoryGadgets}
      />
      <Stack.Screen name="AboutTechGadget" >
        {() => (
          <AuthRoute>
            <AboutTechGadget />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="BuyerPersonal" >
        {() => (
          <AuthRoute>
            <BuyerPersonal />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="BuyerWallet" >
        {() => (
          <AuthRoute>
            <BuyerWallet />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="DepositHistory" >
        {() => (
          <AuthRoute>
            <DepositHistory />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="RefundHistory" >
        {() => (
          <AuthRoute>
            <RefundHistory />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="PaymentHistory" >
        {() => (
          <AuthRoute>
            <PaymentHistory />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="BuyerOrderDetail" >
        {({ navigation, route }) => (
          <AuthRoute>
            <BuyerOrderDetail navigation={navigation} route={route} />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="Policy" >
        {() => (
          <AuthRoute>
            <Policy />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="ChangeProfile" >
        {() => (
          <AuthRoute>
            <ChangeProfile />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="FavoriteList" >
        {() => (
          <AuthRoute>
            <FavoriteList />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="PasswordAndSecure" >
        {() => (
          <AuthRoute>
            <PasswordAndSecure />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="TransferInfo" >
        {() => (
          <AuthRoute>
            <TransferInfo />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="ApplicationRequest" >
        {() => (
          <AuthRoute>
            <ApplicationRequest />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="BuyerCartItem" >
        {() => (
          <AuthRoute>
            <BuyerCartItem />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="PaymentSuccess" >
        {() => (
          <AuthRoute>
            <PaymentSuccess />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="PaymentFail" >
        {() => (
          <AuthRoute>
            <PaymentFail />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="ReviewList" >
        {({ navigation, route }) => (
          <AuthRoute>
            <ReviewList navigation={navigation} route={route} />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="BuyerReviewSellerOrdersScreen" >
        {({ navigation, route }) => (
          <AuthRoute>
            <BuyerReviewSellerOrdersScreen navigation={navigation} route={route} />
          </AuthRoute>
        )}
      </Stack.Screen>

      {/* Seller */}
      <Stack.Screen name="StackSellerHome" component={SellerNavigator} />
      <Stack.Screen name="SellerGadgetByCategory" >
        {({ navigation, route }) => (
          <AuthRoute>
            <SellerGadgetByCategory navigation={navigation} route={route} />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="GadgetSellerDetail"
        component={GadgetSellerDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="SellerOrderDetail" >
        {({ navigation, route }) => (
          <AuthRoute>
            <SellerOrderDetail navigation={navigation} route={route} />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="WalletTrackingScreen" >
        {({ navigation, route }) => (
          <AuthRoute>
            <WalletTrackingScreen navigation={navigation} route={route} />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="SellerOrderReviews" >
        {({ navigation, route }) => (
          <AuthRoute>
            <SellerOrderReviewsScreen navigation={navigation} route={route} />
          </AuthRoute>
        )}
      </Stack.Screen>
    </Stack.Navigator>

  );
};

export default RootNavigator;
