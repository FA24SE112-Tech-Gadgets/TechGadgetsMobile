import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

const DishHorizontal = ({ image, name, avgReview, numOfReview, price, restaurant }) => {

  function formatCurrency(number) {
    // Convert the number to a string
    if (number) {
      let numberString = number.toString();

      // Regular expression to add dot as thousand separator
      let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

      return formattedString;
    }
  }

  return (
    <View style={styles.itemContainer}>
      <View style={styles.container}>
        <Image source={{ uri: image }} style={styles.image} />

        <View style={styles.detailsContainer}>
          <Text style={[styles.name, { color: "#FB5854", fontSize: 20 }]} numberOfLines={1} ellipsizeMode="tail">
            {name}
          </Text>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {restaurant?.name}
          </Text>

          <View style={{
            flexDirection: "row",
            gap: 5
          }}>
            <Text style={styles.price}>{formatCurrency(price.amount)}</Text>

            {numOfReview == 0 ? (
              <View style={{ marginVertical: 2 }}></View>
            ) : (
              <View style={styles.ratingsContainer}>
                <Icon name="star" size={20} color="#FFC700" />
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.rating}>{avgReview}</Text>
                  <Text style={styles.numRating}>({numOfReview})</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {},
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 18,
    marginRight: 10,
    borderColor: "#FB6562",
    borderWidth: 2,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  ratingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  rating: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  numRating: {
    fontSize: 14,
    fontWeight: "500",
  },
  price: {
    fontSize: 16,
    color: "#FB5854",
    fontWeight: "500",
  },
});

export default DishHorizontal;
