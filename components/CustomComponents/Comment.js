import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Avatar, Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import useAuth from "../../utils/useAuth";
import api from "../Authorization/api";
import useComment from "../../utils/useComment";
import { vi, enUS } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import i18next from "../../services/i18next"

const Comment = ({ comment, post }) => {
  const { user } = useAuth();
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { t } = useTranslation();
  const [currLanguage, setCurrLanguage] = useState(i18next.language);

  const {
    handleDeleteComment
  } = useComment();

  const navigation = useNavigation();

  const handleEditComment = () => {
    // Implement edit comment logic
    setShowOptionModal(false);
    navigation.navigate("EditComment", comment);
  };

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <View>
      <View style={{ flexDirection: "row", columnGap: 6 }}>
        {/* Image */}
        {
          comment.imageUrl !== null ?
            <Avatar size={40} rounded source={{
              uri: comment.imageUrl
            }} />
            :
            <View
              style={{
                height: ScreenWidth / 11,
                width: ScreenWidth / 11,
                borderRadius: 30,
                backgroundColor: "#FEC6C4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontSize: 23, fontWeight: "bold", color: "white" }}
              >
                {comment.fullName.charAt(0).toUpperCase()}
              </Text>
            </View>
        }

        {/* Name, format date and content */}
        <View>
          <Pressable
            onLongPress={() => {
              if (comment.accountId === user.id) {
                setShowOptionModal(true);
              }
            }}
            style={{
              rowGap: 5,
              backgroundColor: "#E9ECEE",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              maxWidth: ScreenWidth - 65,
            }}
          >
            <View>
              <View
                style={{
                  flexDirection: "row",
                  columnGap: 6,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  {comment.fullName}
                </Text>
                <Text style={{ fontSize: 13, color: "#ACACAC" }}>
                  {
                    formatDistanceToNow(new Date(parseInt(comment.createdAt, 10)), {
                      addSuffix: true,
                      locale: currLanguage === "vi" ? vi : enUS
                    }) //Create at
                  }
                </Text>
              </View>
              {comment.modified && (
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#ACACAC",
                      backgroundColor: "rgba(217,217,217,0.5)",
                      paddingHorizontal: 4,
                      marginLeft: -4,
                      borderRadius: 10,
                    }}
                  >
                    {t("is-modified")}
                  </Text>
                </View>
              )}
            </View>

            <Text>{comment.content}</Text>
          </Pressable>
        </View>
      </View>

      <OptionModal
        showOptionModal={showOptionModal}
        setShowOptionModal={setShowOptionModal}
        setShowConfirmModal={setShowConfirmModal}
        handleEditComment={handleEditComment}
      />
      <ConfirmModal
        setShowConfirmModal={setShowConfirmModal}
        showConfirmModal={showConfirmModal}
        handleDeleteComment={() => {
          handleDeleteComment(comment, user)
        }}
      />
    </View>
  );
};

const OptionModal = ({
  showOptionModal,
  setShowOptionModal,
  handleEditComment,
  setShowConfirmModal,
}) => {
  const { t } = useTranslation();
  return (
    <View>
      <Modal
        isVisible={showOptionModal}
        onBackdropPress={() => setShowOptionModal(false)}
        onSwipeComplete={() => setShowOptionModal(false)}
        useNativeDriverForBackdrop
        swipeDirection={"down"}
        propagateSwipe={true}
        style={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
      >
        <View style={styles.modalContent}>
          <View
            style={{
              alignItems: "center",
              paddingBottom: 12,
            }}
          >
            <View
              style={{
                width: ScreenWidth / 7,
                height: ScreenHeight / 80,
                backgroundColor: "#FB6562",
                borderRadius: 30,
              }}
            />
          </View>

          <Pressable
            style={styles.modalOption}
            onPress={() => {
              setShowOptionModal(false);
              setShowConfirmModal(true);
            }}
          >
            <Icon name="delete" type="antdesign" />
            <Text style={styles.modalOptionText}>{t("delete-comment")}</Text>
          </Pressable>
          <Pressable style={styles.modalOption} onPress={handleEditComment}>
            <Icon name="edit-2" type="feather" />
            <Text style={styles.modalOptionText}>{t("update-comment")}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const ConfirmModal = ({
  showConfirmModal,
  setShowConfirmModal,
  handleDeleteComment,
}) => {
  const { t } = useTranslation();
  const {
    isFetching
  } = useComment();

  return (
    <Modal
      isVisible={showConfirmModal}
      onBackdropPress={() => setShowConfirmModal(false)}
      propagateSwipe={true}
      style={{
        alignItems: "center",
      }}
    >
      <View style={{
        rowGap: 20,
        width: ScreenWidth * 0.8,
        padding: 20,
        borderRadius: 10,
        backgroundColor: "white",
      }}>
        <Text style={{ fontSize: 15 }}>
          {t("confirm-delete-cmt")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            columnGap: 12,
          }}
        >
          <Pressable
            style={{
              backgroundColor: "white",
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#FB6562",
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center"
            }}
            onPress={() => setShowConfirmModal(false)}
          >
            <Text style={{ fontWeight: "bold", color: "#FB6562" }}>{t("cancel-modal")}</Text>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: "#FB6562",
              paddingHorizontal: 15,
              paddingVertical: 5,
              borderRadius: 10,
              width: ScreenWidth * 0.25,
              height: 35,
              alignItems: "center",
              justifyContent: "center"
            }}
            onPress={() => {
              handleDeleteComment();
              setShowConfirmModal(false)
            }}
            disabled={isFetching}
          >
            <Text style={{ fontWeight: "bold", color: "white" }}>{t("delete-cmt")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderColor: "#FB6562",
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: "#FB6562",
  },
  sortButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    flexDirection: "row",
    // justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    columnGap: 12,
  },
  modalOptionText: {
    fontSize: 16,
  },
});

export default Comment;
