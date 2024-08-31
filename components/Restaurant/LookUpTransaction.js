import {
  View,
  Text,
  Dimensions,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import api from "../Authorization/api";
import ErrModal from "../CustomComponents/ErrModal";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";

export function LookUpTransaction() {
  const { t } = useTranslation();

  const [filterChoosed, setFilterChoosed] = useState(t("three-months-filter"));
  const [isChangeFilter, setChangeFilter] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const [transactionMap, setTransactionMap] = useState(new Map());
  const [totalSubscription, setTotalSubscription] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(
            `/subscriptions/paid/current?page=${currentPage}&limit=30`
          );
          setIsFetching(false);
          setTotalSubscription(res.data.totalSubscription);
          const newData = res.data.data;

          if (newData.length == 0) {
            console.log("No more data to fetch");
            return; // Stop the process if there is no more data
          }

          const updatedTransactionMap = new Map(transactionMap);

          newData.forEach((item) => {
            const key = item.paidDate; // Example key, change it based on your data structure
            const value = item; // Example value, change it based on your data structure

            if (!updatedTransactionMap.has(key)) {
              updatedTransactionMap.set(key, []);
            }

            updatedTransactionMap.get(key).push(value);
          });

          setTransactionMap(updatedTransactionMap);
        } catch (error) {
          setIsError(true);
          setStringErr(
            error.response?.data?.reasons[0]?.message
              ? error.response.data.reasons[0].message
              : t("network-error")
          );
        }
      };

      init();
    }, [currentPage])
  );

  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, contentSize } = nativeEvent;
    const reachedEnd = contentOffset.y >= contentSize.height - ScreenHeight;
    if (reachedEnd) {
      setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
    }
  };

  const handleChangeFilter = () => {
    setChangeFilter(!isChangeFilter);
  };

  const arrTransaction = Array.from(transactionMap, ([key, value]) => ({
    key,
    value,
  }));

  return (
    <>
      {arrTransaction.length == 0 ? (
        <View
          style={{
            flex: 1,
            // height: ScreenHeight / 2.4,
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
              {t("no-transaction-history")}
            </Text>
          </View>
        </View>
      ) : (
        <>
          {/* Filter */}
          <View
            style={{
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: ScreenHeight / 80,
                height: ScreenHeight / 20,
                width: ScreenWidth / 1.1,
                gap: ScreenWidth / 20,
              }}
            >
              <Text>{t("sort-by")}</Text>
              <Pressable
                style={{
                  borderColor: "#FB6562",
                  borderWidth: 1,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 30,
                }}
                onPress={() => handleChangeFilter()}
              >
                <Text>{filterChoosed}</Text>
              </Pressable>
            </View>
          </View>

          {/* Number of transaction */}
          <View
            style={{
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: ScreenHeight / 100,
                height: ScreenHeight / 20,
                width: ScreenWidth / 1.1,
                gap: ScreenWidth / 20,
              }}
            >
              <Text>{totalSubscription}{t("number-transaction")}</Text>
            </View>
          </View>

          {/* Transaction history list */}
          <ScrollView
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {arrTransaction.map((item, index) => (
              <View key={index}>
                {/* date */}
                <View
                  style={{
                    width: ScreenWidth,
                    backgroundColor: "#C40C0C",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ color: "white" }}>{item.key}</Text>
                </View>

                {/* payment list per date */}
                {item.value.map((it, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      alignItems: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        width: ScreenWidth / 1.7,
                      }}
                    >
                      <Text>{it.subscription.name}</Text>
                    </View>
                    <View
                      style={{
                        width: ScreenWidth - ScreenWidth / 1.55,
                        alignItems: "flex-end",
                      }}
                    >
                      <Text>- {it.amount} VND</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
          {
            isFetching &&
            <ActivityIndicator color={"#FB6562"} />
          }
        </>
      )}

      <FilterModal
        visible={isChangeFilter}
        onClose={handleChangeFilter}
        filterChoosed={filterChoosed}
        setFilterChoosed={setFilterChoosed}
      />
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </>
  );
}

export const FilterModal = ({
  visible,
  onClose,
  filterChoosed,
  setFilterChoosed,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      transparent={true}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
        }}
        onPress={() => onClose()}
      >
        <View
          style={{
            backgroundColor: "#D9D9D9",
            width: ScreenWidth / 2.5,
            paddingHorizontal: 8,
            paddingVertical: 10,
            borderRadius: 10,
            marginTop: ScreenHeight / 4.3,
            marginLeft: ScreenWidth / 5,
          }}
        >
          <Pressable
            style={{
              height: ScreenHeight / 23,
              backgroundColor:
                filterChoosed === t("three-months-filter") ? "#FB6562" : null,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "white",
              borderWidth: filterChoosed === t("three-months-filter") ? 1 : 0,
            }}
            onPress={() => {
              setFilterChoosed(t("three-months-filter"));
              onClose();
            }}
          >
            <Text
              style={{
                color: filterChoosed === t("three-months-filter") ? "white" : "black",
              }}
            >
              {t("three-months-filter")}
            </Text>
          </Pressable>
          <Pressable
            style={{
              height: ScreenHeight / 23,
              backgroundColor:
                filterChoosed === t("six-months-filter") ? "#FB6562" : null,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "white",
              borderWidth: filterChoosed === t("six-months-filter") ? 1 : 0,
            }}
            onPress={() => {
              setFilterChoosed(t("six-months-filter"));
              onClose();
            }}
          >
            <Text
              style={{
                color: filterChoosed === t("six-months-filter") ? "white" : "black",
              }}
            >
              {t("six-months-filter")}
            </Text>
          </Pressable>
          <Pressable
            style={{
              height: ScreenHeight / 23,
              backgroundColor:
                filterChoosed === t("nine-months-filter") ? "#FB6562" : null,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "white",
              borderWidth: filterChoosed === t("nine-months-filter") ? 1 : 0,
            }}
            onPress={() => {
              setFilterChoosed(t("nine-months-filter"));
              onClose();
            }}
          >
            <Text
              style={{
                color: filterChoosed === t("nine-months-filter") ? "white" : "black",
              }}
            >
              {t("nine-months-filter")}
            </Text>
          </Pressable>
          <Pressable
            style={{
              height: ScreenHeight / 23,
              backgroundColor:
                filterChoosed === t("one-year-filter") ? "#FB6562" : null,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              borderColor: "white",
              borderWidth: filterChoosed === t("one-year-filter") ? 1 : 0,
            }}
            onPress={() => {
              setFilterChoosed(t("one-year-filter"));
              onClose();
            }}
          >
            <Text
              style={{
                color: filterChoosed === t("one-year-filter") ? "white" : "black",
              }}
            >
              {t("one-year-filter")}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
