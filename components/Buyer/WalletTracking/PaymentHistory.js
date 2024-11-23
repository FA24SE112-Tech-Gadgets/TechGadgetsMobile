import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { AntDesign } from '@expo/vector-icons';
import { Snackbar, Divider } from 'react-native-paper';
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Clipboard from '@react-native-clipboard/clipboard';
import api from '../../Authorization/api';
import LottieView from 'lottie-react-native';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFirstLoad = useRef(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('DESC');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigation = useNavigation();

  const fetchTransactions = useCallback(async (pageNumber, sort = sortOption) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await api.get(`/wallet-trackings?Types=Payment&SortByDate=${sort}&Page=${pageNumber}&PageSize=10`);
      const newTransactions = response.data.items;
      if (newTransactions.length > 0) {
        setTransactions(prev => pageNumber === 1 ? newTransactions : [...prev, ...newTransactions]);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, sortOption]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        fetchTransactions(1);
        isFirstLoad.current = false;
      }
    }, [fetchTransactions])
  );

  const handleSortOption = (option) => {
    setSortOption(option);
    setTransactions([]);
    setPage(1);
    setHasMore(true);
    fetchTransactions(1, option);
    setSortModalVisible(false);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    setSnackbarMessage("Sao chép thành công");
    setSnackbarVisible(true);
  };

  const renderItem = ({ item, index }) => (
    <>
      <View style={styles.transactionItem}>
        <View style={styles.idContainer}>
          <Text style={styles.idText} numberOfLines={1} ellipsizeMode="tail">
            Mã đơn hàng: {item.orderId}
          </Text>
          <TouchableOpacity
            disabled={!item?.orderId}
            onPress={() => copyToClipboard(item?.orderId)}
          >
            <Text style={styles.copyText}>Sao chép</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.idContainer, { marginBottom: 0 }]}>
          <Text style={[styles.paymentMethod, { width: ScreenWidth / 1.4 }]} numberOfLines={1} ellipsizeMode="tail">
            Mã giao dịch: {item.id}
          </Text>
          <TouchableOpacity
            disabled={!item.id}
            onPress={() => copyToClipboard(item.id)}
          >
            <Text style={styles.copyText}>Sao chép</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.paymentMethod}>
          Phương thức thanh toán: <Text style={styles.paymentMethodValue}>Ví điện tử Techgadget</Text>
        </Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Trạng thái:</Text>
          <View style={styles.statusWrapper}>
            <Text style={[styles.statusText, { color: 'green' }]}>
              Hoàn thành
            </Text>
          </View>
        </View>

        <View style={styles.amountDateContainer}>
          <Text style={[styles.amount, styles.successAmount]}>
            - {formatAmount(item.amount)} ₫
          </Text>

          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>

      {index < transactions.length - 1 && <Divider style={{ marginVertical: -8 }} />}
    </>
  );

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Đang chờ';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
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
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#fea92866']} style={styles.gradient}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử thanh toán</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.sortContainer}>
            <SortModal
              modalVisible={sortModalVisible}
              setModalVisible={setSortModalVisible}
              sortOption={sortOption}
              handleSortOption={handleSortOption}
              disabled={transactions.length === 0}
            />
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LottieView
                source={require("../../../assets/animations/catRole.json")}
                style={styles.lottieAnimation}
                autoPlay
                loop
                speed={0.8}
              />
              <Text style={styles.emptyText}>{loading ? "Đang tải dữ liệu giao dịch" : "Lịch sử thanh toán trống"}</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={1500}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </LinearGradient>
    </View>
  );
};

const SortModal = ({
  modalVisible,
  setModalVisible,
  sortOption,
  handleSortOption,
  disabled,
}) => {
  return (
    <View>
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          columnGap: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderColor: "#FB6562",
          borderWidth: 2,
          borderRadius: 20,
          backgroundColor: "#FB6562",
          backgroundColor: disabled ? "#cccccc" : "#ed8900",
          borderColor: disabled ? "#999999" : "#ed8900",
        }}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={{
          fontWeight: "bold",
          fontSize: 18,
          color: "white",
        }}>
          {sortOption == "DESC" ? "Ngày gần nhất" : "Ngày xa nhất"}
        </Text>
        <Icon
          type="material-community"
          name="chevron-down"
          size={24}
          color="white"
        />
      </Pressable>

      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={() => setModalVisible(false)}
        useNativeDriverForBackdrop
        swipeDirection={"down"}
        propagateSwipe={true}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
      >
        <View>
          <View style={{
            backgroundColor: "white",
            paddingVertical: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}>
            <View
              style={{
                alignItems: "center",
                paddingBottom: 12,
              }}
            >
              <View
                style={{
                  width: ScreenWidth / 7,
                  height: ScreenHeight / 100,
                  backgroundColor: "#ed8900",
                  borderRadius: 30,
                }}
              />
            </View>

            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>Lọc theo</Text>
            </View>

            <Pressable
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
              onPress={() => handleSortOption("DESC")}
            >
              <Text style={{
                fontSize: 16,
              }}>Ngày gần nhất</Text>
              {sortOption === "DESC" ? (
                <Icon
                  type="material-community"
                  name="check-circle"
                  size={24}
                  color="#ed8900"
                />
              ) : (
                <Icon
                  type="material-community"
                  name="checkbox-blank-circle-outline"
                  size={24}
                  color="#ed8900"
                />
              )}
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
              onPress={() => handleSortOption("ASC")}
            >
              <Text style={{
                fontSize: 16,
              }}>Ngày xa nhất</Text>
              {sortOption === "ASC" ? (
                <Icon
                  type="material-community"
                  name="check-circle"
                  size={24}
                  color="#ed8900"
                />
              ) : (
                <Icon
                  type="material-community"
                  name="checkbox-blank-circle-outline"
                  size={24}
                  color="#ed8900"
                />
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderColor: 'rgb(254, 169, 40)',
    backgroundColor: 'rgba(254, 169, 40, 0.3)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(254, 161, 40, 0.5)",
    borderWidth: 1,
    borderColor: "rgb(254, 161, 40)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sortContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: ScreenHeight / 1.5,
  },
  lottieAnimation: {
    width: ScreenWidth,
    height: ScreenWidth / 1.3,
  },
  emptyText: {
    fontSize: 18,
    width: ScreenWidth / 1.5,
    textAlign: "center",
  },
  listContent: {
    flexGrow: 1,
  },
  transactionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowRadius: 4,
  },
  idContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  idText: {
    fontSize: 19,
    fontWeight: "700",
    width: ScreenWidth / 1.4,
  },
  copyText: {
    color: "#ed8900",
    fontSize: 16,
    fontWeight: "500",
  },
  paymentMethod: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  paymentMethodValue: {
    fontWeight: "400",
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusWrapper: {
    backgroundColor: "#f9f9f9",
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  amountDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'column',
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "500",
  },
  successAmount: {
    color: '#de241b',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  snackbar: {
    bottom: 0,
    zIndex: 1,
  },
});

export default PaymentHistory;