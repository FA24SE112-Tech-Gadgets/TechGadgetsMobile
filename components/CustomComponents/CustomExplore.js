import { View, Text, Image, Pressable, BackHandler, ActivityIndicator, FlatList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import CustomPostV2 from "./CustomPostV2";
import useAuth from "../../utils/useAuth";
import { ScreenWidth, ScreenHeight, Divider } from "@rneui/base";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";
import useComment from "../../utils/useComment";
import { useTranslation } from "react-i18next";
import ErrModal from "./ErrModal";

export default function CustomExplore({ route, navigation }) {
  const { post } = route.params;
  const { user } = useAuth();

  const [firstPost, setFirstPost] = useState(null)

  const { t } = useTranslation();

  const {
    limit,
    postsData,
    setPostsData,
    currentPostPage,
    setCurrentPostPage,
    totalPostsPages,
    setTotalPostsPages,
    stringErr,
    setStringErr,
    isError,
    setIsError,
    fetchPost,
    handlePostScroll,
    isFetching,
    setIsFetching,
    setHasMoreData
  } = useComment();

  const fetchFirstPost = async (id) => {
    let isErr = true;
    try {
      const res = await api.get(`/posts/${id}`);
      if (res.status >= 200 && res.status < 300) {
        setFirstPost(res.data);
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

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={{
        padding: 5,
        alignItems: 'center'
      }}>
        <ActivityIndicator color={"#FB6562"} />
      </View>
    );
  };

  //Fetch posts / Search posts
  useFocusEffect(
    useCallback(() => {
      fetchPost(0);
      fetchFirstPost(post.id)
    }, [])
  );

  // Post pagination
  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(
            `/posts?page=${currentPostPage}&limit=${limit}`
          );
          const newData = res.data.data;
          setHasMoreData(newData.length > 0);
          setIsFetching(false);
          setTotalPostsPages(res.data.totalPages);

          if (newData.length == 0) {
            // No more data to fetch
            return; // Stop the process if there is no more data
          }

          setPostsData((prevArray) => [...prevArray, ...newData]);
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
      if (currentPostPage >= 1) {
        fetchItems();
        fetchFirstPost(post.id);
      }
    }, [currentPostPage])
  );

  //Remove current post comments data for showing other post comments
  useEffect(() => {
    const backAction = () => {
      setPostsData([]);
      setCurrentPostPage(0);
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      {/* Customer create post */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#FB6562",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 8,
          columnGap: 12,
          height: ScreenWidth / 7
        }}
      >
        {user.imageUrl ? (
          <Image
            source={{
              uri: user.imageUrl,
            }}
            style={{
              height: ScreenWidth / 11,
              width: ScreenWidth / 11,
              backgroundColor: "black",
              borderRadius: 30,
            }}
          />
        ) : (
          <View
            style={{
              height: ScreenWidth / 11,
              width: ScreenWidth / 11,
              borderRadius: 30,
              backgroundColor: "#FEC6C4",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 23, fontWeight: "bold", color: "white" }}>
              {user.fullName.charAt(0)}
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => {
            navigation.navigate("CustomCreatePost");
          }}
          style={{
            backgroundColor: "#E9ECEE",
            flex: 1,
            borderRadius: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            height: ScreenWidth / 12,
            justifyContent: 'center'
          }}
        >
          <Text style={{ fontSize: 15 }}>{t("what-are-u-thinking")}</Text>
        </Pressable>
      </View>

      <FlatList
        data={postsData}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <>
            {
              index === 0 &&
              <>
                <CustomPostV2 post={firstPost} />
                <Divider style={{ marginTop: 12 }} />
              </>
            }
            {item.id != post.id && (
              <>
                <CustomPostV2 post={item} />
                {index < postsData.length && <Divider style={{ marginTop: 12 }} />}
              </>
            )}
          </>
        )}
        onEndReached={handlePostScroll}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      />

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </View>
  );
}
