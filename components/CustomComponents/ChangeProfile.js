import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@rneui/base';
import { Snackbar } from 'react-native-paper';
import api from '../Authorization/api';
import * as DocumentPicker from 'expo-document-picker';
import ErrModal from './ErrModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from "react-i18next";

const formatDateToDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
};

export default function ChangeProfile() {
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newFields, setNewFields] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    cccd: '',
    gender: '',
    dateOfBirth: '',
    avatarUrl: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stringErr, setStringErr] = useState('');
  const [isError, setIsError] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await api.get('/users/current');
      const userData = response.data.customer;
      setCustomer(userData);
      setNewFields({
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        cccd: userData.cccd || '',
        gender: userData.gender || 'Male',
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : new Date(),
        avatarUrl: userData.avatarUrl || '',
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setStringErr('Không thể tải thông tin khách hàng');
      setIsError(true);
    }
  };

  const handleChange = (field, value) => {
    setNewFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsFetching(true);
      const formData = new FormData();
      Object.keys(newFields).forEach(key => {
        if (key === 'dateOfBirth') {
          formData.append(key, newFields[key].toISOString());
        } else if (newFields[key] !== customer[key]) {
          formData.append(key, newFields[key]);
        }
      });


      if (selectedAvatar) {
        formData.append('Avatar', {
          uri: selectedAvatar.uri,
          name: selectedAvatar.name,
          type: selectedAvatar.mimeType,
        });
      }

      const response = await api.patch('/customer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Check for response status
      if (response.status >= 200 && response.status < 300) {
        // Update the customer state with new fields
        setCustomer(prev => ({
          ...prev,
          ...newFields,
          dateOfBirth: newFields.dateOfBirth.toISOString(),
          avatarUrl: selectedAvatar ? selectedAvatar.uri : newFields.avatarUrl,  // Update avatar URL from state
        }));

        setIsEditing(false);
        setSnackbarMessage('Cập nhật thông tin thành công!');
        setSnackbarVisible(true);
      } else {
        Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } catch (error) {
      setStringErr(error.response?.data?.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsError(true);
    } finally {
      setIsFetching(false);
    }
  };


  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
          "image/webp"
        ],
        multiple: false,
      });

      console.log('DocumentPicker result:', result);

      // Check if the user canceled the selection
      if (!result.canceled) {
        const { uri, size, mimeType, name } = result.assets[0]; // Access the first asset in the array

        console.log('Selected file details:');
        console.log('File URI:', uri);
        console.log('File Name:', name);
        console.log('File Size:', size);
        console.log('File MIME Type:', mimeType);

        // Check file size (limit to 3MB)
        if (size > 3 * 1024 * 1024) {
          setStringErr('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 3MB.');
          setIsError(true);
          return;
        }

        // Lưu trữ avatar đã chọn vào state
        setSelectedAvatar({ uri, name, mimeType });
        console.log('Preview Avatar URI:', uri);
      } else {
        console.log('User canceled the document selection');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      setStringErr('Có lỗi xảy ra khi chọn file. Vui lòng thử lại.');
      setIsError(true);
    }
  };

  if (!customer) {
    return <ActivityIndicator size="large" color="#ed8900" />;
  }

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={['#FFFFFF', '#ed8900']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Thông tin cá nhân</Text>

        <Pressable
          style={styles.avatarContainer}
          onPress={isEditing ? pickDocument : null}  // Enable press only in edit mode
        >
          <Image
            source={{ uri: selectedAvatar?.uri || newFields.avatarUrl || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          {isEditing && (  // Only show edit icon when in editing mode
            <View style={styles.editIconContainer}>
              <Icon name="edit" type="feather" color="#FFFFFF" size={20} />
            </View>
          )}
        </Pressable>

        <View style={styles.infoContainer}>
          {Object.entries(newFields).map(([key, value]) => (
            key !== 'avatarUrl' && (
              <View key={key} style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  {key === 'fullName' ? 'Họ và tên' :
                    key === 'phoneNumber' ? 'Số Điện Thoại' :
                      key === 'address' ? 'Địa Chỉ' :
                        key === 'cccd' ? 'CCCD' :
                          key === 'gender' ? 'Giới Tính' :
                            key === 'dateOfBirth' ? 'Ngày Sinh' : key}
                </Text>
                {isEditing ? (
                  key === 'gender' ? (
                    <Picker
                      selectedValue={value}
                      style={styles.picker}
                      onValueChange={(itemValue) => handleChange(key, itemValue)}
                    >
                      <Picker.Item label="Nam" value="Male" />
                      <Picker.Item label="Nữ" value="Female" />
                    </Picker>
                  ) : key === 'dateOfBirth' ? (
                    <Pressable onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.datePickerText}>
                        {formatDateToDisplay(value)}
                      </Text>
                    </Pressable>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={value}
                      onChangeText={(text) => handleChange(key, text)}
                    />
                  )
                ) : (
                  <Text style={styles.infoValue}>
                    {key === 'gender' ? (value === 'Male' ? 'Nam' : 'Nữ') :
                      key === 'dateOfBirth' ? formatDateToDisplay(value) : value}
                  </Text>
                )}
              </View>
            )
          ))}
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa thông tin'}
          </Text>
        </Pressable>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={newFields.dateOfBirth}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              handleChange('dateOfBirth', selectedDate);
            }
          }}
        />
      )}

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />

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
  },
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#ed8900',
    borderRadius: 15,
    padding: 5,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: '#fea92866', 
    padding: 5, 
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  datePickerText: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: "#fea92866",
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  snackbar: {
    bottom: 20,
  },
});