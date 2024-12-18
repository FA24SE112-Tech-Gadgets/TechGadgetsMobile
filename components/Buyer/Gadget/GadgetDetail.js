import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Feather, EvilIcons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import Modal from 'react-native-modal';
import api from '../../Authorization/api';
import LottieView from 'lottie-react-native';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import ErrModal from '../../CustomComponents/ErrModal';
import ReviewSummary from '../BuyerReview/ReviewSummary';
import { useFocusEffect } from '@react-navigation/native';
import userLocationAva from "../../../assets/userLocationAva.jpg";

export default function GadgetDetail({ route, navigation }) {
  const [gadget, setGadget] = useState(null);
  const { gadgetId } = route.params;

  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [buyNowModalVisible, setBuyNowModalVisible] = useState(false);

  const [showBottomBar, setShowBottomBar] = useState(true);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [stringErr, setStringErr] = useState('');
  const [isError, setIsError] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const formatVietnamDate = (time) => {
    const date = new Date(time);
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
    const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = vietnamTime.getUTCFullYear();

    return `${day}/${month}/${year}`;
  };

  useFocusEffect(
    useCallback(() => {
      fetchGadgetDetail();
    }, [gadgetId])
  );

  useFocusEffect(
    useCallback(() => {
      setIsContentExpanded(false);
    }, [activeTab])
  );

  {/* Group Specification*/ }
  const groupSpecifications = (specs) => {
    return specs.reduce((acc, spec) => {
      const key = spec.specificationKey.name;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(spec);
      return acc;
    }, {});
  };

  const fetchGadgetDetail = async () => {
    try {
      setIsFetching(true);
      const response = await api.get(`/gadgets/${gadgetId}`);
      setIsFetching(false);

      setGadget(response.data);
    } catch (error) {
      console.log('Error fetching gadget details:', error);
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

  const addToCart = async () => {
    try {
      await api.post('/cart', {
        gadgetId: gadget.id,
        quantity: quantity
      });
      setSnackbarMessage('Sản phẩm đã được thêm vào giỏ hàng');
      setSnackbarVisible(true);
    } catch (error) {
      console.log('Error adding to cart:', error);
      setSnackbarMessage('Không thể thêm sản phẩm vào giỏ hàng');
      setSnackbarVisible(true);
    }
  };

  const buyNow = async () => {
    try {
      await api.post('/order/now', {
        gadgetId: gadget.id,
        quantity: quantity
      });
      setBuyNowModalVisible(false);
      setSnackbarMessage('Đơn hàng đã được tạo thành công');
      setSnackbarVisible(true);
    } catch (error) {
      console.log('Error buying now:', error.response?.data?.reasons?.[0]?.message);
      setStringErr(error.response?.data?.reasons?.[0]?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsError(true);
      setBuyNowModalVisible(false)
    }
  };

  if (gadget === null || gadget?.status === "Inactive" || gadget?.sellerStatus === "Inactive") {
    return (
      <LinearGradient colors={['#fea92866', '#FFFFFF']}
        style={{
          flex: 1,
          height: ScreenHeight / 1.5,
        }}
      >
        {/* Back btn */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Error showing */}
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
            {isFetching ? "Đang tải dữ liệu sản phẩm" : gadget?.sellerStatus === "Inactive" ? "Người bán sản phẩm này đã bị khóa do vi phạm chính sách TechGadget" : gadget?.status === "Inactive" ? "Sản phẩm đã bị khóa do vi phạm chính sách TechGadget" : "Không tìm thấy thông tin sản phẩm"}
          </Text>
        </View>
      </LinearGradient>
    );
  }
  /* View gadget images */
  const ImageGalleryModal = () => (
    <Modal
      isVisible={imageModalVisible}
      onBackdropPress={() => setImageModalVisible(false)}
      onBackButtonPress={() => setImageModalVisible(false)}
      useNativeDriver
      hideModalContentWhileAnimating
      style={{
        margin: 0
      }}
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
              source={{ uri: item.imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={(data, index) => (
            { length: ScreenWidth, offset: ScreenWidth * index, index }
          )}
        />
      </View>
    </Modal>
  );

  const BuyNowModal = () => (
    <Modal
      isVisible={buyNowModalVisible}
      onBackdropPress={() => setBuyNowModalVisible(false)}
      onBackButtonPress={() => setBuyNowModalVisible(false)}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.buyNowModalContent}>
        <Text style={styles.buyNowModalTitle}>Xác nhận mua hàng</Text>
        <Image
          source={{ uri: gadget.thumbnailUrl }}
          style={styles.buyNowModalImage}
          resizeMode="contain"
        />
        <Text
          style={styles.buyNowModalProductName}
        >{gadget.name}</Text>
        <Text style={styles.buyNowModalQuantity}>Số lượng: {quantity}</Text>
        <Text style={styles.buyNowModalPrice}>
          Tổng tiền: {((gadget.discountPrice || gadget.price) * quantity).toLocaleString('vi-VN')} ₫
        </Text>
        <View style={styles.buyNowModalButtons}>
          <TouchableOpacity
            style={[styles.buyNowModalButton, styles.buyNowModalCancelButton]}
            onPress={() => setBuyNowModalVisible(false)}
          >
            <Text style={styles.buyNowModalButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buyNowModalButton, styles.buyNowModalConfirmButton]}
            onPress={buyNow}
          >
            <Text style={styles.buyNowModalButtonText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient colors={['#FFFFFF', '#fea92866']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={() => {
          setShowBottomBar(false);
        }}
        onMomentumScrollEnd={() => {
          setShowBottomBar(true);
        }}
        contentContainerStyle={{
          paddingBottom: ScreenWidth / 4.5
        }}
      >
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
          {!gadget.isForSale && (
            <View style={styles.soldOutWatermark}>
              <Text style={styles.soldOutText}>Ngừng bán</Text>
            </View>
          )}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
          </View>
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
              key={image.id}
              onPress={() => {
                setSelectedImageIndex(index);
                setImageModalVisible(true);
              }}
            >
              <Image
                source={{ uri: image.imageUrl }}
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

        {/* Seller info */}
        <View style={{
          alignSelf: "center",
          backgroundColor: "white",
          padding: 10,
          width: ScreenWidth / 1.1,
          borderRadius: 10 + 10,
          gap: 10
        }}>
          <View style={{
            flexDirection: "row",
            gap: 10,
          }}>
            {/* Shop avatar */}
            <Image
              source={userLocationAva}
              style={{
                height: 45,
                width: 45,
                backgroundColor: "black",
                borderRadius: 30,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.3)"
              }}
            />

            <View style={{
              width: ScreenWidth / 1.5,
            }}>
              {/* ShopName */}
              <Text style={{
                fontSize: 14,
                marginBottom: 3,
                overflow: "hidden",
              }} numberOfLines={1} ellipsizeMode="tail">
                {gadget.seller !== null ? gadget.seller.shopName : "Người dùng hệ thống"}{gadget.seller?.companyName ? ` - ${gadget.seller.companyName}` : ""}
              </Text>

              {/* Shop address */}
              <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 5,
                gap: 5,
              }}>
                <EvilIcons name="location" size={23} />
                <Text
                  style={{
                    fontSize: 12,
                    overflow: "hidden",
                    width: ScreenWidth / 1.7
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >{gadget.seller !== null ? gadget.seller.shopAddress : "Người bán chưa cập nhật địa chỉ"}</Text>
              </View>
            </View>

          </View>

          {/* Xem Shop */}
          <TouchableOpacity
            onPress={
              () => {
                navigation.navigate('SellerDetailScreen', { sellerId: gadget.seller.id })
              }
            }
            style={{
              width: ScreenWidth / 1.1 - 20,
              height: ScreenHeight / 20,
              backgroundColor: "#ed8900",
              alignItems: "center",
              padding: 10,
              borderRadius: 10,
              alignSelf: "center"
            }}
          >
            <Text style={{
              color: "white",
              fontSize: 14
            }}>Xem shop</Text>
          </TouchableOpacity>
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
              {Object.entries(groupSpecifications(gadget.specificationValues))
                .slice(0, isContentExpanded ? undefined : 4)
                .map(([key, specs], index, array) => (
                  <View key={key}>
                    <View style={styles.specRow}>
                      <View style={styles.specKeyContainer}>
                        <Text style={styles.specKey}>{key}</Text>
                      </View>
                      <View style={styles.specValueContainer}>
                        {specs.map((spec, i) => (
                          <View key={i} style={styles.specValueRow}>
                            <Text style={styles.specValue}>
                              {spec.value}{spec.specificationUnit?.name || ''}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    {index < array.length - 1 && <View style={styles.separator} />}
                  </View>
                ))}
              {Object.keys(groupSpecifications(gadget.specificationValues)).length > 4 && (
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
                    color="#ed8900"
                    style={styles.expandIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.descContainer}>
              {gadget.gadgetDescriptions && gadget.gadgetDescriptions.length > 0 ? (
                gadget.gadgetDescriptions
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
                  ))
              ) : (
                <Text style={styles.noReviewText}>Chưa có bài viết đánh giá nào</Text>
              )}
              {gadget.gadgetDescriptions && gadget.gadgetDescriptions.length > 2 && (
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
                    color="#ed8900"
                    style={styles.expandIcon}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <ReviewSummary
          gadgetId={gadgetId}
          navigation={navigation}
          setIsError={setIsError}
          setStringErr={setStringErr}
        />
      </ScrollView>

      {/* Bottom Bar */}
      {
        showBottomBar &&
        <View style={styles.bottomBar}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={styles.quantityButton}
            >
              <AntDesign name="minus" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(Math.min(gadget.quantity, quantity + 1))}
              style={styles.quantityButton}
            >
              <AntDesign name="plus" size={20} color="#333" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={addToCart}
          >
            <Feather name="shopping-cart" size={20} color="#ed8900" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.buyNowButton,
              !gadget.isForSale && styles.disabledBuyNowButton
            ]}
            onPress={() => gadget.isForSale && setBuyNowModalVisible(true)}
            disabled={!gadget.isForSale}
          >
            <Text style={[
              styles.buyNowButtonText,
              !gadget.isForSale && styles.disabledBuyNowButtonText
            ]}>
              {gadget.isForSale ? 'Mua ngay' : 'Ngừng bán'}
            </Text>
          </TouchableOpacity>
        </View>
      }

      <ImageGalleryModal />
      <BuyNowModal />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={1500}
        wrapperStyle={{ bottom: 0, zIndex: 1 }}
      >
        {snackbarMessage}
      </Snackbar>
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
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
    width: ScreenWidth,
    height: ScreenWidth,
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
    transform: [{ rotate: '0deg' }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ed8900',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 22,
    color: '#ed8900',
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
    borderBottomColor: '#ed8900',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#ed8900',
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
  specValueRow: {
    marginBottom: 2,
  },
  specKey: {
    fontSize: 14,
    color: 'black',
    flexWrap: 'wrap',
    fontWeight: 'bold',
  },
  specValue: {
    fontSize: 14,
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
    color: '#ed8900',
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
    fontSize: 14,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
  },
  noReviewText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    width: ScreenWidth / 1.05,
    alignSelf: "center",
    bottom: 10,
    position: "absolute",
    borderRadius: 15,
    justifyContent: "space-between",
    gap: 10
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    height: ScreenWidth / 9,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 18,
  },
  cartButton: {
    borderWidth: 1,
    borderColor: '#ed8900',
    borderRadius: 8,
    width: ScreenWidth / 9,
    height: ScreenWidth / 9,
    justifyContent: "center",
    alignItems: "center"
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#ed8900',
    borderRadius: 8,
    alignItems: 'center',
    height: ScreenWidth / 9,
    justifyContent: "center"
  },
  buyNowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalImage: {
    width: ScreenWidth,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  buyNowModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyNowModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buyNowModalImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  buyNowModalProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buyNowModalQuantity: {
    fontSize: 14,
    marginBottom: 5,
  },
  buyNowModalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ed8900',
    marginBottom: 15,
  },
  buyNowModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buyNowModalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
    borderColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 0.5
  },
  buyNowModalCancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  buyNowModalConfirmButton: {
    backgroundColor: '#ed8900',
  },
  buyNowModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});