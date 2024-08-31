import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  AppState,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import AntDesign from "react-native-vector-icons/AntDesign";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import useAuth from "../../utils/useAuth";
import api from "../Authorization/api";
import SpinnerImage from "../CustomComponents/SpinnerImage";
import FilterModal from "../CustomComponents/FilterModal";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";
import CustomerSubcription from "./CustomerSubcription";

export default function CustomerHome({ navigation }) {
  // const [dataTag, setDataTag] = useState([]);
  const [arrChoosedTag, setArrChoosedTag] = useState([]);
  // const [currentPage, setCurrentPage] = useState(1);

  const [turnNumber, setTurnNumber] = useState(2);
  const initialTime = 180;
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [intervalId, setIntervalId] = useState(null);

  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [openSubscription, setOpenSubscription] = useState(false);
  const [isDisable, setDisable] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [openRandomModal, setOpenRandomModal] = useState(false);
  const [randomFood, setRandomFood] = useState(null);

  const [bannerArr, setBannerArr] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef();

  const {
    user,
    isTimerRunning,
    setIsTimerRunning,
    isPayToWin,
    setIsPayToWin,
    fetchSubscription,
  } = useAuth();

  const { t } = useTranslation();

  function getRandomNumber() {
    return Math.floor(Math.random() * 5);
  }

  function getRandomElements(array) {
    const shuffledArray = array.sort(() => 0.5 - Math.random());
    return shuffledArray.slice(0, 3);
  }

  const fetchRandomBanner = async () => {
    try {
      const randomPageNumber = getRandomNumber();
      const res = await api.get(
        `/foods?page=${randomPageNumber}&limit=7`
      );
      const newData = res.data.data;
      const randomFoodData = getRandomElements(newData);

      setBannerArr(randomFoodData);
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

  const goToNextPage = () => {
    const nextSlide = currentSlide >= bannerArr.length - 1 ? 0 : currentSlide + 1;
    flatListRef.current.scrollToIndex({ index: nextSlide, animated: true });
    setCurrentSlide(nextSlide);
  };

  //Get random banner
  useFocusEffect(
    useCallback(() => {
      fetchRandomBanner();
    }, [])
  );

  //Scroll banner
  useFocusEffect(
    useCallback(() => {
      const timerId = setInterval(() => {
        goToNextPage();
      }, 4000);

      return () => {
        clearInterval(timerId);
      };
    }, [currentSlide, bannerArr])
  );

  const handleNavigate = (nameRoute) => {
    navigation.navigate(nameRoute);
  };

  const handleInfoPress = () => {
    setInfoModalVisible(true);
  };

  const handleCloseInfoModal = () => {
    setInfoModalVisible(false);
  };

  // Filter tag
  const handleFilterPress = () => {
    if (isPayToWin) {
      setSnackbarMessage(t("pay-to-win-msg"));
      setSnackbarVisible(true);
      setOpenSubscription(true);
    } else {
      setFilterModalVisible(true);
    }
  };

  const handleCloseFilterModal = () => {
    setFilterModalVisible(false);
  };

  const formatTime = (time) => {
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    // Format minutes and seconds to always have two digits
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");

    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const startTimer = () => {
    const id = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1; // Subtract 1 second (1000 milliseconds)
        if (newTime <= 0) {
          clearInterval(id);
          setTurnNumber(2);
          setIsTimerRunning(false);
        }
        return newTime;
      });
    }, 1000);
    setIntervalId(id);
  };

  async function createPaymentLink(type, accountRole) {
    try {
      const res = await api.post(accountRole === "user" ? `/subscriptions/users` : `/subscriptions/restaurants`,
        {
          type: type
        }
      )
      return res.data;
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("network-error")
      );
    }
  }

  //Fetch food random status
  useFocusEffect(
    useCallback(() => {
      let appStateSubscription = null;

      const handleAppStateChange = async (nextAppState) => {
        if (nextAppState === "active") {
          // App has come to the foreground, fetch data and start timer
          await fetchDataAndStartTimer();
        }
      };

      const fetchDataAndStartTimer = async () => {
        try {
          const res = await api.get("/foods/random/status");
          const { countLeft, timeLeft } = res.data;
          setTurnNumber(countLeft);
          setTimeRemaining(timeLeft);
          if (countLeft != 2 && !isTimerRunning) {
            setIsTimerRunning(true);
            startTimer();
          }
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

      appStateSubscription = AppState.addEventListener(
        "change",
        handleAppStateChange
      );
      fetchDataAndStartTimer(); // Initial call to fetch data and start timer

      return () => {
        if (appStateSubscription) {
          appStateSubscription.remove(); // Cleanup the AppState subscription
        }
      };
    }, [isTimerRunning])
  );

  const fetchRandomFood = async () => {
    let isErr = true;
    try {
      const res = await api.get(`/foods/random`);
      if (res.status >= 200 && res.status < 300) {
        // setArrSpinner(prevArr => [...prevArr, res.data.image]);
        setRandomFood(res.data);
      }
      isErr = false;

      const res2 = await api.get("/foods/random/status");
      const { countLeft, timeLeft } = res2.data;
      setTurnNumber(countLeft);
      setTimeRemaining(timeLeft);
      if (countLeft != 2 && !isTimerRunning) {
        setIsTimerRunning(true);
        startTimer();
      }
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("random-error")
      );
      isErr = true;
    }
    return isErr;
  };

  const handleButtonClick = async () => {
    const userId = user.id;
    if (turnNumber > 0) {
      // setTurnNumber((prevTurns) => prevTurns - 1);
      const isErr = await fetchRandomFood();
      if (!isErr) {
        setOpenRandomModal(true);
      }
    } else {
      setIsError(true);
      setStringErr(
        t("empty-turns")
      );
    }
  };

  const handleRandom = () => {
    handleButtonClick();
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
    <KeyboardAvoidingView
      style={{
        flex: 1,
        position: "relative",
      }}
      behavior="padding"
    >
      {/* Banner */}
      <View>
        {
          bannerArr.length > 0 &&
          <FlatList
            data={bannerArr}
            overScrollMode={"never"}
            ref={flatListRef}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View key={index}>
                <Image
                  style={{ width: ScreenWidth, height: ScreenWidth }}
                  source={{ uri: item.image }}
                />
              </View>
            )}
          />
        }
      </View>

      <View
        style={{
          height: ScreenHeight - ScreenHeight / 2.5,
          width: ScreenWidth,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: "white",
          position: "absolute",
          bottom: 0,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: ScreenHeight / 30,
            justifyContent: "space-between",
            width: ScreenWidth / 1.1,
          }}
        >
          {/* Số lượt (Thiếu) */}
          {turnNumber != 2 && (
            <View
              style={{
                backgroundColor: "#F9615D",
                width: ScreenWidth / 1.68,
                height: ScreenWidth / 10,
                borderRadius: 30,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flex: 0.5,
                  borderRightColor: "white",
                  borderRightWidth: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View>
                  <MaterialCommunityIcons
                    name={"water"}
                    size={ScreenWidth / 15}
                    color={"white"}
                  />
                  <Entypo
                    name={"circle"}
                    size={ScreenWidth / 40}
                    color={"#F9615D"}
                    style={{
                      position: "absolute",
                      top: ScreenWidth / 38,
                      left: ScreenWidth / 46,
                    }}
                  />
                </View>
                <View>
                  <Text
                    style={{ color: "white", fontSize: 15, fontWeight: "500" }}
                  >
                    {t("turn-number")}
                    <Text style={{ color: "white", fontSize: 13 }}>
                      {turnNumber}/2
                    </Text>
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flex: 0.4,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 15, fontWeight: "500" }}
                >
                  {formatTime(timeRemaining)}
                </Text>
                <Pressable
                  onPress={() => {
                    handleInfoPress();
                  }}
                >
                  <Feather name={"info"} size={16} color={"white"} />
                </Pressable>
              </View>
            </View>
          )}

          {/* Số lượt (Đủ 2 lượt) */}
          {turnNumber == 2 && (
            <View
              style={{
                backgroundColor: "#F9615D",
                width: ScreenWidth / 2.5,
                height: ScreenWidth / 10,
                paddingRight: 10,
                borderRadius: 30,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View>
                  <MaterialCommunityIcons
                    name={"water"}
                    size={ScreenWidth / 12.5}
                    color={"white"}
                  />
                  <Entypo
                    name={"circle"}
                    size={ScreenWidth / 30}
                    color={"#F9615D"}
                    style={{
                      position: "absolute",
                      top: ScreenWidth / 33,
                      left: ScreenWidth / 41,
                    }}
                  />
                </View>
                <View>
                  <Text
                    style={{ color: "white", fontSize: 17, fontWeight: "500" }}
                  >
                    {t("turn-number")}
                    <Text style={{ color: "white", fontSize: 15 }}>
                      {turnNumber}/2
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Bộ lọc */}
          <Pressable
            style={{
              backgroundColor: "#FB6562",
              flexDirection: "row",
              width: ScreenWidth / 3.5,
              height: ScreenWidth / 10,
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              borderRadius: 30,
            }}
            onPress={() => {
              handleFilterPress();
            }}
          >
            <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>
              {t("filter")} ({arrChoosedTag.length})
            </Text>
            <AntDesign name="down" size={13} color={"white"} />
          </Pressable>
        </View>

        {/* Nút random */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Image
            style={{
              width: 380,
              height: 380,
            }}
            source={require("../../assets/adaptive-icon.png")}
          />
          <Pressable
            style={{
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              width: 180,
              height: 230,
              borderRadius: 100,
              bottom: 75,
            }}
            onPress={handleRandom}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.8 }}
              colors={["#F89B99", "#F98280", "#F9615D", "#FA6865", "#FA5A56"]}
              style={{
                width: 116,
                height: 116,
                borderRadius: 100,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 4,
                borderColor: "white",
                position: "absolute",
                bottom: 35,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: "500",
                }}
              >
                Start
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
      <InfoModalV2 visible={infoModalVisible} onClose={handleCloseInfoModal} />
      <FilterModal
        arrChoosedTag={arrChoosedTag}
        setArrChoosedTag={setArrChoosedTag}
        filterModalVisible={filterModalVisible}
        handleCloseFilterModal={handleCloseFilterModal}
        isPayToWin={isPayToWin}
        setIsPayToWin={setIsPayToWin}
      />
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
      <CustomerSubcription
        openSubscription={openSubscription}
        setOpenSubscription={setOpenSubscription}
        isError={isError}
        setIsError={setIsError}
        setStringErr={setStringErr}
        isDisable={isDisable}
        setDisable={setDisable}
        createPaymentLink={createPaymentLink}
        snackbarVisible={snackbarVisible}
        setSnackbarVisible={setSnackbarVisible}
        snackbarMessage={snackbarMessage}
      />
      <RandomModal
        isOpen={openRandomModal}
        setOpen={setOpenRandomModal}
        randomFood={randomFood}
        navigation={navigation}
      />
    </KeyboardAvoidingView>
  );
}

const InfoModalV2 = ({ visible, onClose }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      useNativeDriverForBackdrop
      swipeDirection={"down"}
      propagateSwipe={true}
      style={{
        justifyContent: 'flex-end',
        margin: 0,
      }}
    >
      <View style={{
        width: ScreenWidth,
        height: ScreenHeight / 1.5,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
      }}>
        <View
          style={{
            alignItems: "center",
            padding: 12,
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
        <View
          style={{
            flex: 1,
            padding: 10,
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          <View
            style={{
              borderWidth: 1,
              borderColor: "#FB6562",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              margin: ScreenWidth / 5,
              borderRadius: 20,
              top: ScreenHeight / 20,
            }}
          >
            <Text>
              {t("info-filter")}
            </Text>
          </View>
          <LottieView
            source={require("../../assets/robotAssitant.json")}
            style={{ width: "80%", height: "80%" }}
            autoPlay
            loop
            speed={0.8}
          />
        </View>
      </View>
    </Modal>
  );
};

const RandomModal = ({ isOpen, setOpen, randomFood, navigation }) => {
  return (
    <Modal
      isVisible={isOpen}
    >
      <SpinnerImage
        setOpen={setOpen}
        randomFood={randomFood}
        navigation={navigation}
      />
    </Modal>
  );
};
