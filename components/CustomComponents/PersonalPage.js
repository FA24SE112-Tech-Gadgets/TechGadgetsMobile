import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import CustomPostV2 from "../CustomComponents/CustomPostV2";
import { Divider, ScreenHeight, ScreenWidth } from "@rneui/base";
import useAuth from "../../utils/useAuth";
import { useTranslation } from "react-i18next";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";

const limit = 20;

export default function PersonalPage({ navigation }) {
  const { user } = useAuth();

  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const scrollViewRef = useRef(null);

  const [isFetching, setIsFetching] = useState(false);

  const { t } = useTranslation();

  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, contentSize } = nativeEvent;
    const reachedEnd = contentOffset.y >= contentSize.height - ScreenHeight;
    if (reachedEnd) {
      setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  const fetchPost = async (currentPage) => {
    let isErr = true;
    try {
      const res = await api.get(`/posts/current?page=${currentPage}&limit=${limit}`);
      if (res.status >= 200 && res.status < 300) {
        setData(res.data.data);
      }
      isErr = false;
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("network-error")
      );
      isErr = true;
    }
    return isErr;
  };

  //Fetch posts
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(0);
      scrollToTop();
      fetchPost(0);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(
            `/posts/current?page=${currentPage}&limit=${limit}`
          );
          setIsFetching(false);
          const newData = res.data.data;

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          setData((prevArray) => [...prevArray, ...newData]);
        } catch (error) {
          setIsError(true);
          setStringErr(
            error.response?.data?.reasons[0]?.message ?
              error.response.data.reasons[0].message
              :
              t("network-error")
          );
        }
      };
      if (currentPage >= 1) {
        fetchItems();
      }
    }, [currentPage])
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      {/* Bạn đang nghĩ gì? */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#FB6562",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 8,
          columnGap: 12,
        }}
      >
        {user.imageUrl ? (
          <Image
            source={{
              uri: user.imageUrl,
            }}
            style={{
              height: 32,
              width: 32,
              backgroundColor: "black",
              borderRadius: 30,
            }}
          />
        ) : (
          <View
            style={{
              height: 32,
              width: 32,
              borderRadius: 30,
              backgroundColor: "#FEC6C4",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
              {user.fullName.charAt(0)}
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => {
            user?.role == "USER"
              ? navigation.navigate("customer-create-post")
              : navigation.navigate("restaurant-create-post");
          }}
          style={{
            backgroundColor: "#F1F5F7",
            flex: 1,
            borderRadius: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            height: ScreenWidth / 12,
            justifyContent: 'center'
          }}
        >
          <Text style={{ fontSize: 15 }}>{t("post-input")}</Text>
        </Pressable>
      </View>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        {data.length > 0 && data.map((postItem, index) => (
          <View key={index}>
            <CustomPostV2 post={postItem} />
            {index < data.length && <Divider style={{ marginTop: 12 }} />}
          </View>
        ))}
        {
          data.length == 0 &&
          <View style={{
            flex: 1,
            height: ScreenHeight / 2.5
          }}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LottieView
                source={require("../../assets/catRole.json")}
                style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                autoPlay
                loop
                speed={0.8}
              />
              <Text style={{
                fontSize: 18,
                width: ScreenWidth / 1.5,
                textAlign: "center"
              }}>
                {t("update-post-soon")}
              </Text>
            </View>
          </View>
        }
      </ScrollView>
      {
        isFetching &&
        <ActivityIndicator color={"#FB6562"} />
      }
    </View>
  );
}
