import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { Snackbar } from "react-native-paper";
import Modal from "react-native-modal";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";

const RestaurantEditDish = ({ navigation, route }) => {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [dish, setDish] = useState("");
  const [foods, setFoods] = useState([]);

  const [currentImageBase64, setCurrentImageBase64] = useState(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBounceString] = useDebounce(searchQuery, 1000);

  const [isFetching, setIsFetching] = useState(false);

  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const { t } = useTranslation();

  const id = route.params;

  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, contentSize } = nativeEvent;
    const reachedEnd = contentOffset.y >= contentSize.height - screenHeight;
    if (reachedEnd) {
      setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  // Search food type
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(0);

      const fetchItems = async () => {
        try {
          const res = await api.get(
            `/foods?page=0&name=${searchBounceString}&status=ACTIVE&limit=10&offset=0`
          );
          const newData = res.data.data;

          setFoods(newData);
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
      scrollToTop();
      fetchItems();
    }, [searchBounceString])
  );

  //Fetch food pagination
  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          const res = await api.get(
            `/foods?page=${currentPage}&name=${searchBounceString}&status=ACTIVE&limit=10&offset=0`
          );
          const newData = res.data.data;

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          setFoods((prevArray) => [...prevArray, ...newData]);
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
      if (currentPage >= 1) fetchItems();
    }, [currentPage])
  );

  //Fetch dish detail
  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get(`/dishes/${id}`);
        const curDish = {
          name: res.data.name,
          image: res.data.image,
          description: res.data.description,
          price: String(res.data.price.amount),
          food: {
            id: res.data.food.id,
            name: res.data.food.name,
          },
        };
        setDish(curDish);
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

    init();
  }, []);

  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;

  const handleChangeData = (fieldName, data) => {
    setDish((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      const fileSizeInMB = result.assets[0].filesize / (1024 * 1024);
      const fileExtension = result.assets[0].uri.split(".").pop();

      if (fileSizeInMB <= 3) {
        const strBase64 =
          `data:image/${fileExtension};base64,` + result.assets[0].base64;
        setCurrentImageBase64(strBase64);
        handleChangeData("image", result.assets[0]);
      } else {
        setIsError(true);
        setStringErr(t("img-oversize"));
      }
    }
  };

  const handleCloseFoodModal = () => {
    setFoodModalVisible(false);
  };

  const isFoodSelected = (food) => {
    return dish.food?.name == food.name;
  };

  const handleModalPress = () => {
    setFoodModalVisible(true);
  };

  const handleSelectFood = (food) => {
    handleChangeData("food", food);
    handleCloseFoodModal();
  };

  const handleEditDish = async () => {
    if (dish.name == "") {
      setIsError(true);
      return setStringErr(t("dish-name-empty"));
    }
    if (dish.price == "") {
      setIsError(true);
      return setStringErr(t("empty-price"));
    }
    if (isNaN(dish.price)) {
      setIsError(true);
      return setStringErr(t("invalid-price"));
    }
    if (dish.description == "") {
      setIsError(true);
      return setStringErr(t("empty-description"));
    }

    const dishReq = {
      name: dish.name,
      description: dish.description,
      price: { amount: dish.price },
      foodId: dish.food.id,
      image: currentImageBase64,
    };

    const url = `/dishes/${id}`;

    try {
      setIsFetching(true);
      const res = await api.patch(url, dishReq);
      setIsFetching(false);
      setSnackbarVisible(true);
      setSnackbarMessage(t("update-dish-success"));
      await delay(700);
      navigation.goBack();
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
      <View style={{ flex: 1, backgroundColor: "white" }}>
        {/* Title */}
        <Text
          style={{
            marginTop: 12,
            fontSize: 24,
            fontWeight: "bold",
            paddingHorizontal: 20,
            marginBottom: 10,
          }}
        >
          {t("edit-dish")}
        </Text>

        <ScrollView
          style={{}}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* Tên món ăn */}
          <View style={{ paddingHorizontal: 16, rowGap: 2 }}>
            <Text style={{ fontSize: 17 }}>{t("dish-name")}</Text>
            <TextInput
              style={{
                borderColor: "grey",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                fontSize: 16
              }}
              value={dish.name}
              onChangeText={(value) => handleChangeData("name", value)}
            />
          </View>

          {/* Hình ảnh */}
          <TouchableOpacity onPress={pickImage} style={{ marginTop: 18 }}>
            {
              dish?.image &&
              <Image
                source={{ uri: dish.image?.uri ? dish.image?.uri : dish.image }}
                style={{
                  width: screenWidth,
                  height: screenHeight * 0.3,
                  backgroundColor: "black",
                }}
              />
            }
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "#FB6562",
                padding: 5,
                borderRadius: 5,
              }}
            >
              <Icon type="feather" name="edit-2" size={20} color={"white"} />
            </View>
          </TouchableOpacity>

          {/* Loại món ăn */}
          <View style={{ paddingHorizontal: 16, marginTop: 18, rowGap: 2 }}>
            <Text style={{ fontSize: 17 }}>{t("food-type")}</Text>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                borderRadius: 4,
                borderWidth: 0.8,
                paddingVertical: 1,
              }}
              onPress={handleModalPress}
            >
              <Text style={{ fontSize: 16 }}>{dish.food?.name}</Text>
              <Icon
                type="material-community"
                name="chevron-down"
                color={"#FB6562"}
              />
            </Pressable>
          </View>

          {/* Giá */}
          <View style={{ paddingHorizontal: 16, rowGap: 2, marginTop: 12 }}>
            <Text style={{ fontSize: 17 }}>{t("dish-price")}</Text>
            <TextInput
              style={{
                borderColor: "grey",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                fontSize: 16
              }}
              value={dish?.price}
              onChangeText={(value) => handleChangeData("price", value)}
              keyboardType="numeric"
            />
          </View>

          {/* Mô tả */}
          <View style={{ paddingHorizontal: 16, rowGap: 2, marginTop: 12 }}>
            <Text style={{ fontSize: 17 }}>{t("register-description")}</Text>
            <TextInput
              style={{
                borderColor: "grey",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 6,
                fontSize: 16
              }}
              value={dish.description}
              onChangeText={(value) => handleChangeData("description", value)}
              multiline={true} // Allow multiple lines
              numberOfLines={5} // Set initial number of lines
              textAlignVertical="top"
            />
          </View>

          {/* Huỷ và xác nhận */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              columnGap: 12,
              paddingHorizontal: 16,
              marginTop: 20,
              marginBottom: 10
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
                width: ScreenWidth / 2.3,
                height: 35,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={navigation.goBack}
            >
              <Text style={{ fontWeight: "bold", color: "#FB6562" }}>{t("dish-cancel")}</Text>
            </Pressable>
            <Pressable
              style={{
                backgroundColor: "#FB6562",
                paddingHorizontal: 15,
                paddingVertical: 5,
                borderRadius: 10,
                width: ScreenWidth / 2.3,
                height: 35,
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                flexDirection: "row"
              }}
              onPress={handleEditDish}
              disabled={isFetching}
            >
              <Text style={{ fontWeight: "bold", color: "white" }}>{t("confirm-txt")}</Text>
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
        wrapperStyle={{ bottom: 0, zIndex: 1 }}
      >
        {snackbarMessage}
      </Snackbar>

      <SelectionModal
        foodModalVisible={foodModalVisible}
        handleCloseFoodModal={handleCloseFoodModal}
        foods={foods}
        isFoodSelected={isFoodSelected}
        handleSelectFood={handleSelectFood}
        handleScroll={handleScroll}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollViewRef={scrollViewRef}
      />
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </KeyboardAvoidingView>
  );
};

export default RestaurantEditDish;
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

const SelectionModal = ({
  foodModalVisible,
  handleCloseFoodModal,
  foods,
  isFoodSelected,
  handleSelectFood,
  handleScroll,
  searchQuery,
  setSearchQuery,
  scrollViewRef,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={foodModalVisible}
      onBackdropPress={handleCloseFoodModal}
      onSwipeComplete={handleCloseFoodModal}
      useNativeDriverForBackdrop
      swipeDirection={"down"}
      propagateSwipe={true}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      <View style={{ height: ScreenHeight * 0.58 }}>
        <View style={styles.modalContent}>
          <View
            style={{
              alignItems: "center",
              paddingBottom: 20,
            }}
          >
            <View
              style={{
                width: ScreenWidth / 7,
                height: ScreenHeight / 100,
                backgroundColor: "#FFBBBA",
                borderRadius: 30,
              }}
            />
          </View>

          <View style={{ marginHorizontal: 14, marginBottom: 10 }}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#F1F3F4",
                alignItems: "center",
                paddingHorizontal: 8,
                paddingVertical: 4,
                columnGap: 12,
                borderRadius: 6,
              }}
            >
              <Icon
                type="font-awesome"
                name="search"
                size={20}
                color={"#FBACAA"}
              />
              <TextInput
                style={{ flex: 1, fontSize: 15, fontWeight: "500" }}
                placeholder={t("search-filter")}
                returnKeyType="search"
                value={searchQuery}
                onChangeText={(query) => setSearchQuery(query)}
              />
            </View>
          </View>

          <ScrollView
            onScroll={handleScroll}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            ref={scrollViewRef}
          >
            {/* <TouchableOpacity activeOpacity={1}> */}
            <View
              style={
                {
                  // marginBottom: 20,
                }
              }
            >
              {foods.map((food, index) => (
                <Pressable
                  key={index}
                  style={{
                    backgroundColor: isFoodSelected(food) ? "#FBACAA" : null,
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                  }}
                  onPress={() => handleSelectFood(food)}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: isFoodSelected(food) ? "white" : "black",
                    }}
                  >
                    {food.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            {/* </TouchableOpacity> */}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderColor: "#FB6562",
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: "#FB6562",
  },
  sortButtonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
