import { createNativeStackNavigator } from "@react-navigation/native-stack";
import useAuth from "../utils/useAuth";
import CustomerNavigator from "./CustomerNavigator";
import LoginScreen from "../components/Authorization/LoginScreen";
import RegisterScreen from "../components/Authorization/RegisterScreen";
import RestaurantNavigator from "./RestaurantNavigator";
import LoadingScreen from "../components/LoadingScreen/Loading";
import CustomerAfterRandom from "../components/Customer/CustomerAfterRandom";
import CustomerDishDetail from "../components/Customer/CustomerDishDetail";
import CustomerRating from "../components/Customer/CustomerRating";
import CustomerAddReview from "../components/Customer/CustomerAddReview";
import RestaurantTransactionHistory from "../components/Restaurant/RestaurantTransactionHistory";
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

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { isLoggedIn, user, isLoading } = useAuth();

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          {!isLoggedIn ? (
            <Stack.Navigator
              screenOptions={{ statusBarColor: "black" }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="VerifyCode"
                component={VerifyCodeScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                statusBarColor: "black",
              }}
            >
              {user?.role?.toLowerCase() === "user" ? (
                <>
                  <Stack.Screen name="StackCustomerHome" component={CustomerNavigator} options={{ statusBarColor: "black", }} />
                  <Stack.Screen name="CustomerAfterRandom" component={CustomerAfterRandom} />
                  <Stack.Screen name="CustomerDishDetail" component={CustomerDishDetail} />
                  <Stack.Screen name="CustomerRating" component={CustomerRating} />
                  <Stack.Screen name="CustomerAddReview" component={CustomerAddReview} />
                  <Stack.Screen name="CustomerHistoryDetail" component={CustomerHistoryDetail} />
                  <Stack.Screen name="CustomExplore" component={CustomExplore} />
                  <Stack.Screen name="CustomCreatePost" component={CustomCreatePost} />
                  <Stack.Screen name="AboutWhatEat" component={AboutWhatEat} />
                  <Stack.Screen name="CustomProfile" component={CustomProfile} />
                  <Stack.Screen name="PersonalPage" component={PersonalPage} />
                  <Stack.Screen name="Policy" component={Policy} />
                  <Stack.Screen name="PasswordAndSecure" component={PasswordAndSecure} />
                  <Stack.Screen name="ChangeProfile" component={ChangeProfile} />
                  <Stack.Screen name="SaveInfoAccounts" component={SaveInfoAccounts} />
                  <Stack.Screen name="Comment" component={CommentScreen} options={{ animation: "slide_from_bottom" }} />
                  <Stack.Screen name="EditComment" component={EditComment} />
                  <Stack.Screen name="TransferInfo" component={TransferInfo} />
                  <Stack.Screen name="CustomerTransactionHistory" component={CustomerTransactionHistory} />
                  <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
                  <Stack.Screen name="PaymentFail" component={PaymentFail} />
                </>
              ) : (
                user?.role?.toLowerCase() === "restaurant" && (
                  <>
                    <Stack.Screen name="StackRestaurantHome" component={RestaurantNavigator} />
                    <Stack.Screen name="CustomExplore" component={CustomExplore} />
                    <Stack.Screen name="CustomCreatePost" component={CustomCreatePost} />
                    <Stack.Screen name="RestaurantDishDetail" component={RestaurantDishDetail} />
                    <Stack.Screen name="RestaurantDishRating" component={RestaurantRating} />
                    <Stack.Screen name="RestaurantEditDish" component={RestaurantEditDish} />
                    <Stack.Screen name="RestaurantAddDish" component={RestaurantAddDish} />
                    <Stack.Screen name="AboutWhatEat" component={AboutWhatEat} />
                    <Stack.Screen name="CustomProfile" component={CustomProfile} />
                    <Stack.Screen name="PersonalPage" component={PersonalPage} />
                    <Stack.Screen name="PasswordAndSecure" component={PasswordAndSecure} />
                    <Stack.Screen name="ChangeProfile" component={ChangeProfile} />
                    <Stack.Screen name="SaveInfoAccounts" component={SaveInfoAccounts} />
                    <Stack.Screen name="Policy" component={Policy} />
                    <Stack.Screen name="Comment" component={CommentScreen} options={{ animation: "slide_from_bottom" }} />
                    <Stack.Screen name="EditComment" component={EditComment} />
                    <Stack.Screen name="AddRequestFood" component={AddRequestFood} />
                    <Stack.Screen name="TransferInfo" component={TransferInfo} />
                    <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
                    <Stack.Screen name="PaymentFail" component={PaymentFail} />
                  </>
                )
              )}
            </Stack.Navigator>
          )}
        </>
      )}
    </>
  );
};

export default RootNavigator;
