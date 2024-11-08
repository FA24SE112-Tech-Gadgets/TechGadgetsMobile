import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from "@rneui/base";
import Clipboard from "@react-native-clipboard/clipboard";

const BuyerOrderItem = ({ id, amount, status, createdAt, sellerInfo, setSnackbarVisible, setSnackbarMessage }) => {
  const formatCurrency = (number) => {
    if (number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " ₫";
    }
    return "";
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    setSnackbarMessage("Sao chép thành công");
    setSnackbarVisible(true);
  };

  const formatVietnamDate = (time) => {
    const date = new Date(time);
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
    const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = vietnamTime.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="tail">
          Mã đơn hàng: {id}
        </Text>
        <TouchableOpacity onPress={() => copyToClipboard(id)}>
          <Text style={styles.copyText}>Sao chép</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Cửa hàng:</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{sellerInfo.shopName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Ngày đặt:</Text>
          <Text style={styles.value}>{formatVietnamDate(createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tổng tiền:</Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tình trạng:</Text>
          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{getStatusText(status)}</Text>
          </View>
        </View>
      </View>

      <Icon name="chevron-right" type="feather" size={24} color="#999" style={styles.icon} />
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Success':
      return 'rgba(77, 218, 98, 0.2)';
    case 'Pending':
      return 'rgba(255, 193, 0, 0.2)';
    case 'Cancelled':
      return 'rgba(210, 65, 82, 0.2)';
    default:
      return 'rgba(0, 0, 0, 0.1)';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'Success':
      return 'Thành công';
    case 'Pending':
      return 'Đang chờ';
    case 'Cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  copyText: {
    color: '#ed8900',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ed8900',
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  icon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },
});

export default BuyerOrderItem;