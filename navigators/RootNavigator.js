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

const Stack = createNativeStackNavigator();

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
      <Stack.Screen name="StackSellerHome" component={SellerNavigator} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
