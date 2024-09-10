import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useState } from "react";
import api from "./api";
import { useFocusEffect } from "@react-navigation/native";

const AuthContext = createContext({
  isLoggedIn: false,
  user: {},
  isTimerRunning: false,
  setIsTimerRunning: () => { },
  setIsLoggedIn: () => { },
  setRole: () => { },
  login: async () => { },
  logout: () => { },
  setUser: () => { },
  isPayToWin: false,
  setIsPayToWin: () => { },
  fetchSubscription: async (status, page, limit) => { },
  currentPackage: {},
  setCurrentPackage: () => { },
  fetchUser: () => { },
});

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPayToWin, setIsPayToWin] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);

  const fetchUser = async () => {
    const url = "/account";
    try {
      const res = await api.get(url);
      let user = res?.data;
      if (user.role == "RESTAURANT") {
        const urlRestaurant = "/restaurants/current";
        const res = await api.get(urlRestaurant);
        user = {
          ...user,
          address: res.data.address,
          imageUrl: res.data.image,
          description: res.data.description,
          idRestaurant: res.data.id,
          restaurantName: res.data.name,
        };
      }
      console.log(user);
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchSubscription(status, page, limit) {
    const url = `/subscriptions/current?subscriptionStatus=${status}&page=${page}&limit=${limit}`;
    try {
      const res = await api.get(url);
      const data = res.data.data;
      if (data != undefined && data.length != 0) {
        setCurrentPackage(data[0]);
        setIsPayToWin(false);
        return true;
      }
      setCurrentPackage(null);
      setIsPayToWin(true);
      return false;
    } catch (error) {
      console.log("check pay to win err:", error.response?.data?.reasons[0]?.message ?
        error.response.data.reasons[0].message
        : error);
      setIsPayToWin(true);
      return false;
    }
  }

  const login = async () => {
    fetchUser();
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUser("");
    setIsTimerRunning(false);
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("token");
  };

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
        fetchSubscription,
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
