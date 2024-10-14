import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Correct import for Picker
import api from '../Authorization/api';
import * as DocumentPicker from 'expo-document-picker';

export default function BusinessRegistrationCertificate() {
  const [assets, setAssets] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [businessModel, setBusinessModel] = useState('Personal'); // Default business model is Personal
  const [taxCode, setTaxCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [billingMails, setBillingMails] = useState([]);

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

  // Form submission logic
  const handleSubmit = async () => {
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

      console.log('Submission successful:', response.data);
      Alert.alert("Upload Success");
      return;
    } catch (error) {
      if (error.response) {
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        console.error('Request error:', error.request);
      } else {
        console.error('Error:', error.message);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>


      <Text style={styles.title}>Đơn Đăng Ký</Text>

      <Text style={styles.label}>Shop Name</Text>
      <TextInput
        style={styles.input}
        value={shopName}
        onChangeText={setShopName}
        placeholder="Enter Shop Name"
      />

      <Text style={styles.label}>Shop Address</Text>
      <TextInput
        style={styles.input}
        value={shopAddress}
        onChangeText={setShopAddress}
        placeholder="Enter Shop Address"
      />
      <Text style={styles.label}>Business Model</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={businessModel}
          onValueChange={(itemValue, itemIndex) => setBusinessModel(itemValue)}
        >
          <Picker.Item label="Personal" value="Personal" />
          <Picker.Item label="Business Household" value="BusinessHouseHold" />
          <Picker.Item label="Company" value="Company" />
        </Picker>
      </View>
      {businessModel !== 'Personal' && (
        <>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Enter Company Name"
          />
        </>
      )}
      {businessModel !== 'Personal' && (
        <>
          <Button title="Pick Business Registration Certificate" onPress={pickBusinessRegistrationCertificate} />
        </>
      )}
      <Text style={styles.label}>Tax Code</Text>
      <TextInput
        style={styles.input}
        value={taxCode}
        onChangeText={setTaxCode}
        placeholder="Enter Tax Code"
      />

      <Text style={styles.label}>Phone Number</Text>
      < TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Enter Phone Number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Billing emails</Text>
      <TextInput
        style={styles.input}
        value={billingMails.join(", ")} // Convert the array to a comma-separated string
        onChangeText={(text) => setBillingMails(text.split(",").map(mail => mail.trim()))} // Split input into array
        placeholder="Enter Billing emails"
      />



      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
});