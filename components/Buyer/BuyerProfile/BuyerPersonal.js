import {
  View,
  Text,
  ScrollView,
  Image,
  Linking,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import logo from "../../../assets/adaptive-icon.png";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Hyperlink from "react-native-hyperlink";
import ErrModal from "../../CustomComponents/ErrModal";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../../utils/useAuth";

export default function BuyerPersonal() {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const navigation = useNavigation();

  const { user } = useAuth();

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#fea92866"]}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ paddingHorizontal: 14 }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {/* TechGadget Logo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 10,
          }}
        >
          <View
            style={{
              height: 43,
              width: 43,
              overflow: 'hidden',
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{
                width: 48,
                height: 48,
              }}
              source={logo}
            />
          </View>
          <MaskedView
            maskElement={
              <Text
                style={{
                  backgroundColor: "transparent",
                  fontSize: 28,
                  fontWeight: "bold",
                }}
              >
                TechGadget
              </Text>
            }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 0.6 }}
              colors={["#EDCD2B", "#EDCD2B", "rgba(0,0,0, 0.7)"]}
            >
              <Text style={{ opacity: 0, fontSize: 28, fontWeight: "bold" }}>
                TechGadget
              </Text>
            </LinearGradient>
          </MaskedView>
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
          Trung tâm tài khoản
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
              url === "https://fa24se112-tech-gadgets.github.io/Tech-Gadgets-Policy/"
                ? "Tìm hiểu thêm"
                : url
            }
            onPress={(url, text) => {
              Linking.openURL("https://fa24se112-tech-gadgets.github.io/Tech-Gadgets-Policy/"); //Link policy TechGadget
            }}
          >
            <Text style={{ fontSize: 16 }}>
              Quản lý phần cài đặt tài khoản và trải nghiệm kết nối trên các công nghệ của TechGadget.{"\u00A0"}
              <Text
                style={{
                  fontSize: 16,
                  color: "#ed8900",
                }}
              >
                https://fa24se112-tech-gadgets.github.io/Tech-Gadgets-Policy/
              </Text>
            </Text>
          </Hyperlink>
        </View>

        {/* Cài đặt tài khoản */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
          Cài đặt tài khoản
        </Text>
        <View
          style={{
            marginTop: 10,
            backgroundColor: "white",
            borderRadius: 10,
            paddingVertical: 5,
          }}
        >
          {
            user?.loginMethod === "Default" &&
            // Mật khẩu
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
                navigation.navigate("PasswordAndSecure");
              }}
            >
              <View
                style={{
                  width: ScreenWidth / 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="shield" size={20} color="#ed8900" />
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
                  Mật khẩu
                </Text>
              </View>
              <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
            </Pressable>
          }

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
                color="#ed8900"
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
                Thông tin cá nhân
              </Text>
            </View>
            <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
          </Pressable>
        </View>
      </ScrollView>
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </LinearGradient >
  );
}
