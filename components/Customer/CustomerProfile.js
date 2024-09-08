import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Image,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import useAuth from "../../utils/useAuth";
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import LanguageModal from "../CustomComponents/LanguageModal";
import ErrModal from "../CustomComponents/ErrModal";
import CustomerSubcription from "./CustomerSubcription";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";

export default function CustomerProfile({ navigation }) {
  const { t } = useTranslation();
  const [openChooseLanguage, setOpenChooseLanguage] = useState(false);
  const quotes = [
    t("bot-quote1"),
    t("bot-quote2"),
    t("bot-quote3"),
    t("bot-quote4"),
    t("bot-quote5"),
    t("bot-quote6"),
    t("bot-quote7"),
    t("bot-quote8"),
    t("bot-quote9"),
    t("bot-quote10"),
  ];

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [openSubscription, setOpenSubscription] = useState(false);
  const [isDisable, setDisable] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [currentQuote, setCurrentQuote] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [hasCurrentPackage, setHasCurrentPackage] = useState(false);

  const {
    logout,
    user,
    fetchSubscription,
    currentPackage,
  } = useAuth();

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote());
      setShowQuote(true);
      setTimeout(() => {
        setShowQuote(false);
      }, 5000); // Ẩn câu nói sau 5 giây
    }, Math.random() * (18000 - 12000) + 12000); // Hiển thị câu nói sau 2-3 phút

    return () => clearInterval(interval);
  }, []);

  const handleRobotClick = () => {
    setCurrentQuote(getRandomQuote());
    setShowQuote(true);
    setTimeout(() => {
      setShowQuote(false);
    }, 5000); // Ẩn câu nói sau 5 giây
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
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("network-error")
      );
      setIsError(true);
    }
  }

  function handlePressSubscriptionButton() {
    if (hasCurrentPackage) {
      setStringErr(`${t("package-before1")}${currentPackage.subscription.name}${t("package-before2")}`);
      setIsError(true);
    } else {
      setOpenSubscription(true);
    }
  }

  //Check payment
  useFocusEffect(
    useCallback(() => {
      const handleCheckSubscription = async () => {
        const isSubscription = await fetchSubscription("ACTIVE", 0, 1);
        if (isSubscription) {
          setHasCurrentPackage(true);
        } else {
          setHasCurrentPackage(false);
        }
      }
      handleCheckSubscription();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#FB6562",
          flexDirection: "row",
          padding: 10,
          paddingVertical: 16,
          alignItems: "center",
          columnGap: 12,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      >
        {user.imageUrl ? (
          <Image
            source={{
              uri: user.imageUrl,
            }}
            style={{
              height: 40,
              width: 40,
              backgroundColor: "black",
              borderRadius: 30,
            }}
          />
        ) : (
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 30,
              backgroundColor: "#FEC6C4",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
              {user.fullName?.charAt(0)}
            </Text>
          </View>
        )}
        <Text style={{ fontSize: 24, fontWeight: "500", color: "white" }}>
          {user.fullName}
        </Text>
      </View>

      {/* Profile function */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, rowGap: 10 }}>
        {/* Thông tin cá nhân */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            navigation.navigate("CustomProfile");
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Icon type="material-community" name="account-outline" size={24} />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("personal-profile")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>
        <Divider />

        {/* Lịch sử giao dịch */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            navigation.navigate("CustomerTransactionHistory");
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Icon type="font-awesome-5" name="money-check-alt" size={24} />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("transaction-history")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>
        <Divider />

        {/* Trung tâm trợ giúp */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            setShowConfirmModal(true);
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Icon
              type="material-community"
              name="help-circle-outline"
              size={24}
            />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("help-center")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>
        <Divider />

        {/* Chính sách quy định */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => navigation.navigate("Policy")}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Icon
              type="material-community"
              name="newspaper-variant-outline"
              size={24}
            />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("policy")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>
        <Divider />

        {/* Gói */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => handlePressSubscriptionButton()}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Icon
              type="material-community"
              name="package-variant-closed"
              size={24}
            />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>{t("package-subscription")}</Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>
        <Divider />

        {/* Về WhatEat */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => navigation.navigate("AboutWhatEat")}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Icon
              type="material-community"
              name="silverware-fork-knife"
              size={24}
            />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("about-what-eat")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>
        <Divider />

        {/* Ngôn ngữ */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => setOpenChooseLanguage(true)}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <MaterialIcons name="language" size={24} color="black" />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("language")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>

        {/* <Pressable onPress={() => navigation.navigate("customer-first-filter")}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 6,
              }}
            >
              <Icon
                type="material-community"
                name="silverware-fork-knife"
                size={24}
              />
              <Text style={{ fontSize: 15, fontWeight: "500" }}>Test</Text>
            </View>

            <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
          </View>
        </Pressable>
        <Divider /> */}
      </View>

      {/* Đăng xuất */}
      <Pressable onPress={() => logout()}>
        <View
          style={{
            paddingVertical: 8,
            marginHorizontal: 12,
            alignItems: "center",
            backgroundColor: "#FB6562",
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "500", color: "white" }}>
            {t("log-out")}
          </Text>
        </View>
      </Pressable>

      {/* Hiển thị câu nói */}
      {showQuote && (
        <View
          style={[
            styles.quoteContainer,
            { width: ScreenWidth * 0.75, zIndex: 2 },
          ]}
        >
          <Text style={styles.quote}>{currentQuote}</Text>
        </View>
      )}

      {/* Robot */}
      <Pressable onPress={handleRobotClick} style={styles.robotContainer}>
        <Icon
          type="material-community"
          name="robot-happy-outline"
          color="white"
          backgroundColor={"#FB6562"}
          style={styles.robot}
          size={24}
        />
      </Pressable>

      {/* Choose language */}
      <LanguageModal
        openChooseLanguage={openChooseLanguage}
        setOpenChooseLanguage={setOpenChooseLanguage}
      />

      <ConfirmModal
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
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
    </View>
  );
}

const ConfirmModal = ({ showConfirmModal, setShowConfirmModal }) => {
  const { t } = useTranslation();
  return (
    <Modal
      isVisible={showConfirmModal}
      onBackdropPress={() => setShowConfirmModal(false)}
      style={{
        alignItems: "center",
      }}
    >
      <View
        style={{
          rowGap: 20,
          width: ScreenWidth * 0.8,
          backgroundColor: "white",
          padding: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: 15 }}>{t("confirm-hep-center")}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            columnGap: 12,
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
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setShowConfirmModal(false)}
          >
            <Text style={{ fontWeight: "bold", color: "#FB6562" }}>
              {t("cancel-update-cmt")}
            </Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "#FB6562",
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 10,
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              Linking.openURL("https://whateat-exe.github.io/WhatEatHelpCenter/");
              setShowConfirmModal(false);
            }}
          >
            <Text style={{ fontWeight: "bold", color: "white" }}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  functionContainerStyle: {
    justifyContent: "space-between",
    alignItems: "center",
    margin: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FFBE98",
    paddingRight: 5,
  },
  functionPressable: {
    flexDirection: "row",
    justifyContent: "flex-start",
    margin: 10,
  },
  functionIcon: {
    marginRight: 10,
  },
  functionDescription: {
    textAlignVertical: "center",
    fontSize: 20,
  },
  quoteContainer: {
    position: "absolute",
    bottom: 40,
    left: 26,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  quote: {
    fontSize: 16,
    textAlign: "center",
  },
  robotContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  robot: {
    padding: 10,
    borderRadius: 26,
  },
});
