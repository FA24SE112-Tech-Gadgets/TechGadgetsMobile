import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import React, { useRef, useState } from "react";
import { ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import ErrModal from "../CustomComponents/ErrModal";

export default function BuyerHome({ navigation }) {
  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef();

  const goToNextPage = () => {
    const nextSlide = currentSlide >= bannerArr.length - 1 ? 0 : currentSlide + 1;
    flatListRef.current.scrollToIndex({ index: nextSlide, animated: true });
    setCurrentSlide(nextSlide);
  };

  //Scroll banner
  // useFocusEffect(
  //   useCallback(() => {
  //     const timerId = setInterval(() => {
  //       goToNextPage();
  //     }, 4000);

  //     return () => {
  //       clearInterval(timerId);
  //     };
  //   }, [currentSlide, bannerArr])
  // );

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        position: "relative",
      }}
      behavior="padding"
    >
      {/* Banner */}
      {/* TODO: Quang Kiệt có thể tham khảo code này cho banner */}
      {/* <View>
        {
          bannerArr.length > 0 &&
          <FlatList
            data={bannerArr}
            overScrollMode={"never"}
            ref={flatListRef}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View key={index}>
                <Image
                  style={{ width: ScreenWidth, height: ScreenWidth }}
                  source={{ uri: item.image }}
                />
              </View>
            )}
          />
        }
      </View> */}

      <View
        style={{
          height: ScreenHeight - ScreenHeight / 2.5,
          width: ScreenWidth,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: "white",
          position: "absolute",
          bottom: 0,
          alignItems: "center",
        }}
      >

        <Text
          style={{
            color: "black",
            fontSize: 22,
            fontWeight: "500",
          }}
        >
          BuyerHome
        </Text>
      </View>

      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </KeyboardAvoidingView>
  );
}
