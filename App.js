import React from "react";
import { AuthProvider } from "./components/Authorization/AuthContext";
import RootNavigator from "./navigators/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import api from "./components/Authorization/api";
import LoadingScreen from "./components/CustomComponents/LoadingScreen";
import useAuth from "./utils/useAuth";
import 'text-encoding';
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { NotificationProvider } from "./components/Notification/NotificationContext";
import "./services/i18next";

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('app', () => App);

export default function App() {
  const { isLoggedIn, fetchUser } = useAuth();

  const linking = {
    prefixes: ["techgadgets://"],
    config: {
      screens: {
        Login: "Login",
        Register: "Register",
        VerifyCode: "VerifyCode",
        StackBuyerHome: {
          screens: {
            BuyerHome: "BuyerHome",
            SearchNaturalLanguage: "SearchNaturalLanguage",
            OrdersHistory: "OrdersHistory",
            BuyerProfile: "BuyerProfile",
            BuyerNotification: "BuyerNotification",
          }
        },
        SellerGadgetByCategory: "SellerGadgetByCategory",
        SellerOrderDetail: "SellerOrderDetail",
        WalletTrackingScreen: "WalletTrackingScreen",
        SellerOrderReviews: "SellerOrderReviews",
        GadgetSellerDetail: "GadgetSellerDetail",
        GadgetDetail: "GadgetDetail",
        AboutTechGadget: "AboutTechGadget",
        BuyerPersonal: "BuyerPersonal",
        BuyerWallet: "BuyerWallet",
        FavoriteList: "FavoriteList",
        Policy: "Policy",
        PasswordAndSecure: "PasswordAndSecure",
        ChangeProfile: "ChangeProfile",
        StackSellerHome: {
          screens: {
            SellerHome: "SellerHome",
            SellerOrders: "SellerOrders",
            SellerNotification: "SellerNotification",
            SellerProfile: "SellerProfile"
          }
        },
        PaymentSuccess: "PaymentSuccess",
        PaymentFail: "PaymentFail",
        NotFound: '*',
      },
    },
    async getInitialURL() {
      try {
        // Try to get the initial URL
        const url = await Linking.getInitialURL();
        if (url) return url;

        // If not, check for a URL in the last notification response
        const response = await Notifications.getLastNotificationResponseAsync();
        return response?.notification.request.content.data?.url || ""; // Default to empty string if null
      } catch (error) {
        console.log("Error fetching initial URL:", error);
        return ""; // Handle errors by returning an empty string or default value
      }
    },
    subscribe(listener) {
      const onReceiveURL = async ({ url }) => {
        if (url) await listener(url); // Only pass the URL if it's not null
      };

      // Listen to incoming links from deep linking
      const eventListenerSubscription = Linking.addEventListener("url", onReceiveURL);

      // Listen to expo push notifications
      const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
        const url = response.notification.request.content.data?.url;
        const notificationId = response.notification.request.content.data?.notificationId;

        if (url) {  // Only proceed if `url` exists
          try {
            await fetchUser();
            if (isLoggedIn) {
              // Fetch API to update Seen status
              const res = await api.get(`/notification/${notificationId}`);
              const noti = res.data;
              console.log("Notification detail:", noti);

              // Let React Navigation handle the URL
              listener(url);
            }
          } catch (error) {
            console.log("Error getting notification detail:", error);
          }
        }
      });

      return () => {
        eventListenerSubscription.remove();
        subscription.remove();
      };
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking} fallback={<LoadingScreen />}>
        <AuthProvider>
          <NotificationProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootNavigator />
            </GestureHandlerRootView>
          </NotificationProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
