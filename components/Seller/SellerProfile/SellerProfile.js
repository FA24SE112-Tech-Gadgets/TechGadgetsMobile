import { View, Text, Pressable, TextInput } from "react-native";
import React, { useCallback, useState } from "react";
import useAuth from "../../../utils/useAuth";
import { Avatar, Divider, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import { Linking } from "react-native";
import ErrModal from "../../CustomComponents/ErrModal";
import { useFocusEffect, useNavigation, CommonActions } from "@react-navigation/native";
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import useNotification from "../../../utils/useNotification";

export default function SellerProfile() {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);
  const navigation = useNavigation();

  const [walletOpen, setWalletOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState("0 ₫");
  const [showWalletAmount, setShowWalletAmount] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  function formatCurrency(number) {
    // Convert the number to a string
    if (number) {
      let numberString = number.toString();

      // Regular expression to add dot as thousand separator
      let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";

      return formattedString;
    }
  }

  const handleOpenError = (message) => {
    setStringErr(message);
    setIsError(true);
  }

  const {
    logout,
    user,
  } = useAuth();

  const {
    setNotifications,
    setNewNotifications,
    setCurrentPage,
    handleDeleteDeviceToken,
    setUnreadNotifications
  } = useNotification();

  useFocusEffect(
    useCallback(() => {
      setWalletOpen(false);
      setShowWalletAmount(false);
      if (user?.wallet) {
        if (user?.wallet.amount > 0) {
          setWalletAmount(formatCurrency(user.wallet.amount));
        }
      } else {
        setWalletAmount("0 ₫");
      }
    }, [])
  );

  return (
    <LinearGradient colors={['#fea92866', '#FFFFFF']} style={{ flex: 1 }}>
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
        {user?.imageUrl ? (
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
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#ed8900" }}>
              {user.seller !== null ? user.seller?.shopName?.charAt(0) : "G"}
            </Text>
          </View>
        )}
        <Text
          style={{ fontSize: 20, color: "white", overflow: "hidden", width: ScreenWidth / 1.3 }}
          numberOfLines={1} // Giới hạn hiển thị trên 1 dòng
          ellipsizeMode="tail" // Thêm "..." vào cuối nếu quá dài
        >
          {user.seller !== null ? user.seller?.shopName : "Người dùng hệ thống"}
        </Text>
      </View>

      {/* Profile function */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, rowGap: 10 }}>
        {/* Thông tin người bán */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            if (user.seller == null) {
              handleOpenError("Vui lòng đăng ký thông tin người bán để sử dụng tính năng này.")
            } else {
              navigation.navigate("BuyerPersonal");
            }
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
                name="account-outline"
                size={24}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Thông tin người bán
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
        </Pressable>
        <Divider />

        {/* Ví của tôi */}
        <Pressable
          onPress={() => {
            setWalletOpen(!walletOpen);
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
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: 25,
                  width: 25,
                }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={23}
                />
              </View>
              <Text style={{ fontSize: 15, fontWeight: "500" }}>
                Ví của tôi
              </Text>
            </View>

            <Icon type="antdesign" name={walletOpen ? "down" : "right"} color={"#ed8900"} size={20} />
          </View>
        </Pressable>

        {
          walletOpen ?
            <>
              <View style={{
                width: ScreenWidth / 1.18,
                alignSelf: "flex-end",
                gap: 10
              }}>
                {/* Số dư ví */}
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}>
                  {/* Số dư ví */}
                  <View style={{
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center"
                  }}>
                    <Text style={{
                      fontSize: 16
                    }}>Số dư ví:</Text>
                    <TextInput
                      style={{
                        fontSize: 16,
                        color: "black"
                      }}
                      editable={false}
                      secureTextEntry={showWalletAmount ? false : true}
                      value={walletAmount}
                      onChangeText={(text) => setPassword(text)}
                    />
                  </View>

                  {/* Eye btn */}
                  <Pressable
                    onPress={() => setShowWalletAmount(!showWalletAmount)}
                  >
                    <Ionicons
                      name={!showWalletAmount ? "eye-off-sharp" : "eye-sharp"}
                      size={20}
                      color="rgba(0, 0, 0, 0.5)"
                    />
                  </Pressable>
                </View>

                {/* Lịch sử giao dịch */}
                <Pressable
                  onPress={() => {
                    if (user.seller == null) {
                      handleOpenError("Vui lòng đăng ký thông tin người bán để sử dụng tính năng này.")
                    } else {
                      navigation.navigate("WalletTrackingScreen");
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
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          height: 25,
                          width: 25,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="history"
                          size={23}
                        />
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: "500" }}>
                        Lịch sử giao dịch
                      </Text>
                    </View>

                    <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
                  </View>
                </Pressable>
              </View>
              <Divider />
            </>
            :
            <Divider />
        }

        {/* Đánh giá sản phẩm */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={() => {
            if (user.seller == null) {
              handleOpenError("Vui lòng đăng ký thông tin người bán để sử dụng tính năng này.")
            } else {
              navigation.navigate("SellerOrderReviews");
            }
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
                type="ant-design"
                name="staro"
                size={24}
              />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Đánh giá sản phẩm
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
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
              Trung tâm trợ giúp
            </Text>
          </View>

          <Icon type="antdesign" name="right" color={"#ed8900"} size={20} />
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
              Chính sách quy định
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
      </View>

      {/* Đăng xuất */}
      <Pressable
        onPress={async () => {
          await handleDeleteDeviceToken();
          await logout();
          setCurrentPage(1);
          setNotifications([]);
          setNewNotifications([]);
          setUnreadNotifications(0);
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

      <ConfirmHelpCenterModal
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
      />
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </LinearGradient>
  );
}

const ConfirmHelpCenterModal = ({ showConfirmModal, setShowConfirmModal }) => {
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
          Bạn sẽ được điều hướng sang trang Web khác
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
              borderColor: "#ed8900",
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center"
            }}
            onPress={() => setShowConfirmModal(false)}
          >
            <Text style={{ fontWeight: "bold", color: "#ed8900" }}>HỦY</Text>
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
              justifyContent: "center"
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
