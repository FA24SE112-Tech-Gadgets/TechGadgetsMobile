import React from "react";
import { AuthProvider } from "./components/Authorization/AuthContext";
import RootNavigator from "./navigators/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CommentProvider } from "./components/CustomComponents/CommentContext";
import api from "./components/Authorization/api";

export default function App() {
  const fetchUser = async () => {
    const url = "/account";
    try {
      const res = await api.get(url);
      let user = res.data;

      console.log("check here", user);
      if (user) {
        return user
      } else {
        return null
      }

    } catch (error) {
      console.log("Don't have token");
      return null
    }
  };

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
            CustomerSocial: "CustomerSocial",
            // CustomerCreatePost: "CustomerCreatePost",
            CustomerHistory: "CustomerHistory",
            CustomerProfile: "CustomerProfile",
            BackgroundTask: "BackgroundTask",
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
            RestaurantSocial: "RestaurantSocial",
            RestaurantCreatePost: "RestaurantCreatePost",
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
    async getInitialURL() {
      // First, you may want to do the default deep link handling
      // Check if app was opened from a deep link
      const url = await Linking.getInitialURL();

      if (url != null) {
        return url;
      }

      // Handle URL from expo push notifications
      const response = await Notifications.getLastNotificationResponseAsync();

      return response?.notification.request.content.data.url;
    },
    subscribe(listener) {
      const onReceiveURL = ({ url }) => listener(url);

      // Listen to incoming links from deep linking
      const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);

      // Listen to expo push notifications
      const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
        const url = response.notification.request.content.data.url;
        const notificationId = response.notification.request.content.data.notificationId;

        // Any custom logic to see whether the URL needs to be handled
        //...
        const user = await fetchUser();
        if (user) {
          //Fetch API /api/notification/{notificationId} for update Seen
          try {
            const res = await api.get(`/notification/${notificationId}`);
            let noti = res.data;

            console.log("check noti detail", noti);
          } catch (error) {
            console.log("Error get notification detail");
            return;
          }

          // Let React Navigation handle the URL
          listener(url);
        }

      });

      return () => {
        // Clean up the event listeners
        eventListenerSubscription.remove();
        subscription.remove();
      };
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
