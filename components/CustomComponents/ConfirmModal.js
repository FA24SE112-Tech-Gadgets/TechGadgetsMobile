import React from "react";
import { useTranslation } from "react-i18next";
import { View, Text, Pressable, Modal } from "react-native";

export default ConfirmModal = ({ visible, onClose, onConfirm, textTitle }) => {
  const { t } = useTranslation();
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 20, marginBottom: 20 }}>{textTitle}</Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Pressable
              style={{
                flex: 0.5,
                backgroundColor: "#FB6562",
                padding: 10,
                borderWidth: 1,
                borderColor: "black",
                borderRadius: 5,
                marginHorizontal: 10,
              }}
              onPress={onConfirm}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  textAlignVertical: "center",
                  textAlign: "center",
                }}
              >
                {t("confirm-yes")}
              </Text>
            </Pressable>
            <Pressable
              style={{
                flex: 0.5,
                backgroundColor: "white",
                padding: 10,
                borderWidth: 1,
                borderColor: "black",
                borderRadius: 5,
                marginHorizontal: 10,
              }}
              onPress={onClose}
            >
              <Text
                style={{
                  color: "black",
                  fontSize: 18,
                  textAlignVertical: "center",
                  textAlign: "center",
                }}
              >
                {t("confirm-no")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
