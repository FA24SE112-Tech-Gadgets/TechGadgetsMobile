import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Correct import for Picker
import api from '../../Authorization/api';
import * as DocumentPicker from 'expo-document-picker';
import LottieView from 'lottie-react-native';
import { LinearGradient } from "expo-linear-gradient";
import ErrModal from '../../CustomComponents/ErrModal';
import { Snackbar } from 'react-native-paper';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import { AntDesign, Entypo } from '@expo/vector-icons';
import * as Location from "expo-location"
import Mapbox, { MapView, Camera, PointAnnotation, Logger } from "@rnmapbox/maps";
import { useFocusEffect } from '@react-navigation/native';
import RegisterAddress from './RegisterAddress';
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
import userLocationAva from "../../../assets/userLocationAva.png";

export default function BusinessRegistrationCertificate() {
  const [assets, setAssets] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [businessModel, setBusinessModel] = useState('Personal'); // Default business model is Personal
  const [taxCode, setTaxCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [billingMails, setBillingMails] = useState([]);

  const [stringErr, setStringErr] = useState('');
  const [isError, setIsError] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [isFetching, setIsFetching] = useState(false);

  const [location, setLocation] = useState(null);
  const [isOpenBigMap, setOpenBigMap] = useState(false);

  const [isShopNameValid, setIsShopNameValid] = useState(true);
  const [isShopAddressValid, setIsShopAddressValid] = useState(true);
  const [isTaxCodeValid, setIsTaxCodeValid] = useState(true);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [isCompanyNameValid, setIsCompanyNameValid] = useState(true); // For company name validation

  const [userLocation, setUserLocation] = useState(null);
  const pointAnnotationRef = useRef(null); // Tham chiếu đến PointAnnotation

  // File picker logic (for file uploads)
  const pickBusinessRegistrationCertificate = async () => {
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: [
          // "audio/*",
          "image/*",
          // "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
          // "application/vnd.ms-excel", // .xls
          // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/pdf", // .pdf
        ],
        multiple: false, // Enable multi-file selection
      });

      if (docRes.type === 'cancel' || !docRes) {
        return; // Exit if the user cancels the picker
      }

      if (docRes?.assets) {
        setAssets([...assets, ...docRes.assets]); // Add selected files to existing assets
      } else {
        setAssets([])
      }
    } catch (error) {
      setStringErr(
        error ?
          error.toString()
          :
          "Lỗi chọn file"
      );
      setIsError(true);
    }
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const handleAddMail = () => {
    setBillingMails([...billingMails, ""]); // Thêm email trống để người dùng nhập
  };

  const handleRemoveMail = (index) => {
    const updatedMails = billingMails.filter((_, i) => i !== index);
    setBillingMails(updatedMails);
  };

  const handleMailChange = (text, index) => {
    const updatedMails = [...billingMails];
    updatedMails[index] = text;
    setBillingMails(updatedMails);
  };

  const validateCompanyName = () => {
    if (businessModel !== 'Personal' && companyName.trim() === '') {
      setIsCompanyNameValid(false);
      setStringErr(
        "Vui lòng nhập tên công ty"
      );
      setIsError(true);
      return false;
    }
    setIsCompanyNameValid(true);
    return true;
  };

  const validateCertificate = () => {
    if (businessModel !== 'Personal' && assets.length === 0) {
      setStringErr(
        "Vui lòng gửi giấy phép kinh doanh"
      );
      setIsError(true);
      return false;
    }
    return true;
  };
  // Form submission logic
  const handleSubmit = async () => {
    if (!shopName.trim()) {
      setIsShopNameValid(false);
      setStringErr(
        "Vui lòng nhập tên cửa hàng"
      );
      setIsError(true);
      return;
    } else {
      setIsShopNameValid(true);
    }

    if (!shopAddress.trim()) {
      setIsShopAddressValid(false);
      setStringErr(
        "Vui lòng nhập địa chỉ cửa hàng"
      );
      setIsError(true);
      return;
    } else {
      setIsShopAddressValid(true);
    }
    if (!taxCode.trim()) {
      setIsTaxCodeValid(false);
      setStringErr(
        "Vui lòng nhập mã số thuế"
      );
      setIsError(true);
      return;
    } else {
      setIsTaxCodeValid(true);
    }
    if (!phoneNumber.trim()) {
      setIsPhoneNumberValid(false);
      setStringErr(
        "Vui lòng nhập số điện thoại"
      );
      setIsError(true);
      return;
    } else {
      setIsPhoneNumberValid(true);
    }
    const isCompanyNameValid = validateCompanyName();
    const isCertificateValid = validateCertificate();

    if (!isCompanyNameValid || !isCertificateValid) {
      return;
    }
    const formData = new FormData();
    // Append company information
    if (businessModel !== 'Personal') {
      formData.append('CompanyName', companyName);
    }
    formData.append('ShopName', shopName);
    formData.append('ShopAddress', shopAddress);
    formData.append('BusinessModel', businessModel);
    formData.append('TaxCode', taxCode);
    formData.append('PhoneNumber', phoneNumber);

    // Append billing emails array
    billingMails.forEach((mail, index) => {
      formData.append(`BillingMails[${index}]`, mail);
    });

    // Append each selected file
    if (businessModel !== 'Personal') {
      assets.forEach((file) => {
        formData.append('BusinessRegistrationCertificate', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        });
      });
    }
    try {
      setIsFetching(true);
      const response = await api.post('/seller-applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsFetching(false);

      // Check for response status before returning
      if (response.status >= 400 && response.status < 500) {
        setStringErr(
          response?.data?.reasons[0]?.message ?
            response.data.reasons[0].message
            :
            "Lỗi mạng vui lòng thử lại sau"
        );
        setIsError(true);
      } else {
        // If response is successful
        setSnackbarMessage('Đơn đăng kí đã được gửi thành công');
        setSnackbarVisible(true);
        setShopName('');
        setShopAddress('');
        setTaxCode('');
        setPhoneNumber('');
        setCompanyName('');
        setBillingMails([]);
        setAssets([]);
        setBusinessModel('Personal');
      }
    } catch (error) {
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
      setIsFetching(false);
    }

  };

  const getCurrentPosition = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation(currentLocation.coords);
      // Reverse geocode to get address
      const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocodedAddress.length > 0) {
        const currentAddress = reverseGeocodedAddress[0];
        const addressParts = [];

        addressParts.push(currentAddress.formattedAddress);

        // Join the parts with a comma and space
        const strAddress = addressParts.join(", ");
        setShopAddress(strAddress);
      } else {
        setShopAddress("")
        setIsError(true);
        setStringErr("Không tìm thấy địa chỉ hiện tại");
      }
    } catch (error) {
      setShopAddress("");
      setIsError(true);
      setStringErr("Lỗi MapBox");
    }
  }

  //Get user current position
  useFocusEffect(
    useCallback(() => {
      getCurrentPosition();
    }, [])
  );

  useEffect(() => {
    let locationSubscription;

    const startWatchingLocation = async () => {
      // Theo dõi vị trí thời gian thực
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Lấy vị trí mỗi 1 giây
          distanceInterval: 0.5, // Lấy vị trí khi di chuyển tối thiểu 5m
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    };

    startWatchingLocation();

    // Hủy theo dõi khi component unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#fea92866"]}
      style={[styles.linearGradient]}
    >
      <LottieView
        source={require("../../../assets/animations/background-login.json")}
        style={styles.background}
        autoPlay
        loop={false}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 70, marginTop: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Đơn Đăng Ký</Text>

        <Text style={styles.label}>Tên Shop</Text>
        <TextInput
          style={[
            styles.input,
            !isShopNameValid && { borderColor: 'red' } // Change border color to red if invalid
          ]}
          value={shopName}
          onChangeText={setShopName}
          placeholder="Nhập tên shop"
          onFocus={() => setIsShopNameValid(true)}
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TouchableOpacity
          style={[styles.input]}
          onPress={() => {
            setOpenBigMap(true)
          }}
        >
          <Text>
            {shopAddress}
          </Text>
        </TouchableOpacity>

        <View style={{
          height: ScreenHeight / 6,
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
            onPress={() => {
              setOpenBigMap(true);
            }}
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
              onSelected={() => {
                setOpenBigMap(true);
              }}
            />
            <PointAnnotation
              id="user-position"
              coordinate={[userLocation?.longitude || 106.69592033355514, userLocation?.latitude || 10.782684066469386]}
              ref={pointAnnotationRef} // Gắn ref vào PointAnnotation
            >
              <Image
                source={userLocationAva} // Đường dẫn tới file ảnh
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 30,
                  borderWidth: 0.5,
                  borderColor: "rgba(0,0,0,0.5)"
                }}
                onLoad={async () => {
                  if (pointAnnotationRef.current) {
                    await delay(500);
                    pointAnnotationRef.current.refresh(); // Nếu thư viện hỗ trợ, gọi refresh() tại đây
                  }
                }}
              />
            </PointAnnotation>
          </MapView>
        </View>

        <Text style={styles.label}>Loại hình kinh doanh</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={businessModel}
            onValueChange={(itemValue, itemIndex) => setBusinessModel(itemValue)}
          >
            <Picker.Item label="Cá nhân" value="Personal" />
            <Picker.Item label="Hộ kinh doanh" value="BusinessHouseHold" />
            <Picker.Item label="Công ty" value="Company" />
          </Picker>
        </View>
        {businessModel !== 'Personal' && (
          <>
            <Text style={styles.label}>Tên công ty</Text>
            <TextInput
              style={[
                styles.input, !isCompanyNameValid && { borderColor: 'red' }
              ]}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Nhập tên công ty"
              onFocus={() => setIsCompanyNameValid(true)}
            />
          </>
        )}
        {businessModel !== 'Personal' && (
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between"
          }}>
            <TouchableOpacity
              onPress={pickBusinessRegistrationCertificate}
              style={[
                styles.button,
                assets.length > 0 ? styles.buttonSuccess : styles.buttonDefault, // Change color based on assets
                assets.length > 0 ? {
                  width: ScreenWidth / 1.4
                } : {
                  width: ScreenWidth / 1.21
                }
              ]}
            >
              <Text
                style={styles.buttonText}
                numberOfLines={1} // Giới hạn hiển thị trên 1 dòng
                ellipsizeMode="tail" // Thêm "..." vào cuối nếu quá dài
              >
                {assets.length > 0 ? `File: ${assets[0].name}` : 'Chọn file giấy phép kinh doanh'}
              </Text>
            </TouchableOpacity>
            {
              assets.length > 0 &&
              <TouchableOpacity onPress={() => setAssets([])} style={styles.button}>
                <AntDesign name="delete" size={24} color="#112A46" />
              </TouchableOpacity>
            }
          </View>
        )}
        <Text style={styles.label}>Mã số thuế</Text>
        <TextInput
          style={[
            styles.input,
            !isTaxCodeValid && { borderColor: 'red' }
          ]}
          value={taxCode}
          onChangeText={setTaxCode}
          placeholder="Nhập mã số thuế"
          onFocus={() => setIsTaxCodeValid(true)}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        < TextInput
          style={[
            styles.input,
            !isPhoneNumberValid && { borderColor: 'red' }
          ]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          onFocus={() => setIsPhoneNumberValid(true)}
        />

        <Text style={styles.label}>Emails nhận hóa đơn</Text>

        <View>
          {billingMails.map((mail, index) => (
            <View key={index} style={styles.emailRow}>
              <TextInput
                style={[styles.input, { width: ScreenWidth / 1.4, marginBottom: 0 }]}
                value={mail}
                onChangeText={(text) => handleMailChange(text, index)}
                placeholder="Nhập email nhận hóa"
              />
              <TouchableOpacity onPress={() => handleRemoveMail(index)} style={styles.button}>
                <AntDesign name="delete" size={24} color="#112A46" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleAddMail} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Thêm Email</Text>
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton]} // Apply your custom styles here
          disabled={isFetching}
        >
          <Text style={styles.submitButtonText}>Gửi</Text>
          {
            isFetching &&
            <ActivityIndicator color={"white"} />
          }
        </TouchableOpacity>

        <RegisterAddress
          isOpen={isOpenBigMap}
          setOpen={setOpenBigMap}
          location={location}
          setLocation={setLocation}
          address={shopAddress}
          setShopAddress={setShopAddress}
          setSnackbarVisible={setSnackbarVisible}
          setSnackbarMessage={setSnackbarMessage}
        />

        <ErrModal
          stringErr={stringErr}
          isError={isError}
          setIsError={setIsError}
        />

      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  linearGradient: {
    flex: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "85%",
    zIndex: 0,
    opacity: 0.4,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  addButton: {
    color: "#fff",
  },
  addButtonText: {
    color: "rgba(0, 0, 0, 0.3)",
    fontWeight: "bold",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonDefault: {
    backgroundColor: '#fea928', // Default button color
  },
  buttonSuccess: {
    backgroundColor: '#6bcf63', // Change color when files are selected
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#112A46', // Set the background color to yellow
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: "center",
    marginVertical: 10,
    flexDirection: "row",
    gap: 10
  },
  submitButtonText: {
    color: 'white', // Set the text color (black)
    fontWeight: 'bold',
  },
  snackbar: {
    bottom: 10,
  },
});