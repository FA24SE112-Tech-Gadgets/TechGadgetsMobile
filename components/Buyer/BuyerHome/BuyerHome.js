import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "@rneui/base";
import api from "../../Authorization/api";
import logo from "../../../assets/adaptive-icon.png";
import { useNavigation } from '@react-navigation/native';
import { useDebounce } from 'use-debounce';
import LottieView from 'lottie-react-native';
import { ScreenHeight, ScreenWidth } from '@rneui/base';
import ErrModal from '../../CustomComponents/ErrModal';
import Snowfall from '../../CustomComponents/Snowfall';

const { width: screenWidth } = Dimensions.get('window');

export default function BuyerHome() {
  const [categories, setCategories] = useState([]);
  const [gadgets, setGadgets] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searching, setSearching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 1000);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [maxBannerCount] = useState(5);
  const [bannerArr, setBannerArr] = useState([
    {
      thumbnailUrl: "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/9a41c904-df8c-4c6c-9c6d-f57352a34550.jpg",
      type: "Điện thoại"
    },
    {
      thumbnailUrl: "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/d2fc02bc-1f9d-451a-9958-a3e4d62e2a77.jpg",
      type: "Điện thoại"
    },
    {
      thumbnailUrl: "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/55780111-4bee-4684-856a-6c61a61caa2f.jpg",
      type: "Laptop"
    },
    {
      thumbnailUrl: "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/01218ab7-8843-4a16-ad81-1a6610dfe49f.jpg",
      type: "Tai nghe"
    },
    {
      thumbnailUrl: "https://storage.googleapis.com/fbdemo-f9d5f.appspot.com/Gadgets/b62600ae-ad35-4903-b012-0911dc4cb619.jpg",
      type: "Loa"
    },
  ]);

  const flatListRef = useRef();
  const navigation = useNavigation();

  const fetchHotGadgets = async (categoryId) => {
    try {
      const response = await api.get(`/gadgets/hot?CategoryId=${categoryId}&Page=1&PageSize=1`);
      const gadget = response.data?.items[0];
      if (gadget) {
        setBannerArr((prev) => {
          // Check if gadget with the same id already exists
          const isDuplicate = prev.some((item) => item.id === gadget.id);
          // Only add if it's not a duplicate
          return isDuplicate ? prev : [...prev, gadget];
        });
      }
    } catch (error) {
      console.error("Error fetching gadgets:", error);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
      setIsError(true);
    }
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data.items);
      for (const category of response.data.items) {
        fetchGadgets(category.id);
      }
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGadgets = async (categoryId) => {
    try {
      const response = await api.get(`/gadgets/category/old/${categoryId}?Page=1&PageSize=20`);
      setGadgets(prev => ({
        ...prev,
        [categoryId]: response.data.items.map(item => ({
          ...item,
          isFavorite: item.isFavorite || false
        }))
      }));
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
    }
  };

  const searchGadgets = useCallback(async () => {
    if (!debouncedSearchQuery) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      setSearching(true);
      const response = await api.get(`/gadgets?Name=${debouncedSearchQuery}&Page=${currentPage}&PageSize=100`);
      setSearching(false);

      setSearchResults(response.data.items.map(item => ({
        ...item,
        isFavorite: item.isFavorite || false // Ensure isFavorite is always present
      })));
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          "Lỗi mạng vui lòng thử lại sau"
      );
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useFocusEffect(
    useCallback(() => {
      setCategories([]);
      setGadgets({});
      setSearchQuery("");
      setSearchResults([]);
      setCurrentPage(1);
      fetchCategories();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (debouncedSearchQuery) {
        searchGadgets();
      } else {
        setSearchResults([]);
      }
    }, [debouncedSearchQuery])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchBanners = async () => {
        const updatedBanners = bannerArr.map(banner => {
          const matchingCategory = categories.find(category => category.name.toLowerCase() === banner.type.toLowerCase());
          if (matchingCategory) {
            return { ...banner, categoryId: matchingCategory.id, categoryName: matchingCategory.name };
          }
          return banner; // Keep banner unchanged if no matching category
        });

        setBannerArr(updatedBanners);
      };
      if (categories.length > 0 && bannerArr.length <= maxBannerCount) {
        fetchBanners();
      }
    }, [categories])
  );

  const toggleFavorite = async (gadgetId) => {
    try {
      await api.post(`/favorite-gadgets/${gadgetId}`);
      // Update the gadget's isFavorite status in the state
      setGadgets(prevGadgets => {
        const updatedGadgets = { ...prevGadgets };
        for (const categoryId in updatedGadgets) {
          updatedGadgets[categoryId] = updatedGadgets[categoryId].map(gadget =>
            gadget.id === gadgetId ? { ...gadget, isFavorite: !gadget.isFavorite } : gadget
          );
        }
        return updatedGadgets;
      });
      // Also update in search results if present
      setSearchResults(prevResults =>
        prevResults.map(gadget =>
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

  const renderGadget = ({ item, isSearchResult = false }) => (
    <TouchableOpacity
      style={[styles.gadgetCard, isSearchResult && styles.searchResultCard]}
      onPress={() => navigation.navigate('GadgetDetail', { gadgetId: item.id })}
    >
      <View style={[styles.imageContainer, isSearchResult && styles.searchResultImageContainer]}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={[styles.gadgetImage, isSearchResult && styles.searchResultImage]}
          resizeMode="contain"
        />
        {!item.isForSale && (
          <View style={styles.watermarkContainer}>
            <Text style={styles.watermarkText}>Ngừng kinh doanh</Text>
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
      <Text style={[styles.gadgetName, isSearchResult && styles.searchResultName]} numberOfLines={2}>{item.name}</Text>
      <View style={styles.priceContainer}>
        {item.discountPercentage > 0 ? (
          <>
            <Text style={[styles.originalPrice, isSearchResult && styles.searchResultOriginalPrice]}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
            <Text style={[styles.discountPrice, isSearchResult && styles.searchResultDiscountPrice]}>{item.discountPrice.toLocaleString().replace(/,/g, '.')} ₫</Text>
          </>
        ) : (
          <Text style={[styles.gadgetPrice, isSearchResult && styles.searchResultPrice]}>{item.price.toLocaleString().replace(/,/g, '.')} ₫</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => {
    const categoryGadgets = gadgets[item.id] || [];

    if (categoryGadgets.length <= 0) {
      return null;
    }

    return (
      <LinearGradient
        colors={['#FFFFFF', '#fea92866']}
        style={styles.categoryContainer}
      >
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CategoryGadgets', { categoryId: item.id, categoryName: item.name })}>
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.categoryUnderline} />
        <FlatList
          data={categoryGadgets.slice(0, 20)}
          renderItem={renderGadget}
          keyExtractor={(gadget) => gadget.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          contentContainerStyle={styles.gadgetList}
        />
      </LinearGradient>
    );
  };

  const renderSearchResults = () => (
    <FlatList
      data={searchResults}
      renderItem={({ item }) => renderGadget({ item, isSearchResult: true })}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      key={2} //Rất cần dòng này để tránh báo lỗi numColumns khi reload API
      contentContainerStyle={styles.searchResultsList}
      showsVerticalScrollIndicator={false}
    />
  );

  const goToNextPage = () => {
    if (flatListRef.current) {
      const nextSlide = currentSlide >= bannerArr.length - 1 ? 0 : currentSlide + 1;
      flatListRef.current.scrollToIndex({ index: nextSlide, animated: true });
      setCurrentSlide(nextSlide);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const timerId = setInterval(() => {
        goToNextPage();
      }, 4000);

      return () => {
        clearInterval(timerId);
      };
    }, [currentSlide, bannerArr])
  );

  const renderLoading = () => (
    <LinearGradient colors={['#fea92866', '#FFFFFF']}
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
          Đang tải dữ liệu sản phẩm
        </Text>
      </View>
    </LinearGradient>
  )

  return (
    <LinearGradient
      colors={['#fea92866', '#FFFFFF']}
      style={styles.container}
    >
      {/* Header + search */}
      <View
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <Icon type="font-awesome" name="search" size={23} color="#ed8900" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sản phẩm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.logo}>
          <Image source={logo} style={styles.logoImage} />
        </View>
      </View>

      {
        loading ? (
          renderLoading()
        )
          :
          <>
            {searchQuery ? (
              searchResults.length > 0 ? (
                renderSearchResults()
              ) : (
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
                    {searching ? "Đang tìm sản phẩm" : "Không tìm thấy từ khóa của bạn"}
                  </Text>
                </View>
              )
            ) : (
              <>
                <FlatList
                  data={categories}
                  renderItem={renderCategory}
                  ListHeaderComponent={
                    (bannerArr.length > 0 && bannerArr[0]?.categoryId) &&
                    <Snowfall style={{
                      backgroundColor: "#112A46",
                      marginBottom: 15
                    }}>
                      <View style={styles.bannerContainer}>
                        <FlatList
                          data={bannerArr}
                          ref={flatListRef}
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => {
                              navigation.navigate('CategoryGadgets', { categoryId: item.categoryId, categoryName: item.categoryName })
                            }}
                              style={styles.imageBtn}
                            >
                              <Image
                                source={{ uri: item.thumbnailUrl }}
                                style={styles.gadgetImageItem}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                          )}
                          keyExtractor={(item, index) => index}
                          onLayout={() => {
                            if (flatListRef.current) {
                              flatListRef.current.scrollToIndex({ index: 0, animated: false });
                            }
                          }}
                          getItemLayout={(data, index) => ({
                            length: screenWidth,
                            offset: screenWidth * index,
                            index,
                          })}
                        />
                      </View>
                    </Snowfall>
                  }
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  style={styles.categoryList}
                />
              </>
            )}
          </>
      }

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
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: screenWidth / 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 21.5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    marginBottom: 15,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 30,
    left: -8,
    right: -8,
    bottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '0deg' }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1,
  },
  watermarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: -5,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "grey"
  },
  discountText: {
    color: 'grey',
    fontSize: 16,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ed8900',
  },
  imageBtn: {
    justifyContent: "center",
    alignItems: "center",
    width: ScreenWidth
  },
  gadgetImageItem: {
    justifyContent: "center",
    width: ScreenWidth,
    alignItems: "center",
    height: ScreenHeight / 4,
  },
  categoryList: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 15,
    paddingTop: 15,
    paddingBottom: 20,
    borderRadius: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    color: '#fea128',
    fontSize: 16,
  },
  categoryUnderline: {
    height: 2,
    backgroundColor: '#fea92866',
    marginStart: 10,
    marginBottom: 15,
  },
  gadgetList: {
    paddingHorizontal: 10,
  },
  gadgetCard: {
    width: (screenWidth - 40) / 3,
    marginHorizontal: 5,
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
    backgroundColor: '#FFFFFF',
  },
  gadgetImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 15,
  },
  gadgetName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  gadgetPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ed8900',
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
  searchResultsList: {
    paddingHorizontal: 5,
  },
  searchResultCard: {
    width: (screenWidth - 30) / 2,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  searchResultImageContainer: {
    height: 180,
  },
  searchResultImage: {
    height: 180,
  },
  searchResultName: {
    fontSize: 16,
  },
  searchResultOriginalPrice: {
    fontSize: 14,
  },
  searchResultDiscountPrice: {
    fontSize: 18,
  },
  searchResultPrice: {
    fontSize: 18,
  },
});