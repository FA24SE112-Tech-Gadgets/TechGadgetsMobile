import React from "react";
import { AuthProvider } from "./components/Authorization/AuthContext";
import RootNavigator from "./navigators/RootNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LoadingScreen from "./components/CustomComponents/LoadingScreen";
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
  const linking = {
    prefixes: ["techgadgets://"],
    config: {
      screens: {
        Login: "Login",
        Register: "Register",
        VerifyCode: "VerifyCode",
        ForgotPassword: "ForgotPassword",
        ChangePasswordScreen: "ChangePasswordScreen",
        StackBuyerHome: {
          screens: {
            BuyerHome: "BuyerHome",
            SearchNaturalLanguage: "SearchNaturalLanguage",
            BuyerOrder: "BuyerOrder",
            BuyerNotification: "BuyerNotification",
            BuyerProfile: "BuyerProfile",
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
        NotFound: '*',
      },
    }
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
