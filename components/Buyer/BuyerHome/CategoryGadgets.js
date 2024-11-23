import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import Slider from '@react-native-community/slider';
import api from "../../Authorization/api";
import LottieView from 'lottie-react-native';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import ErrModal from '../../CustomComponents/ErrModal';

const { width: screenWidth } = Dimensions.get('window');

export default function CategoryGadgets({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const [gadgets, setGadgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000000);
  const [activeFilters, setActiveFilters] = useState(false);
  const [currentFilters, setCurrentFilters] = useState('');
  const [noResults, setNoResults] = useState(false);

  const [stringErr, setStringErr] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchGadgets = useCallback(async (filterParams = '', resetPage = false) => {
    if (!hasMore && page !== 1 && !resetPage) return;
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      const baseUrl = `/gadgets/category/${categoryId}`;
      const url = `${baseUrl}${filterParams}${filterParams ? '&' : '?'}Page=${currentPage}&PageSize=20`;
      const response = await api.get(url);

      const newGadgets = response.data.items;
      if (newGadgets.length === 0 && currentPage === 1) {
        setNoResults(true);
      } else {
        setNoResults(false);
        setGadgets(prev => resetPage ? newGadgets : [...prev, ...newGadgets]);
        setPage(prev => resetPage ? 2 : prev + 1);
        setHasMore(newGadgets.length === 20);
      }
    } catch (error) {
      console.log('Error fetching gadgets:', error);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, hasMore]);

  useFocusEffect(
    useCallback(() => {
      setGadgets([]);
      setPage(1);
      setHasMore(true);
      fetchGadgets();
      fetchBrands();
      fetchFilters();
    }, [])
  );

  const fetchBrands = async () => {
    try {
      const response = await api.get(`/brands/categories/${categoryId}?Page=1&PageSize=50`);
      setBrands(response.data.items);
    } catch (error) {
      console.log('Error fetching brands:', error);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await api.get(`/gadget-filters/category/${categoryId}`);
      setFilters(response.data);
    } catch (error) {
      console.log('Error fetching filters:', error);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
    }
  };

  const toggleFavorite = async (gadgetId) => {
    try {
      await api.post(`/favorite-gadgets/${gadgetId}`);
      setGadgets(prevGadgets =>
        prevGadgets.map(gadget =>
          gadget.id === gadgetId ? { ...gadget, isFavorite: !gadget.isFavorite } : gadget
        )
      );
    } catch (error) {
      console.log('Error toggling favorite:', error);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
    }
  };

  const openFilterModal = () => {
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    let filterParams = [];
    if (selectedBrands.length > 0) {
      selectedBrands.forEach(brandId => {
        filterParams.push(`Brands=${brandId}`);
      });
    }
    if (minPrice !== 0 || maxPrice !== 150000000) {
      filterParams.push(`MinPrice=${minPrice}`);
      filterParams.push(`MaxPrice=${maxPrice}`);
    }
    Object.entries(selectedFilters).forEach(([key, value]) => {
      value.forEach(filterId => {
        filterParams.push(`GadgetFilters=${filterId}`);
      });
    });
    const filterString = filterParams.length > 0 ? `?${filterParams.join('&')}` : '';
    setCurrentFilters(filterString);
    setFilterModalVisible(false);
    setActiveFilters(true);
    fetchGadgets(filterString, true);
  };

  const renderGadget = ({ item }) => (
    <TouchableOpacity
      style={styles.gadgetCard}
      onPress={() => navigation.navigate('GadgetDetail', { gadgetId: item.id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.gadgetImage}
          resizeMode="contain"
        />
        {!item.isForSale && (
          <View style={styles.watermarkContainer}>
            <Text style={styles.watermarkText}>Ngừng bán</Text>
          </View>
        )}
        {item.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <AntDesign
            name={item.isFavorite ? "heart" : "hearto"}
            size={24}
            color={item.isFavorite ? "red" : "black"}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.gadgetName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.priceContainer}>
        {item.discountPercentage > 0 ? (
          <>
            <Text style={styles.originalPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
            <Text style={styles.discountPrice}>{item.discountPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
          </>
        ) : (
          <Text style={styles.gadgetPrice}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderBrandItem = ({ item, index }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.brandItem,
        selectedBrands.includes(item.id) && styles.selectedBrandItem
      ]}
      onPress={() => {
        setSelectedBrands(prev =>
          prev.includes(item.id)
            ? prev.filter(id => id !== item.id)
            : [...prev, item.id]
        );
      }}
    >
      <Image source={{ uri: item.logoUrl }} style={styles.brandLogo} />
      <Text style={styles.brandName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderBrandRows = () => {
    const rows = [];
    const itemsPerRow = 4;
    const numRows = 2;
    const totalItems = itemsPerRow * numRows;

    for (let i = 0; i < brands.length; i += totalItems) {
      const rowGroup = brands.slice(i, i + totalItems);
      rows.push(
        <View key={`group-${i}`} style={styles.brandRowGroup}>
          {[0, 1].map(rowIndex => (
            <View key={`row-${i}-${rowIndex}`} style={styles.brandRow}>
              {rowGroup.slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow).map((brand, index) => (
                renderBrandItem({ item: brand, index: i + rowIndex * itemsPerRow + index })
              ))}
            </View>
          ))}
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.brandListContainer}
      >
        {rows}
      </ScrollView>
    );
  };

  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Lọc sản phẩm</Text>

            <Text style={styles.filterSectionTitle}>Thương hiệu</Text>
            {renderBrandRows()}


            <Text style={styles.filterSectionTitle}>Giá</Text>
            <View style={styles.priceRangeContainer}>
              <Text>{minPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={150000000}
                step={100000}
                value={minPrice}
                onValueChange={(value) => {
                  setMinPrice(value);
                  console.log('Min price:', value);
                }}
              />
              <Text>{maxPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
            </View>
            <View style={styles.priceRangeContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={150000000}
                step={100000}
                value={maxPrice}
                onValueChange={(value) => {
                  setMaxPrice(value);
                  console.log('Max price:', value);
                }}
              />
            </View>

            {filters.map(filter => (
              <View key={filter.specificationKeyName}>
                <Text style={styles.filterSectionTitle}>{filter.specificationKeyName}</Text>
                <View style={styles.filterOptionsContainer}>
                  {filter.gadgetFilters.map(option => (
                    <TouchableOpacity
                      key={option.gadgetFilterId}
                      style={[
                        styles.filterOption,
                        (selectedFilters[filter.specificationKeyName] || []).includes(option.gadgetFilterId) && styles.selectedFilterOption
                      ]}
                      onPress={() => {
                        setSelectedFilters(prev => {
                          const current = prev[filter.specificationKeyName] || [];
                          const updated = current.includes(option.gadgetFilterId)
                            ? current.filter(id => id !== option.gadgetFilterId)
                            : [...current, option.gadgetFilterId];
                          return { ...prev, [filter.specificationKeyName]: updated };
                        });
                      }}
                    >
                      <Text style={styles.filterOptionText}>{option.value}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <View style={styles.filterButtonsContainer}>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#FFFFFF', '#fea92866']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>{categoryName}</Text>
        <TouchableOpacity onPress={openFilterModal}>
          <AntDesign name="filter" size={24} color={activeFilters ? "#fea128" : "black"} />
        </TouchableOpacity>
      </View>
      {loading && page === 1 ? (

        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <LottieView
              source={require("../../../assets/animations/catRole.json")}
              style={styles.lottieAnimation}
              autoPlay
              loop
              speed={0.8}
            />
            <Text style={styles.loadingText}>Đang load dữ liệu</Text>
          </View>
        </LinearGradient>

      ) : noResults ? (
        <LinearGradient colors={['#fea92866', '#FFFFFF']} style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <LottieView
              source={require("../../../assets/animations/catRole.json")}
              style={styles.lottieAnimation}
              autoPlay
              loop
              speed={0.8}
            />
            <Text style={styles.loadingText}>Không có sản phẩm bạn tìm kiếm</Text>
          </View>
        </LinearGradient>
      ) : (
        <FlatList
          data={gadgets}
          renderItem={renderGadget}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          numColumns={2}
          contentContainerStyle={styles.gadgetList}
          onEndReached={() => fetchGadgets(currentFilters)}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => (
            hasMore && <ActivityIndicator size={24} color="#ed8900" />
          )}
        />
      )}
      {renderFilterModal()}

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
    height: ScreenHeight / 1.5,
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lottieAnimation: {
    width: ScreenWidth,
    height: ScreenWidth / 1.5,
  },
  loadingText: {
    fontSize: 18,
    width: ScreenWidth / 1.5,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
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
  headerTxt: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  gadgetList: {
    padding: 10,
  },
  gadgetCard: {
    width: (screenWidth - 30) / 2,
    marginHorizontal: 5,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    marginBottom: 10,
  },
  gadgetImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,

  },
  watermarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    transform: [{ rotate: '0deg' }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gadgetName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ed8900',
  },
  gadgetPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ed8900',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  brandListContainer: {
    height: 170, // Adjust this value to fit two rows of brands
  },
  brandRowGroup: {
    marginRight: 20, // Add some space between groups of brands
  },
  brandRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  brandItem: {
    width: (screenWidth - 60) / 4, // Display 4 items per row
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginRight: 10,
  },
  selectedBrandItem: {
    backgroundColor: '#fea92866',
  },
  brandLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  brandName: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 10,
  },
  priceRangeContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterOption: {
    backgroundColor: '#fea92866',
  },
  filterOptionText: {
    fontSize: 14,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: '#fea128',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
  },
});