import { View, Text, ScrollView, Image, FlatList } from "react-native";
import React from "react";
import logo from "../../assets/adaptive-icon.png";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import kietPic from "../../assets/kietPham.jpg"
import thongPic from "../../assets/minhThong.jpg"
import qKietPic from "../../assets/quangKiet.jpg"
import thuanPic from "../../assets/thuanLam.jpg"


const AboutTechGadget = () => {
  const teamData = [
    {
      avaURL: kietPic,
      jobTitle: "CEO TechGadget",
      intro: "Phạm Tuấn Kiệt (2003), là nhà sáng lập và phát triển giao diện kiêm hệ thống của ứng dụng TechGadget.",
      introContent: "Với niềm đam mê và tầm nhìn sáng tạo, anh đã biến TechGadget thành nền tảng độc đáo giúp người dùng dễ dàng tìm kiếm sản phẩm công nghệ. Hiện Kiệt đang quản lý và điều hành ứng dụng, đảm bảo mang đến trải nghiệm tốt nhất cho người dùng."
    },
    {
      avaURL: thuanPic,
      jobTitle: "Co-Founder TechGadget",
      intro: "Lâm Hữu Thuần (2003), là người đề ra ý tưởng và đồng sáng lập ứng dụng TechGadget.",
      introContent: "Với kỹ năng lập trình hướng đối tượng và chuyên môn ở phía back-end, anh đã góp phần quan trọng vào thành công của nền tảng này, hiện đang dẫn dắt và quản lý hoạt động của ứng dụng."
    },
    {
      avaURL: qKietPic,
      jobTitle: "Founder TechGadget",
      intro: "Đỗ Quang Kiệt (2003), là người sáng lập TechGadget và là chuyên gia trong lĩnh vực KTPM.",
      introContent: "Anh đặc biệt quan tâm và phát triển phần Frontend cho các ứng dụng web, sử dụng nền tảng React để tạo ra các trải nghiệm người dùng tốt nhất cho TechGadget."
    },
    {
      avaURL: thongPic,
      jobTitle: "Founder TechGadget",
      intro: "Lý Minh Thông (2003), chuyên ngành Kỹ sư phần mềm, áp dụng Tailwind.",
      introContent: "Anh chuyên phụ trách phát triển phần Frontend cho các ứng dụng web, sử dụng nền tảng React để tạo ra các trải nghiệm người dùng tốt nhất cho TechGadget."
    }
  ]
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
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

        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          TechGadget sẽ là người bạn đồng hành đáng tin cậy giúp bạn giải quyết vấn đề khó nhằn này một cách dễ dàng và thú vị.
        </Text>

        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          Chúng tôi là đội ngũ phát triển đằng sau TechGadget - một ứng dụng sáng tạo và độc đáo, chuyên về tìm kiếm sản phẩm công nghệ dựa trên ngôn ngữ tự nhiên.
        </Text>

        {/* Đội ngũ */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6, paddingHorizontal: 14 }}
        >
          <FontAwesome6 name="people-group" color={"#ed8900"} size={ScreenWidth / 20} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            Đội ngũ
          </Text>
        </View>

        {/* Team list */}
        <FlatList
          data={teamData}
          pagingEnabled={true}
          horizontal
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View
              key={index}
              style={{
                marginBottom: 10,
                gap: 10,
                width: ScreenWidth,
                paddingHorizontal: 14
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
              >
                <Image
                  source={item.avaURL}
                  style={{
                    height: ScreenWidth / 2.7,
                    width: ScreenWidth / 2.7,
                    marginTop: ScreenHeight / 80,
                    borderRadius: 30,
                  }}
                  resizeMode="cover"
                />
                <View style={{
                  height: ScreenWidth / 2.7,
                  width: ScreenWidth / 1.8,
                }}>
                  <Text
                    style={{ fontWeight: "bold", fontSize: 16, marginVertical: 5 }}
                  >
                    {item.jobTitle}
                  </Text>
                  <Text
                    style={{ fontSize: 15, overflow: "hidden", height: ScreenWidth / 4 }}
                  >
                    {item.intro}
                  </Text>
                </View>
              </View>
              <View style={{
                width: ScreenWidth / 1.1,
              }}>
                <Text
                  style={{ fontSize: 15 }}
                >
                  {item.introContent}
                </Text>
              </View>
            </View>
          )}
        />

        {/* Sứ mệnh */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6, paddingHorizontal: 14 }}
        >
          <Icon name="shield" type="entypo" color={"#ed8900"} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            Sứ mệnh
          </Text>
        </View>

        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          Chúng tôi tin rằng việc tìm kiếm sản phẩm để bỏ vào giỏ hàng không chỉ là một nhiệm vụ nhàm chán, mà còn là một thách thức đối với nhiều người. Với TechGadget, chúng tôi đã đặt ra sứ mệnh làm cho quá trình này trở nên dễ dàng và thú vị hơn bao giờ hết. Từ đó, giúp mọi người có thể khám phá những sản phẩm mới đa dạng, phong phú và đúng với nhu cầu tìm kiếm của người dùng.
        </Text>

        {/* Tầm nhìn */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6, paddingHorizontal: 14 }}
        >
          <Icon name="eye" type="font-awesome-5" color={"#ed8900"} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            Tầm nhìn
          </Text>
        </View>

        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          Tầm nhìn của chúng tôi không chỉ dừng lại ở việc giải quyết vấn đề "tìm kiếm nâng cao", mà còn là trở thành một phần không thể thiếu của cuộc sống hàng ngày của mọi gia đình và cá nhân.
        </Text>

        {/* Vì sao lại chọn chúng tôi? */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6, paddingHorizontal: 14 }}
        >
          <Icon name="question" type="octicon" color={"#ed8900"} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            Vì sao bạn nên chọn chúng tôi?
          </Text>
        </View>
        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ fontWeight: "600" }}>
            • Tiện ích và tiết kiệm thời gian:
          </Text>{" "}TechGadget không chỉ là một ứng dụng thương mại điện tử, mà còn là một công cụ hữu ích giúp bạn tiết kiệm thời gian và công sức trong việc tìm kiếm sản phẩm công nghệ hàng ngày. Với chúng tôi, việc lựa chọn sản phẩm không còn là nỗi lo lắng nữa.
        </Text>
        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ fontWeight: "600" }}>
            • Trải nghiệm độc đáo:
          </Text>{" "}Với TechGadget, chúng tôi cam kết mang đến cho bạn những trải nghiệm tìm kiếm độc đáo và thú vị. Hệ thống tìm kiếm sản phẩm công nghệ nâng cao của chúng tôi sẽ đem lại cho bạn những lựa chọn mới mẻ và đa dạng mỗi ngày.
        </Text>
      </ScrollView>
    </View>
  );
};

export default AboutTechGadget;
