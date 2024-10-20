import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

// const { height } = Dimensions.get('window');

export default function ProductDetails() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      {/* <View style={styles.header}>
          <Text style={styles.backIcon}>←</Text>
          <View style={styles.headerIcons}>
            <Text style={styles.icon}>🛒</Text>
            <Text style={styles.icon}>🏠</Text>
          </View>
        </View> */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Brands/Apple.jpg' }}
            style={styles.productImage}
          />
        </View>
        <View style={styles.optionsContainer}>
          {['Xanh Lưu Ly', 'Trắng', 'Đen', 'Xanh Mòng Két'].map((color, index) => (
            <TouchableOpacity key={index} style={styles.optionButton}>
              <Text>{color}</Text>
            </TouchableOpacity>
          ))}
        </View>


        <View style={styles.optionsContainer}>
          {['512GB', '256GB', '128GB','64GB','32GB'].map((storage, index) => (
            <TouchableOpacity key={index} style={styles.optionButtons}>
              <Text>{storage}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.priceText}>22.990.000đ</Text>
        <Text style={styles.productName}>iPhone 16 128GB</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detail}>- Chính hãng, Mới 100%, Nguyên seal</Text>
          <Text style={styles.detail}>- Màn hình: OLED Super Retina XDR</Text>
          <Text style={styles.detail}>- Bộ nhớ: 128GB</Text>
        </View>

        <Text style={styles.grayText}>
          Thương hiệu: <Text style={styles.blueText}>APPLE</Text>
        </Text>
        <Text style={styles.grayText}>SKU: 240900701</Text>
        <View style={styles.container}>
          {/* Title */}
          <Text style={styles.title}>Chi tiết sản phẩm</Text>


          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thương hiệu</Text>
            <Text style={styles.detailValue}>APPLE</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bảo hành</Text>
            <Text style={styles.detailValue}>12 tháng</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nhóm sản phẩm</Text>
            <Text style={styles.detailValue}>Điện thoại</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tên</Text>
            <Text style={styles.detailValue}>iPhone 16</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Series</Text>
            <Text style={styles.detailValue}>iPhone 16</Text>
          </View>

          <TouchableOpacity style={styles.showMoreButton} onPress={() => navigation.navigate('Details')}>
            <Text style={styles.showMoreText}>Xem thêm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80, // Prevent content from being hidden behind the buttons
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
  },
  productIndex: {
    marginTop: 8,
    color: 'gray',
  },
  grayText: {
    color: 'gray',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtons:{
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: 'red',
  },
  selectedText: {
    color: 'red',
  },
  priceText: {
    fontSize: 24,
    color: 'red',
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detail: {
    color: 'gray',
    marginBottom: 4,
  },
  blueText: {
    color: 'blue',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  cartButton: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cartButtonText: {
    fontWeight: '600',
    color: '#555',
  },
  buyButton: {
    backgroundColor: '#ff5722',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    color: 'gray',
    fontSize: 14,
  },
  detailValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  showMoreText: {
    color: '#007bff',
    fontWeight: '600',
  },
});
