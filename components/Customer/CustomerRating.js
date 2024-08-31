import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import React, { useCallback, useState } from "react";
import RenderStars from "../CustomComponents/RenderStars";
import { Divider, FAB, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { useFocusEffect } from "@react-navigation/native";
import Modal from "react-native-modal";
import api from "../Authorization/api";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import i18next from "../../services/i18next"

const CustomerRating = ({ navigation, route }) => {
  const id = route.params;
  const [reviews, setReviews] = useState([]);

  const [isFetching, setIsFetching] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState("new");

  const [summary, setSummary] = useState("");
  const [numRating, setNumRating] = useState(0);
  const [numRatings, setNumRatings] = useState([]);

  const { t } = useTranslation();

  const url =
    sortOption == "new"
      ? `/dishes/${id}/reviews?desc=TIME&page=${currentPage}`
      : `/dishes/${id}/reviews?desc=STAR&page=${currentPage}`;

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

  // Fetch dish reviews summary
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(`/dishes/${id}/reviews/summary`);
          const newData = res.data;
          setHasMoreData(newData.length > 0);
          setIsFetching(false);

          setNumRating(newData.numOfReview);

          setNumRatings([
            {
              star: 5,
              number: newData.numOfFiveStar,
            },
            {
              star: 4,
              number: newData.numOfFourStar,
            },
            {
              star: 3,
              number: newData.numOfThreeStar,
            },
            {
              star: 2,
              number: newData.numOfTwoStar,
            },
            {
              star: 1,
              number: newData.numOfOneStar,
            },
          ]);

          setSummary(newData);
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
    }, [])
  );

  //Set back current state
  useFocusEffect(
    useCallback(() => {
      setReviews([]);
      setCurrentPage(0);
    }, [])
  );

  //Fetch review Sort
  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(url);
          setIsFetching(false);
          const newData = res.data.data;

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          setReviews((prevArray) => [...prevArray, ...newData]);
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
    }, [currentPage])
  );

  const handleSortOption = (option) => {
    if (option != sortOption) {
      setSortOption(option);
      setModalVisible(false);
      setReviews([]);
      setCurrentPage(0);
      if (currentPage == 0) {
        const init = async () => {
          try {
            const url =
              option == "new"
                ? `/dishes/${id}/reviews?desc=TIME&page=${currentPage}`
                : `/dishes/${id}/reviews?desc=STAR&page=${currentPage}`;
            const res = await api.get(url);
            const newData = res.data.data;

            if (newData.length == 0) {
              console.log("No more data to fetch");
              return; // Stop the process if there is no more data
            }

            setReviews(newData);
          } catch (error) {
            console.error(error);
          }
        };

        init();
      }
    }
  };

  const handleScroll = () => {
    if (!isFetching && hasMoreData) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  function formatCreatedAt(createdAtMillis) {
    // Convert the string to a number
    const createdAtMillisNumber = Number(createdAtMillis);

    // Create a new Date object from the milliseconds
    const createdAtDate = new Date(createdAtMillisNumber);

    // Get the year, month, date, hours, and minutes
    const year = createdAtDate.getFullYear();
    const month = createdAtDate.getMonth() + 1; // Months are zero-based
    const date = String(createdAtDate.getDate()).padStart(2, "0");
    const hours = String(createdAtDate.getHours()).padStart(2, "0");
    const minutes = String(createdAtDate.getMinutes()).padStart(2, "0");

    // Define an array of month abbreviations in Vietnamese
    const monthAbbreviationsVI = [
      "Th1",
      "Th2",
      "Th3",
      "Th4",
      "Th5",
      "Th6",
      "Th7",
      "Th8",
      "Th9",
      "Th10",
      "Th11",
      "Th12",
    ];

    const monthAbbreviationsEN = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    // VI
    const formattedDateTimeVI = `${date} ${monthAbbreviationsVI[month - 1]
      } ${year}, ${hours}:${minutes}`;
    //EN
    const formattedDateTimeEN = `${monthAbbreviationsEN[month - 1]
      } ${date}, ${year} - ${hours}:${minutes}`;

    if (i18next.language === "vi") {

      return formattedDateTimeVI;
    } else {
      return formattedDateTimeEN;
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: 10,
      }}
    >
      {/* Title */}
      <Text style={{ fontWeight: "bold", fontSize: 20, marginLeft: 12 }}>
        {t("rating-review")}
      </Text>

      {summary.numOfReview != 0 ? (
        <>
          <View style={{ paddingHorizontal: 12 }}>
            {/* Rating calculator */}
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <View style={{ width: "30%", alignItems: "center", rowGap: 2 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  {summary?.avgReview}
                </Text>
                <View style={{ flexDirection: "row", columnGap: -4 }}>
                  <RenderStars avgRating={summary?.avgReview} />
                </View>
                <Text
                  style={{ fontSize: 15, color: "#6B6B6B" }}
                >{`${summary?.numOfReview} ${t("feedback")}${(summary?.numOfReview > 1 && i18next.language !== "vi") ? "s" : ""}`}</Text>
              </View>
              <View
                style={{
                  width: 2,
                  height: "90%",
                  alignSelf: "center",
                  backgroundColor: "#EAEAEA",
                  marginLeft: "8%",
                  marginRight: "8%",
                }}
              ></View>
              <View style={{ width: "50%" }}>
                {numRatings.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text>{item.star}</Text>
                    <ProgressBar width={item.number / numRating} />
                  </View>
                ))}
              </View>
            </View>

            {/* Filter */}
            <View
              style={{
                flexDirection: "row",
                columnGap: 6,
                marginTop: 14,
                marginBottom: 8,
              }}
            >
              <FilterModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                sortOption={sortOption}
                handleSortOption={handleSortOption}
              />
            </View>
          </View>

          <View style={{
            marginBottom: 20,
            marginTop: 8
          }}>
            <FlatList
              contentContainerStyle={{
                paddingHorizontal: 18,
              }}
              data={reviews}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item, index }) => (
                <View style={{ rowGap: 5 }}>
                  <Pressable>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        columnGap: 8,
                        marginBottom: 4,
                      }}
                    >
                      {/* Avatar */}
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
                        {
                          item?.userResponse?.imageUrl ?
                            <Image
                              source={{
                                uri: item?.userResponse?.imageUrl,
                              }}
                              style={{
                                height: ScreenWidth / 11,
                                width: ScreenWidth / 11,
                                backgroundColor: "black",
                                borderRadius: 30,
                              }}
                            /> :
                            <Text
                              style={{
                                fontSize: 17,
                                fontWeight: "bold",
                                color: "white",
                              }}
                            >
                              {item?.userResponse?.fullName.charAt(0)}
                            </Text>
                        }
                      </View>

                      {/* Username */}
                      <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                        {item?.userResponse.fullName}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        columnGap: 6,
                        marginBottom: 4,
                      }}
                    >
                      {/* Number of stars */}
                      <View style={{ flexDirection: "row", columnGap: -4 }}>
                        <RenderStars avgRating={item?.stars} size={16} />
                      </View>

                      {/* Created at */}
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 5,
                          backgroundColor: "#6E6E6E",
                        }}
                      />
                      <Text style={{ color: "#575757" }}>
                        {formatCreatedAt(item?.lastModified)}
                      </Text>
                    </View>

                    {/* Feedback */}
                    <View>
                      <Text style={{ fontSize: 15 }}>{item?.feedback}</Text>
                    </View>
                    {index < reviews.length - 1 && (
                      <Divider style={{ marginVertical: 14 }} />
                    )}
                  </Pressable>
                </View>
              )}
              onEndReached={handleScroll}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              initialNumToRender={5}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
            />
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              flex: 1,
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
                style={{ width: ScreenWidth, height: ScreenWidth / 1.4 }}
                autoPlay
                loop
                speed={0.8}
              />
              <Text
                style={{
                  fontSize: 16,
                  width: ScreenWidth / 1.5,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                {t("no-feedback")}
              </Text>
            </View>
          </View>
        </>
      )}

      <FAB
        size="large"
        icon={{
          name: "edit",
          color: "white",
        }}
        placement="right"
        color="#FB6562"
        onPress={() => navigation.navigate("CustomerAddReview", id)}
      />
    </View>
  );
};

const FilterModal = ({
  modalVisible,
  setModalVisible,
  sortOption,
  handleSortOption,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <Pressable
        style={styles.sortButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.sortButtonText}>
          {sortOption == "new" ? t("latest") : t("highest-rating")}
        </Text>
        <Icon
          type="material-community"
          name="chevron-down"
          size={24}
          color="white"
        />
      </Pressable>

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
            <View
              style={{
                alignItems: "center",
                paddingBottom: 12,
              }}
            >
              <View
                style={{
                  width: ScreenWidth / 7,
                  height: ScreenHeight / 80,
                  backgroundColor: "#FB6562",
                  borderRadius: 30,
                }}
              />
            </View>

            <View style={[styles.modalOption]}>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>{t("sort-by")}</Text>
            </View>

            {/* Latest */}
            <Pressable
              style={styles.modalOption}
              onPress={() => handleSortOption("new")}
            >
              <Text style={styles.modalOptionText}>{t("latest")}</Text>
              {sortOption === "new" ? (
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

            {/* Highest rating */}
            <Pressable
              style={styles.modalOption}
              onPress={() => handleSortOption("rating")}
            >
              <Text style={styles.modalOptionText}>{t("highest-rating")}</Text>
              {sortOption === "rating" ? (
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

const ProgressBar = ({ width }) => {
  const percent = `${Math.floor(width * 100)}%`;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ backgroundColor: "#E6EAED", height: 5, borderRadius: 12 }}>
        <View
          style={{
            backgroundColor: "#FFD700",
            height: 5,
            width: percent, // Corrected line
            borderRadius: 12,
          }}
        ></View>
      </View>
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
    fontSize: 16,
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

export default CustomerRating;
