import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BuyerNavigator from "./BuyerNavigator";
import LoginScreen from "../components/Authorization/LoginScreen";
import RegisterScreen from "../components/Authorization/RegisterScreen";
import SellerNavigator from "./SellerNavigator";
import AboutTechGadget from "../components/CustomComponents/AboutTechGadget";
import BuyerPersonal from "../components/Buyer/BuyerPersonal";
import Policy from "../components/CustomComponents/Policy";
import ChangeProfile from "../components/CustomComponents/ChangeProfile";
import VerifyCodeScreen from "../components/Authorization/VerifyCodeScreen";
import TransferInfo from "../components/Payment/TransferInfo";
import PaymentSuccess from "../components/Payment/PaymentSuccess";
import PaymentFail from "../components/Payment/PaymentFail";
import AuthRoute from "../components/Authorization/AuthRoute";
import ApplicationRequest from "../components/Buyer/ApplicationRequest";
import Details from "../components/Buyer/Detail/Detail";
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BusinessRegistrationCertificate from "../components/Seller/BusinessRegistrationCertificate";
import CertificateHistory from "../components/Seller/CertificateHistory";
import PasswordAndSecure from "../components/CustomComponents/PasswordAndSecure";
import GadgetDetail from "../components/Buyer/Detail/GadgetDetail";
import CategoryGadgets from "../components/Buyer/CategoryGadgets";
import BuyerWallet from "../components/Buyer/BuyerWallet";
import DepositHistory from "../components/Buyer/DepositHistory";
import RefundHistory from "../components/Buyer/RefundHistory";
import PaymentHistory from "../components/Buyer/PaymentHistory";
import SellerGadgetByCategory from "../components/Seller/SellerGadgetByCategory";
import GadgetSellerDetail from "../components/Seller/Gadget/GadgetSellerDetail";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const SellerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SellerTab" component={SellerTabNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const SellerTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="RegisterSeller"
      barStyle={{ backgroundColor: '#694fad' }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="RegisterSeller"
        component={BusinessRegistrationCertificate}
        options={{
          tabBarIcon: () => (
            <MaterialCommunityIcons name="application" size={24} color="black" />
          ),
          tabBarLabel: "Đơn",
        }}
      />
      <Tab.Screen
        name="RegisterSellerHistory"
        component={CertificateHistory}
        options={{
          tabBarIcon: () => (
            <FontAwesome name="history" size={24} color="black" />
          ),
          tabBarLabel: "Lịch sử",
        }}
      />
    </Tab.Navigator>
  );
};


const RootNavigator = () => {
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
      <Stack.Screen name="RegisterSeller" component={SellerStack} options={{ headerShown: false }} />
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
    </Stack.Navigator>

  );
};

export default RootNavigator;
