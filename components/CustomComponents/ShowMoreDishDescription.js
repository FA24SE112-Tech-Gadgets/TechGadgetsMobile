import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const ShowMoreDishDescription = ({ data }) => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <View
      style={{
        paddingHorizontal: 6,
        paddingVertical: 4,
        backgroundColor: "#F4F4F4",
        borderRadius: 12,
      }}
    >
      <Text numberOfLines={showMore ? undefined : 2} style={{ fontSize: 15 }}>
        {data.description}
      </Text>
      {!showMore ? (
        <TouchableOpacity onPress={toggleShowMore}>
          <Text style={{ color: "grey" }}>More</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={toggleShowMore}>
          <Text style={{ color: "grey" }}>Less</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ShowMoreDishDescription;
