import React from "react";
import { AuthProvider } from "./components/Authorization/AuthContext";
import RootNavigator from "./navigators/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CommentProvider } from "./components/CustomComponents/CommentContext";

export default function App() {
  const linking = {
    prefixes: ["techgadgets://"],
    config: {
      screens: {
        Login: "Login",
        Register: "Register",
        VerifyCode: "VerifyCode",
        StackCustomerHome: {
          screens: {
            CustomerHome: "CustomerHome",
            CustomSocial: "CustomSocial",
            CustomCreatePost: "CustomCreatePost",
            CustomerHistory: "CustomerHistory",
            CustomerProfile: "CustomerProfile"
          }
        },
        CustomCreatePost: "CustomCreatePost",
        CustomerAfterRandom: "CustomerAfterRandom",
        CustomerDishDetail: "CustomerDishDetail",
        CustomerRating: "CustomerRating",
        CustomerAddReview: "CustomerAddReview",
        CustomerHistoryDetail: "CustomerHistoryDetail",
        CustomExplore: "CustomExplore",
        AboutWhatEat: "AboutWhatEat",
        CustomProfile: "CustomProfile",
        PersonalPage: "PersonalPage",
        Policy: "Policy",
        PasswordAndSecure: "PasswordAndSecure",
        ChangeProfile: "ChangeProfile",
        SaveInfoAccounts: "SaveInfoAccounts",
        Comment: "Comment",
        EditComment: "EditComment",
        StackRestaurantHome: {
          screens: {
            RestaurantHome: "RestaurantHome",
            CustomSocial: "CustomSocial",
            CustomCreatePost: "CustomCreatePost",
            RestaurantTransactionHistory: "RestaurantTransactionHistory",
            RestaurantProfile: "RestaurantProfile"
          }
        },
        RestaurantDishDetail: "RestaurantDishDetail",
        RestaurantDishRating: "RestaurantDishRating",
        RestaurantEditDish: "RestaurantEditDish",
        RestaurantAddDish: "RestaurantAddDish",
        AddRequestFood: "AddRequestFood",
        PaymentSuccess: "PaymentSuccess",
        PaymentFail: "PaymentFail",
        NotFound: '*',
      },
    },
  };
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <AuthProvider>
          <CommentProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootNavigator />
            </GestureHandlerRootView>
          </CommentProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
