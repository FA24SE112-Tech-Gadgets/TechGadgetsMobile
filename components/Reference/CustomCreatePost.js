import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  Pressable,
  Dimensions,
  FlatList,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import Octicons from "react-native-vector-icons/Octicons";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { IconButton, Snackbar } from "react-native-paper";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import useAuth from "../../utils/useAuth";
import api from "../Authorization/api";
import ErrModal from "../CustomComponents/ErrModal";
import { useTranslation } from "react-i18next";
import ImageCreateSlider from "../CustomComponents/ImageCreateSlider";
import { useFocusEffect } from "@react-navigation/native";

export default function CustomCreatePost({ navigation }) {
  const [post, setPost] = useState({
    content: "",
  });

  const [isFetching, setIsFetching] = useState(false);
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [images, setImages] = useState([]);
  const [imagesBase64, setImagesBase64] = useState([]);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { user } = useAuth();

  const { t } = useTranslation();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
      base64: true,
    });
    if (!result.canceled) {
      const fileSizeInMB = result.assets[0].filesize / (1024 * 1024);
      // result.assets[0].filesize: Đây là kích thước của tệp tin, được biểu diễn dưới dạng số bytes.
      // 1024: Đây là số byte trong một kilobyte (KB).
      // 1024 * 1024: Đây là số byte trong một megabyte (MB).

      if (fileSizeInMB <= 3) {
        if (images.length < 3) {
          setImagesBase64((prevArray) => [
            ...prevArray,
            result.assets[0].base64,
          ]);
          const fileExtension = result.assets[0].uri.split(".").pop();
          const strBase64 =
            `data:image/${fileExtension};base64,` + result.assets[0].base64;
          setImages((prevArray) => [...prevArray, {
            image: strBase64,
            caption: "No caption",
            imageUrl: result.assets[0].uri,
            height: result.assets[0].height,
            width: result.assets[0].width,
          }]);
        } else {
          setIsError(true);
          setStringErr(t("choose-img-err"));
        }
      } else {
        setIsError(true);
        setStringErr(t("img-oversize"));
      }
    }
  };

  const handleRemoveImage = (imageRemove, imageRemoveBase64) => {
    const updatedArray = images.filter((item) => item.imageUrl !== imageRemove.imageUrl);
    setImages(updatedArray);

    const updatedBase64Array = imagesBase64.filter(
      (item) => item !== imageRemoveBase64
    );
    setImagesBase64(updatedBase64Array);
  };

  const renderDots = (arrImg, index) => {
    const dots = [];
    for (let i = 0; i < arrImg.length; i++) {
      if (i == index) {
        dots.push(
          <Octicons
            key={i}
            name="dot-fill"
            size={20}
            color={"#ed8900"}
            style={{ marginRight: 10 }}
          />
        );
      } else {
        dots.push(
          <Octicons
            key={i}
            name="dot-fill"
            size={20}
            color={"#D9D9D9"}
            style={{ marginRight: 10 }}
          />
        );
      }
    }
    return dots;
  };

  const isNumberHorizontal = (numberHorizontal) => {
    let horizonalImageCount = 0;

    for (const image of images) {
      if (image.height <= image.width) {
        horizonalImageCount++;
      }
    }

    return horizonalImageCount === numberHorizontal;
  };

  const isNumberVertical = (numberVertical) => {
    let portraitImageCount = 0;

    for (const image of images) {
      if (image.height > image.width) {
        portraitImageCount++;
      }
    }

    return portraitImageCount === numberVertical;
  };

  const showError = (message) => {
    ToastAndroid.show(message, ToastAndroid.CENTER);
  };

  const handleChangeData = (fieldName, data) => {
    setPost((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const handleCreatePost = async () => {
    if (images.length === 0) {
      setIsError(true);
      setStringErr(t("at-least-one-img"));
    } else {
      const isErr = await apiPost();
      if (!isErr) {
        setSnackbarVisible(true);
        setSnackbarMessage(t("create-post-success"));
        await delay(1500);
        navigation.goBack();
      }
    }
  };

  async function apiPost() {
    let isErr = true
    try {
      const reqBody = {
        content: post.content,
        images: images,
        // images: convertToImageObjects(images)
      }
      setIsFetching(true);
      const res = await api.post(`/posts`, reqBody);
      setIsFetching(false);
      if (res.status >= 200 && res.status < 300) {
        isErr = false;
      } else {
        isErr = true;
      }
      return isErr;
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("network-error")
      );
      isErr = true;
      return isErr;
    }
  }

  //Set to default
  useFocusEffect(
    useCallback(() => {
      setPost({
        content: ""
      });
      setImages([]);
      setImagesBase64([]);
    }, [])
  );

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
          backgroundColor: "white",
        }}
      >
        <ScrollView
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              marginTop: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
              }}
            >
              {/* Avatar */}
              {user.imageUrl ? (
                <Image
                  source={{
                    uri: user.imageUrl,
                  }}
                  style={{
                    height: ScreenWidth / 10,
                    width: ScreenWidth / 10,
                    backgroundColor: "black",
                    borderRadius: 30,
                  }}
                />
              ) : (
                <View
                  style={{
                    height: ScreenWidth / 10,
                    width: ScreenWidth / 10,
                    borderRadius: 30,
                    backgroundColor: "#FEC6C4",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: ScreenWidth / 18, fontWeight: "bold", color: "white" }}
                  >
                    {user.fullName.charAt(0)}
                  </Text>
                </View>
              )}

              {/* pickImage */}
              <View style={{ rowGap: 3 }}>
                <Text style={{ fontSize: ScreenWidth / 27, fontWeight: "500" }}>{user.fullName}</Text>
                <Pressable
                  style={{
                    width: ScreenWidth / 4,
                    height: ScreenHeight / 30,
                    flexDirection: "row",
                    padding: 2,
                    backgroundColor: "#FDC1BF",
                    borderRadius: 5,
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                  onPress={pickImage}
                >
                  <Entypo name="plus" size={ScreenWidth / 20} color={"#ed8900"} />
                  <Text style={{ color: "#ed8900", fontSize: ScreenWidth / 25 }}>{t("img")}</Text>
                  <Feather name="image" size={ScreenWidth / 20} color={"#ed8900"} />
                </Pressable>
              </View>
            </View>

            {/* Đăng */}
            <View style={{
              justifyContent: "center",
            }}>
              <Pressable
                style={{
                  borderColor: "#ed8900",
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingVertical: 1,
                  paddingHorizontal: 10,
                  justifyContent: "center",
                  height: ScreenHeight / 25,
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center"
                }}
                onPress={() => {
                  handleCreatePost();
                }}
                disabled={isFetching}
              >
                <Text style={{ fontSize: ScreenWidth / 28, color: "#ed8900", fontWeight: "500" }}>{t("post-btn")}</Text>
                {
                  isFetching &&
                  <ActivityIndicator color={"#ed8900"} />
                }
              </Pressable>
            </View>
          </View>

          {/* Content */}
          <View
            style={{
              marginVertical: 10,
              paddingHorizontal: 10,
            }}
          >
            <TextInput
              style={{
                borderColor: "#B7B7B7",
                borderWidth: 1,
                borderRadius: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                textAlignVertical: "top",
                fontSize: 18,
              }}
              placeholder={t("post-input")}
              value={post.content}
              onChangeText={(value) => {
                handleChangeData("content", value);
              }}
              multiline={true} // Allow multiple lines
              numberOfLines={10} // Set initial number of lines
            />
          </View>

          {/* Image */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 5,
              marginBottom: 10,
            }}
          >
            <ImageCreateSlider list={images} handleRemoveImage={handleRemoveImage} />
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
}
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
//               <Text style={{ fontWeight: "bold", color: "#ed8900" }}>OK</Text>
//             </Pressable>
//           </View>
//         </View>
//       </ModalContent>
//     </Modal>
//   );
// };
