import { View, Text, KeyboardAvoidingView, TextInput, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ScreenWidth } from "@rneui/base";
import { Snackbar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";

const AddRequestFood = () => {
  const [requestedFood, setRequestedFood] = useState({
    type: "",
    content: "",
  });
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [isFetching, setIsFetching] = useState(false);

  const { t } = useTranslation();

  const navigation = useNavigation();

  const handleChangeData = (fieldName, data) => {
    setRequestedFood((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  const handleAddRequest = async () => {
    if (requestedFood.type == "") {
      setIsError(true);
      return setStringErr(t("food-name"));
    }
    if (requestedFood.content == "") {
      setIsError(true);
      return setStringErr(t("food-empty-des"));
    }
    setSnackbarVisible(true);
    setSnackbarMessage(t("request-success"));
    setIsFetching(true);
    await delay(1500);
    //TODO: Có API request r thì thay thg delay(1500)
    setIsFetching(false);
    navigation.goBack();
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "white" }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginTop: 10,
          marginLeft: 10,
          marginBottom: 10,
        }}
      >
        {t("request-new-food")}
      </Text>

      <View style={{ paddingHorizontal: 16, rowGap: 2 }}>
        <Text style={{ fontSize: ScreenWidth / 25 }}>{t("food-type")}</Text>
        <TextInput
          style={{
            borderColor: "#B7B7B7",
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
          }}
          value={requestedFood.type}
          onChangeText={(value) => handleChangeData("type", value)}
        />
      </View>

      <View style={{ paddingHorizontal: 16, rowGap: 2, marginTop: 12 }}>
        <Text style={{ fontSize: ScreenWidth / 25 }}>{t("request-content")}</Text>
        <TextInput
          style={{
            borderColor: "#B7B7B7",
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            paddingVertical: 10,
          }}
          value={requestedFood.content}
          onChangeText={(value) => handleChangeData("content", value)}
          multiline={true} // Allow multiple lines
          numberOfLines={5} // Set initial number of lines
          textAlignVertical="top"
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
        >
          <Text style={{ fontWeight: "bold", color: "#FB6562" }}>{t("cancel-modal")}</Text>
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
            justifyContent: "center",
            flexDirection: "row",
            gap: 5
          }}
          onPress={handleAddRequest}
          disabled={isFetching}
        >
          <Text style={{ fontWeight: "bold", color: "white" }}>{t("requets-send")}</Text>
          {
            isFetching &&
            <ActivityIndicator color={"white"} />
          }
        </Pressable>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0, zIndex: 1 }}
      >
        {snackbarMessage}
      </Snackbar>

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </KeyboardAvoidingView>
  );
};

export default AddRequestFood;
