import { View, Text, ScrollView, Pressable } from "react-native";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import DishHorizontal from "../CustomComponents/DishHorizontal";
import { Divider } from "@rneui/base";

const data = [
  {
    id: 1,
    image:
      "https://images.foody.vn/res/g80/793247/prof/s576x330/foody-upload-api-foody-mobile-phoboquynh-jpg-181105133924.jpg",
    name: "Phở Quỳnh Lê Văn Việt",
    avgRating: 4.6,
    numRating: 99,
    price: "35.000",
    description:
      "Quán phở nổi tiếng với nước dùng ngon, nhiều hương vị từ xương và nắm đặc biệt của đầu bếp.",
    address: "13 Lê Văn Việt, Quận 9, TP. Hồ Chí Minh",
  },
  {
    id: 2,
    image:
      "https://mia.vn/media/uploads/blog-du-lich/Pho-bat-dan-pho-gia-truyen-100-nam-tuoi-tai-ha-noi-05-1639325605.jpg",
    name: "Phở Bát Đản",
    avgRating: 4.5,
    numRating: 123,
    price: "40.000",
    description:
      "Quán phở lâu đời với nước dùng ngọt thanh, thịt bò thơm ngon, phục vụ tận tình.",
    address: "49 Bát Đản, Quận 3, TP. Hồ Chí Minh",
  },
  {
    id: 3,
    image:
      "https://cdn.tuoitre.vn/thumb_w/730/471584752817336320/2023/2/24/base64-16772329880401347618399.png",
    name: "Phở Thìn Bờ Hồ",
    avgRating: 4.4,
    numRating: 87,
    price: "45.000",
    description:
      "Quán phở ven hồ với không gian yên tĩnh, nước dùng ngon, đậm đà hương vị.",
    address: "26 Bờ Hồ, Quận 10, TP. Hồ Chí Minh",
  },
  {
    id: 4,
    image:
      "https://cdn.tgdd.vn/Files/2020/12/31/1317213/top-10-quan-pho-ngon-tru-danh-khap-sai-gon-ma-ban-nen-an-thu-mot-lan-202012311449138145.jpg",
    name: "Phở Vương Béo",
    avgRating: 4.3,
    numRating: 112,
    price: "50.000",
    description:
      "Quán phở nổi tiếng với nước dùng đậm đà, thịt bò thơm ngon, phục vụ nhiệt tình.",
    address: "97 Nguyễn Thái Bình, Quận 1, TP. Hồ Chí Minh",
  },
];

const food = {
  id: 1,
  food: "Phở",
  time: "26 Th2 2024, 7:31",
  haveDetail: true,
};

const CustomerHistoryDetail = ({ navigation, route }) => {
  const [dishes, setDishes] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);

  const id = route.params;

  useFocusEffect(useCallback(() => { }, []));

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>{food.food}</Text>
        <Text style={{ color: "#7C7C7C" }}>{food.time}</Text>
      </View>
      <ScrollView
        style={{
          paddingHorizontal: 18,
        }}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 20 }}>
          {dishes.map((item, index) => (
            <View key={index}>
              <Pressable
                onPress={() =>
                  navigation.navigate("CustomerDishDetail", item)
                }
              >
                <DishHorizontal {...item} />
                {index < data.length - 1 && (
                  <Divider style={{ marginVertical: 14 }} />
                )}
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CustomerHistoryDetail;
