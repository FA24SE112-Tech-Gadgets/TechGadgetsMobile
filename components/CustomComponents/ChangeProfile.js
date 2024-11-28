import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
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
import useAuth from '../../utils/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const formatDateToDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
};

export default function ChangeProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [newCustomerFields, setNewCustomerFields] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    cccd: '',
    gender: '',
    dateOfBirth: '',
    avatarUrl: '',
  });
  const [newSellerFields, setNewSellerFields] = useState({
    companyName: "",
    shopName: "",
    shopAddress: "",
    businessModel: "",
    businessRegistrationCertificateUrl: ""
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [stringErr, setStringErr] = useState('');
  const [isError, setIsError] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const { user, fetchUser } = useAuth();

  useFocusEffect(
    useCallback(() => {
      setIsFetching(true);
      fetchUser();
      setIsFetching(false);
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (user) {
        if (user.role === "Customer") {
          const userData = user.customer;
          setNewCustomerFields({
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber || '',
            address: userData.address || '',
            cccd: userData.cccd || '',
            gender: userData.gender || 'Male',
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth : null,
            avatarUrl: userData.avatarUrl || '',
          });
        } else if (user.role === "Seller") {
          const userData = user.seller;
          setNewSellerFields({
            companyName: userData.companyName || "",
            shopName: userData.shopName || "",
            shopAddress: userData.shopAddress || "",
            phoneNumber: userData.phoneNumber || '',
            businessModel: userData.businessModel || "",
            businessRegistrationCertificateUrl: userData.businessRegistrationCertificateUrl || ""
          })
        } else {
          setNewCustomerFields(null);
          setNewSellerFields(null);
          setSelectedAvatar(null);
        }
      }
    }, [user])
  );

  const handleChange = (field, value) => {
    if (user.role === "Customer") {
      setNewCustomerFields(prev => ({ ...prev, [field]: value }));
    } else if (user.role === "Seller") {
      setNewSellerFields(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSellerSave = async () => {
    try {
      setIsFetching(true);

      // Chỉ gửi những field đã thay đổi
      const changedFields = {};
      Object.keys(newSellerFields).forEach((key) => {
        if (
          newSellerFields[key] !== user?.seller[key] && // Field đã thay đổi
          newSellerFields[key] !== "" // Field không phải chuỗi rỗng
        ) {
          changedFields[key] = newSellerFields[key];
        }
      });

      // Nếu không có thay đổi, không cần gọi API
      if (Object.keys(changedFields).length === 0) {
        setIsFetching(false);
        setSnackbarMessage('Không có thay đổi nào được thực hiện.');
        setSnackbarVisible(true);
        return;
      }

      const formData = new FormData();
      Object.keys(changedFields).forEach((key) => {
        formData.append(key, changedFields[key]);
      });

      const response = await api.patch('/seller', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Kiểm tra phản hồi từ server
      if (response.status >= 200 && response.status < 300) {
        setIsEditing(false);
        setSnackbarMessage('Cập nhật thông tin thành công!');
        setSnackbarVisible(true);
      } else {
        setStringErr(
          response?.data?.reasons[0]?.message
            ? response.data.reasons[0].message
            : 'Lỗi mạng vui lòng thử lại sau'
        );
        setIsError(true);
      }
      setIsFetching(false);
    } catch (error) {
      setStringErr(
        error.response?.data?.reasons[0]?.message
          ? error.response.data.reasons[0].message
          : 'Lỗi mạng vui lòng thử lại sau'
      );
      setIsError(true);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCustomerSave = async () => {
    try {
      setIsFetching(true);

      // Chỉ gửi những field đã thay đổi
      const changedFields = {};
      Object.keys(newCustomerFields).forEach((key) => {
        if (
          newCustomerFields[key] !== user?.customer[key] && // Field đã thay đổi
          newCustomerFields[key] !== "" // Field không phải chuỗi rỗng
        ) {
          changedFields[key] = newCustomerFields[key];
        }
      });

      // Nếu không có thay đổi, không cần gọi API
      if (Object.keys(changedFields).length === 0 && selectedAvatar == null) {
        setIsFetching(false);
        setSnackbarMessage('Không có thay đổi nào được thực hiện.');
        setSnackbarVisible(true);
        return;
      }

      const formData = new FormData();
      Object.keys(changedFields).forEach(key => {
        if (key === 'dateOfBirth') {
          formData.append(key, changedFields[key].toISOString());
        } else {
          formData.append(key, changedFields[key]);
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
        setIsEditing(false);
        setSnackbarMessage('Cập nhật thông tin thành công!');
        setSnackbarVisible(true);
      } else {
        setStringErr(
          response?.data?.reasons[0]?.message ?
            response.data.reasons[0].message
            :
            "Lỗi mạng vui lòng thử lại sau"
        );
        setIsError(true);
      }
      setIsFetching(false);
    } catch (error) {
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
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
      console.log('Error picking document:', error);
      setStringErr('Có lỗi xảy ra khi chọn file. Vui lòng thử lại.');
      setIsError(true);
    }
  };

  return (
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      colors={['#FFFFFF', '#fea92866']}
      style={[styles.container]}
    >
      <View style={styles.viewContainer}>
        <Text style={styles.title}>Thông tin cá nhân</Text>

        {
          user.role === "Customer" &&
          <>
            <Pressable
              style={styles.avatarContainer}
              onPress={isEditing ? pickDocument : null}  // Enable press only in edit mode
            >
              <Image
                source={{ uri: selectedAvatar?.uri || newCustomerFields.avatarUrl || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              {isEditing && (  // Only show edit icon when in editing mode
                <View style={styles.editIconContainer}>
                  <Icon name="edit" type="feather" color="#FFFFFF" size={20} />
                </View>
              )}
            </Pressable>

            <View style={styles.infoContainer}>
              {Object.entries(newCustomerFields).map(([key, value]) => (
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
                            {value ? formatDateToDisplay(value) : "Chọn ngày sinh"}
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
                          key === 'dateOfBirth' ? value ? formatDateToDisplay(value) : "Chưa nhập ngày sinh" : value}
                      </Text>
                    )}
                  </View>
                )
              ))}
            </View>
          </>
        }

        {
          user.role === "Seller" &&
          <>
            <View style={styles.infoContainer}>
              {Object.entries(newSellerFields).map(([key, value]) => {
                if (key !== "businessModel" && key !== "companyName" && key !== "businessRegistrationCertificateUrl")
                  return (
                    <View key={key} style={styles.infoItem}>
                      <Text style={styles.infoLabel}>
                        {key === 'shopName' ? 'Tên cửa hàng' :
                          key === 'shopAddress' ? 'Địa Chỉ' :
                            key === 'phoneNumber' && 'Số điện thoại'}
                      </Text>
                      {isEditing ? (
                        <TextInput
                          style={styles.input}
                          value={value}
                          onChangeText={(text) => handleChange(key, text)}
                        />
                      ) : (
                        <Text style={styles.infoValue}>
                          {value}
                        </Text>
                      )}
                    </View>
                  )
                if (user.seller.businessModel !== "Personal" && (key === "companyName" || key === "businessRegistrationCertificateUrl")) {
                  return (
                    <View key={key} style={styles.infoItem}>
                      <Text style={styles.infoLabel}>
                        {key === 'companyName' ? 'Tên công ty' :
                          key === 'businessRegistrationCertificateUrl' && 'Giấy phép kinh doanh'}
                      </Text>
                      {isEditing ? (
                        <TextInput
                          style={styles.input}
                          value={value}
                          onChangeText={(text) => handleChange(key, text)}
                        />
                      ) : (
                        <Text style={styles.infoValue}>
                          {value}
                        </Text>
                      )}
                    </View>
                  )
                }
              }
              )}
            </View>
          </>
        }

        <Pressable
          style={styles.editButton}
          disabled={isFetching}
          onPress={async () => {
            if (isEditing) {
              if (user.role === "Customer") {
                await handleCustomerSave()
              } else if (user.role === "Seller") {
                await handleSellerSave();
              }
            } else {
              setIsEditing(true)
            }
            await fetchUser();
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa thông tin'}
          </Text>
          {
            isFetching &&
            <ActivityIndicator color={"white"} />
          }
        </Pressable>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={newCustomerFields?.dateOfBirth ? newCustomerFields?.dateOfBirth : new Date()}
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
    justifyContent: "center"
  },
  viewContainer: {
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
    marginBottom: 15,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
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
    flexDirection: "row",
    gap: 10,
    justifyContent: "center"
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