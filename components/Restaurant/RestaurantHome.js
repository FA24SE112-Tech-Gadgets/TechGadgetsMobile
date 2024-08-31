import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { useFocusEffect } from "@react-navigation/native";
import Modal from "react-native-modal";
import useAuth from "../../utils/useAuth";
import api from "../Authorization/api";
import RenderSubscription from "../CustomComponents/RenderSubscription";
import LottieView from "lottie-react-native";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import DishItem from "./DishItem";

export default function RestaurantHome({ navigation }) {
  const [openSubscription, setOpenSubscription] = useState(false);

  const [dishes, setDishes] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBounceString] = useDebounce(searchQuery, 1000);

  const [modalVisible, setModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState("PRICE");

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [isSearching, setIsSearching] = useState(false);

  const { t } = useTranslation();

  const {
    user,
    fetchSubscription,
  } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setDishes([]);
      setCurrentPage(0);
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
            `/dishes/restaurants/${user.idRestaurant}?name=${searchBounceString}&${filter}&page=${currentPage}&limit=10`
          );
          const newData = res.data.data;
          setHasMoreData(newData.length > 0);
          setIsFetching(false);

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          setDishes((prevArray) => [...prevArray, ...newData]);
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

  // Search food
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(0);

      if (searchBounceString === "") {
        setIsSearching(false);
      } else {
        setIsSearching(true);
      }

      const fetchItems = async () => {
        try {
          const res = await api.get(
            `/dishes/restaurants/${user.idRestaurant}?${filter}&name=${searchBounceString}&page=0&limit=10`
          );
          const newData = res.data.data;

          if (newData.length == 0) {
            setDishes([])
            return; // Stop the process if there is no more data
          }

          setDishes(newData);
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
      fetchItems();
    }, [searchBounceString])
  );

  const handleSortOption = (option) => {
    if (option != sortOption) {
      setSortOption(option);
      setModalVisible(false);
      setDishes([]);
      setCurrentPage(0);
      const init = async () => {
        try {
          const url =
            option == "PRICE"
              ? `/dishes/restaurants/${user.idRestaurant}?name=${searchBounceString}&asc=PRICE&page=0`
              : `/dishes/restaurants/${user.idRestaurant}?name=${searchBounceString}&desc=REVIEW&page=0`;
          const res = await api.get(url);
          const newData = res.data.data;

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          setDishes(newData);
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

  //Check payment
  useFocusEffect(
    useCallback(() => {
      const handleCheckSubscription = async () => {
        const isSubscription = await fetchSubscription("ACTIVE", 0, 1);
        if (isSubscription) {
          setOpenSubscription(false);
        } else {
          setOpenSubscription(true);
        }
      }
      handleCheckSubscription();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: 10 }}>
      <View style={{ paddingHorizontal: 16, position: "relative" }}>
        {/* Search bar */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#E9ECEE",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 4,
            columnGap: 12,
            borderRadius: 6,
            height: ScreenWidth / 9
          }}
        >
          <Icon type="font-awesome" name="search" size={23} color={"#FB6562"} />
          <TextInput
            placeholder={t("finding-dishes")}
            returnKeyType="search"
            style={{ fontSize: 20 }}
            value={searchQuery}
            onChangeText={(query) => setSearchQuery(query)}
          />
        </View>

        {/* Filter Sort */}
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <SortModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            sortOption={sortOption}
            handleSortOption={handleSortOption}
            disabled={dishes.length == 0}
          />
        </View>

        <View
          style={{
            height: ScreenHeight / 1.25,
          }}
        >
          {dishes.length === 0 ? (
            <View
              style={{
                flex: 1,
                height: ScreenHeight / 1.5,
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
                  {isSearching ? t("dish-not-found") : t("dont-have-dish")}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 20, marginTop: 16 }}>
              <FlatList
                data={dishes}
                keyExtractor={item => item.id}
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() =>
                      navigation.navigate("RestaurantDishDetail", item.id)
                    }
                  >
                    <DishItem
                      {...item}
                    />
                    {index < dishes.length - 1 && (
                      <Divider style={{ marginVertical: 14 }} />
                    )}
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
          )}
        </View>

      </View>
      <RenderSubscription
        openSubscription={openSubscription}
        setOpenSubscription={setOpenSubscription}
      />
    </View>
  );
}

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
        <Icon
          type="material-community"
          name="chevron-down"
          size={24}
          color="white"
        />
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
                paddingBottom: 12,
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
                <Icon
                  type="material-community"
                  name="check-circle"
                  size={24}
                  color="#FB6562"
                />
              ) : (
                <Icon
                  type="material-community"
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
                <Icon
                  type="material-community"
                  name="check-circle"
                  size={24}
                  color="#FB6562"
                />
              ) : (
                <Icon
                  type="material-community"
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
