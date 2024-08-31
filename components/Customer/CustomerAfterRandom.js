import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import DishHorizontal from "../CustomComponents/DishHorizontal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import Modal from "react-native-modal";
import { Divider, ScreenHeight, ScreenWidth } from "@rneui/base";
import api from "../Authorization/api";
import LottieView from "lottie-react-native";
import ErrModal from "../CustomComponents/ErrModal";
import { useTranslation } from "react-i18next";

const limit = 20;

const CustomerAfterRandom = ({ navigation, route }) => {
  // Get the height of the phone screen
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState("PRICE"); //PRICE, REVIEW

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const { t } = useTranslation();

  const [randomizedFood, setRandomizedFood] = useState(route.params.foodData);

  const getDishByFoodId = async () => {
    try {
      const filterStr = sortOption === "PRICE" ? "desc=PRICE" : "desc=REVIEW";
      const res = await api.get(
        `/dishes/foods/${randomizedFood.id}?status=ACTIVE&${filterStr}&limit=20&page=0`
      );
      const newData = res.data.data;

      setData(newData);
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

  const handleSortOption = (option) => {
    if (option != sortOption) {
      setSortOption(option);
      setModalVisible(false);
      setData([]);
      setCurrentPage(0);
      const init = async () => {
        try {
          const url = option == "PRICE"
            ? `/dishes/foods/${randomizedFood.id}?limit=${limit}&asc=PRICE&page=0`
            : `/dishes/foods/${randomizedFood.id}?limit=${limit}&desc=REVIEW&page=0`;
          const res = await api.get(url);
          const newData = res.data.data;

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          setData(newData);
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
    }
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(0);
      getDishByFoodId();
    }, [])
  );


  const filter = sortOption == "PRICE" ? `asc=PRICE` : `desc=REVIEW`;

  // Dish pagination
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(
            `/dishes/foods/${randomizedFood.id}?limit=${limit}&${filter}&page=${currentPage}`
          );
          const newData = res.data.data;
          setHasMoreData(newData.length > 0);
          setIsFetching(false);

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

      if (currentPage >= 1) init();
    }, [currentPage])
  );

  const handleScroll = () => {
    if (!isFetching && hasMoreData) {
      setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
    }
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

  return (
    <View style={{ backgroundColor: "#FFFFFF", flex: 1 }}>
      {/* Header Image */}
      <View>
        <Image
          source={{
            uri: randomizedFood.image,
          }}
          style={{ height: ScreenHeight * 0.3 }}
        />

        <Text
          style={{
            position: "absolute",
            bottom: "4%",
            left: "1%",
            color: "white",
            backgroundColor: "#FB6562",
            fontSize: 20,
            borderRadius: 4,
            paddingHorizontal: 10,
            paddingVertical: 4,
            fontWeight: "600",
          }}
        >
          {randomizedFood.name}
        </Text>
      </View>

      {/* Danh sách quán ăn gợi ý */}
      <Text
        style={{
          fontSize: 23,
          color: "#FB6562",
          paddingLeft: 10,
          paddingTop: 10,
          fontWeight: "500",
        }}
      >
        {t("suggest-restaurant")}
      </Text>

      {/* Filter Sort */}
      <View
        style={{
          paddingHorizontal: 12,
          rowGap: 10,
          marginVertical: 10,
          flexDirection: "column",
        }}
      >
        <View style={{ alignItems: "flex-start" }}>
          <SortModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            sortOption={sortOption}
            handleSortOption={handleSortOption}
            disabled={data.length == 0}
          />
        </View>
      </View>

      {data.length == 0 && (
        <View
          style={{
            flex: 1,
            height: ScreenHeight / 2.5,
          }}
        >
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
            <Text
              style={{
                fontSize: 18,
                width: ScreenWidth / 1.5,
                textAlign: "center",
              }}
            >
              {t("empty-data")}
            </Text>
          </View>
        </View>
      )}

      {/* Restaurant list */}
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() =>
              navigation.navigate("CustomerDishDetail", item)
            }
          >
            <DishHorizontal {...item} />
            {index < data.length - 1 && (
              <Divider style={{ marginVertical: 14 }} />
            )}
          </Pressable>
        )}
        onEndReached={handleScroll}
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
};

export default CustomerAfterRandom;

const SortModal = ({
  modalVisible,
  setModalVisible,
  sortOption,
  handleSortOption,
  disabled,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <Pressable
        style={[
          styles.sortButton,
          {
            backgroundColor: disabled ? "#cccccc" : "#FB6562",
            borderColor: disabled ? "#999999" : "#FB6562",
          },
        ]}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={styles.sortButtonText}>
          {sortOption == "PRICE" ? t("lowest-price") : t("highest-rating")}
        </Text>
        <Icon name="chevron-down" size={24} color="white" />
      </Pressable>

      {/* choose Giá thấp nhất/ Đánh giá cao nhất */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
        useNativeDriverForBackdrop
        swipeDirection={"down"}
        propagateSwipe={true}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
      >
        <View>
          <View style={styles.modalContent}>
            {/* Thanh hồng trên cùng */}
            <View
              style={{
                alignItems: "center",
                padding: 12,
              }}
            >
              <View
                style={{
                  width: ScreenWidth / 7,
                  height: ScreenHeight / 100,
                  backgroundColor: "#FB6562",
                  borderRadius: 30,
                }}
              />
            </View>

            {/* Lọc theo */}
            <View style={[styles.modalOption]}>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>{t("sort-by")}</Text>
            </View>

            {/* Giá thấp nhất */}
            <Pressable
              style={styles.modalOption}
              onPress={() => handleSortOption("PRICE")}
            >
              <Text style={styles.modalOptionText}>{t("lowest-price")}</Text>
              {sortOption === "PRICE" ? (
                <Icon name="check-circle" size={24} color="#FB6562" />
              ) : (
                <Icon
                  name="checkbox-blank-circle-outline"
                  size={24}
                  color="#FB6562"
                />
              )}
            </Pressable>

            {/* Đánh giá cao nhất */}
            <Pressable
              style={styles.modalOption}
              onPress={() => handleSortOption("REVIEW")}
            >
              <Text style={styles.modalOptionText}>{t("highest-rating")}</Text>
              {sortOption === "REVIEW" ? (
                <Icon name="check-circle" size={24} color="#FB6562" />
              ) : (
                <Icon
                  name="checkbox-blank-circle-outline"
                  size={24}
                  color="#FB6562"
                />
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderRadius: 20,
  },
  sortButtonText: {
    fontWeight: "bold",
    fontSize: 17,
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
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
