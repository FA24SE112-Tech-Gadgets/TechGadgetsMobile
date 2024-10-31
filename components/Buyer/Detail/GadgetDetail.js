import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign } from '@expo/vector-icons';
import api from '../../Authorization/api';

const { width } = Dimensions.get('window');

export default function GadgetDetail({ route, navigation }) {
  const [gadget, setGadget] = useState(null);
  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const formatVietnamDate = (time) => {
    const date = new Date(time);
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
    const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = vietnamTime.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };



  useEffect(() => {
    fetchGadgetDetail();
  }, []);

  // Reset expanded state when switching tabs
  useEffect(() => {
    setIsContentExpanded(false);
  }, [activeTab]);

  const fetchGadgetDetail = async () => {
    try {
      const response = await api.get(`/gadgets/${route.params.gadgetId}`);
      setGadget(response.data);
    } catch (error) {
      console.error('Error fetching gadget details:', error);
    }
  };

  if (!gadget) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const ImageGalleryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={imageModalVisible}
      onRequestClose={() => setImageModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setImageModalVisible(false)}
        >
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
        <FlatList
          data={gadget.gadgetImages}
          horizontal
          pagingEnabled
          initialScrollIndex={selectedImageIndex}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => (
            { length: width, offset: width * index, index }
          )}
        />
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={['#FFFFFF', '#fea92866']} style={styles.container}>
      <ScrollView>
        {/* Main Image with Brand Logo */}
        <View style={styles.mainImageContainer}>
          <Image
            source={{ uri: gadget.thumbnailUrl }}
            style={styles.mainImage}
            resizeMode="contain"
          />
          {gadget.discountPercentage > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{gadget.discountPercentage}%</Text>
            </View>
          )}
          {/* Watermark "Ngừng kinh doanh" if isForSale is false */}
          {!gadget.isForSale && (
            <View style={styles.soldOutWatermark}>
              <Text style={styles.soldOutText}>Ngừng kinh doanh</Text>
            </View>
          )}
          {/* Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Brand Logo */}
          <View style={styles.brandLogoContainer}>
            <Image
              source={{ uri: gadget.brand.logoUrl }}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Image Thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
          {gadget.gadgetImages.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedImageIndex(index);
                setImageModalVisible(true);
              }}
            >
              <Image
                source={{ uri: image }}
                style={styles.thumbnail}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{gadget.name}</Text>
          {gadget.discountPercentage > 0 ? (
            <>
              <View style={styles.priceContainer}>
                <Text style={styles.originalPrice}>
                  {gadget.price.toLocaleString('vi-VN')} ₫
                </Text>
                <Text style={styles.discountPrice}>
                  {gadget.discountPrice.toLocaleString('vi-VN')} ₫
                </Text>
              </View>
              {gadget.discountExpiredDate && (
                <Text style={styles.discountExpiry}>
                  Ưu đãi còn đến: {formatVietnamDate(gadget.discountExpiredDate)}
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.productPrice}>
              {gadget.price.toLocaleString('vi-VN')} ₫
            </Text>
          )}
          <Text style={styles.condition}>Tình trạng: {gadget.condition}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'specs' && styles.activeTab]}
            onPress={() => setActiveTab('specs')}
          >
            <Text style={[styles.tabText, activeTab === 'specs' && styles.activeTabText]}>
              Thông số kỹ thuật
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'desc' && styles.activeTab]}
            onPress={() => setActiveTab('desc')}
          >
            <Text style={[styles.tabText, activeTab === 'desc' && styles.activeTabText]}>
              Bài viết đánh giá
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'specs' ? (
            <View style={styles.specsContainer}>
              {gadget.specificationValues.slice(0, isContentExpanded ? undefined : 4).map((spec, index) => (
                <View key={index}>
                  <View style={styles.specRow}>
                    <View style={styles.specKeyContainer}>
                      <Text style={styles.specKey}>{spec.specificationKey}</Text>
                    </View>
                    <View style={styles.specValueContainer}>
                      <Text style={styles.specValue}>
                        {spec.specificationKey === 'Thời điểm ra mắt' ? formatVietnamDate(spec.value) : spec.value} {spec.specificationUnit}
                      </Text>
                    </View>
                  </View>

                  {index < (isContentExpanded ? gadget.specificationValues.length - 1 : 3) && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
              {gadget.specificationValues.length > 4 && (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setIsContentExpanded(!isContentExpanded)}
                >
                  <Text style={styles.expandButtonText}>
                    {isContentExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </Text>
                  <AntDesign
                    name={isContentExpanded ? "up" : "down"}
                    size={16}
                    color="#fea128"
                    style={styles.expandIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.descContainer}>
              {gadget.gadgetDescriptions
                .sort((a, b) => a.index - b.index)
                .slice(0, isContentExpanded ? undefined : 2)
                .map((desc, index) => (
                  <View key={index} style={styles.descriptionItem}>
                    {desc.type === 'Image' ? (
                      <Image
                        source={{ uri: desc.value }}
                        style={styles.descriptionImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.descriptionText,
                          desc.type === 'BoldText' && styles.boldText,
                        ]}
                      >
                        {desc.value}
                      </Text>
                    )}
                  </View>
                ))}
              {gadget.gadgetDescriptions.length > 2 && (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => setIsContentExpanded(!isContentExpanded)}
                >
                  <Text style={styles.expandButtonText}>
                    {isContentExpanded ? 'Thu gọn' : 'Xem thêm'}
                  </Text>
                  <AntDesign
                    name={isContentExpanded ? "up" : "down"}
                    size={16}
                    color="#fea128"
                    style={styles.expandIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.quantityButton}
          >
            <AntDesign name="minus" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(Math.min(gadget.quantity, quantity + 1))}
            style={styles.quantityButton}
          >
            <AntDesign name="plus" size={20} color="black" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => {
            // Add to cart logic here
          }}
        >
          <LinearGradient
            colors={['#FFFFFF', '#fea92866']}
            style={styles.addToCartGradient}
          >
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ImageGalleryModal />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  mainImageContainer: {
    position: 'relative',
    width: width,
    height: width,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  brandLogoContainer: {
    position: 'absolute',
    bottom: '5%',
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 1,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceContainer: {
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  discountExpiry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  soldOutWatermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  soldOutText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  thumbnailContainer: {
    padding: 16,
  },
  thumbnail: {
    width: 120,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#fea128',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  condition: {
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fea128',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#fea128',
    fontWeight: 'bold',
  },
  tabContent: {
    padding: 16,
  },
  specsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  descContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  specKeyContainer: {
    flex: 2,
    paddingRight: 16,
  },
  specValueContainer: {
    flex: 3,
  },
  specKey: {
    fontSize: 16,
    color: 'black',
    flexWrap: 'wrap',
    fontWeight: 'bold',
  },
  specValue: {
    fontSize: 15,
    color: '#333',
    flexWrap: 'wrap',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  expandButtonText: {
    color: '#fea128',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  expandIcon: {
    marginLeft: 4,
  },
  descriptionItem: {
    marginBottom: 16,
  },
  descriptionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 18,
  },
  addToCartButton: {
    flex: 1,
  },
  addToCartGradient: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fea128',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalImage: {
    width: width,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
});