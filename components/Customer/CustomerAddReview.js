import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Icon, ScreenWidth } from "@rneui/base";
import { Snackbar } from "react-native-paper";
import api from "../Authorization/api";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";

const CustomerAddReview = ({ navigation, route }) => {
  const [review, setReview] = useState({
    feedback: "",
    stars: 1,
  });

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const dishId = route.params;

  const [maxStars] = useState(5);

  const [errors, setErrors] = useState({
    feedback: false,
    stars: false,
  });
  const [errorsString, setErrorsString] = useState({
    feedback: "",
    stars: "",
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { t } = useTranslation();

  const RatingStars = () => {
    const starColor = (index) => {
      if (review.stars >= index) {
        return "#FFC805"; // Yellow
      } else {
        return "#D3D3D3"; // Gray
      }
    };

    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {Array.from({ length: maxStars }, (_, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={() => handleChangeData("stars", index + 1)}
          >
            <Icon
              type="font-awesome"
              name="star"
              size={20}
              color={starColor(index + 1)}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleChangeData = (fieldName, data) => {
    setReview((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  const saveChanges = async () => {
    if (review.feedback == "") {
      setIsError(true);
      return setStringErr(t("empty-review"));
    }

    const reviewReq = {
      feedback: review.feedback,
      stars: review.stars,
    };

    const url = `/dishes/${dishId}/reviews`;

    try {
      setIsFetching(true);
      await api.post(url, reviewReq);
      setIsFetching(false);
      setSnackbarVisible(true);
      setSnackbarMessage(t("add-rv-success"));
      await delay(700);
      navigation.goBack();
      setReview({
        feedback: "",
        stars: 1,
      });
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response.data.reasons[0]?.message
          ? error.response.data.reasons[0]?.message
          : t("network-error")
      );
    }
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: "white",
        }}
      >
        <ScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={{ marginVertical: 10 }} />
          <Text style={{ fontSize: 26, fontWeight: "bold" }}>
            {t("add-rating")}
          </Text>

          <View style={{ marginVertical: 10 }} />

          {/* Đánh giá */}
          <View
            style={{
              flexDirection: "row",
              columnGap: 10,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>{t("rating")}</Text>
            <RatingStars />
          </View>

          {/* Nhận xét */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  errors.feedback ? styles.inputError : null,
                  {
                    fontSize: 16
                  }
                ]}
                placeholder={t("review")}
                value={review.feedback}
                onChangeText={(value) => handleChangeData("feedback", value)}
                multiline={true} // Allow multiple lines
                numberOfLines={5} // Set initial number of lines
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Show Error */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              {errors.feedback && (
                <Text style={[styles.textError]}>{errorsString.feedback}</Text>
              )}
            </View>
          </View>

          {/* Feedback button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              columnGap: 10,
              marginHorizontal: 20,
              marginVertical: 10,
            }}
          >
            {/* Cancel button */}
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

            {/* Send button */}
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
              onPress={saveChanges}
              disabled={isFetching}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>{t("create-review-btn")}</Text>
              {
                isFetching &&
                <ActivityIndicator color={"white"} />
              }
            </Pressable>
          </View>
        </ScrollView>
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0 }}
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

export default CustomerAddReview;
//   return (
//     <Modal visible={isError} onTouchOutside={() => setIsError(false)}>
//       <ModalContent>
//         <View style={{ rowGap: 20, width: ScreenWidth * 0.7 }}>
//           <Text style={{ fontSize: 15 }}>{stringErr}</Text>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "flex-end",
//               columnGap: 12,
//             }}
//           >
//             <Pressable onPress={() => setIsError(false)}>
//               <Text style={{ fontWeight: "bold", color: "#FB6562" }}>OK</Text>
//             </Pressable>
//           </View>
//         </View>
//       </ModalContent>
//     </Modal>
//   );
// };

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 5,
  },
  inputWrapper: {
    flex: 1,
  },
  input: {
    borderColor: "#B7B7B7",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 10,
  },
  filterWrapper: {
    flex: 1,
    position: "relative",
  },
  inputFilter: {
    borderColor: "grey",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
  },
  iconFilterContainer: {
    position: "absolute",
    right: 10,
    top: 5,
  },
  showItem: {
    position: "absolute",
    bottom: -100,
    backgroundColor: "#FEECE2",
    flex: 1,
    width: "100%",
    height: 100,
    borderRadius: 20,
  },
  item: {
    height: 50,
    justifyContent: "center",
    borderColor: "black",
  },
  inputError: {
    borderColor: "red", // Change border color to red for invalid input
  },
  textError: {
    color: "red", // Change border color to red for invalid input
    fontSize: 12,
    paddingLeft: 10,
  },
  saveButton: {
    flex: 0.4,
    backgroundColor: "#FB6562",
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  cancelButton: {
    flex: 0.4,
    backgroundColor: "#CDC8C5",
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    alignItems: "center",
    textAlignVertical: "center",
  },
  dateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dateInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    minWidth: 200,
    alignItems: "center",
  },
});
