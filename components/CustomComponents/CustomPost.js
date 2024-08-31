import { View, Text, Image, FlatList, Dimensions, Modal, TextInput, Pressable, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Octicons from "react-native-vector-icons/Octicons";
import Feather from "react-native-vector-icons/Feather";

export default function CustomPost({ post }) {
  const [isUpVoted, setUpVote] = useState(false);
  const [isDownVoted, setDownVote] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;

  const renderDots = (arrImg, index) => {
    const dots = [];
    for (let i = 0; i < arrImg.length; i++) {
      if (i == index) {
        dots.push(
          <Octicons
            key={i}
            name="dot-fill"
            size={20}
            color={"#FB6562"}
            style={{ marginRight: 10 }}
          />
        );
      } else {
        dots.push(
          <Octicons
            key={i}
            name="dot-fill"
            size={20}
            color={"#D9D9D9"}
            style={{ marginRight: 10 }}
          />
        );
      }
    }
    return dots;
  };

  const handleCommentPress = () => {
    setCommentModalVisible(true);
    // Fetch or set comments here
  };

  const handleCloseModal = () => {
    setCommentModalVisible(false);
  };

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 5,
          marginBottom: 5,
        }}
      >
        <Image
          source={{
            uri: post.avaURL,
          }}
          style={{
            height: 35,
            width: 35,
            // resizeMode: 'contain',
            backgroundColor: "black",
            borderRadius: 30,
          }}
        />
        <View
          style={{
            flex: 1,
            marginLeft: 5,
          }}
        >
          <Text>
            {post.fullName}    {post.createdAt}
          </Text>
        </View>
      </View>
      {/* Post content */}
      {post?.content && post.content?.length !== 0 && (
        <View
          style={{
            paddingHorizontal: 5,
            marginBottom: 5,
          }}
        >
          <Text>{post.content}</Text>
        </View>
      )}

      {/* Image */}
      <FlatList
        data={post.postImages}
        horizontal={true}
        renderItem={({ item, index }) => (
          <View style={{ position: "relative" }}>
            <Image
              source={{
                uri: item,
              }}
              style={{
                height: screenHeight / 3,
                width: screenWidth,
                // resizeMode: 'contain',
                backgroundColor: "black",
              }}
            />
            <View
              style={{
                flexDirection: "row",
                position: "absolute",
                bottom: 0,
                left: screenWidth / 2.4,
              }}
            >
              {renderDots(post.postImages, index)}
            </View>
          </View>
        )}
        keyExtractor={(item) => item}
      />

      {/* Upvote - Downvote - Comment */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: screenWidth / 4,
          justifyContent: "space-evenly",
          marginBottom: 10,
        }}
      >
        <View style={{ position: "relative" }}>
          <MaterialCommunityIcons
            name={"arrow-up-bold-outline"}
            size={24}
            color={"black"}
          />
          <MaterialCommunityIcons
            style={{ position: "absolute" }}
            name={isUpVoted ? "arrow-up-bold" : "arrow-up-bold-outline"}
            size={24}
            color={isUpVoted ? "#FB6562" : "black"}
          />
        </View>
        <Text>{post.voted}</Text>
        <View style={{ position: "relative" }}>
          <MaterialCommunityIcons
            name={"arrow-down-bold-outline"}
            size={24}
            color={"black"}
          />
          <MaterialCommunityIcons
            style={{ position: "absolute" }}
            name={isDownVoted ? "arrow-down-bold" : "arrow-down-bold-outline"}
            size={24}
            color={isDownVoted ? "#FB6562" : "black"}
          />
        </View>
        <Pressable onPress={() => handleCommentPress()}>
          <EvilIcons name={"comment"} size={25} color={"black"} />
        </Pressable>
        <CommentModal
          visible={commentModalVisible}
          onClose={handleCloseModal}
          comments={post.comments}
        />
      </View>
    </>
  );
}

const CommentModal = ({ visible, onClose, comments }) => {
  const [newComment, setNewComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent={true}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <TouchableOpacity
          style={{ flex: 0.2 }}
          activeOpacity={1}
          onPress={() => onClose()}
        />
        <View
          style={{
            flex: 0.7,
            padding: 10,
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          {comments.length === 0 && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <Image
                style={{
                  width: 200,
                  height: 200,
                }}
                source={require("../../assets/adaptive-icon.png")}
              />
              <Text style={{ fontSize: 20, color: "grey" }}>
                Chưa có bình luận nào
              </Text>
              <Text style={{ color: "grey" }}>
                Hãy là người đầu tiên bình luận
              </Text>
            </View>
          )}
          {comments.length !== 0 &&
            comments.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Image
                  source={{
                    uri: item.avaURL,
                  }}
                  style={{
                    height: 35,
                    width: 35,
                    // resizeMode: 'contain',
                    backgroundColor: "black",
                    borderRadius: 30,
                    marginRight: 10,
                  }}
                />
                <View
                  style={{
                    backgroundColor: "#D9D9D9",
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ fontWeight: "500" }}>{item.fullName}</Text>
                  <Text>{item.content}</Text>
                </View>
              </View>
            ))}
        </View>
        <View
          style={{
            flex: 0.1,
            backgroundColor: "white",
            justifyContent: "center",
            borderTopColor: "black",
          }}
        >
          <View
            style={{
              backgroundColor: "#D9D9D9",
              paddingHorizontal: 10,
              paddingVertical: 5,
              marginHorizontal: 10,
              marginVertical: 5,
              borderRadius: 30,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextInput
              placeholder="Viết bình luận..."
              value={newComment}
              onChangeText={setNewComment}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {isFocused && <Feather name={"send"} size={20} color={"#FB6562"} />}
          </View>
        </View>
      </View>
    </Modal>
  );
};
