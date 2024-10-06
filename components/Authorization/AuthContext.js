import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useState } from "react";
import api from "./api";
import { useFocusEffect } from "@react-navigation/native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Client } from '@stomp/stompjs';
import { NODE_ENV } from "@env";

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

const routingKey = "getAllNoti";
const exchangeName = "test-exchange";
const webSocketPort = "15674";
const domainName = NODE_ENV == "development" ? "tech-gadgets-dev.xyz" : "tech-gadgets-prod.online"

const AuthProvider = ({ children }) => {
  let client;
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
    await fetchUser();
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUser(null);
    setIsTimerRunning(false);
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("token");
  };

  const connectToRabbitMQ = () => {
    const headers = {
      login: 'myadmin', // Replace with your RabbitMQ username
      passcode: 'mypassword' // Replace with your RabbitMQ password
    };
    client = new Client({
      brokerURL: `ws://${domainName}:${webSocketPort}/ws`,
      connectHeaders: headers,
      onConnect: () => {
        console.log("connect success");
        client.subscribe(`/exchange/${exchangeName}/${routingKey}`, message => {
          console.log(`Received: ${message.body}`)
          setServerMessages(prevNotifications => [
            ...prevNotifications,
            message.body
          ]);
        }
        );
      },
      onStompError: (frame) => {
        const readableString = new TextDecoder().decode(frame.binaryBody);
        console.log('STOMP error', readableString);
      },
      appendMissingNULLonIncoming: true,
      forceBinaryWSFrames: true
    });

    client.activate();
  };

  //Connect RabbitMQ
  // useFocusEffect(
  //   useCallback(() => {
  //     connectToRabbitMQ();
  //     return () => {
  //       if (client) {
  //         console.log("Disconnecting from RabbitMQ");
  //         client.deactivate(); // Properly deactivate the client on component unmount
  //       }
  //     };
  //   }, [])
  // );

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
