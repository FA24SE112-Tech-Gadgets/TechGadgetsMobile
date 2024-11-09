import { View, Text, ScrollView, Image, FlatList } from "react-native";
import React from "react";
import logo from "../../assets/adaptive-icon.png";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useTranslation } from "react-i18next";
import kietPic from "../../assets/kietPham.jpg"
import dungPic from "../../assets/dungDao.jpg"
import longPic from "../../assets/longDoan.jpg"
import khanhPic from "../../assets/khanhMai.jpg"
import thuanPic from "../../assets/thuanLam.jpg"
import linhPic from "../../assets/linhDo.jpg"


const AboutTechGadget = () => {
  const { t } = useTranslation();
  const teamData = [
    {
      avaURL: kietPic,
      jobTitle: "CEO TechGadget",
      intro: t("ptk-intro"),
      introContent: t("ptk-intro-content")
    },
    {
      avaURL: dungPic,
      jobTitle: "Co-Founder TechGadget",
      intro: t("vincent-intro"),
      introContent: t("vincent-intro-content")
    },
    {
      avaURL: thuanPic,
      jobTitle: "Founder TechGadget",
      intro: t("thuan-intro"),
      introContent: t("thuan-intro-content")
    },
    {
      avaURL: linhPic,
      jobTitle: "Founder TechGadget",
      intro: t("linh-intro"),
      introContent: t("linh-intro-content")
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
          {t("about-intro")}
        </Text>

        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          {t("about-intro-content")}
        </Text>

        {/* Đội ngũ */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6, paddingHorizontal: 14 }}
        >
          <FontAwesome6 name="people-group" color={"#ed8900"} size={ScreenWidth / 20} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            {t("what-eat-team")}
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
            {t("what-eat-mission")}
          </Text>
        </View>

        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          {t("mission-content")}
        </Text>

        {/* Tầm nhìn */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6, paddingHorizontal: 14 }}
        >
          <Icon name="eye" type="font-awesome-5" color={"#ed8900"} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            {t("what-eat-vision")}
          </Text>
        </View>

        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          {t("vision-content")}
        </Text>

        {/* Vì sao lại chọn chúng tôi? */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6, paddingHorizontal: 14 }}
        >
          <Icon name="question" type="octicon" color={"#ed8900"} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            {t("why-us")}
          </Text>
        </View>
        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ fontWeight: "600" }}>
            • {t("save-time")}
          </Text>{t("save-time-content")}
        </Text>
        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ fontWeight: "600" }}>
            • {t("good-exp")}
          </Text>{t("good-exp-content")}
        </Text>
        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ fontWeight: "600" }}>
            • {t("phac-do")}
          </Text>{t("phac-do-content")}
        </Text>
        <Text style={{ fontSize: 16, marginVertical: 10, paddingHorizontal: 14 }}>
          <Text style={{ fontWeight: "600" }}>
            • {t("social-exp")}
          </Text>{t("social-exp-content")}
        </Text>
      </ScrollView>
    </View>
  );
};

export default AboutTechGadget;
