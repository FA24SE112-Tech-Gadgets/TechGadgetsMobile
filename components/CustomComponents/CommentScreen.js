import { View, Text, Image, ActivityIndicator, FlatList } from "react-native";
import React, { useCallback, useEffect } from "react";
import Comment from "./Comment";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { TextInput } from "react-native";
import { useState } from "react";
import { Snackbar } from "react-native-paper";
import useAuth from "../../utils/useAuth";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";
import useComment from "../../utils/useComment";
import { BackHandler } from "react-native";
import { useTranslation } from "react-i18next";

const CommentScreen = ({ route, navigation }) => {
  const post = route.params;

  const { user } = useAuth();

  const [currentComment, setCurrentComment] = useState("");

  const {
    limit,
    commentsData,
    setCommentsData,
    currentCommentPage,
    setCurrentCommentPage,
    snackbarVisible,
    setSnackbarVisible,
    setStringErr,
    snackbarMessage,
    setSnackbarMessage,
    setIsError,
    fetchComment,
    handleCommentScroll,
    totalCommentsPages,
    setTotalCommentsPages,
    isFetching,
    setIsFetching,
    setPostsData,
    setCurrentPostPage,
    setHasMoreData
  } = useComment();

  const { t } = useTranslation();

  const [isCreating, setIsCreating] = useState(false);

  const addComment = async () => {
    let isErr = true;
    try {
      setIsCreating(true);
      const res = await api.post(`/posts/${post.id}/comments`, {
        content: currentComment
      });
      if (res.status >= 200 && res.status < 300) {
        await fetchComment((totalCommentsPages - 1) < 0 ? 0 : (totalCommentsPages - 1), post);
        setIsCreating(false);
        setSnackbarMessage(t("create-cmt-success"));
        setCurrentComment("")
        setSnackbarVisible(true);
      }
      isErr = false;
    } catch (error) {
      setIsCreating(false);
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

  //Fetch comments
  useFocusEffect(
    useCallback(() => {
      fetchComment(0, post);
    }, [])
  );

  //Fetch comments by page
  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(
            `/posts/${post.id}/comments?page=${currentCommentPage}&limit=${limit}`
          );
          const newData = res.data.data;
          setHasMoreData(newData.length > 0);
          setIsFetching(false);
          setTotalCommentsPages(res.data.totalPages);

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          setCommentsData((prevArray) => [...prevArray, ...newData]);
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
      if (currentCommentPage >= 1) {
        fetchItems();
      }
    }, [currentCommentPage])
  );

  //Remove current post comments data for showing other post comments
  useEffect(() => {
    const backAction = () => {
      setCommentsData([]);
      setHasMoreData(true);
      setCurrentCommentPage(0);
      setPostsData([]);
      setCurrentPostPage(0);
      setSnackbarVisible(false);
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
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: 20 }}>
      {/* Handle show no empty commentsData */}
      {commentsData.length == 0 && (
        <View
          style={{
            alignItems: "center",
            rowGap: -10,
            marginTop: ScreenWidth * 0.2,
          }}
        >
          <Icon
            type="foundation"
            name="comments"
            color={"#CED2D6"}
            size={200}
          />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#9B9FA2" }}>
              {t("no-one-cmt")}
            </Text>
            <Text style={{ fontSize: 16, color: "#9B9FA2" }}>
              {t("be-one-cmt")}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={commentsData}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <View
            style={{ marginTop: index !== 0 ? 16 : 0, marginLeft: 8 }}
          >
            <Comment
              setSnackbarVisible={setSnackbarVisible}
              setSnackbarMessage={setSnackbarMessage}
              comment={item}
              post={post}
            />
          </View>
        )}
        onEndReached={handleCommentScroll}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      />

      {/* Create comment */}
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 8,
          flexDirection: "row",
          borderTopWidth: 0.7,
          borderTopColor: "#D4D2D2",
          alignItems: "center",
          justifyContent: "space-between",
          columnGap: 10,
          marginTop: 5
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            columnGap: 10,
          }}
        >
          {user.imageUrl ? (
            <Image
              source={{
                uri: user.imageUrl,
              }}
              style={{
                height: 34,
                width: 34,
                backgroundColor: "black",
                borderRadius: 30,
              }}
            />
          ) : (
            <View
              style={{
                height: 34,
                width: 34,
                borderRadius: 30,
                backgroundColor: "#FEC6C4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                {user.fullName.charAt(0)}
              </Text>
            </View>
          )}
          <TextInput
            style={{ width: ScreenWidth * 0.7 }}
            placeholder={t("add-cmt")}
            value={currentComment}
            onChangeText={(value) => setCurrentComment(value)}
          />
        </View>

        {
          isCreating ?
            <ActivityIndicator color={"#FB6562"} />
            :
            <Icon
              type="feather"
              name="send"
              color={currentComment == "" ? "grey" : "#FB6562"}
              size={24}
              onPress={currentComment != "" ? addComment : null}
            />
        }
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: ScreenWidth * 0.1, zIndex: 1 }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

export default CommentScreen;
