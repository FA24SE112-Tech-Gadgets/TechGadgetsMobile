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

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('app', () => App);

export default function App() {
  const { isLoggedIn, fetchUser } = useAuth();
  //   const url = "/account";
  //   try {
  //     const res = await api.get(url);
  //     let user = res.data;

  //     console.log("check here", user);
  //     if (user) {
  //       return user
  //     } else {
  //       return null
  //     }

  //   } catch (error) {
  //     console.log("Don't have token");
  //     return null
  //   }
  // };

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
            FavouriteGagdets: "FavouriteGagdets",
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
        await fetchUser();
        if (isLoggedIn) {
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
