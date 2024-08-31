import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { Avatar, ScreenWidth } from "@rneui/base";
import { useNavigation } from "@react-navigation/native";
import { Snackbar } from "react-native-paper";
import useComment from "../../utils/useComment";
import { useTranslation } from "react-i18next";

const EditComment = ({ route }) => {
  const [comment, setComment] = useState(route.params);

  const { t } = useTranslation();

  const {
    snackbarVisible,
    setSnackbarVisible,
    snackbarMessage,
    handleUpdateComment,
    isFetching
  } = useComment();

  const navigation = useNavigation();

  const handleChangeData = (fieldName, data) => {
    setComment((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 20,
          marginTop: 10,
          marginLeft: 10,
        }}
      >
        {t("edit-cmt")}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          columnGap: 6,
          marginLeft: 10,
          marginTop: 10,
        }}
      >
        {/* Image */}
        {
          comment.imageUrl !== null ?
            <Avatar size={40} rounded source={{
              uri: comment.imageUrl
            }} />
            :
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
              <Text
                style={{ fontSize: 23, fontWeight: "bold", color: "white" }}
              >
                {comment.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
        }

        {/* Content */}
        <TextInput
          value={comment.content}
          onChangeText={(value) => handleChangeData("content", value)}
          textAlignVertical="top"
          multiline={true}
          numberOfLines={3}
          style={{
            width: ScreenWidth - 70,
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: "#E9ECEE",
            borderRadius: 10,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          columnGap: 10,
          marginHorizontal: 20,
          marginVertical: 10,
        }}
      >
        <Pressable
          style={{
            backgroundColor: "white",
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#FB6562",
            width: ScreenWidth * 0.25,
            height: 35,
            alignItems: "center",
            justifyContent: "center"
          }}
          onPress={navigation.goBack}
          disabled={isFetching}
        >
          <Text style={{ color: "#FB6562", fontWeight: "bold" }}>{t("cancel-update-cmt")}</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#FB6562",
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 10,
            width: ScreenWidth * 0.25,
            height: 35,
            alignItems: "center",
            justifyContent: "center"
          }}
          onPress={() => {
            handleUpdateComment(navigation, comment)
          }}
          disabled={isFetching}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>{t("update-cmt")}</Text>
        </Pressable>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0 }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

export default EditComment;
