import {
  View,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import api from "../Authorization/api";
import { useDebounce } from "use-debounce";
import LottieView from "lottie-react-native";
import { useTranslation } from "react-i18next";
import ErrModal from "./ErrModal";

const limit = 20

export default function CustomSocial({ navigation }) {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchBounceString] = useDebounce(searchQuery, 1000);
  const scrollViewRef = useRef(null);

  const [isFetching, setIsFetching] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const { t } = useTranslation();

  const handleNavigate = (nameRoute, post) => {
    navigation.navigate(nameRoute, { post: post });
  };

  const fetchPost = async (currentPage) => {
    let isErr = true;
    try {
      const res = await api.get(`/posts?page=${currentPage}&limit=${limit}`);
      if (res.status >= 200 && res.status < 300) {
        setData(res.data.data);
      }
      isErr = false;
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("network-error")
      );
      isErr = true;
    }
    return isErr;
  };

  const handleScroll = () => {
    if (!isFetching && hasMoreData) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const renderFooter = () => {
    if (!isFetching) return null;
    return (
      <View style={{
        padding: 5,
        alignItems: 'center'
      }}>
        <ActivityIndicator color={"#FB6562"} />
      </View>
    );
  };

  //Fetch posts / Search posts
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(0);
      fetchPost(0);
    }, [searchBounceString])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchItems = async () => {
        try {
          setIsFetching(true);
          const res = await api.get(
            `/posts?page=${currentPage}&name=${searchQuery}&limit=${limit}`
          );
          const newData = res.data.data;
          setHasMoreData(newData.length > 0);
          setIsFetching(false);

          if (newData.length == 0) {
            // No more data to fetch
            return; // Stop the process if there is no more data
          }

          // Filter out items with imgURL !== null
          const filteredData = newData.filter(item => item?.postImages);

          // Only update the state if there are filtered items
          if (filteredData.length > 0) {
            setData((prevArray) => [...prevArray, ...filteredData]);
          }

        } catch (error) {
          setIsError(true);
          setStringErr(
            error.response?.data?.reasons[0]?.message ?
              error.response.data.reasons[0].message
              :
              t("network-error")
          );
        }
      };
      if (currentPage >= 1) {
        fetchItems();
      }
    }, [currentPage])
  );

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{
        flex: 1,
        backgroundColor: "white",
        position: "relative"
      }}
    >
      {/* Search bài viết */}
      <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
        {/* <View
          style={{
            flexDirection: "row",
            backgroundColor: "#E9ECEE",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 4,
            columnGap: 12,
            borderRadius: 6,
            height: ScreenWidth / 9
          }}
        >
          <Icon type="font-awesome" name="search" size={23} color={"#FB6562"} />
          <TextInput
            style={{
              fontSize: 20
            }}
            placeholder={t("search-content")}
            returnKeyType="search"
            value={searchQuery}
            onChangeText={(query) => setSearchQuery(query)}
            editable={false} //TODO: Khi nào có API search post thì mở
          />
        </View> */}
        <Pressable
          style={{
            flexDirection: "row",
            backgroundColor: "#E9ECEE",
            alignItems: "center",
            paddingHorizontal: 10,
            paddingVertical: 4,
            columnGap: 12,
            borderRadius: 6,
            height: ScreenWidth / 9
          }}
          onPress={() => {
            // TODO: Khi nào có API search post thì mở
            setIsError(true);
            setStringErr(
              t("lock-feature")
            );
          }}
        >
          <Icon type="font-awesome" name="search" size={23} color={"#FB6562"} />
          <TextInput
            style={{
              fontSize: 20
            }}
            placeholder={t("search-content")}
            returnKeyType="search"
            value={searchQuery}
            onChangeText={(query) => setSearchQuery(query)}
            editable={false} //TODO: Khi nào có API search post thì mở
          />
        </Pressable>
      </View>

      {
        data.length == 0 &&
        <View style={{
          flex: 1,
          height: ScreenHeight / 2.5
        }}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LottieView
              source={require("../../assets/catRole.json")}
              style={{ width: ScreenWidth, height: ScreenWidth / 1.5 }}
              autoPlay
              loop
              speed={0.8}
            />
            <Text style={{
              fontSize: 18,
              width: ScreenWidth / 1.5,
              textAlign: "center"
            }}>
              {t("update-post-soon")}
            </Text>
          </View>
        </View>
      }

      <FlatList
        contentContainerStyle={{
          alignItems: "center",
          padding: 3
        }}
        numColumns={3}
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          if (item?.postImages) {
            return (
              <Pressable
                style={{
                  margin: 3
                }}
                onPress={() => {
                  handleNavigate("CustomExplore", item);
                }}
              >
                <Image
                  source={{
                    uri: item.postImages[0].imageUrl,
                  }}
                  alt={item.id}
                  style={{
                    height: ScreenWidth / 3.2,
                    width: ScreenWidth / 3.2,
                    resizeMode: "cover",
                    borderColor: "#FB6562",
                  }}
                />
              </Pressable>
            )
          }
        }}
        onEndReached={handleScroll}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        initialNumToRender={5}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
      />

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </KeyboardAvoidingView>
  );
}
