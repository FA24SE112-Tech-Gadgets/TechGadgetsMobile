import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { Snackbar } from "react-native-paper";
import Modal from "react-native-modal";
import api from "../Authorization/api";
import { useFocusEffect } from "@react-navigation/native";
import useAuth from "../../utils/useAuth";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";

const RestaurantEditDish = ({ navigation }) => {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [dish, setDish] = useState({
    name: "",
    image: "",
    food: "",
    price: undefined,
    description: "",
  });
  const [foods, setFoods] = useState([]);
  const [currentImageBase64, setCurrentImageBase64] = useState(null);
  const [foodModalVisible, setFoodModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBounceString] = useDebounce(searchQuery, 1000);

  const [isFetching, setIsFetching] = useState(false);

  const { t } = useTranslation();

  const scrollViewRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(0);

  const { user } = useAuth();

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
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

  // Search
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(0);

      const fetchItems = async () => {
        try {
          const res = await api.get(
            `/foods?page=0&name=${searchBounceString}&status=ACTIVE&limit=10`
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

  // Pagination
  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          const res = await api.get(
            `/foods?page=${currentPage}&name=${searchBounceString}&status=ACTIVE&limit=10`
          );
          const newData = res.data.data;

          if (newData.length == 0) {
            // No more data to fetch
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

  // const handleScroll = ({ nativeEvent }) => {
  //   const { contentOffset, contentSize } = nativeEvent;
  //   const reachedEnd = contentOffset.y >= contentSize.height - ScreenHeight;
  //   if (reachedEnd) {
  //     setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
  //   }
  // };
  const handleScroll = () => {
    if (!isFetching) {
      setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
    }
  };

  const handleChangeData = (fieldName, data) => {
    setDish((prev) => ({
      ...prev,
      [fieldName]: data,
    }));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
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
    return dish.food.name == food.name;
  };

  const handleModalPress = () => {
    setFoodModalVisible(true);
  };

  const handleSelectFood = (food) => {
    handleChangeData("food", food);
    setFoodModalVisible(false);
  };

  const handleAddDish = async () => {
    if (dish.name == "") {
      setIsError(true);
      return setStringErr(t("dish-name-empty"));
    }
    if (dish.image == "") {
      setIsError(true);
      return setStringErr(t("select-img"));
    }
    if (dish.food == "") {
      setIsError(true);
      return setStringErr(t("select-food"));
    }
    if (dish.price == undefined) {
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
      restaurantId: user.idRestaurant,
    };

    const url = `/dishes`;
    try {
      setIsFetching(true);
      await api.post(url, dishReq);
      setIsFetching(false);
      setSnackbarVisible(true);
      setSnackbarMessage(t("add-dish-success"));
      await delay(1500);
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
        <Text
          style={{
            marginTop: 12,
            fontSize: 24,
            fontWeight: "bold",
            paddingHorizontal: 20,
            marginBottom: 10,
          }}
        >
          {t("add-dish")}
        </Text>
        <ScrollView
          style={{}}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          {/* Tên món ăn */}
          <View style={{ paddingHorizontal: 16, rowGap: 2 }}>
            <Text style={{ fontSize: ScreenWidth / 25 }}>{t("dish-name")}</Text>
            <TextInput
              style={{
                borderColor: "#B7B7B7",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              value={dish.name}
              onChangeText={(value) => handleChangeData("name", value)}
            />
          </View>

          {/* Hình ảnh */}
          <View
            style={{
              paddingHorizontal: 16,
              rowGap: 2,
              marginTop: 18,
              flexDirection: "row",
              alignItems: "center",
              columnGap: 6,
            }}
          >
            <Text style={{ fontSize: ScreenWidth / 25 }}>{t("dish-img")}</Text>
            {!dish.image?.uri && (
              <Pressable onPress={pickImage}>
                <Icon name="add-circle" type="ionicon" color={"#FB6562"} size={ScreenWidth / 15} />
              </Pressable>
            )}
          </View>

          {dish.image?.uri && (
            <TouchableOpacity onPress={pickImage} style={{ marginTop: 18 }}>
              <Image
                source={{ uri: dish.image.uri }}
                style={{
                  width: ScreenWidth,
                  height: ScreenHeight * 0.3,
                  backgroundColor: "black",
                }}
              />
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
                <Icon type="feather" name="edit-2" size={ScreenWidth / 20} color={"white"} />
              </View>
            </TouchableOpacity>
          )}

          {/* Loại món ăn */}
          <View style={{ paddingHorizontal: 16, marginTop: 18, rowGap: 2 }}>
            <Text style={{ fontSize: ScreenWidth / 25 }}>{t("food-type")}</Text>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                borderRadius: 4,
                borderWidth: 0.8,
                paddingVertical: 1,
                borderColor: "#B7B7B7",
              }}
              onPress={handleModalPress}
            >
              <Text>{dish.food.name}</Text>
              <Icon
                type="material-community"
                name="chevron-down"
                color={"#FB6562"}
              />
            </Pressable>
          </View>

          {/* Giá */}
          <View style={{ paddingHorizontal: 16, rowGap: 2, marginTop: 12 }}>
            <Text style={{ fontSize: ScreenWidth / 25 }}>{t("dish-price")}</Text>
            <TextInput
              style={{
                borderColor: "#B7B7B7",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
              }}
              value={dish.price}
              onChangeText={(value) => handleChangeData("price", value)}
              keyboardType="numeric"
            />
          </View>

          {/* Mô tả */}
          <View style={{ paddingHorizontal: 16, rowGap: 2, marginTop: 12 }}>
            <Text style={{ fontSize: ScreenWidth / 25 }}>{t("register-description")}</Text>
            <TextInput
              style={{
                borderColor: "#B7B7B7",
                borderWidth: 1,
                borderRadius: 5,
                paddingHorizontal: 10,
                paddingVertical: 10,
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
              justifyContent: "center",
              columnGap: 12,
              paddingHorizontal: 16,
              marginTop: 20,
              marginBottom: 10,
            }}
          >
            <Pressable
              style={{
                width: ScreenWidth / 2.25,
                borderWidth: 1,
                borderColor: "#FB6562",
                borderRadius: 4,
                alignItems: "center",
                paddingVertical: 5,
              }}
              onPress={navigation.goBack}
            >
              <Text style={{ color: "#FB6562", fontSize: 15 }}>{t("dish-cancel")}</Text>
            </Pressable>
            <Pressable
              style={{
                width: ScreenWidth / 2.25,
                backgroundColor: "#FB6562",
                alignItems: "center",
                borderRadius: 4,
                paddingVertical: 5,
                flexDirection: "row",
                justifyContent: "center",
                gap: 5
              }}
              onPress={handleAddDish}
              disabled={isFetching}
            >
              <Text style={{ color: "white", fontSize: 15 }}>{t("dish-add-btn")}</Text>
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

      <SelectModalV2
        foodModalVisible={foodModalVisible}
        handleCloseFoodModal={handleCloseFoodModal}
        foods={foods}
        isFoodSelected={isFoodSelected}
        handleSelectFood={handleSelectFood}
        handleScroll={handleScroll}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        scrollViewRef={scrollViewRef}
        renderFooter={renderFooter}
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

const SelectModalV2 = ({
  foodModalVisible,
  handleCloseFoodModal,
  foods,
  isFoodSelected,
  handleSelectFood,
  handleScroll,
  searchQuery,
  setSearchQuery,
  scrollViewRef,
  renderFooter
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
      <View style={{
        height: ScreenHeight * 0.58,
        backgroundColor: "white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}>
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

          {
            foods.length == 0 &&
            <Text
              style={{
                fontSize: 15,
                fontWeight: "500",
                color: "black",
                paddingHorizontal: 12,
              }}
            >
              {t("no-data")}
            </Text>
          }

          <FlatList
            data={foods}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={{
                  backgroundColor: isFoodSelected(item) ? "#FBACAA" : null,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                }}
                onPress={() => handleSelectFood(item)}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: isFoodSelected(item) ? "white" : "black",
                  }}
                >
                  {item.name}
                </Text>
              </Pressable>
            )}
            onEndReached={handleScroll}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            initialNumToRender={10}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
          />
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
