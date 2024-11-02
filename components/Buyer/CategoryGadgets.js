import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";
import api from "../Authorization/api";

const { width: screenWidth } = Dimensions.get('window');

export default function CategoryGadgets({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  const [gadgets, setGadgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    fetchGadgets();
  }, []);

  const fetchGadgets = async () => {
    if (!hasMore) return;
    try {
      const response = await api.get(`/gadgets/category/old/${categoryId}?Page=${page}&PageSize=20`);
      const newGadgets = response.data.items;
      setGadgets(prev => [...prev, ...newGadgets]);
      setPage(prev => prev + 1);
      setHasMore(newGadgets.length === 20);
    } catch (error) {
      console.error('Error fetching gadgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (gadgetId) => {
    setFavorites(prev => ({
      ...prev,
      [gadgetId]: !prev[gadgetId]
    }));
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
            name={favorites[item.id] ? "heart" : "hearto"}
            size={24}
            color={favorites[item.id] ? "red" : "black"}
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

  return (
    <LinearGradient
      colors={['#FFFFFF', '#fea92866']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <TouchableOpacity onPress={() => {/* Implement filter functionality */}}>
          <AntDesign name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={gadgets}
        renderItem={renderGadget}
        keyExtractor={(item, index) => `${item.id}-${index}`} 
        numColumns={2}
        contentContainerStyle={styles.gadgetList}
        onEndReached={fetchGadgets}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => (
          hasMore && <ActivityIndicator size="large" color="#0000ff" />
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    backgroundColor: '#ff4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
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
});