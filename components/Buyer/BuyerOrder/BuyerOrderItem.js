import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Icon } from "@rneui/base";
import Clipboard from "@react-native-clipboard/clipboard";

const BuyerOrderItem = ({ id, amount, status, createdAt, sellerInfo, gadgets, setSnackbarVisible, setSnackbarMessage }) => {
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

  const renderGadgetItem = ({ item }) => (
    <View style={styles.gadgetItem}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      <View style={styles.gadgetInfo}>
        <Text style={styles.gadgetName} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
        <Text style={styles.gadgetQuantity}>x{item.quantity}</Text>
      </View>
      <Text style={styles.gadgetPrice}>{formatCurrency(item.discountPrice)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.shopInfo}>
          <Icon name="store" type="material" size={20} color="#333" />
          <Text style={styles.shopName} numberOfLines={1} ellipsizeMode="tail">
            {sellerInfo.shopName}
          </Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{getStatusText(status)}</Text>
        </View>
      </View>

      <FlatList
        data={gadgets}
        renderItem={renderGadgetItem}
        keyExtractor={(item) => item.sellerOrderItemId}
        scrollEnabled={false}
      />

      <View style={styles.footer}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderDate}> Ngày đặt: {formatVietnamDate(createdAt)}</Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(amount)}</Text>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 3,
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
  gadgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  gadgetInfo: {
    flex: 1,
  },
  gadgetName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  gadgetQuantity: {
    fontSize: 12,
    color: '#666',
  },
  gadgetPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ed8900',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ed8900',
  },
  icon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -12,
  },
});

export default BuyerOrderItem;