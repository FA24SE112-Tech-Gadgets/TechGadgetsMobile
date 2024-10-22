import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Correct import for Picker
import api from '../Authorization/api';
import * as DocumentPicker from 'expo-document-picker';
import LottieView from 'lottie-react-native';
import { LinearGradient } from "expo-linear-gradient";

export default function BusinessRegistrationCertificate() {
  const [assets, setAssets] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [businessModel, setBusinessModel] = useState('Personal'); // Default business model is Personal
  const [taxCode, setTaxCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [billingMails, setBillingMails] = useState([]);


  const [isShopNameValid, setIsShopNameValid] = useState(true);
  const [isShopAddressValid, setIsShopAddressValid] = useState(true);
  const [isTaxCodeValid, setIsTaxCodeValid] = useState(true);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);
  const [isCompanyNameValid, setIsCompanyNameValid] = useState(true); // For company name validation
  const [isCertificateUploaded, setIsCertificateUploaded] = useState(true);
  // File picker logic (for file uploads)
  const pickBusinessRegistrationCertificate = async () => {
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: [
          "audio/*",
          "image/*",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
          "application/vnd.ms-excel", // .xls
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/pdf", // .pdf
        ],
        multiple: true, // Enable multi-file selection
      });

      if (docRes.type === 'cancel') {
        return; // Exit if the user cancels the picker
      }

      setAssets([...assets, ...docRes.assets]); // Add selected files to existing assets
    } catch (error) {
      console.log("Error while selecting certificate: ", error);
    }
  };


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
      Alert.alert('Validation Error', 'Company name is required.');
      return false;
    }
    setIsCompanyNameValid(true);
    return true;
  };

  const validateCertificate = () => {
    if (businessModel !== 'Personal' && assets.length === 0) {
      setIsCertificateUploaded(false);
      Alert.alert('Validation Error', 'Business registration certificate is required.');
      return false;
    }
    setIsCertificateUploaded(true);
    return true;
  };
  // Form submission logic
  const handleSubmit = async () => {
    let valid = true;
    if (!shopName.trim()) {
      setIsShopNameValid(false);
      valid = false;
      Alert.alert("Validation Error", "Vui lòng nhập tên shop");
      return;
    } else {
      setIsShopNameValid(true);
    }

    if (!shopAddress.trim()) {
      setIsShopAddressValid(false);
      valid = false;
      Alert.alert("Validation Error", "Vui lòng nhập địa chỉ shop");
      return;
    } else {
      setIsShopAddressValid(true);
    }
    if (!taxCode.trim()) {
      setIsTaxCodeValid(false);
      valid = false;
      Alert.alert("Validation Error", "Vui lòng nhập mã số thuế");
      return;
    } else {
      setIsTaxCodeValid(true);
    }
    if (!phoneNumber.trim()) {
      setIsPhoneNumberValid(false);
      valid = false;
      Alert.alert("Validation Error", "Vui lòng nhập số điện thoại");
      return;
    } else {
      setIsPhoneNumberValid(true);
    }
    const isCompanyNameValid = validateCompanyName();
    const isCertificateValid = validateCertificate();

    if (!isCompanyNameValid || !isCertificateValid) {
      valid = false;
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
      const response = await api.post('/seller-applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check for response status before returning
      if (response.status >= 400 && response.status < 500) {
        const errorMessage = response.data.reasons?.[0]?.message || 'Vui lòng thử lại.';
        Alert.alert(`${errorMessage}`); // Show the error message in an alert
      } else {
        // If response is successful
        Alert.alert("Đơn đăng kí đã được gửi thành công");
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
      if (error.response) {
        // Extract and show the error message from the server response
        const errorMessage = error.response.data.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
        Alert.alert('Lỗi', errorMessage);
      } else if (error.request) {
        console.error('Request error:', error.request);
        Alert.alert('Lỗi', 'Không thể kết nối với máy chủ.');
      } else {
        console.error('Error:', error.message);
        Alert.alert('Lỗi', 'Đã xảy ra lỗi.');
      }
    }

  };

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={["#FFFFFF", "#fea92866"]}
      style={[styles.linearGradient]}
    >
      <LottieView
        source={require("../../assets/animations/background-login.json")}
        style={styles.background}
        autoPlay
        loop={false}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>


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
        <TextInput
          style={[
            styles.input,
            !isShopAddressValid && { borderColor: 'red' }
          ]}
          value={shopAddress}
          onChangeText={setShopAddress}
          placeholder="Nhập địa chỉ"
          onFocus={() => setIsShopAddressValid(true)}
        />
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
          <>
            <TouchableOpacity
              onPress={pickBusinessRegistrationCertificate}
              style={[
                styles.button,
                assets.length > 0 ? styles.buttonSuccess : styles.buttonDefault // Change color based on assets
              ]}
            >
              <Text style={styles.buttonText}>
                {assets.length > 0 ? 'Files Selected' : 'Pick Business Registration Certificate'}
              </Text>
            </TouchableOpacity>
          </>
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
        {/* <TextInput
        style={styles.input}
        value={billingMails.join(", ")} 
        onChangeText={(text) => setBillingMails(text.split(",").map(mail => mail.trim()))} 
        placeholder="Enter Billing emails"
      /> */}
        <View>
          {billingMails.map((mail, index) => (
            <View key={index} style={styles.emailRow}>
              <TextInput
                style={styles.input}
                value={mail}
                onChangeText={(text) => handleMailChange(text, index)}
                placeholder="Nhập email nhận hóa"
              />
              <TouchableOpacity onPress={() => handleRemoveMail(index)} style={styles.button}>
                <Text style={styles.buttonTextEmails}>Xóa</Text>
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
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>

      </ScrollView>
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
    paddingLeft: 15,
    paddingRight: 15,
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
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonTextEmails: {
    color: "#ff0000", // This is the hex code for red
    fontWeight: "bold",
  },

  addButton: {
    color: "#fff",

  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
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
    backgroundColor: '#FFCC33', // Set the background color to yellow
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  submitButtonText: {
    color: 'white', // Set the text color (black)
    fontWeight: 'bold',
  },
});