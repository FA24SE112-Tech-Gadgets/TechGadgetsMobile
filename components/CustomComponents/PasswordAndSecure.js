import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import logo from "../../assets/adaptive-icon.png";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import { Snackbar } from "react-native-paper";
import ErrModal from "./ErrModal";
import api from '../Authorization/api';

export default function PasswordAndSecure() {

  const [isOpenChangePass, setOpenChangePass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [isFetching, setIsFetching] = useState(false);

  const handleUpdate = async () => {
    if (newPassword !== newConfirmPassword) {
      setIsError(true);
      setStringErr("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setIsFetching(true);
      const response = await api.put('/user/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword
      });
      setIsFetching(false);

      if (response.status === 200) {
        setOpenChangePass(false);
        setSnackbarVisible(true);
        setSnackbarMessage("Cập nhật mật khẩu thành công");
        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setNewConfirmPassword("");
      } else {
        setIsError(true);
        setStringErr("Có lỗi xảy ra khi cập nhật mật khẩu");
      }
    } catch (error) {
      setIsError(true);
      if (error.response && error.response.status === 400) {
        setStringErr("Mật khẩu hiện tại không chính xác");
      } else {
        setStringErr("Có lỗi xảy ra khi cập nhật mật khẩu");
      }
      setIsFetching(false);
    }
  };

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

        {/* Mật khẩu */}
        <Text
          style={{
            fontSize: 25,
            fontWeight: "bold",
            textAlignVertical: "center",
          }}
        >
          Mật khẩu
        </Text>
        <Text style={{ fontSize: 17, fontWeight: "500", marginTop: 10 }}>
          Đăng nhập & tùy chọn
        </Text>
        <Text style={{ fontSize: 15 }}>
          Quản lý mật khẩu và tùy chọn đăng nhập.
        </Text>

        {/* Đổi mật khẩu */}
        <View
          style={{
            marginTop: 10,
            backgroundColor: "white",
            borderRadius: 10,
            paddingVertical: 5,
          }}
        >
          {/* Mật khẩu và bảo mật */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
            onPress={() => setOpenChangePass(true)}
          >
            <View
              style={{
                width: ScreenWidth / 1.5,
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 17, overflow: "hidden" }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Đổi mật khẩu
              </Text>
            </View>
            <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
          </Pressable>

        </View>

        <Modal
          isVisible={isOpenChangePass}
          onBackdropPress={() => setOpenChangePass(false)}
          onSwipeComplete={() => setOpenChangePass(false)}
          useNativeDriverForBackdrop
          swipeDirection={"down"}
          propagateSwipe={true}
          style={{
            justifyContent: 'flex-end',
            margin: 0,
          }}
        >
          {/* Bottom Modal Screen */}
          <LinearGradient
            colors={["#FFFFFF", "#ed8900"]}
            style={{
              width: ScreenWidth,
              height: ScreenHeight / 3,
              borderTopRightRadius: 20,
              borderTopLeftRadius: 20
            }}
          >
            {/* Thanh trên cùng */}
            <View
              style={{
                width: ScreenWidth / 5,
                height: ScreenHeight / 80,
                backgroundColor: "#ed8900",
                borderRadius: 30,
                alignSelf: "center",
                margin: 10,
              }}
            />

            <View
              style={{
                marginVertical: 10,
                paddingHorizontal: 10,
                paddingVertical: 10,
                gap: 10,
                backgroundColor: "white",
                width: ScreenWidth / 1.1,
                borderRadius: 10,
                alignSelf: "center"
              }}
            >
              <TextInput
                style={{
                  borderColor: "#B7B7B7",
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  fontSize: 15,
                }}
                placeholder="Nhập mật khẩu hiện tại"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={true}
              />
              <TextInput
                style={{
                  borderColor: "#B7B7B7",
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  fontSize: 15,
                }}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={true}
              />
              <TextInput
                style={{
                  borderColor: "#B7B7B7",
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  fontSize: 15,
                }}
                placeholder="Xác nhận mật khẩu mới"
                value={newConfirmPassword}
                onChangeText={setNewConfirmPassword}
                secureTextEntry={true}
              />
              <Pressable
                style={{
                  backgroundColor: "#ed8900",
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  marginTop: 10,
                  borderRadius: 6,
                  flexDirection: "row",
                  gap: 10,
                  justifyContent: "center"
                }}
                onPress={handleUpdate}
              >
                <Text
                  style={{
                    color: "white",
                    textAlign: "center",
                    textAlignVertical: "center",
                    fontSize: 16,
                  }}
                >
                  Cập nhật
                </Text>
                {
                  isFetching &&
                  <ActivityIndicator color={"white"} />
                }
              </Pressable>
            </View>
          </LinearGradient>
        </Modal>
      </ScrollView>

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0 }}
      >
        {snackbarMessage}
      </Snackbar>
    </LinearGradient>
  );
}