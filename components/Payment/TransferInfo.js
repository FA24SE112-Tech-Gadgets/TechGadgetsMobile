import {
  View,
  StyleSheet,
  Alert,
  Image,
  Text,
  Pressable,
} from "react-native";
import { useEffect, useState, useRef, useCallback } from "react";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";
import { captureRef } from "react-native-view-shot";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getBanksList } from "../../services/payment";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { IconButton, Snackbar } from 'react-native-paper';
import ErrModal from "../CustomComponents/ErrModal";
import { useTranslation } from "react-i18next";
import api from "../Authorization/api";

const TransferInfo = ({ route }) => {
  const {
    accountName,
    amount,
    bin,
    description,
    qrCode,
    paymentLinkId
  } = route.params;
  const { t } = useTranslation();

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [shouldStop, setShouldStop] = useState(false);

  const [bank, setBank] = useState({ logo: undefined, name: undefined });

  const viewShotRef = useRef(null);
  const navigation = useNavigation();

  const captureAndSaveImage = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef, {
          fileName: `TechGadget_QrCode.png`,
          format: "png",
          quality: 1,
        });
        const image = await CameraRoll.save(uri, { type: "photo" });
        if (image) {
          setSnackbarVisible(true);
          setSnackbarMessage(t("save-qr-success"));
        }
      }
    } catch (error) {
      console.log("Error while capturing and saving image:", error);
      setIsError(true);
      setStringErr(t("err-save-qr"));
    }
  };
  useEffect(() => {
    (async () => {
      try {
        const resBank = await getBanksList();
        if (resBank.code != "00") {
          setIsError(true);
          setStringErr(t("err-get-bank"));
          return;
        }

        const bank = resBank.data.filter((item) => item.bin == bin)[0];
        setBank((prev) => bank);
      } catch (error) {
        setIsError(true);
        setStringErr(error.message);
      }
    })();
  }, []);

  const handleShareBtn = () => {
    setIsError(true);
    setStringErr(t("update-waiting"));
  }

  async function fetchPaymentStatus() {
    try {
      const res = await api.get(`/subscriptions/paymentId/${paymentLinkId}`);
      if (res.status >= 200 && res.status < 300) {
        const subscriptionStatus = res.data.subscriptionStatus;
        if (subscriptionStatus === "EXPIRED") {
          setShouldStop(true);
          navigation.replace("PaymentFail", res.data);
        } else if (subscriptionStatus === "ACTIVE") {
          setShouldStop(true);
          navigation.replace("PaymentSuccess", res.data);
        }
      }
    } catch (error) {
      console.log("err fetchPaymentStatus", error.response?.data?.reasons[0]?.message);
      // setIsError(true);
      // setStringErr(
      //   error.response?.data?.reasons[0]?.message ?
      //     error.response.data.reasons[0].message
      //     :
      //     t("network-error")
      // );
    }
  }

  useFocusEffect(
    useCallback(() => {
      const intervalId = setInterval(() => {
        if (!shouldStop) {
          fetchPaymentStatus();
        }
      }, 10000); // 10 giây

      return () => clearInterval(intervalId); // Dọn dẹp interval khi component unmount
    }, [shouldStop])
  );

  return (
    <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.8 }}
        colors={["#FFFFFF", "#ed8900"]}
        style={styles.container}
        ref={viewShotRef}
      >
        {/* QR and detail */}
        <View style={{
          height: ScreenHeight / 15,
          width: ScreenWidth / 2,
        }}>
          {bank.logo && (
            <Image source={{ uri: bank?.logo }} style={styles.image} />
          )}
        </View>

        <View style={styles.qrCode}>
          <QRCode value={qrCode} size={ScreenWidth / 2} backgroundColor="transparent" />
        </View>

        <View style={{
          width: ScreenWidth / 1.5,
          paddingLeft: 10,
          marginTop: 10
        }}>
          {bank.name && <Text style={styles.bankName}>{bank.name}</Text>}
          <Text style={{ fontSize: 15, color: "white" }}>{accountName}</Text>
          <Text style={{ fontSize: 15, color: "white" }}>{t("amount-payment")} {amount} VND</Text>
          <Text style={{ fontSize: 15, color: "white" }}>{t("payment-pack")} <Text style={{ fontWeight: "500" }}>{description}</Text></Text>
        </View>

        {/* QR Code Download Or Share */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={{
              backgroundColor: "#FFE4E3",
              height: ScreenHeight / 25,
              width: ScreenWidth / 4,
              alignItems: "center",
              justifyContent: "space-around",
              borderRadius: 10,
              flexDirection: "row",
              paddingHorizontal: 5,
            }}
            onPress={captureAndSaveImage}
          >
            <Feather name="download" size={ScreenWidth / 20} color={"black"} />
            <Text style={{ fontSize: 15 }}>{t("payment-download")}</Text>
          </Pressable>

          <Pressable
            style={{
              backgroundColor: "#FFE4E3",
              height: ScreenHeight / 25,
              width: ScreenWidth / 4,
              alignItems: "center",
              justifyContent: "space-around",
              borderRadius: 10,
              flexDirection: "row",
              paddingHorizontal: 5,
            }}
            onPress={handleShareBtn}
          >
            <Feather name="share" size={ScreenWidth / 20} color={"black"} />
            <Text style={{ fontSize: 15 }}>{t("payment-share")}</Text>
          </Pressable>
        </View>

        {/* Lưu ý */}
        <View style={{
          position: "absolute",
          bottom: ScreenHeight / 25,
          width: ScreenWidth,
          height: ScreenHeight / 10,
          justifyContent: "center"
        }}>
          <Text style={{ textAlign: "center", textAlignVertical: "center", fontSize: 15, color: "white" }}>
            {t("payment-note1")}
            <Text style={{ fontWeight: "bold" }}>{amount}</Text>
            {t("payment-note2")}
          </Text>
        </View>

        {/* Close icon */}
        <View style={{
          position: "absolute",
          top: 5,
          left: 5,
          zIndex: 1
        }}>
          <IconButton
            icon={"close"}
            iconColor='grey'
            size={ScreenWidth / 12}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={1500}
          wrapperStyle={{ bottom: 50, zIndex: 1 }}
        >
          {snackbarMessage}
        </Snackbar>

        <ErrModal
          stringErr={stringErr}
          isError={isError}
          setIsError={setIsError}
        />
      </LinearGradient>
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    gap: 10,
    height: ScreenHeight,
    width: ScreenWidth,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  image: {
    flex: 1,
  },
  bankName: {
    fontWeight: "500",
    fontSize: 18,
    color: "white"
  },
  qrCode: {
    width: ScreenWidth / 1.5,
    height: ScreenWidth / 1.5,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FFE4E3",
  },
  buttonContainer: {
    width: ScreenWidth / 1.5,
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10
  },
});

export default TransferInfo;