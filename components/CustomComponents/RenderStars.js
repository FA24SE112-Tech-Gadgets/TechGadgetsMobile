import { View } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HalfStar = ({ color1, color2 }) => (
  <View style={{ flexDirection: "row" }}>
    <Icon
      name="star-half"
      size={24}
      color={color1}
      style={{ marginRight: -24 }}
    />
    <Icon
      name="star-half"
      size={24}
      color={color2}
      style={{ transform: [{ scaleX: -1 }] }}
    />
  </View>
);
const RenderStars = ({ avgRating, size = 22 }) => {
  const fullStars = Math.floor(avgRating);
  const halfStar = avgRating - fullStars >= 0.5;
  const totalStars = 5;
  const starArray = [];

  for (let i = 1; i <= totalStars; i++) {
    if (i <= fullStars) {
      starArray.push(<Icon name="star" key={i} size={size} color="#FFD700" />);
    } else if (i === fullStars + 1 && halfStar) {
      starArray.push(<HalfStar key={i} color1="#FFD700" color2="#E8E8E8" />);
    } else {
      starArray.push(<Icon name="star" key={i} size={size} color="#E8E8E8" />);
    }
  }

  return starArray;
};

export default RenderStars;
