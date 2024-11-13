import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useState } from "react";
import api from "./api";
import { useFocusEffect } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import messaging from '@react-native-firebase/messaging';

const AuthContext = createContext({
  isLoggedIn: false,
  user: {},
  isTimerRunning: false,
  setIsTimerRunning: () => { },
  setIsLoggedIn: () => { },
  setRole: () => { },
  login: async () => { },
  logout: async () => { },
  setUser: () => { },
  isPayToWin: false,
  setIsPayToWin: () => { },
  currentPackage: {},
  setCurrentPackage: () => { },
  fetchUser: async () => { },
});

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPayToWin, setIsPayToWin] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);

  const fetchUser = async () => {
    const url = "/users/current";
    try {
      const res = await api.get(url);
      let user = res?.data;
      console.log(user);
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    await fetchUser();
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUser(null);
    setIsTimerRunning(false);
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("token");
    await messaging().unregisterDeviceForRemoteMessages(); //Stop receive FCM
  };

  useFocusEffect(
    useCallback(() => {
      login();
    }, [])
  );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        login,
        logout,
        isLoading,
        setUser,
        isTimerRunning,
        setIsTimerRunning,
        isPayToWin,
        setIsPayToWin,
        currentPackage,
        setCurrentPackage,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
