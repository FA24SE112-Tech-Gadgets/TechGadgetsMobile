import {
  View,
  Text,
  ScrollView,
  Image,
  Linking,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import logo from "../../assets/adaptive-icon.png";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuth from "../../utils/useAuth";
import Hyperlink from "react-native-hyperlink";
import { useTranslation } from "react-i18next";
import ErrModal from "./ErrModal";

export default function CustomProfile({ navigation }) {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const { t } = useTranslation();

  const { logout, user } = useAuth();

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#FB6562"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ paddingHorizontal: 14 }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {/* WhatEat logo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 10,
          }}
        >
          <Image
            style={{
              width: 70,
              height: 70,
              borderColor: "black",
              marginRight: -12,
            }}
            source={logo}
          />
          <MaskedView
            maskElement={
              <Text
                style={{
                  backgroundColor: "transparent",
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                WhatEat
              </Text>
            }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 0.6 }}
              colors={["rgba(250, 164, 147, 0.65)", "#FB5854"]}
            >
              <Text style={{ opacity: 0, fontSize: 28, fontWeight: "bold" }}>
                WhatEat
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text style={{ color: "#505050" }}></Text>
        </View>

        {/* Trung tâm tài khoản */}
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            textAlign: "center",
            textAlignVertical: "center",
          }}
        >
          {t("account-center")}
        </Text>
        <View
          style={{
            paddingHorizontal: 10,
            marginTop: 10,
          }}
        >
          <Hyperlink
            linkDefault={true}
            linkText={(url) =>
              url === "https://whateat-exe.github.io/WhatEatPolicy/"
                ? t("more-info")
                : url
            }
            onPress={(url, text) => {
              Linking.openURL("https://whateat-exe.github.io/WhatEatPolicy/"); //Link policy WhatEat
            }}
          >
            <Text style={{ fontSize: 16 }}>
              {t("account-management")}{"\u00A0"}
              <Text
                style={{
                  fontSize: 16,
                  color: "#FB5854",
                }}
              >
                https://whateat-exe.github.io/WhatEatPolicy/
              </Text>
            </Text>
          </Hyperlink>
        </View>

        {/* Trang cá nhân */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            padding: 10,
            marginTop: 20,
            borderRadius: 10,
            justifyContent: "space-between",
          }}
          onPress={() => navigation.navigate("PersonalPage")}
        >
          {user.imageUrl ? (
            <Image
              source={{
                uri: user.imageUrl,
              }}
              style={{
                height: 45,
                width: 45,
                backgroundColor: "black",
                borderRadius: 30,
              }}
            />
          ) : (
            <View
              style={{
                height: 45,
                width: 45,
                borderRadius: 30,
                backgroundColor: "#FEC6C4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                {user.fullName.charAt(0)}
              </Text>
            </View>
          )}

          <View
            style={{
              width: ScreenWidth / 1.5,
            }}
          >
            <Text style={{ fontSize: 17 }}>{t("personal-page")}</Text>
            <Text style={{ fontSize: 15, fontWeight: "300" }}>
              {user.fullName}
            </Text>
          </View>
          <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
        </Pressable>

        {/* Cài đặt tài khoản */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          {t("account-settings")}
        </Text>
        <View
          style={{
            marginTop: 10,
            backgroundColor: "white",
            borderRadius: 10,
            paddingVertical: 5,
          }}
        >
          {/* Mật khẩu */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
            onPress={() => {
              // navigation.navigate("PasswordAndSecure", { id: 0 });
              // TODO: Sẽ mở sau khi đã làm xong
              setIsError(true);
              setStringErr(
                t("lock-feature")
              );
            }}
          >
            <View
              style={{
                width: ScreenWidth / 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="shield" size={20} color="#FB6562" />
            </View>
            <View
              style={{
                width: ScreenWidth / 1.5,
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, overflow: "hidden" }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t("password-input")}
              </Text>
            </View>
            <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
          </Pressable>

          {/* Thông tin cá nhân */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              padding: 10,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
            onPress={() => {
              navigation.navigate("ChangeProfile");
            }}
          >
            <View
              style={{
                width: ScreenWidth / 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons
                name="account-details-outline"
                size={23}
                color="#FB6562"
              />
            </View>
            <View
              style={{
                width: ScreenWidth / 1.5,
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, overflow: "hidden" }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t("personal-details")}
              </Text>
            </View>
            <Icon type="antdesign" name="right" color={"#FB6562"} size={20} />
          </Pressable>
        </View>
      </ScrollView>
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </LinearGradient>
  );
}
