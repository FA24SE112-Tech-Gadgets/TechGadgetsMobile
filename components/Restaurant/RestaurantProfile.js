import { View, Text, Pressable } from "react-native";
import React, { useCallback, useState } from "react";
import useAuth from "../../utils/useAuth";
import { Avatar, Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import { Linking } from "react-native";
import MaterialIconsRN from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import LanguageModal from "../CustomComponents/LanguageModal";
import ErrModal from "../CustomComponents/ErrModal";
import RenderSubscription from "../CustomComponents/RenderSubscription";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Authorization/api";

export default function RestaurantProfile({ navigation }) {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [openSubscription, setOpenSubscription] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { t } = useTranslation();
  const [openChooseLanguage, setOpenChooseLanguage] = useState(false);

  const [hasCurrentPackage, setHasCurrentPackage] = useState(false);

  const [canCreateDish, setCanCreateDish] = useState(false);

  const {
    logout,
    user,
    fetchSubscription,
    currentPackage,
  } = useAuth();

  function handlePressSubscriptionButton() {
    if (hasCurrentPackage) {
      setStringErr(`${t("package-before1")}${currentPackage.subscription.name}${t("package-before2")}`);
      setIsError(true);
    }
    setOpenSubscription(true);
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

  //Check can create dish
  useFocusEffect(
    useCallback(() => {
      const handleCheckCanCreateDish = async () => {
        const url = `/dishes/check-create`;
        try {
          const res = await api.get(url);
          setCanCreateDish(res.data.canCreateDish ? res.data.canCreateDish : false);
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
      handleCheckCanCreateDish();
    }, [])
  );

  return (
    <View>
      {/* Ava header */}
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
        <Avatar size={40} rounded source={{ uri: user.imageUrl }} />
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
            navigation.navigate("CustomProfile", { id: 1 });
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

        {/* Thêm món ăn */}
        <Pressable
          onPress={() => {
            if (canCreateDish) {
              navigation.navigate("RestaurantAddDish")
            } else {
              setStringErr(t("can-create-dish-msg"));
              setIsError(true);
              setOpenSubscription(true);
            }
          }}
        >
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
              <Icon type="font-awesome-5" name="concierge-bell" size={20} />
              <Text style={{ fontSize: 15, fontWeight: "500" }}>
                {t("add-dish")}
              </Text>
            </View>

            <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
          </View>
        </Pressable>
        <Divider />

        {/* Yêu cầu món mới trong hệ thống */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            // navigation.navigate("AddRequestFood");
            // TODO: Sẽ mở sau khi đã làm xong
            setIsError(true);
            setStringErr(
              t("lock-feature")
            );
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Icon type="feather" name="send" size={20} />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("request-dish")}
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
          onPress={() => navigation.navigate("Policy")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
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
            <Text style={{ fontSize: 15, fontWeight: "500" }}>{t("about-what-eat")}</Text>
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
            <MaterialIconsRN name="language" size={24} color="black" />
            <Text style={{ fontSize: 15, fontWeight: "500" }}>{t("language")}</Text>
          </View>

          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => {
          logout();
          navigation.replace("Login")
        }}
      >
        <View
          style={{
            paddingVertical: 8,
            marginHorizontal: 12,
            alignItems: "center",
            backgroundColor: "#FB6562",
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "500", color: "white" }}>
            {t("log-out")}
          </Text>
        </View>
      </Pressable>

      <RenderSubscription
        openSubscription={openSubscription}
        setOpenSubscription={setOpenSubscription}
      />

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
        alignItems: "center"
      }}
    >
      <View style={{
        rowGap: 20,
        width: ScreenWidth * 0.8,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20
      }}>
        <Text style={{ fontSize: 15 }}>
          {t("confirm-hep-center")}
        </Text>
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
              justifyContent: "center"
            }}
            onPress={() => setShowConfirmModal(false)}
          >
            <Text style={{ fontWeight: "bold", color: "#FB6562" }}>{t("cancel-update-cmt")}</Text>
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
              justifyContent: "center"
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
