import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome, Ionicons, FontAwesome6, Entypo } from '@expo/vector-icons';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import Clipboard from '@react-native-clipboard/clipboard';
import Pdf from 'react-native-pdf';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import * as Location from "expo-location"
import Mapbox, { MapView, Camera, PointAnnotation, Logger, } from "@rnmapbox/maps";
Logger.setLogCallback(log => {
  const { message } = log;
  if (
    message.match("Request failed due to a permanent error: Canceled") ||
    message.match("Request failed due to a permanent error: Socket Closed")
  ) {
    return true;
  }
  return false;
})
Mapbox.setWellKnownTileServer('Mapbox');
Mapbox.setAccessToken("pk.eyJ1IjoidGVjaGdhZGdldHMiLCJhIjoiY20wbTduZ2luMGUwOTJrcTRoZ2sxdDlxNSJ9._u75BBT2ZyNAfGwkcSgVOw");

const CertificateDetail = ({
  application,
  onClose,
  setSnackbarMessage,
  setSnackbarVisible,
  setStringErr,
  setIsError
}) => {
  const [fileType, setFileType] = useState("unknown");

  const [location, setLocation] = useState(null);

  const geocode = async () => {
    const geocodedLocation = await Location.geocodeAsync(
      application?.shopAddress
        ? application.shopAddress
        : "Ho Chi Minh"
    ); //Default Ho Chi Minh
    setLocation(geocodedLocation[0]);
  };

  const businessModelTranslation = {
    BusinessHousehold: 'Hộ Kinh Doanh',
    Personal: 'Cá Nhân',
    Company: 'Công Ty',
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    setSnackbarMessage("Sao chép thành công");
    setSnackbarVisible(true);
  };

  const getFileType = (url) => {
    if (!url) return null;

    // Extract file extension
    const extension = url.split('.').pop().toLowerCase();

    // Check file type
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else {
      return 'unknown';
    }
  };

  const downloadFile = async (url) => {
    try {
      const extension = url.split('.').pop().toLowerCase();

      // Đường dẫn lưu file
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${application.id}.${extension}`;

      // Tải file
      const result = await RNFS.downloadFile({
        fromUrl: url,
        toFile: downloadDest,
      }).promise;

      if (result.statusCode === 200) {
        setSnackbarMessage("Tải về thành công");
        setSnackbarVisible(true);
      } else {
        Alert.alert("Lỗi", `Không thể tải file. Mã lỗi: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(error);
      setStringErr(
        "Lỗi tải xuống, vui lòng thử lại sau"
      );
      setIsError(true);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  useFocusEffect(
    useCallback(() => {
      if (application?.businessRegistrationCertificateUrl) {
        const type = getFileType(application.businessRegistrationCertificateUrl);
        setFileType(type);
      }
    }, [application?.businessRegistrationCertificateUrl])
  );

  //Fetch seller application position
  useEffect(() => {
    geocode();
  }, [])

  return (
    <View style={styles.overlay}>
      <ScrollView
        style={[styles.modalContainer, {
          maxHeight: ScreenHeight / 1.3
        }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chi Tiết Đơn Đăng Ký</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          {/* Shop Name + Shop address */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetags" size={24} color="black" />
              <Text style={styles.sectionTitle}>Thông Tin Cửa Hàng</Text>
            </View>

            {/* Shop Name + Shop address */}
            <View style={styles.sectionContent}>
              <Text
                style={styles.sectionText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Tên Cửa Hàng: {application.shopName}
              </Text>
              <Text
                style={styles.sectionText}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                Địa Chỉ Cửa Hàng: {application.shopAddress}
              </Text>

              <View style={{
                height: ScreenHeight / 7,
                width: ScreenWidth / 1.55,
                marginVertical: 3,
                borderRadius: 15, // Tạo borderRadius
                overflow: "hidden", // Ẩn phần bên ngoài View,
                borderColor: "rgba(0,0,0,0.2)",
                borderWidth: 1
              }}>
                <MapView
                  style={{
                    flex: 1
                  }}
                  styleURL="mapbox://styles/mapbox/streets-v12"
                  zoomEnabled={false}
                  attributionEnabled={false} //Ẩn info icon
                  logoEnabled={false} //Ẩn logo
                  rotateEnabled={false}
                  scrollEnabled={false}
                >
                  <Camera
                    centerCoordinate={[location?.longitude || 0, location?.latitude || 0]}
                    zoomLevel={15}
                    pitch={10}
                    heading={0}
                  />

                  <PointAnnotation
                    id="marker"
                    coordinate={[location?.longitude || 0, location?.latitude || 0]}
                  />
                </MapView>
              </View>
            </View>
          </View>

          {/* BusinessModel + companyName + taxcode */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={24} color="black" />
              <Text style={styles.sectionTitle}>Thông Tin Doanh Nghiệp</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text
                style={styles.sectionText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Mô Hình Kinh Doanh: {businessModelTranslation[application.businessModel] || application.businessModel}
              </Text>

              {application.companyName &&
                <Text
                  style={styles.sectionText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  Tên Công Ty: {application.companyName}
                </Text>
              }
              <View style={{
                flexDirection: "row",
              }}>
                <Text
                  style={[styles.sectionText, {
                    width: ScreenWidth / 2.2
                  }]}
                >
                  Mã Số Thuế: {application.taxCode}
                </Text>
                <TouchableOpacity
                  disabled={application.taxCode != null ? false : true}
                  onPress={() => copyToClipboard(application.taxCode)}
                >
                  <Text style={{ color: "#ed8900", fontSize: 14, fontWeight: "500" }}>Sao chép</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* phoneNumber + billingMailApplications */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="accessibility" size={24} color="black" />
              <Text style={styles.sectionTitle}>Thông Tin Liên Hệ</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>Số Điện Thoại: {application.phoneNumber}</Text>
              {application.billingMailApplications.length > 0 && (
                <View>
                  <Text style={styles.sectionText}>Email Thanh Toán:</Text>
                  {application.billingMailApplications.map((email, index) => (
                    <View key={index} style={styles.emailContainer}>
                      <Text style={styles.emailText}>{email.mail}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Status + createdAt */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="registered" size={24} color="black" />
              <Text style={styles.sectionTitle}>Trạng Thái Đơn Đăng Ký</Text>
            </View>
            <View style={styles.sectionContent}>
              {/* Status */}
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 5,
                gap: 10
              }}>
                <Text style={{
                  fontSize: 16,
                }}>Trạng thái:</Text>
                <View style={{
                  backgroundColor: "white",
                  borderWidth: 0.5,
                  borderColor: "rgba(0, 0, 0, 0.5)",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 10
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: application.status == "Pending" ? "rgb(255, 193, 0)" : application.status === 'Approved' ? "rgb(77, 218, 98)" : "rgb(210, 65, 82)",
                  }}>{application.status === 'Pending' ? 'Đang Chờ' : application.status === 'Approved' ? 'Đã Duyệt' : 'Bị Từ Chối'}</Text>
                </View>
              </View >
              <Text style={styles.sectionText}>Ngày Tạo: {formatDateTime(application.createdAt)}</Text>
              {application.rejectReason &&
                <Text
                  style={styles.sectionText}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                >
                  Lý Do Từ Chối: {application.rejectReason}
                </Text>
              }
            </View>
          </View>

          {application.businessRegistrationCertificateUrl && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <FontAwesome6 name="newspaper" size={24} color="black" />
                <Text style={styles.sectionTitle}>Giấy Đăng Ký Kinh Doanh</Text>
              </View>
              {/* <View style={{
                flexDirection: "row",
                gap: 10
              }}>
                <TouchableOpacity
                  style={[styles.sectionHeader, {
                    backgroundColor: "#f9f9f9",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 10,
                    borderWidth: 0.5,
                    borderColor: "rgba(0, 0, 0, 0.5)"
                  }]}
                  disabled={application?.businessRegistrationCertificateUrl == null}
                  onPress={() => {
                    downloadFile(application.businessRegistrationCertificateUrl);
                  }}
                >
                  <Entypo name="download" size={18} color="black" />
                  <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Tải xuống</Text>
                </TouchableOpacity>
              </View> */}
              <View style={[styles.sectionContent, { marginBottom: 20 }]}>
                {
                  fileType === "image" ?
                    <Image
                      source={{ uri: application.businessRegistrationCertificateUrl }}
                      style={styles.image}
                    /> : fileType === "pdf" &&
                    <Pdf
                      trustAllCerts={false}
                      source={{
                        uri: application.businessRegistrationCertificateUrl,
                        cache: true,
                      }}
                      // onLoadComplete={(numberOfPages, filePath) => {
                      //   console.log(`Number of pages: ${numberOfPages}`);
                      // }}
                      // onPageChanged={(page, numberOfPages) => {
                      //   console.log(`Current page: ${page}`);
                      // }}
                      onError={(error) => {
                        setStringErr(
                          error.response?.data?.reasons[0]?.message ?
                            error.response.data.reasons[0].message
                            :
                            "Lỗi mạng vui lòng thử lại sau"
                        );
                        setIsError(true);
                      }}
                      style={{
                        height: ScreenHeight / 5,
                        width: ScreenWidth / 1.4,
                        backgroundColor: "rgba(0,0,0,0.2)"
                      }}
                      enableDoubleTapZoom={true}
                      scale={2}
                    />
                }
              </View>
              <TouchableOpacity
                style={[styles.sectionHeader, {
                  backgroundColor: "#f9f9f9",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 0.5,
                  borderColor: "rgba(0, 0, 0, 0.5)",
                  alignSelf: "center",
                  marginBottom: 20,
                  width: ScreenWidth / 2.5,
                  justifyContent: "center"
                }]}
                disabled={application?.businessRegistrationCertificateUrl == null}
                onPress={() => {
                  downloadFile(application.businessRegistrationCertificateUrl);
                }}
              >
                <Entypo name="download" size={18} color="black" />
                <Text style={[styles.sectionTitle, { fontSize: 16 }]}>Tải xuống</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  modalContainer: {
    width: '90%', // You can adjust this width as needed
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    marginTop: 20,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 10
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionContent: {
    paddingLeft: 35,
  },
  sectionText: {
    fontSize: 14,
    marginBottom: 3,
    width: ScreenWidth / 1.5
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    padding: 5,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    marginRight: 10,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 14,
  },
  image: {
    width: ScreenWidth / 1.4,
    height: ScreenHeight / 5,
    resizeMode: 'contain',
    borderRadius: 5,
    marginTop: 10,
  },
});

export default CertificateDetail;
