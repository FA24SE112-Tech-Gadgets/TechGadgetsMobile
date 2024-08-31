import { createContext, useState } from "react";
import api from "../Authorization/api";
import { ScreenHeight } from "@rneui/base";
import { useTranslation } from "react-i18next";

const limit = 5;

const CommentContext = createContext({
    limit,
    postsData: [],
    setPostsData: () => { },
    currentPostPage: 0,
    setCurrentPostPage: () => { },
    totalPostsPages: 0,
    setTotalPostsPages: () => { },
    handleUpdateComment: async (navigation, comment) => { },
    handleDeleteComment: async (comment, user) => { },
    stringErr: "",
    setStringErr: () => { },
    isError: false,
    setIsError: () => { },
    fetchPost: (currentPage) => { },
    handlePostScroll: () => { },
    commentsData: [],
    setCommentsData: () => { },
    currentCommentPage: 0,
    setCurrentCommentPage: () => { },
    totalCommentsPages: 0,
    setTotalCommentsPages: () => { },
    fetchComment: async (currentPage) => { },
    handleCommentScroll: () => { },
    snackbarMessage: "",
    setSnackbarMessage: () => { },
    snackbarVisible: false,
    setSnackbarVisible: () => { },
    isFetching: false,
    setIsFetching: () => { },
    hasMoreData: true,
    setHasMoreData: () => { },
});

const CommentProvider = ({ children }) => {
    const [postsData, setPostsData] = useState([]);
    const [currentPostPage, setCurrentPostPage] = useState(0);
    const [totalPostsPages, setTotalPostsPages] = useState(0);

    const [commentsData, setCommentsData] = useState([]);
    const [currentCommentPage, setCurrentCommentPage] = useState(0);
    const [totalCommentsPages, setTotalCommentsPages] = useState(0);

    const [stringErr, setStringErr] = useState("");
    const [isError, setIsError] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [isFetching, setIsFetching] = useState(false);
    const [hasMoreData, setHasMoreData] = useState(true);

    const { t } = useTranslation();

    const fetchPost = async (currentPage) => {
        let isErr = true;
        try {
            setIsFetching(true);
            const res = await api.get(`/posts?page=${currentPage}&limit=${limit}`);
            if (res.status >= 200 && res.status < 300) {
                setIsFetching(false);
                setPostsData(res.data.data);
                setTotalPostsPages(res.data.totalPages);
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

    const handlePostScroll = () => {
        if (!isFetching && hasMoreData) {
            setCurrentPostPage(prevPage => prevPage + 1);
        }
    };

    const handleCommentScroll = () => {
        if (!isFetching && hasMoreData) {
            setCurrentCommentPage(prevPage => prevPage + 1);
        }
    };

    const handleUpdateComment = async (navigation, comment) => {
        try {
            setIsFetching(true);
            const res = await api.put(`/posts/comments/${comment.id}`, {
                content: comment.content
            });
            setIsFetching(false);
            if (res.status >= 200 && res.status < 300) {
                const updatedComments = commentsData.map(item => {
                    if (item.id === comment.id) {
                        return { ...item, content: comment.content };
                    }
                    return item;
                });
                setCommentsData(updatedComments);
                setCurrentCommentPage(totalCommentsPages - 1);
                setSnackbarMessage(t("update-cmt-success"));
                setSnackbarVisible(true);
                await delay(1500);
                navigation.goBack();
            }
        } catch (error) {
            setSnackbarMessage(error.response?.data?.reasons[0]?.message ?
                error.response.data.reasons[0].message
                :
                t("network-error"));
            setSnackbarVisible(true);
        }
    };

    const handleDeleteComment = async (comment, user) => {
        if (comment.accountId === user.id) {
            try {
                setIsFetching(true);
                const res = await api.delete(`/posts/comments/${comment.id}`);
                setIsFetching(false);
                if (res.status >= 200 && res.status < 300) {
                    setCommentsData(prevComments =>
                        prevComments.filter(item => item.id !== comment.id)
                    );
                }
            } catch (error) {
                setSnackbarMessage(error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    t("network-error"));
                setSnackbarVisible(true);
            }
        }
        setSnackbarMessage(t("delete-cmt-success"));
        setSnackbarVisible(true);
    };

    const fetchComment = async (currentPage, post) => {
        let isErr = true;
        try {
            setIsFetching(true);
            const res = await api.get(`/posts/${post.id}/comments?page=${currentPage}&limit=${limit}`);
            if (res.status >= 200 && res.status < 300) {
                setIsFetching(false);
                setCommentsData(res.data.data);
                setTotalCommentsPages(res.data.totalPages);
            }
            isErr = false;
        } catch (error) {
            setStringErr(
                error.response?.data?.reasons[0]?.message ?
                    error.response.data.reasons[0].message
                    :
                    t("network-error")
            );
            setIsError(true);
            isErr = true;
        }
        return isErr;
    };

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    return (
        <CommentContext.Provider
            value={{
                limit,
                postsData,
                setPostsData,
                currentPostPage,
                setCurrentPostPage,
                totalPostsPages,
                setTotalPostsPages,
                handleUpdateComment,
                handleDeleteComment,
                stringErr,
                setStringErr,
                isError,
                setIsError,
                fetchPost,
                handlePostScroll,
                commentsData,
                setCommentsData,
                currentCommentPage,
                setCurrentCommentPage,
                totalCommentsPages,
                setTotalCommentsPages,
                fetchComment,
                handleCommentScroll,
                snackbarMessage,
                setSnackbarMessage,
                snackbarVisible,
                setSnackbarVisible,
                isFetching,
                setIsFetching,
                hasMoreData,
                setHasMoreData
            }}
        >
            {children}
        </CommentContext.Provider>
    );
};

export { CommentContext, CommentProvider };