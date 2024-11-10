import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { AntDesign } from '@expo/vector-icons';
import api from '../../Authorization/api';
import { Snackbar } from 'react-native-paper';

const DepositHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFirstLoad = useRef(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const fetchTransactions = useCallback(async (pageNumber) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await api.get(`/wallet-trackings?Types=Deposit&Page=${pageNumber}&PageSize=10`);
      const newTransactions = response.data.items;
      if (newTransactions.length > 0) {
        setTransactions(prev => pageNumber === 1 ? newTransactions : [...prev, ...newTransactions]);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error fetching deposit history:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        fetchTransactions(1);
        isFirstLoad.current = false;
      }
    }, [fetchTransactions])
  );

  const cancelTransaction = async (walletTrackingId) => {
    try {
      await api.put(`/wallet-trackings/${walletTrackingId}/cancel`);
    
      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === walletTrackingId
            ? { ...transaction, status: 'Cancelled' }
            : transaction
        )
      );
      setSnackbarMessage('Giao dịch đã được hủy thành công.');
      setSnackbarVisible(true);
    } catch (error) {
      console.log('Error cancelling transaction:', error);
      setSnackbarMessage('Không thể hủy giao dịch. Vui lòng thử lại sau.');
      setSnackbarVisible(true);
    }
  };

  const showCancelModal = (transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const handleCancelConfirm = () => {
    if (selectedTransaction) {
      cancelTransaction(selectedTransaction.id);
    }
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <Text style={styles.amount}>{formatAmount(item.amount)} VNĐ</Text>
      <Text style={styles.paymentMethod}>Phương thức: {item.paymentMethod}</Text>
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Trạng thái: </Text>
        <View style={styles.statusWrapper}>
          <Text style={[styles.status, getStatusStyle(item.status)]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        {item.status === 'Pending' && (
          <TouchableOpacity onPress={() => showCancelModal(item)} style={styles.cancelButton}>
            <AntDesign name="close" size={24} color="red" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.date}>Ngày nạp: {getDepositedAtText(item.status, item.depositedAt)}</Text>
      <Text style={styles.date}>Ngày tạo: {formatDate(item.createdAt)}</Text>
    </View>
  );

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Success':
        return 'Thành công';
      case 'Pending':
        return 'Đang chờ';
      case 'Cancelled':
        return 'Đã hủy';
      case 'Expired':
        return 'Đã hết hạn';
      default:
        return status;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Success':
        return styles.successStatus;
      case 'Pending':
        return styles.pendingStatus;
      case 'Cancelled':
      case 'Expired':
        return styles.cancelledStatus;
      default:
        return {};
    }
  };

  const getDepositedAtText = (status, depositedAt) => {
    switch (status) {
      case 'Pending':
        return 'Đang chờ';
      case 'Cancelled':
        return 'Đã hủy';
      case 'Expired':
        return 'Đã hết hạn';
      default:
        return formatDate(depositedAt);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Đang chờ';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#ed8900" />
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchTransactions(page);
    }
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#fea92866']}
      style={styles.container}
    >
      <Text style={styles.title}>Lịch sử nạp tiền</Text>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
      />
       <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={1500}
          wrapperStyle={{ bottom: 0, zIndex: 1 }}
        >
          {snackbarMessage}
        </Snackbar>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Xác nhận hủy giao dịch</Text>
          <Text style={styles.modalText}>Bạn có chắc chắn muốn hủy giao dịch nạp tiền này?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleCancelConfirm}>
              <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Có</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  transactionItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ed8900',
  },
  paymentMethod: {
    fontSize: 16,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 4,
  },
  statusWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  successStatus: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  pendingStatus: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  cancelledStatus: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  cancelButton: {
    marginLeft: 'auto',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#ed8900',
    borderColor: '#ed8900',
  },
  confirmButtonText: {
    color: 'white',
  },
});

export default DepositHistory;