import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import React from "react";
import logo from "../../assets/adaptive-icon.png";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import { useTranslation } from "react-i18next";

const Policy = () => {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={styles.container}
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
          <Image
            style={{
              width: 70,
              height: 70,
              borderColor: "black",
              marginRight: -12,
            }}
            source={logo}
          />
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
              colors={["rgba(250, 164, 147, 0.65)", "#FB5854"]}
            >
              <Text style={{ opacity: 0, fontSize: 28, fontWeight: "bold" }}>
                TechGadget
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* Giới thiệu */}
        <View
          style={{ flexDirection: "row", alignItems: "center", columnGap: 6 }}
        >
          <Icon name="users" type="font-awesome" color={"#ed8900"} />
          <Text
            style={{ fontWeight: "bold", fontSize: 18, marginVertical: 10 }}
          >
            {t("introduction")}
          </Text>
        </View>

        {/* Giới thiệu content */}
        <Text style={styles.paragraph}>
          {t("intro-content")}
        </Text>

        {/* KHI NÀO TechGadget SẼ THU THẬP DỮ LIỆU CÁ NHÂN? */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          <Icon
            name="access-time"
            size={28}
            type="material"
            color={"#ed8900"}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.8,
            }}
          >
            {t("when-collecting-data")}
          </Text>
        </View>

        <Text style={styles.paragraph}>
          {t("maybe-collect")}
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-register")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-send-application")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-sign-application")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-contact-us")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-using-e-commerce")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-give-access")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-transaction")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-feedback")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-send-personal")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("when-do-sth")}
          </Text>
        </View>
        <Text style={styles.paragraph}>
          {t("none-of-above")}
        </Text>

        {/* TechGadget SẼ THU THẬP NHỮNG DỮ LIỆU GÌ? */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          <Icon
            name="database-outline"
            size={28}
            type="material-community"
            color={"#ed8900"}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.8,
            }}
          >
            {t("what-collect")}
          </Text>
        </View>
        <Text style={styles.paragraph}>
          {t("what-collect-content")}
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>{t("name-policy")}</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>{t("email-policy")}</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>{t("dob-policy")}</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("shipping-address")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("payment-info")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>{t("register-phone")}</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>{t("gender-policy")}</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("relate-policy")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("internet-policy")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("img-vid-policy")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("family-policy")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("mkt-policy")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("payment-policy")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>{t("location-policy")}</Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("other-people-policy")}
          </Text>
        </View>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>&#8226;</Text>
          <Text style={styles.bulletText}>
            {t("user-content")}
          </Text>
        </View>

        {/* COOKIES */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Icon name="cookie" size={28} type="material" color={"#ed8900"} />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.8,
            }}
          >
            COOKIES
          </Text>
        </View>

        <Text style={styles.paragraph}>
          {t("cookies-content")}
        </Text>

        {/* LOẠI TRỪ TRÁCH NHIỆM VỀ NGHĨA VỤ BẢO MẬT VÀ CÁC TRANG WEB BÊN THỨ BA */}
        <View
          style={{
            flexDirection: "row",
            columnGap: 6,
            marginBottom: 10,
            marginTop: 16,
          }}
        >
          <Icon
            name="alert-minus"
            size={28}
            type="material-community"
            color={"#ed8900"}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              width: ScreenWidth * 0.83,
            }}
          >
            {t("policy-except")}
          </Text>
        </View>

        <Text style={styles.paragraph}>
          <Text style={{ fontWeight: "500", color: "red" }}>
            {t("not-sure-secure")}
          </Text>
          {"\u00A0"}{t("way-secure")}
        </Text>
        <View style={{ marginBottom: ScreenHeight / 15 }} />
        <View style={{
          width: ScreenWidth / 1.1,
          height: ScreenHeight / 10,
          alignItems: "flex-end",
          marginBottom: ScreenHeight / 35
        }}>
          <Text style={[styles.paragraph, { marginBottom: 0 }]}>
            {t("editor")}
          </Text>
          <Text style={[styles.paragraph, { marginBottom: 0 }]}>
            {t("supporter")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  bulletContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    marginRight: 8,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 24,
    flex: 1,
  },
});

export default Policy;
