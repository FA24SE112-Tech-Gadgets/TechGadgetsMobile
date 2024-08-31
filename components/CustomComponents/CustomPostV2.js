import {
  View,
  Text,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Icon, ScreenHeight, ScreenWidth } from "@rneui/base";
import ImageSlider from "./ImageSlider";
import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../Authorization/api";
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslation } from "react-i18next";
import i18next from "../../services/i18next"
import ErrModal from "./ErrModal";

const votingURL = "/posts/post-votings"

const CustomPostV2 = ({ post }) => {
  const [currentPost, setCurrentPost] = useState(null);
  const [isUpVoted, setUpVote] = useState(post?.voted && post?.postVoting?.type === "UP" ? true : false);
  const [isDownVoted, setDownVote] = useState(post?.voted && post?.postVoting?.type === "DOWN" ? true : false);
  const [totalVotes, setTotalVotes] = useState(post?.totalVotes);
  const [totalComments, setTotalComments] = useState(post?.totalComments);
  const [isFetching, setIsFetching] = useState(false);

  const [stringErr, setStringErr] = useState("");
  const [isError, setIsError] = useState(false);

  const { t } = useTranslation();
  const [currLanguage, setCurrLanguage] = useState(i18next.language);

  const navigation = useNavigation();

  const handleUpvote = async () => {
    setIsFetching(true);
    if (!isUpVoted && !isDownVoted) {
      try {
        setUpVote(true);
        setTotalVotes(totalVotes + 1);
        const reqBody = {
          type: "UP",
          postId: currentPost.id
        }
        const res = await api.post(votingURL, reqBody);
        if (res.status >= 200 && res.status < 300) {
          await getCurrentPost();
          setIsFetching(false);
        }
      } catch (error) {
        setUpVote(false);
        setTotalVotes(totalVotes - 1);
        setIsError(true);
        setStringErr(
          error.response?.data?.reasons[0]?.message ?
            error.response.data.reasons[0].message
            :
            t("network-error")
        );
      }
    } else if (isUpVoted) {
      try {
        setUpVote(false);
        setTotalVotes(totalVotes - 1);
        const res = await api.delete(votingURL + "/" + currentPost.postVoting.id);
        if (res.status >= 200 && res.status < 300) {
          await getCurrentPost();
          setIsFetching(false);
        }
      } catch (error) {
        setUpVote(true);
        setTotalVotes(totalVotes + 1);
        setIsError(true);
        setStringErr(
          error.response?.data?.reasons[0]?.message ?
            error.response.data.reasons[0].message
            :
            t("network-error")
        );
      }
    } else if (isDownVoted) {
      try {
        setDownVote(false);
        setUpVote(true);
        const res = await api.put(votingURL + "/" + currentPost.postVoting.id, {
          type: "UP"
        });
        if (res.status >= 200 && res.status < 300) {
          await getCurrentPost();
          setIsFetching(false);
        }
      } catch (error) {
        setDownVote(true);
        setUpVote(false);
        setIsError(true);
        setStringErr(
          error.response?.data?.reasons[0]?.message ?
            error.response.data.reasons[0].message
            :
            t("network-error")
        );
      }
    }


  };

  const handleDownvote = async () => {
    setIsFetching(true)
    if (!isUpVoted && !isDownVoted) {
      try {
        setDownVote(true);
        setTotalVotes(totalVotes + 1);
        const reqBody = {
          type: "DOWN",
          postId: currentPost.id
        }
        const res = await api.post(votingURL, reqBody);
        if (res.status >= 200 && res.status < 300) {
          await getCurrentPost();
          setIsFetching(false);
        }
      } catch (error) {
        setDownVote(false);
        setTotalVotes(totalVotes - 1);
        setIsError(true);
        setStringErr(
          error.response?.data?.reasons[0]?.message ?
            error.response.data.reasons[0].message
            :
            t("network-error")
        );
      }
    } else if (isDownVoted) {
      try {
        setDownVote(false);
        setTotalVotes(totalVotes - 1);
        const res = await api.delete(votingURL + "/" + currentPost.postVoting.id);
        if (res.status >= 200 && res.status < 300) {
          await getCurrentPost();
          setIsFetching(false);
        }
      } catch (error) {
        setDownVote(true);
        setTotalVotes(totalVotes + 1);
        setIsError(true);
        setStringErr(
          error.response?.data?.reasons[0]?.message ?
            error.response.data.reasons[0].message
            :
            t("network-error")
        );
      }
    } else if (isUpVoted) {
      try {
        setUpVote(false);
        setDownVote(true);
        const res = await api.put(votingURL + "/" + currentPost.postVoting.id, {
          type: "DOWN"
        });
        if (res.status >= 200 && res.status < 300) {
          await getCurrentPost();
          setIsFetching(false);
        }
      } catch (error) {
        setUpVote(true);
        setDownVote(false);
        setIsError(true);
        setStringErr(
          error.response?.data?.reasons[0]?.message ?
            error.response.data.reasons[0].message
            :
            t("network-error")
        );
      }
    }
  };

  async function getCurrentPost() {
    try {
      const res = await api.get(`/posts/${currentPost.id}`);
      if (res.status >= 200 && res.status < 300) {
        setCurrentPost(res.data);
        setTotalVotes(res.data.totalVotes);
        setTotalComments(res.data.totalComments);
      }
    } catch (error) {
      setIsError(true);
      setStringErr(
        error.response?.data?.reasons[0]?.message ?
          error.response.data.reasons[0].message
          :
          t("block-post")
      );
    }
  }

  useEffect(() => {
    setCurrentPost(post)
    setUpVote(post?.voted && post?.postVoting?.type === "UP" ? true : false)
    setDownVote(post?.voted && post?.postVoting?.type === "DOWN" ? true : false)
    setTotalVotes(post?.totalVotes)
    setTotalComments(post?.totalComments)
  }, [post])

  return (
    <View>
      {/* Ava, name, format date */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          columnGap: 8,
          marginLeft: 10,
          marginVertical: 8,
        }}
      >
        {currentPost?.avatarImage ? (
          <Image
            source={{
              uri: currentPost.avatarImage,
            }}
            style={{
              height: ScreenWidth / 11,
              width: ScreenWidth / 11,
              backgroundColor: "black",
              borderRadius: 30,
            }}
          />
        ) : (
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
              {currentPost?.accountName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          {currentPost?.accountName}
        </Text>
        {
          currentPost !== null &&
          <Text style={{ color: "#ACACAC", fontSize: 15 }}>
            {
              formatDistanceToNow(new Date(parseInt(currentPost?.createdAt, 10)), {
                addSuffix: true,
                locale: currLanguage === "vi" ? vi : enUS
              }) //Create at
            }
          </Text>
        }
      </View>

      {/* image slider */}
      <ImageSlider list={currentPost?.postImages} />

      {/* Voting and comment */}
      <View
        style={{
          flexDirection: "row",
          columnGap: 6,
          marginTop: 6,
          marginLeft: 6,
          marginBottom: 6,
        }}
      >
        {/* Voting Icons */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            columnGap: 4,
            paddingHorizontal: 6,
            paddingVertical: 3.5,
            borderRadius: 16,
            borderColor: "#FB6562",
            borderWidth: 1,
            backgroundColor: "white",
          }}
        >
          <Icon
            type="material-community"
            name={isUpVoted ? "arrow-up-bold" : "arrow-up-bold-outline"}
            color={"#FB6562"}
            size={25}
            onPress={() => {
              !isFetching && handleUpvote();
            }}
          />
          <Text style={{ fontWeight: "bold", color: "#FB6562", fontSize: 17 }}>
            {totalVotes}
          </Text>
          <Icon
            type="material-community"
            name={isDownVoted ? "arrow-down-bold" : "arrow-down-bold-outline"}
            color={"#FB6562"}
            size={25}
            onPress={() => {
              !isFetching && handleDownvote();
            }}
          />
        </View>
        {/* Comment Icon */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            columnGap: 4,
            paddingHorizontal: 10,
            paddingVertical: 3.5,
            borderRadius: 16,
            borderColor: "#FB6562",
            borderWidth: 1,
            backgroundColor: "white",
          }}
          onPress={() => {
            navigation.navigate("Comment", currentPost)
          }}
        >
          <Icon
            type="material-community"
            name="comment-outline"
            color={"#FB6562"}
          />
          <Text style={{ color: "#FB6562", fontWeight: "bold", fontSize: 17 }}>
            {totalComments}
          </Text>
        </Pressable>
      </View>

      {/* Name, content */}
      <View style={{ marginHorizontal: 6, flexDirection: "row" }}>
        <Text style={{ fontSize: 15 }}>
          <Text style={{ fontWeight: "500", fontSize: 17 }}>
            {currentPost?.accountName}{"\u00A0\u00A0"}
          </Text>
          {currentPost?.content}
        </Text>
      </View>
      <ErrModal
        stringErr={stringErr}
        isError={isError}
        setIsError={setIsError}
      />
    </View>
  );
};

export default CustomPostV2;
