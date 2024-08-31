import { View, Text } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ScreenHeight, ScreenWidth } from "@rneui/base";

const CommonHeader = ({ text }) => {

  return (
    <View
      style={{
        height: ScreenHeight / 9,
        backgroundColor: "#FB6562",
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <View style={{ height: ScreenHeight / 12, justifyContent: "center", }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 8,
            width: ScreenWidth / 1.1,
            paddingHorizontal: 20,
            backgroundColor: "white",
            borderRadius: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFC100",
              borderRadius: 30,
              padding: 6,
            }}
          >
            <Icon name="robot-excited-outline" size={30} color="white" />
          </View>
          <View>
            <Text style={{
              fontSize: ScreenWidth / 27,
              fontWeight: "600",
              width: ScreenWidth / 1.8,
            }}>{text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommonHeader;
