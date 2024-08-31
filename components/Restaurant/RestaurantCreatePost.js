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
} from "react-native";
import React, { useRef, useState } from "react";
import Feather from "react-native-vector-icons/Feather";
import Entypo from "react-native-vector-icons/Entypo";
import Octicons from "react-native-vector-icons/Octicons";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { Snackbar } from "react-native-paper";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import useAuth from "../../utils/useAuth";
import api from "../Authorization/api";
import ErrModal from "../CustomComponents/ErrModal";

export default function RestaurantCreatePost({ navigation }) {
  const [post, setPost] = useState({
    content: "",
  });
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [images, setImages] = useState([]);
  const [imagesBase64, setImagesBase64] = useState([]);
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { user } = useAuth();

  const flatListRef = useRef(null);
  const scrollToSecondImg = () => {
    // Scroll tới phần tử cuối cùng của danh sách
    flatListRef.current.scrollToIndex({ animated: true, index: 1 });
  };

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
            uri: result.assets[0].uri,
            height: result.assets[0].height,
            width: result.assets[0].width,
          }]);
        } else {
          setIsError(true);
          setStringErr("Chọn tối đa 3 hình");
        }
      } else {
        setIsError(true);
        setStringErr("Kích thước hình ảnh phải bé hơn hoặc bằng 3Mb");
      }
    }
  };

  const handleRemoveImage = (imageRemove, imageRemoveBase64) => {
    const updatedArray = images.filter((item) => item.uri !== imageRemove.uri);
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
            color={"#FB6562"}
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
      setStringErr("Bài đăng cần ít nhất 1 tấm ảnh");
    } else {
      const isErr = await apiPost();
      if (!isErr) {
        setSnackbarVisible(true);
        setSnackbarMessage("Đăng bài thành công");
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
      const res = await api.post(`/posts`, reqBody);
      if (res.status >= 200 && res.status < 300) {
        isErr = false;
      } else {
        isErr = true;
      }
      return isErr;
    } catch (error) {
      setIsError(true);
      setStringErr(error.response.data.reasons[0].message);
      isErr = true;
      return isErr;
    }
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
              {user.image ? (
                <Image
                  source={{
                    uri: user.image,
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
                    width: 75,
                    flexDirection: "row",
                    padding: 2,
                    backgroundColor: "#FDC1BF",
                    borderRadius: 10,
                    gap: 2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={pickImage}
                >
                  <Entypo name="plus" size={18} color={"#FB6562"} />
                  <Text style={{ color: "#FB6562" }}>Ảnh</Text>
                  <Feather name="image" size={18} color={"#FB6562"} />
                </Pressable>
              </View>
            </View>

            {/* Đăng */}
            <View style={{
              justifyContent: "center",
            }}>
              <Pressable
                style={{
                  borderColor: "#FB6562",
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingVertical: 1,
                  paddingHorizontal: 5,
                  justifyContent: "center",
                  height: ScreenHeight / 25
                }}
                onPress={() => {
                  handleCreatePost();
                }}
              >
                <Text style={{ fontSize: ScreenWidth / 28, color: "#FB6562", fontWeight: "500" }}>Đăng</Text>
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
              placeholder="Bạn đang nghĩ gì?"
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
            {/* TH1: chỉ 1 hình dọc */}
            {images.length !== 0 &&
              isNumberVertical(1) &&
              !isNumberHorizontal(1) &&
              !isNumberHorizontal(2) &&
              images.map((item, index) => {
                if (item.width < item.height)
                  //doc
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 3.3,
                          width: screenWidth,
                          resizeMode: "contain",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}

            {/* TH2: 1 hình dọc và 1 hình ngang */}
            {images.length !== 0 &&
              isNumberVertical(1) &&
              isNumberHorizontal(1) &&
              images.map((item, index) => {
                if (item.width < item.height)
                  //doc
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 4.5,
                          width: screenWidth / 3.7,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}
            {images.length !== 0 &&
              isNumberVertical(1) &&
              isNumberHorizontal(1) &&
              images.map((item, index) => {
                if (item.width >= item.height)
                  //ngang - vuông
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 4.5,
                          width: screenWidth / 1.6,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}

            {/* TH3: 1 hình dọc và 2 hình ngang */}
            {images.length !== 0 &&
              isNumberVertical(1) &&
              isNumberHorizontal(2) &&
              images.map((item, index) => {
                if (item.width < item.height)
                  //doc
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                        borderColor: "#FB6562",
                        // borderWidth: 1,
                        // margin: 0.5,
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 2.7,
                          width: screenWidth / 2.7,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}
            {images.length !== 0 &&
              isNumberVertical(1) &&
              isNumberHorizontal(2) && (
                <View style={{ gap: 5 }}>
                  {images.length !== 0 &&
                    images.map((item, index) => {
                      if (item.width >= item.height)
                        //ngang - vuong
                        return (
                          <View
                            key={index}
                            style={{
                              position: "relative",
                              borderColor: "#FB6562",
                            }}
                          >
                            <Image
                              source={{
                                uri: item.uri,
                              }}
                              style={{
                                height: screenHeight / 2.7 / 2.05,
                                width: screenWidth / 1.7,
                                resizeMode: "cover",
                                backgroundColor: "black",
                              }}
                            />
                            <Pressable
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                              }}
                              onPress={() => {
                                handleRemoveImage(item, item.base64);
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  position: "absolute",
                                  top: 10,
                                  right: 10,
                                }}
                              >
                                <Ionicons
                                  name="remove-circle-outline"
                                  size={24}
                                  color={"#FB6562"}
                                />
                              </View>
                              <View
                                style={{
                                  flexDirection: "row",
                                  position: "absolute",
                                  top: 11,
                                  right: 11.5,
                                }}
                              >
                                <Ionicons
                                  name="remove-circle"
                                  size={21}
                                  color={"#FDC1BF"}
                                />
                              </View>
                            </Pressable>
                          </View>
                        );
                    })}
                </View>
              )}

            {/* TH4: 2 hình dọc và 1 hình ngang */}
            {images.length !== 0 &&
              isNumberVertical(2) &&
              isNumberHorizontal(1) &&
              images.map((item, index) => {
                if (item.width >= item.height)
                  //ngang - vuong
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 3.5,
                          width: screenWidth / 1.2,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}
            {images.length !== 0 &&
              isNumberVertical(2) &&
              isNumberHorizontal(1) &&
              images.map((item, index) => {
                if (item.width < item.height)
                  //doc
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 2.7,
                          width: screenWidth / 2.45,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}

            {/* TH5: 3 hình dọc */}
            {images.length !== 0 &&
              isNumberVertical(3) &&
              images.map((item, index) => {
                if (item.width < item.height)
                  //doc
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 3.3,
                          width: screenWidth / 3.1,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}

            {/* TH6: 2 hình dọc và 0 hình ngang */}
            {images.length !== 0 &&
              isNumberVertical(2) &&
              isNumberHorizontal(0) &&
              images.map((item, index) => {
                if (item.width < item.height)
                  //doc
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 2.4,
                          width: screenWidth / 2.1,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}

            {/* TH7: 1 hình ngang và 0 hình dọc */}
            {images.length !== 0 &&
              isNumberVertical(0) &&
              isNumberHorizontal(1) &&
              images.map((item, index) => {
                if (item.width >= item.height)
                  //ngang - vuong
                  return (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 3,
                          width: screenWidth / 1.02,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  );
              })}

            {/* TH8: 2-3 hình ngang và 0 hình dọc */}
            {images.length !== 0 &&
              isNumberVertical(0) &&
              (isNumberHorizontal(2) || isNumberHorizontal(3)) && (
                <FlatList
                  data={images}
                  horizontal={true}
                  ref={flatListRef}
                  renderItem={({ item, index }) => (
                    <View
                      key={index}
                      style={{
                        position: "relative",
                      }}
                    >
                      <Image
                        source={{
                          uri: item.uri,
                        }}
                        style={{
                          height: screenHeight / 3,
                          width: screenWidth,
                          resizeMode: "cover",
                          backgroundColor: "black",
                        }}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          position: "absolute",
                          bottom: 0,
                          left: screenWidth / 2.4,
                        }}
                      >
                        {renderDots(images, index)}
                      </View>
                      <Pressable
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                        }}
                        onPress={() => {
                          handleRemoveImage(item, item.base64);
                          if (index == 2) {
                            scrollToSecondImg();
                          }
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 10,
                            right: 10,
                          }}
                        >
                          <Ionicons
                            name="remove-circle-outline"
                            size={24}
                            color={"#FB6562"}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            position: "absolute",
                            top: 11,
                            right: 11.5,
                          }}
                        >
                          <Ionicons
                            name="remove-circle"
                            size={21}
                            color={"#FDC1BF"}
                          />
                        </View>
                      </Pressable>
                    </View>
                  )}
                />
              )}
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
