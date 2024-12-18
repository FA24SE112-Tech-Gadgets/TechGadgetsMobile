import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableWithoutFeedback, FlatList, ActivityIndicator } from 'react-native';
import api from '../../Authorization/api';
import CertificateDetail from './CertificateDetail';
import LottieView from 'lottie-react-native';
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import useAuth from "../../../utils/useAuth";
import { useNavigation } from "@react-navigation/native";
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import ErrModal from '../../CustomComponents/ErrModal';
import useNotification from '../../../utils/useNotification';
import SellerApplicationItem from './SellerApplicationItem';
import { Divider } from "@rneui/base";
import { Snackbar } from 'react-native-paper';

const CertificateHistory = () => {
  const [applications, setApplications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isPopupNotiOpen, setIsPopupNotiOpen] = useState(false);
  const {
    logout
  } = useAuth();

  const { setNotifications, setNewNotifications, setCurrentPage: setContextCurrentPage, handleDeleteDeviceToken } = useNotification();

  const navigation = useNavigation();

  //Reset sort option and search query
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      setApplications([]);
    }, [])
  );

  // Seller application pagination
  const fetchSellerApplications = async (page) => {
    try {
      setIsFetching(true);
      const res = await api.get(`/seller-applications?Page=${page}&PageSize=10`);
      setIsFetching(false);
      const newData = res.data.items;

      if (newData && newData.length > 0) {
        const allWalletTrackings = [
          ...applications,
          ...newData.filter(
            (newApplication) =>
              !applications.some(
                (existingApplication) =>
                  existingApplication.id === newApplication.id
              )
          ),
        ];
        setApplications(allWalletTrackings);
        const approvedApp = newData.find(app => app.status === 'Approved');
        if (approvedApp) {
          setIsPopupNotiOpen(true);
        }
      }

      // Update hasMoreData status
      setHasMoreData(res.data.hasNextPage);

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

  const handleScroll = () => {
    if (isFetching) return; // Ngăn không gọi nếu đang fetch

    if (hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage); // Cập nhật page nếu vẫn còn dữ liệu
      fetchSellerApplications(nextPage); // Gọi fetchSellerApplications với trang tiếp theo
    } else {
      setIsFetching(true);
      fetchSellerApplications(currentPage); // Gọi fetchSellerApplications nhưng không tăng currentPage
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSellerApplications(1); // Fetch new data (page 1)
    setRefreshing(false);
  };

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={{
        padding: 5,
        alignItems: 'center'
      }}>
        <ActivityIndicator color={"#ed8900"} />
      </View>
    );
  };

  const handleLogout = async () => {
    await handleDeleteDeviceToken();
    await logout();
    setContextCurrentPage(1);
    setNotifications([]);
    setNewNotifications([]);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,  // Starts at the first screen in the stack
        routes: [{ name: 'Login' }],  // Replace 'Login' with the name of your Login screen
      })
    );
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await api.get(`${"/seller-applications"}/${id}`);
      setSelectedApplication(response.data);
      setIsPopupOpen(true);
    } catch (error) {
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
    }
  };

  //For refresh page when send reply
  useFocusEffect(
    useCallback(() => {
      if (refreshing) {
        setApplications([]);
        setCurrentPage(1);
        fetchSellerApplications(1);
        setRefreshing(false);
      }
    }, [refreshing])
  );

  // Initial Fetch when component mounts
  useFocusEffect(
    useCallback(() => {
      fetchSellerApplications(1); // Fetch the first page
    }, [])
  );

  if (isFetching) return (
    <LinearGradient colors={['#F9F9F9', '#fea92866']} style={styles.loadingContainer}>
      <View
        style={{
          flex: 1,
          height: ScreenHeight / 1.5,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LottieView
            source={require("../../../assets/animations/catRole.json")}
            style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
            autoPlay
            loop
            speed={0.8}
          />
          <Text
            style={{
              fontSize: 18,
              width: ScreenWidth / 1.5,
              textAlign: "center",
            }}
          >
            Đang lấy dữ liệu
          </Text>
        </View>
      </View>
    </LinearGradient>
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
          source={require("../../../assets/animations/background-login.json")}
          style={styles.background}
          autoPlay
          loop={false}
        />
        <Text style={[styles.title, { marginTop: 10 }]}>Lịch Sử Đơn Đăng Ký</Text>
        {applications.length === 0 ? (
          <View
            style={{
              flex: 1,
              height: ScreenHeight / 1.5,
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LottieView
                source={require("../../../assets/animations/catRole.json")}
                style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
                autoPlay
                loop
                speed={0.8}
              />
              <Text
                style={{
                  fontSize: 18,
                  width: ScreenWidth / 1.5,
                  textAlign: "center",
                }}
              >
                Không có đơn nào
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.tableContainer}>
            <FlatList
              data={applications}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => (
                <>
                  <SellerApplicationItem
                    {...item}
                    handleViewDetails={handleViewDetails}
                    setSnackbarVisible={setSnackbarVisible}
                    setSnackbarMessage={setSnackbarMessage}
                  />
                  {index < applications.length - 1 && (
                    <Divider style={{ marginVertical: 10 }} />
                  )}
                </>
              )}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              ListFooterComponent={renderFooter}
              initialNumToRender={10}
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </View>
        )}
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

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0, zIndex: 3, alignSelf: "center" }}
      >
        {snackbarMessage}
      </Snackbar>

      {isPopupOpen && selectedApplication && (
        <CertificateDetail
          application={selectedApplication}
          onClose={() => setIsPopupOpen(false)}
          setSnackbarVisible={setSnackbarVisible}
          setSnackbarMessage={setSnackbarMessage}
          setStringErr={setStringErr}
          setIsError={setIsError}
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
    paddingHorizontal: 10
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
    backgroundColor: "#000",
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
