import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import api from '../Authorization/api';

const DepositHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFirstLoad = useRef(true);

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
      console.error('Error fetching deposit history:', error);
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
});

export default DepositHistory;