import { View, Text, ActivityIndicator, FlatList } from "react-native";
import React, { useCallback, useState } from "react";
import { Divider, ScreenHeight, ScreenWidth } from "@rneui/base";
import api from "../Authorization/api";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import i18next from "../../services/i18next"
import ErrModal from "../CustomComponents/ErrModal";

export default function CustomerHistory({ navigation }) {
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const { t } = useTranslation();
  const arrBotString = [
    t("bot-string1"),
    t("bot-string2"),
    t("bot-string3"),
    t("bot-string4"),
    t("bot-string5"),
  ]

  const [botString, setBotString] = useState(arrBotString[0]);
  const [randomNumber, setRandomNumber] = useState(0);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [foods, setFoods] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={{
        padding: 5,
        alignItems: 'center'
      }}>
        <ActivityIndicator color={"#ed8900"} />
      </View>
    );
  };

  //Get random number from 0 to 4
  function getRandomNumber() {
    let newNumber;
    do {
      newNumber = Math.floor(Math.random() * 5);
    } while (newNumber === randomNumber);

    return newNumber;
  }

  //Fetch random food history first time
  useFocusEffect(
    useCallback(() => {
      setFoods([]);
      setCurrentPage(0);
      const fetchItems = async () => {
        try {
          const res = await api.get(
            `/foods/random/history?page=${currentPage}&limit=10`
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
      fetchItems();
    }, [])
  );

  //Get random food history by page
  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(
            `/foods/random/history?page=${currentPage}&limit=10`
          );
          const newData = res.data.data;
          setHasMoreData(newData.length > 0);
          setIsFetching(false);

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
      if (currentPage >= 1) {
        fetchItems();
      }
    }, [currentPage])
  );

  //Get random number
  useFocusEffect(
    useCallback(() => {
      const interval = setInterval(() => {
        setRandomNumber(getRandomNumber()); // Random number between 0 and 4
      }, 30000);

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [])
  );

  //Setbot string
  useFocusEffect(
    useCallback(() => {
      setBotString(arrBotString[randomNumber]);
    }, [randomNumber, i18next.language])
  );

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

  const handleScroll = () => {
    if (!isFetching && hasMoreData) {
      setCurrentPage((prevPage) => prevPage + 1); // Fetch more data when reaching the end of the list
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Text style={{ fontSize: 30, paddingVertical: 20, fontWeight: "bold", paddingHorizontal: 18, }}>
        {t("history-title")}
      </Text>

      {
        foods.length == 0 &&
        <View style={{
          flex: 1,
          height: ScreenHeight / 2.5
        }}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LottieView
              source={require("../../assets/animations/catRole.json")}
              style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
              autoPlay
              loop
              speed={0.8}
            />
            <Text style={{
              fontSize: 18,
              width: ScreenWidth / 1.5,
              textAlign: "center"
            }}>
              {t("empty-data-history")}
            </Text>
          </View>
        </View>
      }

      <FlatList
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: 10
        }}
        data={foods}
        keyExtractor={item => item.createdAt}
        renderItem={({ item, index }) => (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                rowGap: 5,
              }}
            >
              <View>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.food.name}
                </Text>
                <Text style={{ color: "#5F5F5F" }}>
                  {formatCreatedAt(item.createdAt)}
                </Text>
              </View>
            </View>

            {index < foods.length - 1 && (
              <Divider style={{ marginVertical: 14 }} />
            )}
          </>
        )}
        onEndReached={handleScroll}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={10}
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
}
//   return (
//     <Modal visible={isError}>
//       <ModalContent>
//         <View style={{ rowGap: 0.5, width: ScreenWidth * 0.7, height: ScreenHeight / 3.5 }}>
//           <View
//             style={{
//               alignItems: "center",
//               justifyContent: "center",
//               position: "relative"
//             }}
//           >
//             <LottieView
//               source={require("../../assets/animations/catRole.json")}
//               style={{ width: ScreenWidth / 2, height: ScreenWidth / 2 }}
//               autoPlay
//               loop
//               speed={0.8}
//             />
//             <Text style={{
//               fontSize: 15,
//               width: ScreenWidth / 1.5,
//               position: "absolute",
//               bottom: ScreenWidth / 40
//             }}>{stringErr}</Text>
//           </View>
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "flex-end",
//               columnGap: 12,
//             }}
//           >
//             <Pressable
//               style={{
//                 backgroundColor: "#ed8900",
//                 paddingHorizontal: 15,
//                 paddingVertical: 5,
//                 borderRadius: 10,
//                 width: 60,
//                 height: 35,
//                 alignItems: "center",
//                 justifyContent: "center"
//               }}
//               onPress={() => setIsError(false)}>
//               <Text style={{ fontWeight: "bold", color: "white" }}>OK</Text>
//             </Pressable>
//           </View>
//         </View>
//       </ModalContent>
//     </Modal >
//   );
// };
