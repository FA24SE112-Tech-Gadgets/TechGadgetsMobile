import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import useAuth from "../../utils/useAuth";
import { Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import { useTranslation } from "react-i18next";
import ErrModal from "../CustomComponents/ErrModal";
import { CommonActions, useNavigation } from "@react-navigation/native";
import api from "../Authorization/api";
import { FontAwesome5, Feather, FontAwesome, AntDesign, MaterialIcons } from '@expo/vector-icons';

export default function BuyerProfile() {
  const navigation = useNavigation();
  const { t } = useTranslation();
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

  const [currentQuote, setCurrentQuote] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const {
    logout,
    user,
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

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#ed8900",
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
              backgroundColor: "#ffecd0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
              {/* {user.fullName?.charAt(0)} */}
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
            navigation.navigate("BuyerPersonal");
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <Icon type="material-community" name="account-outline" size={24} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Thông tin cá nhân
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
        </Pressable>
        <Divider />

        {/* Quản lý yêu cầu */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            navigation.navigate("ApplicationRequest");
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <FontAwesome
                name="wpforms"
                size={23}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Quản lý yêu cầu
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
        </Pressable>
        <Divider />

        {/* Đã xem gần đây */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            navigation.navigate("ApplicationRequest");
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <AntDesign
                name="clockcircleo"
                size={19}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Đã xem gần đây
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
        </Pressable>
        <Divider />

        {/* Kho voucher */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            navigation.navigate("ApplicationRequest");
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <MaterialIcons
                name="discount"
                size={19}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Kho voucher
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
        </Pressable>
        <Divider />

        {/* Bắt đầu bán | Trang bán hàng */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            navigation.replace("StackSellerHome")
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <FontAwesome5
                name="store"
                size={19}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>{true ? "Bắt đầu bán" : "Trang bán hàng"}</Text>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <Text style={{ fontSize: 14, fontWeight: "400" }}>{true && "Đăng ký miễn phí"}</Text>
            <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
          </View>
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
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <Icon
                type="material-community"
                name="help-circle-outline"
                size={24}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("help-center")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
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
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <Icon
                type="material-community"
                name="newspaper-variant-outline"
                size={24}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              {t("policy")}
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
        </Pressable>
        <Divider />

        {/* Về TechGadget */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => navigation.navigate("AboutTechGadget")}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
          >
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                height: 25,
                width: 25,
              }}
            >
              <Feather
                name="triangle"
                size={20}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Về TechGadget
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
        </Pressable>
        <Divider />
      </View>

      {/* Đăng xuất */}
      <Pressable
        onPress={() => {
          logout();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,  // Starts at the first screen in the stack
              routes: [{ name: 'Login' }],  // Replace 'Login' with the name of your Login screen
            })
          );
        }}
      >
        <View
          style={{
            paddingVertical: 8,
            marginHorizontal: 12,
            alignItems: "center",
            backgroundColor: "#ed8900",
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "500", color: "white" }}>
            Đăng xuất
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
          backgroundColor={"#ed8900"}
          style={styles.robot}
          size={24}
        />
      </Pressable>

      <ConfirmHelpCenterModal
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

const ConfirmHelpCenterModal = ({ showConfirmModal, setShowConfirmModal }) => {
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
        <Text style={{ fontSize: 15 }}>Bạn sẽ được điều hướng sang trang Web khác</Text>
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
              borderColor: "#ed8900",
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setShowConfirmModal(false)}
          >
            <Text style={{ fontWeight: "bold", color: "#ed8900" }}>
              HỦY
            </Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "#ed8900",
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 10,
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              Linking.openURL("https://fa24se112-tech-gadgets.github.io/Tech-Gadget-HelpCenter/");
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
