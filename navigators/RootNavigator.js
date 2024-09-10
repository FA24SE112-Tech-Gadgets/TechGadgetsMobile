import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomerNavigator from "./CustomerNavigator";
import LoginScreen from "../components/Authorization/LoginScreen";
import RegisterScreen from "../components/Authorization/RegisterScreen";
import RestaurantNavigator from "./RestaurantNavigator";
import CustomerAfterRandom from "../components/Customer/CustomerAfterRandom";
import CustomerDishDetail from "../components/Customer/CustomerDishDetail";
import CustomerRating from "../components/Customer/CustomerRating";
import CustomerAddReview from "../components/Customer/CustomerAddReview";
import RestaurantDishDetail from "../components/Restaurant/RestaurantDishDetail";
import RestaurantRating from "../components/Restaurant/RestaurantRating";
import RestaurantEditDish from "../components/Restaurant/RestaurantEditDish";
import CustomerHistoryDetail from "../components/Customer/CustomerHistoryDetail";
import CustomExplore from "../components/CustomComponents/CustomExplore";
import CustomCreatePost from "../components/CustomComponents/CustomCreatePost";
import RestaurantAddDish from "../components/Restaurant/RestaurantAddDish";
import AboutWhatEat from "../components/CustomComponents/AboutWhatEat";
import CustomProfile from "../components/CustomComponents/CustomProfile";
import PersonalPage from "../components/CustomComponents/PersonalPage";
import Policy from "../components/CustomComponents/Policy";
import PasswordAndSecure from "../components/CustomComponents/PasswordAndSecure";
import ChangeProfile from "../components/CustomComponents/ChangeProfile";
import SaveInfoAccounts from "../components/CustomComponents/SaveInfoAccounts";
import CommentScreen from "../components/CustomComponents/CommentScreen";
import EditComment from "../components/CustomComponents/EditComment";
import AddRequestFood from "../components/Restaurant/AddRequestFood";
import VerifyCodeScreen from "../components/Authorization/VerifyCodeScreen";
import TransferInfo from "../components/Payment/TransferInfo";
import PaymentSuccess from "../components/Payment/PaymentSuccess";
import PaymentFail from "../components/Payment/PaymentFail";
import CustomerTransactionHistory from "../components/Customer/CustomerTransactionHistory";
import AuthRoute from "../components/Authorization/AuthRoute";

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
      <Stack.Screen name="StackCustomerHome" component={CustomerNavigator} options={{ statusBarColor: "black", }} />
      <Stack.Screen name="CustomerAfterRandom">
        {() => (
          <AuthRoute>
            <CustomerAfterRandom />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="CustomerDishDetail">
        {() => (
          <AuthRoute>
            <CustomerDishDetail />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="CustomerRating" >
        {() => (
          <AuthRoute>
            <CustomerRating />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="CustomerAddReview" >
        {() => (
          <AuthRoute>
            <CustomerAddReview />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="CustomerHistoryDetail" >
        {() => (
          <AuthRoute>
            <CustomerHistoryDetail />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="CustomExplore" >
        {() => (
          <AuthRoute>
            <CustomExplore />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="CustomCreatePost" >
        {() => (
          <AuthRoute>
            <CustomCreatePost />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="AboutWhatEat" >
        {() => (
          <AuthRoute>
            <AboutWhatEat />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="CustomProfile" >
        {() => (
          <AuthRoute>
            <CustomProfile />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="PersonalPage" >
        {() => (
          <AuthRoute>
            <PersonalPage />
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
      <Stack.Screen name="PasswordAndSecure" >
        {() => (
          <AuthRoute>
            <PasswordAndSecure />
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
      <Stack.Screen name="SaveInfoAccounts" >
        {() => (
          <AuthRoute>
            <SaveInfoAccounts />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="Comment" options={{ animation: "slide_from_bottom" }} >
        {() => (
          <AuthRoute>
            <CommentScreen />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="EditComment" >
        {() => (
          <AuthRoute>
            <EditComment />
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
      <Stack.Screen name="CustomerTransactionHistory" >
        {() => (
          <AuthRoute>
            <CustomerTransactionHistory />
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
      <Stack.Screen name="StackRestaurantHome" component={RestaurantNavigator} />
      <Stack.Screen name="RestaurantDishDetail"  >
        {() => (
          <AuthRoute>
            <RestaurantDishDetail />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="RestaurantDishRating" >
        {() => (
          <AuthRoute>
            <RestaurantRating />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="RestaurantEditDish"  >
        {() => (
          <AuthRoute>
            <RestaurantEditDish />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="RestaurantAddDish" >
        {() => (
          <AuthRoute>
            <RestaurantAddDish />
          </AuthRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="AddRequestFood" >
        {() => (
          <AuthRoute>
            <AddRequestFood />
          </AuthRoute>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default RootNavigator;
