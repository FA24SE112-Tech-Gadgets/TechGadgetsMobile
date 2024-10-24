import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
import api from '../Authorization/api';
import CertificateDetail from './CertificateDetail';
import LottieView from 'lottie-react-native';
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from '@react-navigation/native';
import useAuth from "../../utils/useAuth";
import { CommonActions, useNavigation } from "@react-navigation/native";
const CertificateHistory = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupNotiOpen, setIsPopupNotiOpen] = useState(false);
  const {
    logout
  } = useAuth();
  const navigation = useNavigation();

  // useEffect(() => {
  //   const fetchApplications = async () => {
  //     try {
  //       const response = await api.get("/seller-applications");
  //       setApplications(response.data.items);
  //       setLoading(false);
  //     } catch (err) {
  //       setError('Không thể lấy danh sách đơn đăng ký');
  //       setLoading(false);
  //     }
  //   };
  //   fetchApplications();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchApplications = async () => {
        try {
          const response = await api.get("/seller-applications");
          const newApplications = response.data.items;
          setApplications(response.data.items);
          setApplications(newApplications);
          setLoading(false);
          const approvedApp = newApplications.find(app => app.status === 'Approved');
          if (approvedApp) {
            setIsPopupNotiOpen(true);
          }

        } catch (err) {
          setError('Không thể lấy danh sách đơn đăng ký');
          setLoading(false);
        }
      };
      fetchApplications();
    }, [])
  );
  const handleLogout = () => {
    logout();
    navigation.navigate('Login');
  };
  const handleViewDetails = async (id) => {
    try {
      const response = await api.get(`${"/seller-applications"}/${id}`);
      setSelectedApplication(response.data);
      setIsPopupOpen(true);
    } catch (err) {
      console.error('Không thể lấy chi tiết đơn đăng ký', err);
    }
  };

  if (loading) return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIndicator} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (

    <View style={styles.container}>
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

        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Lịch Sử Đơn Đăng Ký</Text>
          {applications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Bạn chưa có đơn nào chờ xét duyệt</Text>
            </View>
          ) : (
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Tên Cửa Hàng</Text>
                <Text style={styles.tableHeaderText}>Mô Hình Kinh Doanh</Text>
                <Text style={styles.tableHeaderText}>Trạng Thái</Text>
                <Text style={styles.tableHeaderText}>Ngày Tạo</Text>
                <Text style={styles.tableHeaderText}>Hành Động</Text>
              </View>
              {applications.map((app) => (
                <View key={app.id} style={styles.tableRow}>
                  <Text style={styles.tableCellText}>{app.shopName}</Text>
                  <Text style={styles.tableCellText}>
                    {app.businessModel === 'BusinessHousehold' ? 'Hộ Kinh Doanh' :
                      app.businessModel === 'Personal' ? 'Cá Nhân' :
                        app.businessModel === 'Company' ? 'Công Ty' : app.businessModel}
                  </Text>
                  <View style={[styles.statusContainer, app.status === 'Pending' ? styles.pendingStatus : app.status === 'Approved' ? styles.approvedStatus : styles.rejectedStatus]}>
                    <Text style={styles.statusText}>
                      {app.status === 'Pending' ? 'Đang Chờ' : app.status === 'Approved' ? 'Đã Duyệt' : 'Bị Từ Chối'}
                    </Text>
                  </View>
                  <Text style={styles.tableCellText}>{new Date(app.createdAt).toLocaleString()}</Text>
                  <TouchableOpacity onPress={() => handleViewDetails(app.id)} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Xem</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
      <Modal
        visible={isPopupNotiOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPopupNotiOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsPopupNotiOpen(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Thông Báo</Text>
              <Text style={styles.modalMessage}>Đơn của bạn đã được duyệt, vui lòng đăng nhập lại.</Text>
              <Pressable style={styles.actionButton} onPress={handleLogout}>
                <Text style={styles.actionButtonText}>Đăng Xuất</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>


      {isPopupOpen && selectedApplication && (
        <CertificateDetail
          application={selectedApplication}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flexGrow: 1,
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: '#007bff',
    borderTopColor: 'transparent',
    animation: 'spin 1s linear infinite', // You may need to implement this
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 10,
  },
  tableHeaderText: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 10,
  },
  tableCellText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  statusContainer: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  pendingStatus: {
    backgroundColor: '#FFEB3B',
  },
  approvedStatus: {
    backgroundColor: '#4CAF50',
  },
  rejectedStatus: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Tối màn hình khi hiển thị popup
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

});

export default CertificateHistory;
